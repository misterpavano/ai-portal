import { Box, CircularProgress, Typography } from "@mui/material";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import ErrorState from "../../../../../components/shared/ErrorState";
import TranscriptBox from "../Forms/TranscriptionBox";
import { useEffect, useRef, useState, useCallback } from "react";
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
  useDeleteFileFromVectorStoreMutation,
  useDeleteFileFromStorageMutation,
  useDeleteVectorStoreMutation,
  useDeleteAssistantMutation,
} from "../../../../../api/slices/openAiSlice";
import { audioToTextValues } from "../../../../../config/audioToTextValues";
import {
  IconFile,
  IconMicrophone,
  IconClock,
  IconUserScan,
} from "@tabler/icons-react";

const POLL_INTERVAL = 10000;

// Stable waveform bar values (seeded, not random per render)
const WAVE_BARS = [
  { startHeight: 18, endHeight: 42, opacity: 0.5 },
  { startHeight: 30, endHeight: 36, opacity: 0.7 },
  { startHeight: 14, endHeight: 48, opacity: 0.4 },
  { startHeight: 36, endHeight: 28, opacity: 0.9 },
  { startHeight: 22, endHeight: 44, opacity: 0.6 },
  { startHeight: 40, endHeight: 32, opacity: 0.8 },
  { startHeight: 16, endHeight: 46, opacity: 0.5 },
  { startHeight: 34, endHeight: 38, opacity: 0.7 },
  { startHeight: 20, endHeight: 42, opacity: 0.6 },
  { startHeight: 38, endHeight: 30, opacity: 0.9 },
  { startHeight: 24, endHeight: 40, opacity: 0.5 },
  { startHeight: 32, endHeight: 34, opacity: 0.8 },
];

interface TranscriptionPreviewProps {
  onCancel?: () => void;
}

