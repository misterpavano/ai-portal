import { Box, CircularProgress, Typography } from "@mui/material";
import TranscriptBox from "../Forms/TranscriptionBox";
import { useEffect, useRef, useState } from "react";
import { TranscriptData } from "../../../../../types/response/openai";
import { useAtom } from "jotai";
import { audioToTextFormAtom } from "../../../../../atoms/audioToTextAtom";
import {
  useLazyGetTranscriptionStatusQuery,
  useTranscribeAudioMutation,
  useUploadFileMutation,
  useAddFileToVectorStoreMutation,
  useAskQuestionBasedOnFileMutation,
  useCreateThreadMutation,
} from "../../../../../api/slices/openAiSlice";

const POLL_INTERVAL = 10000;

const TranscriptionPreview: React.FC = () => {
  const [audioToTextFormValues, setAudioToTextFormValues] =
    useAtom(audioToTextFormAtom);
  const [transcript, setTranscript] = useState<string | TranscriptData>("");
  const [transcriptResetKey, setTranscriptResetKey] = useState(0);
  const [transcribing, setIsTranscribing] = useState(false);
  const [getTranscriptionStatus] = useLazyGetTranscriptionStatusQuery();
  const [transcribeAudio] = useTranscribeAudioMutation();
  const [uploadFile] = useUploadFileMutation();
  const [addFileToVectorStore] = useAddFileToVectorStoreMutation();
  const [askQuestionBasedOnFile] = useAskQuestionBasedOnFileMutation();
  const [createThread] = useCreateThreadMutation();
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<
    "waiting" | "active" | "completed" | "failed" | null
  >(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null,
  );
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileProcessed, setFileProcessed] = useState(false);
  // Prevent double POST /transcribe (React Strict Mode or effect re-run with same file)
  const transcriptionStartedForFileRef = useRef<string | null>(null);

  const getTranscriptText = (
    transcript: string | TranscriptData | null,
  ): string => {
    if (!transcript) return "";
    if (typeof transcript === "string") return transcript;
    if (typeof transcript === "object" && transcript.fullText) {
      return transcript.fullText;
    }
    return "";
  };

  // Reset fileProcessed when a new file is uploaded
  useEffect(() => {
    setFileProcessed(false);
  }, [audioToTextFormValues.uploadedFile]);

  // Transcribe the file when component mounts or when file/options change
  useEffect(() => {
    const transcribeFile = async () => {
      if (!audioToTextFormValues.uploadedFile) {
        transcriptionStartedForFileRef.current = null;
        return;
      }

      const file = audioToTextFormValues.uploadedFile;
      const fileKey = `${file.name}-${file.size}-${file.lastModified}`;

      // Only trigger once per file (avoids double POST from Strict Mode or dependency flicker)
      if (transcriptionStartedForFileRef.current === fileKey) {
        return;
      }
      transcriptionStartedForFileRef.current = fileKey;

      const fileType = file.type;

      // Only transcribe audio files
      const isAudio =
        fileType.startsWith("audio/") ||
        fileType === "video/mp4" ||
        fileType === "video/mpeg" ||
        fileType === "video/quicktime" || // .mov
        fileType === "video/webm";

      if (!isAudio) {
        setTranscriptionError(
          "Unsupported file type. Please upload an audio or video file that contains audio.",
        );
        return;
      }

      try {
        setIsTranscribing(true);
        setTranscriptionError(null);

        const formData = new FormData();
        formData.append("file", file);

        // Append transcription options to FormData
        if (audioToTextFormValues.transcriptionOptions.provideSummary) {
          formData.append("provideSummary", "true");
        }
        if (audioToTextFormValues.transcriptionOptions.includeTimestamps) {
          formData.append("includeTimestamps", "true");
        }
        if (
          audioToTextFormValues.transcriptionOptions.includeSpeakerIdentifier
        ) {
          formData.append("includeSpeakerIdentifier", "true");
        }

        const { jobId } = await transcribeAudio(formData).unwrap();
        setJobId(jobId);
        setJobState("waiting");
        console.log("Transcription job queued:", jobId);
      } catch (error) {
        console.error("Transcription failed:", error);
        transcriptionStartedForFileRef.current = null;
        setIsTranscribing(false);
        setTranscriptionError(
          "Failed to start transcription. Please try again.",
        );
      }
    };

    transcribeFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioToTextFormValues.uploadedFile]);

  // Poll for transcription status
  useEffect(() => {
    if (!jobId || jobState === "completed" || jobState === "failed") return;

    const interval = setInterval(async () => {
      try {
        const statusResponse = await getTranscriptionStatus(jobId).unwrap();

        setJobState(statusResponse.state);

        if (statusResponse.state === "completed") {
          clearInterval(interval);
          setIsTranscribing(false);

          const transcriptData = statusResponse.transcript;
          setTranscript(transcriptData || "");

          // Store transcript in atom for download and clear previous edits
          setAudioToTextFormValues((prev) => ({
            ...prev,
            transcript: transcriptData || null,
            transcriptEdits: {
              speakerEdits: {},
              segmentTextEdits: {},
              segmentSpeakerReassignments: {},
            },
          }));

          const transcriptText = getTranscriptText(transcriptData);

          if (transcriptText.trim() !== "") {
            setTranscriptionError(null);
            setTranscriptResetKey((prev) => prev + 1);
          } else {
            setTranscriptionError(
              "Transcription completed but no text was returned.",
            );
          }
        } else if (statusResponse.state === "failed") {
          clearInterval(interval);
          setIsTranscribing(false);
          setTranscriptionError("Transcription failed. Please try again.");
        }
      } catch (err) {
        console.error("Polling error:", err);
        clearInterval(interval);
        setIsTranscribing(false);
        setTranscriptionError(
          "Failed to get transcription status. Please try again.",
        );
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [jobId, jobState, getTranscriptionStatus]);

  // Separate effect to handle file upload and summary generation after transcription completes
  useEffect(() => {
    const processFileAndGenerateSummary = async () => {
      // Only process if:
      // 1. Transcription is complete (we have transcript data)
      // 2. provideSummary is enabled
      // 3. Vector store and assistant are ready
      // 4. File hasn't been processed yet
      if (
        !audioToTextFormValues.transcriptionOptions.provideSummary ||
        !transcript ||
        !audioToTextFormValues.vectorStoreId ||
        !audioToTextFormValues.assistantId ||
        !audioToTextFormValues.uploadedFile ||
        audioToTextFormValues.file.fileId ||
        fileProcessed
      ) {
        return;
      }

      const transcriptText = getTranscriptText(transcript);
      if (!transcriptText.trim()) {
        return;
      }

      console.log("🔄 Starting file upload and summary generation...");
      setIsProcessingFile(true);
      setFileProcessed(true);

      try {
        // Convert transcript text to a file
        const transcriptBlob = new Blob([transcriptText], {
          type: "text/plain",
        });
        const transcriptFile = new File(
          [transcriptBlob],
          audioToTextFormValues.uploadedFile.name.replace(/\.[^/.]+$/, "") +
            "_transcript.txt",
          { type: "text/plain" },
        );

        console.log("📤 Uploading file to OpenAI...");
        // Upload file to OpenAI
        const formData = new FormData();
        formData.append("file", transcriptFile);
        formData.append("purpose", "assistants");
        const uploadResponse = await uploadFile(formData).unwrap();
        const fileId = uploadResponse.id;
        const fileName = uploadResponse.filename;
        console.log("✅ File uploaded:", fileId, fileName);

        console.log("📦 Adding file to vector store...");
        // Add file to vector store
        await addFileToVectorStore({
          vectorId: audioToTextFormValues.vectorStoreId,
          file_id: fileId,
        }).unwrap();
        console.log("✅ File added to vector store");

        // Store file info in atom
        setAudioToTextFormValues((prev) => ({
          ...prev,
          file: {
            fileId: fileId,
            fileName: fileName,
          },
        }));

        // Wait for vector store to process the file before querying
        // We'll try multiple times with increasing delays
        console.log("⏳ Waiting for vector store to process file...");
        let summaryResponse;
        let attempt = 0;
        const maxAttempts = 3;
        let success = false;

        while (attempt < maxAttempts && !success) {
          attempt++;

          // Wait longer on each attempt: 5s, 8s, 12s
          const waitTime = attempt === 1 ? 5000 : attempt === 2 ? 8000 : 12000;
          console.log(
            `⏳ Attempt ${attempt}/${maxAttempts}: Waiting ${waitTime / 1000}s for vector store...`,
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));

          console.log("💬 Creating thread and generating summary...");
          // Create thread and call askQuestionBasedOnFile for summary
          const thread = await createThread().unwrap();
          const systemPrompt = `You have access to a transcribed audio file in your knowledge base. Please read the transcription and provide a comprehensive summary. Focus on the main topics discussed, key points, and any important conclusions or decisions. Do not reference file names, IDs, or metadata in your response. Just provide the summary of the content.`;

          console.log(
            `📝 Attempt ${attempt}: Calling askQuestionBasedOnFile with prompt:`,
            systemPrompt,
          );

          try {
            summaryResponse = await askQuestionBasedOnFile({
              threadId: thread.id,
              assistantId: audioToTextFormValues.assistantId,
              message: systemPrompt,
              assistantPrompt: "",
            }).unwrap();

            console.log(
              `✅ Summary response received (attempt ${attempt}):`,
              summaryResponse.content,
            );

            // Check if the response contains error messages
            const responseContent = summaryResponse.content || "";
            const isErrorResponse =
              responseContent.includes("couldn't find") ||
              responseContent.includes("I couldn't") ||
              responseContent.includes("file with the ID") ||
              responseContent.includes("feel free to upload") ||
              responseContent.includes("provide me with more context") ||
              responseContent.includes("attempt another search") ||
              responseContent.length < 50; // Very short responses might indicate errors

            if (!isErrorResponse) {
              // Success! We got a valid summary
              success = true;
              console.log(`✅ Valid summary generated on attempt ${attempt}`);

              // Remove OpenAI citation tags like 【4:0†source】
              const cleanedSummary = responseContent
                .replace(/【\d+:\d+†source】/g, "")
                .trim();

              // Store summary in atom
              setAudioToTextFormValues((prev) => ({
                ...prev,
                summary: cleanedSummary,
              }));
            } else {
              console.warn(
                `⚠️ Attempt ${attempt} returned an error response, will retry...`,
              );
              if (attempt === maxAttempts) {
                // Last attempt failed
                throw new Error(
                  "Failed to generate summary after multiple attempts",
                );
              }
            }
          } catch (err) {
            console.error(`❌ Error on attempt ${attempt}:`, err);
            if (attempt === maxAttempts) {
              throw err;
            }
          }
        }

        if (!success) {
          console.error("❌ Summary generation failed after all attempts");
          setAudioToTextFormValues((prev) => ({
            ...prev,
            summary:
              "Unable to generate summary at this time. The file may still be processing. Please try generating the summary again in a few moments.",
          }));
          throw new Error(
            "Failed to generate summary. The file may not be ready yet.",
          );
        }
      } catch (error) {
        console.error("❌ Error processing file for vector store:", error);

        // Set error message as summary if it's a summary-related error
        setAudioToTextFormValues((prev) => ({
          ...prev,
          summary:
            prev.summary ||
            "Unable to generate summary. Please try uploading the file again or contact support if the issue persists.",
        }));

        setFileProcessed(false); // Reset flag on error so it can retry
      } finally {
        setIsProcessingFile(false);
      }
    };

    processFileAndGenerateSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    transcript,
    audioToTextFormValues.vectorStoreId,
    audioToTextFormValues.assistantId,
    audioToTextFormValues.uploadedFile,
    audioToTextFormValues.transcriptionOptions.provideSummary,
    audioToTextFormValues.file.fileId,
    fileProcessed,
  ]);

  if (transcribing || isProcessingFile) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          minHeight: "200px",
        }}
      >
        <CircularProgress size={40} sx={{ color: "#2688ac" }} />
        <Typography sx={{ color: "#2688ac", fontSize: "14px" }}>
          {transcribing ? "Transcribing audio..." : "Processing file..."}
        </Typography>
      </Box>
    );
  }

  if (transcriptionError) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          minHeight: "200px",
        }}
      >
        <Typography sx={{ color: "error.main", fontSize: "14px" }}>
          {transcriptionError}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TranscriptBox
        transcript={transcript}
        resetKey={transcriptResetKey}
        transcriptionOptions={audioToTextFormValues.transcriptionOptions}
      />
    </Box>
  );
};

export default TranscriptionPreview;
