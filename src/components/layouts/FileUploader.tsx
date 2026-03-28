import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  FormHelperText,
  Tooltip,
} from "@mui/material";
import { IconFile, IconTrashFilled } from "@tabler/icons-react";
import mammoth from "mammoth";

export type DropzoneState = "default" | "loading" | "uploaded" | "error";
export type FileUploadProps = {
  text: string;
  description?: string;
  onFileUploaded: (fileContents: string[], fileName: string) => void;
  setFileUploaded: React.Dispatch<React.SetStateAction<boolean>>;
  clearFileUpload: () => void;
  dropzoneState: DropzoneState;
  uploadProgress: number;
};

const FileUploader = ({
  text,
  description,
  onFileUploaded,
  setFileUploaded,
  clearFileUpload,
  dropzoneState,
  uploadProgress,
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [, setFileContents] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      newFiles.forEach(readFileContent);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles) {
      const newFiles = Array.from(droppedFiles);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      newFiles.forEach(readFileContent);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const fileContent = event.target.result as string;
        onFileUploaded([fileContent], file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleClearUpload = (index: number) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      setFileContents((prevContents) => {
        const updatedContents = prevContents.filter((_, i) => i !== index);
        if (updatedFiles.length > 0) {
          onFileUploaded(updatedContents, updatedFiles[0].name);
        } else {
          onFileUploaded([], "");
        }
        return updatedContents;
      });
      if (updatedFiles.length === 0) {
        setFileUploaded(false);
        clearFileUpload();
      }
      return updatedFiles;
    });
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
            sx={{ display: "flex", alignItems: "center", gap: 1, width: "40%" }}
          >
            <IconFile color="#57534E" size={20} />
            <LinearProgress
              sx={{ width: "100%" }}
              color="info"
              variant="determinate"
              value={uploadProgress}
            />
          </Box>
        );
      case "uploaded":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {files.map((file, index) => {
              const shortName =
                file.name.length > 25
                  ? file.name.substring(0, 25) + "..."
                  : file.name;
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconFile color="#57534E" size={16} />
                    <Tooltip placement="right-start" title={file.name} arrow>
                      <Typography sx={{ color: "#E86D5A", fontSize: "14px" }}>
                        {shortName}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <Box>
                    <IconTrashFilled
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClearUpload(index);
                      }}
                      style={{ cursor: "pointer" }}
                      size={16}
                      color="#DC5E5E"
                    />
                  </Box>
                </Box>
              );
            })}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconFile color="#57534E" size={16} />
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
                An error occurred while uploading. Please try again.
              </Typography>
            </Box>
            <Typography
              onClick={(event) => {
                event.stopPropagation();
                handleClearUpload(0);
              }}
              sx={{
                color: "error.main",
                fontSize: "12px",
                fontWeight: "bold",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Try Again
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <FormHelperText sx={{ color: "neutral.700", pb: 0.5 }}>{text}</FormHelperText>
      <Box sx={{ pb: 0.5 }}>
        <Typography sx={{ fontSize: "11px", color: "neutral.600" }}>
          {description}
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
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileSelect}
          accept=".txt,.doc,.docx"
          multiple
        />
        {renderContent()}
      </Box>
    </Box>
  );
};

export default FileUploader;

export const MeetingNotesFileUploader = ({
  text,
  description,
  onFileUploaded,
  setFileUploaded,
  clearFileUpload,
  dropzoneState,
  uploadProgress,
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [, setFileContents] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      newFiles.forEach(readFileContent);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles) {
      const newFiles = Array.from(droppedFiles);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      newFiles.forEach(readFileContent);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const readFileContent = async (file: File) => {
    if (file.name.endsWith(".docx")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const extractedText = result.value; // The text extracted from the DOCX
        onFileUploaded([extractedText], file.name);
      } catch (error) {
        console.error("Error extracting DOCX file:", error);
        onFileUploaded([], file.name);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const fileContent = event.target.result as string;
          onFileUploaded([fileContent], file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearUpload = (index: number) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      setFileContents((prevContents) => {
        const updatedContents = prevContents.filter((_, i) => i !== index);
        if (updatedFiles.length > 0) {
          onFileUploaded(updatedContents, updatedFiles[0].name);
        } else {
          onFileUploaded([], "");
        }
        return updatedContents;
      });
      if (updatedFiles.length === 0) {
        setFileUploaded(false);
        clearFileUpload();
      }
      return updatedFiles;
    });
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
            sx={{ display: "flex", alignItems: "center", gap: 1, width: "40%" }}
          >
            <IconFile color="#57534E" size={20} />
            <LinearProgress
              sx={{ width: "100%" }}
              color="info"
              variant="determinate"
              value={uploadProgress}
            />
          </Box>
        );
      case "uploaded":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {files.map((file, index) => {
              const shortName =
                file.name.length > 25
                  ? file.name.substring(0, 25) + "..."
                  : file.name;
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconFile color="#57534E" size={16} />
                    <Tooltip placement="right-start" title={file.name} arrow>
                      <Typography sx={{ color: "#E86D5A", fontSize: "14px" }}>
                        {shortName}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <Box>
                    <IconTrashFilled
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClearUpload(index);
                      }}
                      style={{ cursor: "pointer" }}
                      size={16}
                      color="#DC5E5E"
                    />
                  </Box>
                </Box>
              );
            })}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconFile color="#57534E" size={16} />
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
                An error occurred while uploading. Please try again.
              </Typography>
            </Box>
            <Typography
              onClick={(event) => {
                event.stopPropagation();
                handleClearUpload(0);
              }}
              sx={{
                color: "error.main",
                fontSize: "12px",
                fontWeight: "bold",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Try Again
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <FormHelperText sx={{ color: "neutral.700", pb: 0.5 }}>{text}</FormHelperText>
      <Box sx={{ pb: 0.5 }}>
        <Typography sx={{ fontSize: "11px", color: "neutral.600" }}>
          {description}
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
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileSelect}
          accept=".txt,.doc,.docx"
          multiple
        />
        {renderContent()}
      </Box>
    </Box>
  );
};