const TranscriptionPreview: React.FC<TranscriptionPreviewProps> = ({
  onCancel,
}) => {
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
  const [deleteFileFromVectorStore] = useDeleteFileFromVectorStoreMutation();
  const [deleteFileFromStorage] = useDeleteFileFromStorageMutation();
  const [deleteVectorStore] = useDeleteVectorStoreMutation();
  const [deleteAssistant] = useDeleteAssistantMutation();
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<
    "waiting" | "active" | "completed" | "failed" | null
  >(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null,
  );
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileProcessed, setFileProcessed] = useState(false);
  // Gate: user must confirm before transcription starts
  const [confirmed, setConfirmed] = useState(false);
  // Track cancellation
  const cancelledRef = useRef(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Prevent double POST /transcribe
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

  // Cleanup helper: delete vector store, assistant, uploaded file
  const cleanupResources = useCallback(async () => {
    const vectorStoreId = audioToTextFormValues.vectorStoreId;
    const assistantId = audioToTextFormValues.assistantId;
    const fileId = audioToTextFormValues.file?.fileId;

    if (fileId && vectorStoreId) {
      try {
        await deleteFileFromVectorStore({
          vectorStoreId,
          file_id: fileId,
        }).unwrap();
      } catch (e) {
        console.error("Cleanup: error deleting file from vector store", e);
      }
      try {
        await deleteFileFromStorage(fileId).unwrap();
      } catch (e) {
        console.error("Cleanup: error deleting file from storage", e);
      }
    }

    if (assistantId) {
      try {
        await deleteAssistant(assistantId).unwrap();
      } catch (e) {
        console.error("Cleanup: error deleting assistant", e);
      }
    }

    if (vectorStoreId) {
      try {
        await deleteVectorStore(vectorStoreId).unwrap();
      } catch (e) {
        console.error("Cleanup: error deleting vector store", e);
      }
    }
  }, [
    audioToTextFormValues.vectorStoreId,
    audioToTextFormValues.assistantId,
    audioToTextFormValues.file?.fileId,
    deleteFileFromVectorStore,
    deleteFileFromStorage,
    deleteAssistant,
    deleteVectorStore,
  ]);

  // Handle cancel: stop polling, cleanup, go back
  const handleCancel = useCallback(async () => {
    cancelledRef.current = true;
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsTranscribing(false);
    setIsProcessingFile(false);
    await cleanupResources();
    onCancel?.();
  }, [cleanupResources, onCancel]);

  // Reset fileProcessed when a new file is uploaded
  useEffect(() => {
    setFileProcessed(false);
  }, [audioToTextFormValues.uploadedFile]);

  // Transcribe the file ONLY after user confirms
  useEffect(() => {
    if (!confirmed) return;

    const transcribeFile = async () => {
      if (!audioToTextFormValues.uploadedFile) {
        transcriptionStartedForFileRef.current = null;
        return;
      }

      const file = audioToTextFormValues.uploadedFile;
      const fileKey = `${file.name}-${file.size}-${file.lastModified}`;

      if (transcriptionStartedForFileRef.current === fileKey) {
        return;
      }
      transcriptionStartedForFileRef.current = fileKey;

      const fileType = file.type;
      const isAudio =
        fileType.startsWith("audio/") ||
        fileType === "video/mp4" ||
        fileType === "video/mpeg" ||
        fileType === "video/quicktime" ||
        fileType === "video/webm";

      if (!isAudio) {
        setTranscriptionError(
          "Unsupported file type. Please upload an audio or video file that contains audio.",
        );
        return;
      }

      try {
        cancelledRef.current = false;
        setIsTranscribing(true);
        setTranscriptionError(null);

        const formData = new FormData();
        formData.append("file", file);

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

        if (cancelledRef.current) return;

        setJobId(jobId);
        setJobState("waiting");
      } catch (error) {
        if (cancelledRef.current) return;
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
  }, [confirmed, audioToTextFormValues.uploadedFile]);

  // Poll for transcription status
  useEffect(() => {
    if (!jobId || jobState === "completed" || jobState === "failed") return;

    const interval = setInterval(async () => {
      if (cancelledRef.current) {
        clearInterval(interval);
        return;
      }

      try {
        const statusResponse = await getTranscriptionStatus(jobId).unwrap();

        if (cancelledRef.current) return;

        setJobState(statusResponse.state);

        if (statusResponse.state === "completed") {
          clearInterval(interval);
          setIsTranscribing(false);

          const transcriptData = statusResponse.transcript;
          setTranscript(transcriptData || "");

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
          // Cleanup on failure
          await cleanupResources();
        }
      } catch (err) {
        if (cancelledRef.current) return;
        console.error("Polling error:", err);
        clearInterval(interval);
        setIsTranscribing(false);
        setTranscriptionError(
          "Failed to get transcription status. Please try again.",
        );
      }
    }, POLL_INTERVAL);

    pollIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
      pollIntervalRef.current = null;
    };
  }, [jobId, jobState, getTranscriptionStatus, cleanupResources]);

  // File upload and summary generation after transcription completes
  useEffect(() => {
    const processFileAndGenerateSummary = async () => {
      if (
        !audioToTextFormValues.transcriptionOptions.provideSummary ||
        !transcript ||
        !audioToTextFormValues.vectorStoreId ||
        !audioToTextFormValues.assistantId ||
        !audioToTextFormValues.uploadedFile ||
        audioToTextFormValues.file.fileId ||
        fileProcessed ||
        cancelledRef.current
      ) {
        return;
      }

      const transcriptText = getTranscriptText(transcript);
      if (!transcriptText.trim()) {
        return;
      }

      setIsProcessingFile(true);
      setFileProcessed(true);

      try {
        const transcriptBlob = new Blob([transcriptText], {
          type: "text/plain",
        });
        const transcriptFile = new File(
          [transcriptBlob],
          audioToTextFormValues.uploadedFile.name.replace(/\.[^/.]+$/, "") +
            "_transcript.txt",
          { type: "text/plain" },
        );

        const formData = new FormData();
        formData.append("file", transcriptFile);
        formData.append("purpose", "assistants");
        const uploadResponse = await uploadFile(formData).unwrap();
        const fileId = uploadResponse.id;
        const fileName = uploadResponse.filename;

        if (cancelledRef.current) return;

        await addFileToVectorStore({
          vectorId: audioToTextFormValues.vectorStoreId,
          file_id: fileId,
        }).unwrap();

        setAudioToTextFormValues((prev) => ({
          ...prev,
          file: { fileId, fileName },
        }));

        if (cancelledRef.current) return;

        let summaryResponse;
        let attempt = 0;
        const maxAttempts = 3;
        let success = false;

        while (attempt < maxAttempts && !success && !cancelledRef.current) {
          attempt++;
          const waitTime =
            attempt === 1 ? 5000 : attempt === 2 ? 8000 : 12000;
          await new Promise((resolve) => setTimeout(resolve, waitTime));

          if (cancelledRef.current) return;

          const thread = await createThread().unwrap();
          const systemPrompt = `You have access to a transcribed audio file in your knowledge base. Please read the transcription and provide a comprehensive summary. Focus on the main topics discussed, key points, and any important conclusions or decisions. Do not reference file names, IDs, or metadata in your response. Just provide the summary of the content.`;

          try {
            summaryResponse = await askQuestionBasedOnFile({
              threadId: thread.id,
              assistantId: audioToTextFormValues.assistantId,
              message: systemPrompt,
              assistantPrompt: "",
            }).unwrap();

            if (cancelledRef.current) return;

            const responseContent = summaryResponse.content || "";
            const isErrorResponse =
              responseContent.includes("couldn't find") ||
              responseContent.includes("I couldn't") ||
              responseContent.includes("file with the ID") ||
              responseContent.includes("feel free to upload") ||
              responseContent.includes("provide me with more context") ||
              responseContent.includes("attempt another search") ||
              responseContent.length < 50;

            if (!isErrorResponse) {
              success = true;
              const cleanedSummary = responseContent
                .replace(/【\d+:\d+†source】/g, "")
                .trim();

              setAudioToTextFormValues((prev) => ({
                ...prev,
                summary: cleanedSummary,
              }));
            } else if (attempt === maxAttempts) {
              throw new Error(
                "Failed to generate summary after multiple attempts",
              );
            }
          } catch (err) {
            if (attempt === maxAttempts) throw err;
          }
        }

        if (!success && !cancelledRef.current) {
          setAudioToTextFormValues((prev) => ({
            ...prev,
            summary:
              "Unable to generate summary at this time. The file may still be processing.",
          }));
        }
      } catch (error) {
        if (cancelledRef.current) return;
        console.error("Error processing file for vector store:", error);
        setAudioToTextFormValues((prev) => ({
          ...prev,
          summary:
            prev.summary ||
            "Unable to generate summary. Please try uploading the file again.",
        }));
        setFileProcessed(false);
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

  // ── Confirmation screen ──
  if (!confirmed) {
    const file = audioToTextFormValues.uploadedFile;
    const opts = audioToTextFormValues.transcriptionOptions;
    const selectedOptions = [
      opts.provideSummary && { icon: IconMicrophone, label: "Audio Summary" },
      opts.includeTimestamps && { icon: IconClock, label: "Timestamps" },
      opts.includeSpeakerIdentifier && {
        icon: IconUserScan,
        label: "Speaker Identification",
      },
    ].filter(Boolean) as { icon: typeof IconMicrophone; label: string }[];

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 360,
          px: 4,
          py: 6,
        }}
      >
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 800,
            color: "#1C1917",
            letterSpacing: "-0.02em",
            mb: 1,
          }}
        >
          Ready to transcribe?
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#A8A29E", mb: 4 }}>
          Review your selection before starting
        </Typography>

        {/* File info card */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderRadius: "12px",
            border: "1.5px solid #E7E5E4",
            bgcolor: "#FAFAF9",
            mb: 3,
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              bgcolor: "#E86D5A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconFile color="#FFFFFF" size={18} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: "#1C1917",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file?.name || "Unknown file"}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#A8A29E" }}>
              {file
                ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                : "Unknown size"}
            </Typography>
          </Box>
        </Box>

        {/* Selected options */}
        {selectedOptions.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "center",
              mb: 4,
              maxWidth: 400,
            }}
          >
            {selectedOptions.map((opt) => (
              <Box
                key={opt.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: "8px",
                  bgcolor: "#FEF2F0",
                  border: "1px solid #FECDC6",
                }}
              >
                <opt.icon size={14} color="#E86D5A" strokeWidth={1.5} />
                <Typography
                  sx={{ fontSize: 12, fontWeight: 500, color: "#E86D5A" }}
                >
                  {opt.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Typography
          sx={{
            fontSize: 12,
            color: "#D6D3D1",
            mb: 3,
            textAlign: "center",
          }}
        >
          This may take a few minutes depending on file length
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          {onCancel && (
            <DefaultButton
              type="secondary"
              title="Go Back"
              onClick={onCancel}
              style={{
                borderRadius: "10px",
                height: 48,
                width: 140,
                fontSize: 14,
              }}
            />
          )}
          <DefaultButton
            type="primary"
            title="Start Transcription"
            onClick={() => setConfirmed(true)}
            style={{
              borderRadius: "10px",
              height: 48,
              width: 200,
              fontSize: 14,
            }}
          />
        </Box>
      </Box>
    );
  }

  // ── Loading / processing state ──
  if (transcribing || isProcessingFile) {
    const steps = [
      { label: "Uploading audio", done: true },
      {
        label: "Processing audio stream",
        done: jobState === "active" || jobState === "completed",
      },
      { label: "Generating transcript", done: jobState === "completed" },
      { label: "Finalizing output", done: false },
    ];
    const activeStep = steps.findIndex((s) => !s.done);
    const progressPercent = Math.min(
      ((activeStep < 0 ? steps.length : activeStep) / steps.length) * 100,
      95,
    );

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "360px",
          px: 4,
        }}
      >
        {/* Animated waveform visualization */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            mb: 4,
            height: 48,
          }}
        >
          {WAVE_BARS.map((bar, i) => (
            <Box
              key={i}
              sx={{
                width: 4,
                borderRadius: "2px",
                bgcolor: "#E86D5A",
                opacity: bar.opacity,
                animation: `waveBar${i} 1.2s ease-in-out ${i * 0.1}s infinite alternate`,
                height: `${bar.startHeight}px`,
                [`@keyframes waveBar${i}`]: {
                  "0%": { height: "12px", opacity: 0.3 },
                  "100%": {
                    height: `${bar.endHeight}px`,
                    opacity: 1,
                  },
                },
              }}
            />
          ))}
        </Box>

        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 800,
            color: "#1C1917",
            letterSpacing: "-0.02em",
            mb: 1,
          }}
        >
          {transcribing ? "Transcribing..." : "Processing..."}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#A8A29E", mb: 4 }}>
          This may take a few minutes depending on file length
        </Typography>

        {/* Progress bar */}
        <Box sx={{ width: "100%", maxWidth: 400, mb: 4 }}>
          <Box
            sx={{
              width: "100%",
              height: 4,
              borderRadius: 2,
              bgcolor: "#F5F5F4",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                borderRadius: 2,
                bgcolor: "#E86D5A",
                width: `${progressPercent}%`,
                transition: "width 1s ease",
              }}
            />
          </Box>
        </Box>

        {/* Step indicators */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            width: "100%",
            maxWidth: 300,
          }}
        >
          {steps.map((step, i) => (
            <Box
              key={step.label}
              sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: step.done
                    ? "#E86D5A"
                    : i === activeStep
                      ? "#1C1917"
                      : "#F5F5F4",
                  transition: "all 0.3s ease",
                }}
              >
                {step.done ? (
                  <Box
                    component="span"
                    sx={{ color: "#FFFFFF", fontSize: 11, fontWeight: 700 }}
                  >
                    ✓
                  </Box>
                ) : i === activeStep ? (
                  <CircularProgress size={10} sx={{ color: "#FFFFFF" }} />
                ) : (
                  <Box
                    component="span"
                    sx={{ color: "#D6D3D1", fontSize: 10, fontWeight: 600 }}
                  >
                    {i + 1}
                  </Box>
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight:
                    step.done ? 600 : i === activeStep ? 600 : 400,
                  color:
                    step.done
                      ? "#1C1917"
                      : i === activeStep
                        ? "#1C1917"
                        : "#A8A29E",
                  transition: "all 0.3s ease",
                }}
              >
                {step.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Cancel button */}
        <Box sx={{ mt: 5 }}>
          <DefaultButton
            type="secondary"
            title="Cancel"
            onClick={handleCancel}
            style={{
              borderRadius: "8px",
              height: 40,
              width: 120,
              fontSize: 13,
            }}
          />
        </Box>
      </Box>
    );
  }

  // ── Error state ──
  if (transcriptionError) {
    return (
      <ErrorState
        title="Transcription Failed"
        message={transcriptionError}
        actionLabel="Try Again"
        onAction={() => {
          setTranscriptionError(null);
          setConfirmed(false);
          transcriptionStartedForFileRef.current = null;
        }}
        secondaryLabel="Go Back"
        onSecondary={async () => {
          await cleanupResources();
          onCancel?.();
        }}
      />
    );
  }

  // ── Transcript result ──
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
