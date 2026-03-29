import {
  Box,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { DropzoneState } from "../../../../../components/layouts/FileUploader";
import { AudioToTextFlow } from "../../../../../types/audioToText";
import {
  IconFile,
  IconTrashFilled,
  IconUpload,
  IconCheck,
  IconMicrophone,
  IconClock,
  IconUserScan,
} from "@tabler/icons-react";
import ReplayIcon from "@mui/icons-material/Replay";
import DefaultButton from "../../../../../components/layouts/DefaultButton";

interface AudioToTextUploadsProps {
  nextStep: () => void;
  initialValues: AudioToTextFlow;
  setAudioToTextFormValues: React.Dispatch<
    React.SetStateAction<AudioToTextFlow>
  >;
}

// Custom toggle card for options instead of bland checkboxes
const OptionCard = ({
  checked,
  onChange,
  icon: Icon,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: typeof IconMicrophone;
  title: string;
  description: string;
}) => (
  <Box
    onClick={() => onChange(!checked)}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: 2,
      borderRadius: "12px",
      border: "1.5px solid",
      borderColor: checked ? "#E86D5A" : "#E7E5E4",
      bgcolor: checked ? "#FEF2F0" : "#FFFFFF",
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": {
        borderColor: checked ? "#D4553F" : "#D6D3D1",
        bgcolor: checked ? "#FEF2F0" : "#FAFAF9",
      },
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "10px",
        bgcolor: checked ? "#E86D5A" : "#F5F5F4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s ease",
        flexShrink: 0,
      }}
    >
      <Icon size={18} color={checked ? "#FFFFFF" : "#78716C"} strokeWidth={1.5} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: "#1C1917",
          lineHeight: 1.3,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          color: "#A8A29E",
          lineHeight: 1.4,
        }}
      >
        {description}
      </Typography>
    </Box>
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: "6px",
        border: "1.5px solid",
        borderColor: checked ? "#E86D5A" : "#D6D3D1",
        bgcolor: checked ? "#E86D5A" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s ease",
        flexShrink: 0,
      }}
    >
      {checked && <IconCheck size={14} color="#FFFFFF" strokeWidth={2.5} />}
    </Box>
  </Box>
);

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
      file: { fileId: "", fileName: "" },
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

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += 10;
      if (progress >= 90) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
      setUploadProgress(progress);
    }, 100);

    setAudioToTextFormValues((prev) => ({
      ...prev,
      uploadedFile: selectedFile,
    }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const fileType = selectedFile.type;

      if (
        fileType.startsWith("audio/") ||
        fileType === "video/mp4" ||
        fileType === "video/mpeg" ||
        fileType === "video/quicktime"
      ) {
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
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setDropzoneState("error");
      setUploadError("File upload failed. Please try again.");
      setUploadProgress(0);
    }
  };

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
      setFile(null);
      await handleUpload(droppedFiles[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(null);
      await handleUpload(selectedFile);
    }
  };

  const renderDropzone = () => {
    switch (dropzoneState) {
      case "default":
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              py: 4,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "14px",
                bgcolor: "#1C1917",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconUpload color="#FFFFFF" size={24} strokeWidth={1.5} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#1C1917",
                  mb: 0.5,
                  letterSpacing: "-0.01em",
                }}
              >
                Drop your audio file here
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#A8A29E" }}>
                or{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#E86D5A",
                    fontWeight: 600,
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  browse files
                </Box>
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#D6D3D1", mt: 1 }}>
                MP3, MP4, WAV, MOV supported
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
              gap: 1.5,
              py: 4,
              width: "70%",
              mx: "auto",
            }}
          >
            <Typography sx={{ fontSize: 13, color: "#78716C", fontWeight: 500 }}>
              Uploading...
            </Typography>
            <LinearProgress
              sx={{
                width: "100%",
                borderRadius: 4,
                height: 3,
                bgcolor: "#F5F5F4",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#E86D5A",
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#E86D5A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconFile color="#FFFFFF" size={16} />
              </Box>
              <Tooltip placement="top" title={file?.name} arrow>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1C1917",
                  }}
                >
                  {file?.name?.length! > 35
                    ? file?.name.substring(0, 35) + "..."
                    : file?.name}
                </Typography>
              </Tooltip>
            </Box>
            <Tooltip title="Remove" placement="top" arrow>
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  clearFileUpload();
                }}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": { bgcolor: "#FEF2F0" },
                }}
              >
                <IconTrashFilled size={16} color="#A8A29E" />
              </Box>
            </Tooltip>
          </Box>
        );
      case "error":
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <IconFile color="#DC5E5E" size={20} />
              <Typography sx={{ color: "#DC5E5E", fontSize: 13, fontWeight: 500 }}>
                {uploadError || "Upload failed. Please try again."}
              </Typography>
            </Box>
            <Box
              onClick={(e) => {
                e.stopPropagation();
                handleRetryUpload();
              }}
              sx={{
                cursor: "pointer",
                color: "#DC5E5E",
                "&:hover": { color: "#b91c1c" },
              }}
            >
              <ReplayIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  const hasSelection =
    initialValues.transcriptionOptions.provideSummary ||
    initialValues.transcriptionOptions.includeTimestamps ||
    initialValues.transcriptionOptions.includeSpeakerIdentifier;

  return (
    <Box sx={{ px: 4, pt: 2, pb: 6 }}>
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
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
          Transcription
        </Typography>
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 800,
            color: "#1C1917",
            letterSpacing: "-0.02em",
          }}
        >
          New Transcription
        </Typography>
      </Box>

      {/* Split layout: Upload left, Options right */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
          mb: 4,
        }}
      >
        {/* Left — Upload */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: "#1C1917",
              mb: 1.5,
            }}
          >
            Audio File
          </Typography>
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: "2px dashed",
              borderColor: dropzoneState === "uploaded" ? "#E86D5A" : "#E7E5E4",
              borderRadius: "16px",
              px: 3,
              cursor: "pointer",
              bgcolor: dropzoneState === "uploaded" ? "#FEF2F0" : "#FAFAF9",
              transition: "all 0.2s ease",
              height: "100%",
              minHeight: 240,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                borderColor: "#E86D5A",
                bgcolor: "#FEF2F0",
              },
            }}
          >
            <input
              ref={fileInputRef}
              accept="audio/*,video/mp4,video/mpeg,video/quicktime"
              style={{ display: "none" }}
              type="file"
              onChange={handleFileChange}
            />
            <Box sx={{ width: "100%" }}>{renderDropzone()}</Box>
          </Box>
        </Box>

        {/* Right — Options */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: "#1C1917",
              mb: 1.5,
            }}
          >
            Options
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <OptionCard
              checked={initialValues.transcriptionOptions.provideSummary}
              onChange={(checked) =>
                setAudioToTextFormValues((prev) => ({
                  ...prev,
                  transcriptionOptions: {
                    ...prev.transcriptionOptions,
                    provideSummary: checked,
                  },
                }))
              }
              icon={IconMicrophone}
              title="Audio Summary"
              description="Generate a concise summary of the audio content"
            />
            <OptionCard
              checked={initialValues.transcriptionOptions.includeTimestamps}
              onChange={(checked) =>
                setAudioToTextFormValues((prev) => ({
                  ...prev,
                  transcriptionOptions: {
                    ...prev.transcriptionOptions,
                    includeTimestamps: checked,
                  },
                }))
              }
              icon={IconClock}
              title="Timestamps"
              description="Include time markers throughout the transcript"
            />
            <OptionCard
              checked={
                initialValues.transcriptionOptions.includeSpeakerIdentifier
              }
              onChange={(checked) =>
                setAudioToTextFormValues((prev) => ({
                  ...prev,
                  transcriptionOptions: {
                    ...prev.transcriptionOptions,
                    includeSpeakerIdentifier: checked,
                  },
                }))
              }
              icon={IconUserScan}
              title="Speaker Identification"
              description="Detect and label different speakers (Beta)"
            />
          </Box>
        </Box>
      </Box>

      {/* Action — anchored to right column width */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <DefaultButton
          style={{
            borderRadius: "10px",
            height: 48,
            width: "calc(50% - 12px)",
            fontSize: 15,
          }}
          type="primary"
          title="Transcribe Audio"
          onClick={nextStep}
          disabled={dropzoneState !== "uploaded" || !hasSelection}
        />
      </Box>
    </Box>
  );
};

export default AudioToTextUploads;
