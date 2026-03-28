import {
  Box,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { DropzoneState } from "../../../../../components/layouts/FileUploader";
import { AudioToTextFlow } from "../../../../../types/audioToText";
import { IconFile, IconTrashFilled } from "@tabler/icons-react";
import ReplayIcon from "@mui/icons-material/Replay";
import DefaultButton from "../../../../../components/layouts/DefaultButton";

interface AudioToTextUploadsProps {
  nextStep: () => void;
  initialValues: AudioToTextFlow;
  setAudioToTextFormValues: React.Dispatch<
    React.SetStateAction<AudioToTextFlow>
  >;
}

const AudioToTextUploads: React.FC<AudioToTextUploadsProps> = ({
  nextStep,
  initialValues,
  setAudioToTextFormValues,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<globalThis.File | null>(null);
  const [dropzoneState, setDropzoneState] = useState<DropzoneState>("default");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearFileUpload = () => {
    setFile(null);
    setAudioToTextFormValues((prev) => ({
      ...prev,
      tasks: [],
      file: {
        fileId: "",
        fileName: "",
      },
      uploadedFile: null,
      transcript: null,
      transcriptEdits: {
        speakerEdits: {},
        segmentTextEdits: {},
        segmentSpeakerReassignments: {},
      },
    }));
    setDropzoneState("default");
    setUploadError(null);
    setUploadProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    // Clear the file input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleRetryUpload = () => {
    setFile(null);
    setDropzoneState("default");
    setUploadError(null);
    setUploadProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleUpload = async (selectedFile: globalThis.File) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setDropzoneState("loading");
    setUploadError(null);
    setUploadProgress(0);

    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Start progress simulation
    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += 10;
      if (progress >= 90) {
        // Stop at 90% until validation completes
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
      setUploadProgress(progress);
    }, 100);

    // Store uploaded file in atom
    setAudioToTextFormValues((prev) => ({
      ...prev,
      uploadedFile: selectedFile,
    }));

    try {
      // Simulate a small delay for file validation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Just validate the file type - transcription will happen in TranscriptionPreview
      const fileType = selectedFile.type;

      if (
        fileType.startsWith("audio/") ||
        fileType === "video/mp4" ||
        fileType === "video/mpeg" ||
        fileType === "video/quicktime" // for .mov if needed
      ) {
        // Accept audio and video containers
        setUploadProgress(100);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setTimeout(() => {
          setDropzoneState("uploaded");
          setUploadProgress(0);
        }, 300);
      } else {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setDropzoneState("error");
        setUploadError("Please upload an audio or video file with audio.");
        setUploadProgress(0);
      }
    } catch (error) {
      console.error("File upload failed:", error);
      // Clear interval on error
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setDropzoneState("error");
      setUploadError("File upload failed. Please try again.");
      setUploadProgress(0);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

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
      await handleUpload(selectedFile);
    }
  };

  const renderContent = () => {
    switch (dropzoneState) {
      case "default":
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconFile color="#57534E" size={20} />
            <Typography sx={{ color: "neutral.700", fontSize: "14px" }}>
              Drop items here or{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", textDecoration: "underline" }}
                onClick={() => fileInputRef.current?.click()}
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
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 1,
              gap: 1,
              width: "90%",
            }}
          >
            <LinearProgress
              sx={{ width: "100%", backgroundColor: "#E86D5A" }}
              // color="error"
              variant="determinate"
              value={uploadProgress}
            />
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
                <IconFile color="#57534E" size={16} />
                <Tooltip placement="right-start" title={file?.name} arrow>
                  <Typography sx={{ color: "#2688ac", fontSize: "14px" }}>
                    {file?.name?.length! > 25
                      ? file?.name.substring(0, 25) + "..."
                      : file?.name}
                  </Typography>
                </Tooltip>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
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
              <Typography sx={{ color: "error.main", fontSize: "12px" }}>
                {uploadError ||
                  "An error occurred while uploading. Please try again."}
              </Typography>
            </Box>
            <ReplayIcon
              onClick={(event) => {
                event.stopPropagation();
                handleRetryUpload();
              }}
              sx={{
                color: "error.main",
                cursor: "pointer",
                "&:hover": { color: "#b91c1c" },
              }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        width: "100%",
      }}
    >
      <Box sx={{ mt: 1, padding: 4 }}>
        <Box sx={{ pb: 0.5 }}>
          <Typography sx={{ fontSize: "11px", color: "neutral.600" }}>
            You can either drag and drop the files into the section below or
            browse to attach them.
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "neutral.600", mt: 0.5 }}>
            Audio-related files such as MP3, MP4, and other audio/video formats
            are allowed to be uploaded.
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
            width: "40%",
            cursor: "pointer",
            flexDirection: "column",
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            accept="audio/*,video/mp4,video/mpeg,video/quicktime"
            style={{ display: "none" }}
            type="file"
            onChange={handleFileChange}
          />
          {renderContent()}
        </Box>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={initialValues.transcriptionOptions.provideSummary}
                onChange={(e) => {
                  setAudioToTextFormValues((prev) => ({
                    ...prev,
                    transcriptionOptions: {
                      ...prev.transcriptionOptions,
                      provideSummary: e.target.checked,
                    },
                  }));
                }}
              />
            }
            label="Provide Summary of Audio"
            sx={{ "& .MuiFormControlLabel-label": { fontSize: "14px" } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={initialValues.transcriptionOptions.includeTimestamps}
                onChange={(e) => {
                  setAudioToTextFormValues((prev) => ({
                    ...prev,
                    transcriptionOptions: {
                      ...prev.transcriptionOptions,
                      includeTimestamps: e.target.checked,
                    },
                  }));
                }}
              />
            }
            label="Include Timestamps"
            sx={{ "& .MuiFormControlLabel-label": { fontSize: "14px" } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  initialValues.transcriptionOptions.includeSpeakerIdentifier
                }
                onChange={(e) => {
                  setAudioToTextFormValues((prev) => ({
                    ...prev,
                    transcriptionOptions: {
                      ...prev.transcriptionOptions,
                      includeSpeakerIdentifier: e.target.checked,
                    },
                  }));
                }}
              />
            }
            label="Include Speaker Identifier (Beta)"
            sx={{ "& .MuiFormControlLabel-label": { fontSize: "14px" } }}
          />
        </Box>
        <DefaultButton
          style={{
            borderRadius: "8px",
            height: 45,
            marginBottom: 1.5,
            marginTop: 1,
          }}
          type="primary"
          title="Transcribe"
          onClick={nextStep}
          disabled={
            dropzoneState !== "uploaded" ||
            (!initialValues.transcriptionOptions.provideSummary &&
              !initialValues.transcriptionOptions.includeTimestamps &&
              !initialValues.transcriptionOptions.includeSpeakerIdentifier)
          }
        />
      </Box>
    </Box>
  );
};

export default AudioToTextUploads;
