import React, { useRef, useState, useEffect } from "react";
import { Box, LinearProgress, Tooltip, Typography } from "@mui/material";
import {
  IconFile,
  IconTrashFilled,
  IconUpload,
  IconCheck,
} from "@tabler/icons-react";
import ReplayIcon from "@mui/icons-material/Replay";

export type DropzoneStatus = "idle" | "uploading" | "uploaded" | "error";

export interface FileDropzoneProps {
  /** Current file (null when nothing uploaded) */
  file: File | null;
  status: DropzoneStatus;
  /** 0-100 progress while uploading */
  progress?: number;
  /** Error message when status === "error" */
  errorMessage?: string;
  /** Accepted file types, e.g. "audio/*,video/mp4" */
  accept?: string;
  /** Hint text below the CTA, e.g. "MP3, MP4, WAV supported" */
  formatHint?: string;
  /** Headline inside the dropzone */
  headline?: string;
  /** Minimum height */
  minHeight?: number;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
  onRetry?: () => void;
  disabled?: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  file,
  status,
  progress = 0,
  errorMessage,
  accept,
  formatHint,
  headline = "Drop your file here",
  minHeight = 240,
  onFileSelected,
  onRemove,
  onRetry,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileSelected(dropped);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelected(f);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClick = () => {
    if (disabled || status === "uploading") return;
    inputRef.current?.click();
  };

  const truncatedName = (name: string, max = 35) =>
    name.length > max ? name.substring(0, max) + "..." : name;

  /* ── idle ── */
  const renderIdle = () => (
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
          {headline}
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
        {formatHint && (
          <Typography sx={{ fontSize: 11, color: "#D6D3D1", mt: 1 }}>
            {formatHint}
          </Typography>
        )}
      </Box>
    </Box>
  );

  /* ── uploading ── */
  const renderUploading = () => (
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
          "& .MuiLinearProgress-bar": { bgcolor: "#E86D5A", borderRadius: 4 },
        }}
        variant="determinate"
        value={progress}
      />
    </Box>
  );

  /* ── uploaded ── */
  const renderUploaded = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 2,
        width: "100%",
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
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1C1917" }}>
            {file?.name ? truncatedName(file.name) : "File uploaded"}
          </Typography>
        </Tooltip>
      </Box>
      <Tooltip title="Remove" placement="top" arrow>
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
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

  /* ── error ── */
  const renderError = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 2,
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <IconFile color="#DC5E5E" size={20} />
        <Typography
          sx={{ color: "#DC5E5E", fontSize: 13, fontWeight: 500 }}
        >
          {errorMessage || "Upload failed. Please try again."}
        </Typography>
      </Box>
      <Box
        onClick={(e) => {
          e.stopPropagation();
          onRetry ? onRetry() : inputRef.current?.click();
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

  const content = {
    idle: renderIdle,
    uploading: renderUploading,
    uploaded: renderUploaded,
    error: renderError,
  }[status]();

  const isUploaded = status === "uploaded";

  return (
    <>
      <input
        ref={inputRef}
        accept={accept}
        style={{ display: "none" }}
        type="file"
        onChange={handleChange}
      />
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
        sx={{
          border: "2px dashed",
          borderColor: isUploaded ? "#E86D5A" : "#E7E5E4",
          borderRadius: "16px",
          px: 3,
          cursor: disabled || status === "uploading" ? "default" : "pointer",
          bgcolor: isUploaded ? "#FEF2F0" : "#FAFAF9",
          transition: "all 0.2s ease",
          minHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.6 : 1,
          "&:hover": {
            borderColor:
              disabled || status === "uploading" ? undefined : "#E86D5A",
            bgcolor:
              disabled || status === "uploading" ? undefined : "#FEF2F0",
          },
        }}
      >
        <Box sx={{ width: "100%" }}>{content}</Box>
      </Box>
    </>
  );
};

export default FileDropzone;
