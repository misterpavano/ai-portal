import {
  Box,
  Typography,
  Tooltip,
  LinearProgress,
  FormControlLabel,
  Radio,
  CircularProgress,
} from "@mui/material";
import { Form, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import TextArea from "../../../../../components/layouts/TextArea";
import { discussionSchema } from "../../../../../schemas/discussionGuideSchema";
import {
  InterviewDiscussionFormValues,
  InterviewSummariesFlow,
} from "../../../../../types/interviewSummaries";
import ReplayIcon from "@mui/icons-material/Replay";
import { DropzoneState } from "../../../../../components/layouts/FileUploader";
import { IconFile, IconFileSearch, IconTrashFilled } from "@tabler/icons-react";
import {
  useAddFileToVectorStoreMutation,
  useLazyGetTranscriptionStatusQuery,
  useTranscribeAudioMutation,
  useUploadFileMutation,
} from "../../../../../api/slices/openAiSlice";
import TranscriptBox from "../Modals/TranscriptBox";
import { TranscriptData } from "../../../../../types/response/openai";
import { useAtom } from "jotai";
import { vectorStoreIdMeetingSummaryAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";

const POLL_INTERVAL = 10000;

export type InterviewDiscussionFormProps = {
  initialValues: InterviewDiscussionFormValues;
  setInterviewDiscussionFormValues: React.Dispatch<
    React.SetStateAction<InterviewSummariesFlow>
  >;
  modelError: string | null;
};

const InterviewDiscussionForm = ({
  initialValues,
  setInterviewDiscussionFormValues,
  modelError,
}: InterviewDiscussionFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile] = useUploadFileMutation();
  const [addFileToVectorStore] = useAddFileToVectorStoreMutation();
  const [transcribeAudio] = useTranscribeAudioMutation();
  const [vectorStoreId] = useAtom(vectorStoreIdMeetingSummaryAtom);
  const [file, setFile] = useState<File | null>(null);
  const [dropzoneState, setDropzoneState] = useState<DropzoneState>("default");
  const [openTranscriptModal, setOpenTranscriptModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [transcript, setTranscript] = useState<string | TranscriptData>("");
  const [transcribing, setIsTranscribing] = useState(false);
  const [getTranscriptionStatus] = useLazyGetTranscriptionStatusQuery();
  const [jobId, setJobId] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null,
  );
  const [jobState, setJobState] = useState<
    "waiting" | "active" | "completed" | "failed" | null
  >(null);
  const [transcriptResetKey, setTranscriptResetKey] = useState(0);

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

  const handleObjectiveChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    handleChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void,
  ) => {
    handleChange(e);
    setInterviewDiscussionFormValues((prev) => ({
      ...prev,
      objectives: e.target.value,
    }));
  };

  const handleObjectivesSummaryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    handleChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void,
  ) => {
    handleChange(e);
    setInterviewDiscussionFormValues((prev) => ({
      ...prev,
      objectivesSummary: e.target.value,
    }));
  };

  const clearFileUpload = () => {
    setFile(null);
    setTranscript("");
    setInterviewDiscussionFormValues((prev) => ({
      ...prev,
      objectives: "",
      file: {
        fileId: "",
        fileName: "",
      },
    }));
    setFileUploaded(false);
    setDropzoneState("default");
    setUploadProgress(0);
    setIsTranscribing(false);
    setJobId(null);
    setJobState(null);
    setTranscriptionError(null);
    setTranscriptResetKey((prev) => prev + 1); // Reset transcript state
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

          // ✅ Set the transcript (handles both string and object formats)
          setTranscript(transcriptData || "");

          const transcriptText = getTranscriptText(transcriptData);

          if (transcriptText.trim() !== "") {
            const transcriptBlob = new Blob([transcriptText], {
              type: "text/plain",
            });
            const txtFile = new File([transcriptBlob], "transcript.txt", {
              type: "text/plain",
            });

            const txtFormData = new FormData();
            txtFormData.append("file", txtFile);

            const uploadResponse = await uploadFile(txtFormData).unwrap();

            await addFileToVectorStore({
              vectorId: vectorStoreId,
              file_id: uploadResponse.id,
            }).unwrap();

            setInterviewDiscussionFormValues((prevValues) => ({
              ...prevValues,
              file: {
                fileId: uploadResponse.id,
                fileName: uploadResponse.filename,
              },
            }));

            setDropzoneState("uploaded");
            setTranscriptionError(null);
            // Reset transcript state after successful upload to vector store
            setTranscriptResetKey((prev) => prev + 1);
          } else {
            setDropzoneState("error");
            setTranscriptionError("Transcription failed. Try again.");
          }
        } else if (statusResponse.state === "failed") {
          clearInterval(interval);
          setIsTranscribing(false);
          setDropzoneState("error");
          setTranscriptionError("Transcription failed. Try again.");
        }
      } catch (err) {
        console.error("Polling error:", err);
        clearInterval(interval);
        setIsTranscribing(false);
        setDropzoneState("error");
        setTranscriptionError("Transcription failed. Try again.");
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [
    jobId,
    jobState,
    getTranscriptionStatus,
    uploadFile,
    addFileToVectorStore,
    setInterviewDiscussionFormValues,
  ]);

  const handleUpload = async (selectedFile: File) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setDropzoneState("loading");
    setUploadProgress(0);
    setTranscript("");
    setTranscriptResetKey((prev) => prev + 1); // Reset transcript state when new file upload starts

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const fileType = selectedFile.type;

      if (fileType.startsWith("audio/")) {
        setIsTranscribing(true);
        const { jobId } = await transcribeAudio(formData).unwrap();
        setJobId(jobId);
        setJobState("waiting");
        console.log("Job queued:", jobId);
      } else {
        const response = await uploadFile(formData).unwrap();
        await addFileToVectorStore({
          vectorId: vectorStoreId,
          file_id: response.id,
        }).unwrap();

        setInterviewDiscussionFormValues((prevValues) => ({
          ...prevValues,
          file: {
            fileId: response.id,
            fileName: response.filename,
          },
        }));
        setUploadProgress(100);
        setFileUploaded(true);
        setDropzoneState("uploaded");
        // Reset transcript state after successful upload to vector store
        setTranscriptResetKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("File processing failed:", error);
      setDropzoneState("error");
      setIsTranscribing(false);
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleRetryUpload = () => {
    setFile(null);
    setTranscript("");
    setDropzoneState("default");
    setTranscriptionError(null);
    setUploadProgress(0);
    setIsTranscribing(false);
    setJobId(null);
    setJobState(null);
    setFileUploaded(false);
    setTranscriptResetKey((prev) => prev + 1); // Reset transcript state

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      setFile(null);
      await handleUpload(droppedFile);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(null);
      e.target.value = "";
      await handleUpload(selectedFile);
    }
  };

  useEffect(() => {
    if (initialValues.objectives === "") {
      setFileUploaded(false);
    }
  }, [initialValues.objectives]);

  const renderContent = () => {
    switch (dropzoneState) {
      case "default":
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconFile color="#475467" size={20} />
            <Typography sx={{ color: "#475467", fontSize: "14px" }}>
              Drop items here or{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", textDecoration: "underline" }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                    fileInputRef.current.click();
                  }
                }}
              >
                Browse files
              </Box>
            </Typography>
          </Box>
        );
      case "loading":
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "40%",
            }}
          >
            <IconFile color="#475467" size={20} />
            {transcribing ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ color: "#2688ac", fontSize: "14px" }}>
                  Transcribing
                </Typography>
                <CircularProgress size={18} sx={{ color: "#2688ac" }} />
              </Box>
            ) : transcript ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ color: "#2688ac", fontSize: "14px" }}>
                  Transcribing
                </Typography>
                <CircularProgress size={18} sx={{ color: "#2688ac" }} />
              </Box>
            ) : (
              <LinearProgress
                sx={{ width: "100%" }}
                color="error"
                variant="determinate"
                value={uploadProgress}
              />
            )}
          </Box>
        );
      case "uploaded":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconFile color="#475467" size={16} />
                <Tooltip placement="right-start" title={file?.name} arrow>
                  <Typography sx={{ color: "#2688ac", fontSize: "14px" }}>
                    {file?.name?.length! > 25
                      ? file?.name.substring(0, 25) + "..."
                      : file?.name}
                  </Typography>
                </Tooltip>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                {transcript && (
                  <Tooltip
                    title="View full transcript"
                    placement="top-end"
                    arrow
                  >
                    <IconFileSearch
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenTranscriptModal(true);
                      }}
                      style={{ cursor: "pointer" }}
                      size={18}
                      color="#2688ac"
                    />
                  </Tooltip>
                )}
                <Tooltip title="Remove file" placement="top-end" arrow>
                  <IconTrashFilled
                    onClick={(event) => {
                      event.stopPropagation();
                      clearFileUpload();
                    }}
                    style={{ cursor: "pointer" }}
                    size={16}
                    color="#DC5E5E"
                  />
                </Tooltip>
              </Box>
            </Box>
          </Box>
        );
      case "error":
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "80%",
              }}
            >
              <IconFile color="#DC5E5E" size={32} />
              <Typography sx={{ color: "#DC5E5E", fontSize: "12px" }}>
                {transcriptionError ||
                  "An error occurred while uploading. Please try again."}
              </Typography>
            </Box>
            <ReplayIcon
              onClick={(event) => {
                event.stopPropagation();
                handleRetryUpload();
              }}
              sx={{
                color: "#DC5E5E",
                cursor: "pointer",
                "&:hover": { color: "darkred" },
              }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={discussionSchema}
      onSubmit={() => {}}
    >
      {({ values, errors, handleChange, setFieldValue }) => (
        <Form>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              width: "100%",
            }}
          >
            <TextArea
              styles={{ width: "95%", minHeight: "100px", marginBottom: 2 }}
              topText="Instructions*"
              placeholder="Input instructions..."
              value={values.objectivesSummary!}
              onChange={(e) => handleObjectivesSummaryChange(e, handleChange)}
              error={!!errors.objectivesSummary}
              name="objectivesSummary"
              disabled={!!modelError}
            />
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <FormControlLabel
                  value="notes"
                  control={
                    <Radio
                      checked={values.inputMode === "notes"}
                      onChange={(e) => {
                        setFieldValue("inputMode", "notes");
                        setInterviewDiscussionFormValues((prev) => ({
                          ...prev,
                          inputMode: "notes",
                        }));
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontWeight: 500 }}>
                      Meeting Notes*
                    </Typography>
                  }
                />
              </Box>
              {values.inputMode === "notes" && (
                <TextArea
                  styles={{ width: "95%", minHeight: "300px" }}
                  placeholder="Input meeting notes..."
                  value={fileUploaded ? "" : values.objectives!}
                  onChange={(e) => handleObjectiveChange(e, handleChange)}
                  error={!!errors.objectives}
                  name="objectives"
                  disabled={fileUploaded || !!modelError}
                />
              )}
            </Box>
            {values.aiTool === "Open AI" && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <FormControlLabel
                    value="upload"
                    control={
                      <Radio
                        checked={values.inputMode === "upload"}
                        onChange={(e) => {
                          setFieldValue("inputMode", "upload");
                          setInterviewDiscussionFormValues((prev) => ({
                            ...prev,
                            inputMode: "upload",
                          }));
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontWeight: 500 }}>
                        Upload your meeting notes or transcripts below
                      </Typography>
                    }
                  />
                </Box>
                {values.inputMode === "upload" && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ pb: 0.5 }}>
                      <Typography sx={{ fontSize: "11px", color: "#767373" }}>
                        You can either drag and drop the files into the section
                        below or browse to attach them.
                      </Typography>
                    </Box>
                    <Box
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      sx={{
                        border: "1px dashed",
                        borderRadius: 2,
                        padding: 2,
                        display: "flex",
                        minHeight: "10px",
                        width: "95%",
                        cursor: "pointer",
                        flexDirection: "column",
                      }}
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                          fileInputRef.current.click();
                        }
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        multiple
                        accept=".txt, .doc, .docx, audio/*"
                        style={{ display: "none" }}
                        type="file"
                        onChange={handleFileChange}
                      />
                      {renderContent()}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
            <TranscriptBox
              open={openTranscriptModal}
              onClose={() => setOpenTranscriptModal(false)}
              transcript={transcript}
              resetKey={transcriptResetKey}
            />
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default InterviewDiscussionForm;
