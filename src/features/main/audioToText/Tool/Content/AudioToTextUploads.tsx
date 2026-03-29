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
import { IconFile, IconTrashFilled, IconUpload } from "@tabler/icons-react";
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
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                backgroundColor: "#F5F5F4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconUpload color="#78716C" size={20} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ color: "#1C1917", fontSize: 14, fontWeight: 600, mb: 0.5 }}>
                Drop audio file here or{" "}
                <Box
                  component="span"
                  sx={{ color: "#E86D5A", textDecoration: "underline", cursor: "pointer" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse
                </Box>
              </Typography>
              <Typography sx={{ color: "#A8A29E", fontSize: 12 }}>
                MP3, MP4, WAV, and other audio/video formats
              </Typography>
            </Box>
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
              mx: "auto",
            }}
          >
            <LinearProgress
              sx={{
                width: "100%",
                borderRadius: 4,
                height: 4,
                backgroundColor: "#F5F5F4",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#E86D5A",
                  borderRadius: 4,
                },
              }}
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
                <IconFile color="#78716C" size={16} />
                <Tooltip placement="right-start" title={file?.name} arrow>
                  <Typography sx={{ color: "#E86D5A", fontSize: 14, fontWeight: 500 }}>
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
              <Typography sx={{ color: "error.main", fontSize: 12 }}>
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
        {/* Section header: label + title pattern */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "#A8A29E",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              mb: 0.5,
            }}
          >
            Upload
          </Typography>
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 700,
              color: "#1C1917",
              letterSpacing: "-0.01em",
            }}
          >
            Audio File
          </Typography>
        </Box>

        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          sx={{
            border: "1px dashed #D6D3D1",
            borderRadius: "10px",
            padding: 2.5,
            display: "flex",
            minHeight: "10px",
            width: "50%",
            cursor: "pointer",
            flexDirection: "column",
            backgroundColor: "#FAFAF9",
            transition: "all 0.15s ease",
            "&:hover": {
              borderColor: "#E86D5A",
              backgroundColor: "#FEF2F0",
            },
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

        {/* Transcription options */}
        <Box sx={{ mt: 4, mb: 3 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "#A8A29E",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              mb: 1.5,
            }}
          >
            Options
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
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
                  sx={{
                    color: "#A8A29E",
                    "&.Mui-checked": { color: "#E86D5A" },
                  }}
                />
              }
              label="Provide Summary of Audio"
              sx={{ "& .MuiFormControlLabel-label": { fontSize: 14, color: "#1C1917" } }}
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
                  sx={{
                    color: "#A8A29E",
                    "&.Mui-checked": { color: "#E86D5A" },
                  }}
                />
              }
              label="Include Timestamps"
              sx={{ "& .MuiFormControlLabel-label": { fontSize: 14, color: "#1C1917" } }}
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
                  sx={{
                    color: "#A8A29E",
                    "&.Mui-checked": { color: "#E86D5A" },
                  }}
                />
              }
              label="Include Speaker Identifier (Beta)"
              sx={{ "& .MuiFormControlLabel-label": { fontSize: 14, color: "#1C1917" } }}
            />
          </Box>
        </Box>

        <DefaultButton
          style={{
            borderRadius: "8px",
            height: 44,
            width: 160,
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
