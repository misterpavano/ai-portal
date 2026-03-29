import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { AudioToTextFlow } from "../../../../../types/audioToText";
import { IconMicrophone, IconClock, IconUserScan } from "@tabler/icons-react";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import OptionCard from "../../../../../components/shared/OptionCard";
import FileDropzone, {
  DropzoneStatus,
} from "../../../../../components/shared/FileDropzone";

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
  const [file, setFile] = useState<globalThis.File | null>(null);
  const [dropzoneStatus, setDropzoneStatus] = useState<DropzoneStatus>("idle");
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
    setDropzoneStatus("idle");
    setUploadError(null);
    setUploadProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleUpload = async (selectedFile: globalThis.File) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setDropzoneStatus("uploading");
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
          setDropzoneStatus("uploaded");
          setUploadProgress(0);
        }, 300);
      } else {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setDropzoneStatus("error");
        setUploadError("Please upload an audio or video file with audio.");
        setUploadProgress(0);
      }
    } catch (error) {
      console.error("File upload failed:", error);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setDropzoneStatus("error");
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

      {/* Split layout: Upload left (40%), Options right (60%) */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
          mb: 4,
        }}
      >
        {/* Left - Upload */}
        <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 320px" }, minWidth: 0 }}>
          <Typography
            sx={{ fontSize: 13, fontWeight: 700, color: "#1C1917", mb: 1.5 }}
          >
            Audio File
          </Typography>
          <FileDropzone
            file={file}
            status={dropzoneStatus}
            progress={uploadProgress}
            errorMessage={uploadError ?? undefined}
            accept="audio/*,video/mp4,video/mpeg,video/quicktime"
            headline="Drop your audio file here"
            formatHint="MP3, MP4, WAV, MOV supported"
            onFileSelected={handleUpload}
            onRemove={clearFileUpload}
            onRetry={() => {
              setDropzoneStatus("idle");
              setUploadError(null);
            }}
          />
        </Box>

        {/* Right - Options */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{ fontSize: 13, fontWeight: 700, color: "#1C1917", mb: 1.5 }}
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

      {/* Action */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <DefaultButton
          style={{
            borderRadius: "10px",
            height: 48,
            width: 200,
            fontSize: 15,
          }}
          type="primary"
          title="Transcribe Audio"
          onClick={nextStep}
          disabled={dropzoneStatus !== "uploaded" || !hasSelection}
        />
      </Box>
    </Box>
  );
};

export default AudioToTextUploads;
