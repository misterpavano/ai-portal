import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { useAtom } from "jotai";
import {
  routeValidatorFormAtom,
  routeValidatorStepAtom,
} from "../../../../../atoms/routeValidatorAtom";
import {
  IconFile,
  IconFileTypePdf,
  IconFileZip,
  IconFileTypeDocx,
  IconUpload,
  IconTrashFilled,
  IconCheck,
} from "@tabler/icons-react";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { useUploadDocumentMutation } from "../../../../../api/slices/routeValidatorSlice";
import JSZip from "jszip";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/legacy/build/pdf.worker.min.mjs`;

const documentTypes = [
  {
    id: "route",
    name: "PDF",
    description: "Route as PDF document",
    icon: IconFileTypePdf,
    accept: ".pdf",
    disabled: false,
  },
  {
    id: "screenshots",
    name: "ZIP",
    description: "Route as screenshots",
    icon: IconFileZip,
    accept: ".zip",
    disabled: false,
  },
  {
    id: "word",
    name: "Word",
    description: "Route as .doc/.docx",
    icon: IconFileTypeDocx,
    accept: ".doc,.docx",
    disabled: false,
  },
];

const DocumentToReviewStep: React.FC = () => {
  const [routeValidatorFormValues, setRouteValidatorFormValues] = useAtom(
    routeValidatorFormAtom,
  );
  const [currentStepState, setCurrentStep] = useAtom(routeValidatorStepAtom);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);
  const previousStepRef = useRef<number>(0);

  const [uploadDocument] = useUploadDocumentMutation();

  const fileUploaded = !!routeValidatorFormValues.file?.fileName;
  const uploadedFileName = routeValidatorFormValues.file?.fileName || "";

  useEffect(() => {
    if (currentStepState.currentStep === 0 && previousStepRef.current > 0) {
      setJustUploaded(false);
    }
    previousStepRef.current = currentStepState.currentStep;
  }, [currentStepState.currentStep]);

  const showUploadComplete =
    fileUploaded && justUploaded && currentStepState.currentStep === 0;

  const handleDocumentTypeSelect = (typeId: string) => {
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      documentType: typeId,
      file: { fileId: "", fileName: "" },
      extractedImages: [],
      extractedText: "",
    }));
  };

  const processFile = async (selectedFile: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return 90;
        return Math.min(prev + 10, 90);
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await uploadDocument(formData).unwrap();

      let extractedImages: { id: string; url: string; name: string }[] = [];

      if (routeValidatorFormValues.documentType === "screenshots") {
        try {
          const zip = await JSZip.loadAsync(selectedFile);
          const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];
          const imageEntries: { filename: string; file: (typeof zip.files)[string] }[] = [];
          for (const [filename, file] of Object.entries(zip.files)) {
            if (file.dir) continue;
            const baseName = filename.split("/").pop() || filename;
            if (baseName.startsWith(".") || baseName.startsWith("._") || filename.includes("__MACOSX")) continue;
            const isImage = imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
            if (isImage) imageEntries.push({ filename, file });
          }
          imageEntries.sort((a, b) => {
            const nameA = (a.filename.split("/").pop() || a.filename).toLowerCase();
            const nameB = (b.filename.split("/").pop() || b.filename).toLowerCase();
            return nameA.localeCompare(nameB, undefined, { numeric: true });
          });
          for (let i = 0; i < imageEntries.length; i++) {
            const { filename, file } = imageEntries[i];
            try {
              const blob = await file.async("blob");
              if (blob.size === 0) continue;
              extractedImages.push({ id: `img-${i + 1}`, url: URL.createObjectURL(blob), name: filename });
            } catch (error) {
              console.error(`Error processing image ${filename}:`, error);
            }
          }
        } catch (error) {
          console.error("Error extracting ZIP file:", error);
        }
      }

      if (routeValidatorFormValues.documentType === "route") {
        try {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const numPages = pdfDoc.numPages;
          const RENDER_SCALE = 2;
          const JPEG_QUALITY = 0.88;
          for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            try {
              const page = await pdfDoc.getPage(pageNum);
              const viewport = page.getViewport({ scale: RENDER_SCALE });
              const canvas = document.createElement("canvas");
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              const context = canvas.getContext("2d");
              if (!context) continue;
              context.fillStyle = "#ffffff";
              context.fillRect(0, 0, canvas.width, canvas.height);
              await page.render({ canvas, canvasContext: context, viewport }).promise;
              const blob: Blob = await new Promise((resolve) =>
                canvas.toBlob((b) => resolve(b!), "image/jpeg", JPEG_QUALITY),
              );
              if (!blob || blob.size === 0) continue;
              extractedImages.push({ id: `img-${pageNum}`, url: URL.createObjectURL(blob), name: `page-${String(pageNum).padStart(3, "0")}.jpg` });
            } catch (pageError) {
              console.error(`Error rendering PDF page ${pageNum}:`, pageError);
            }
          }
        } catch (error) {
          console.error("Error extracting PDF file:", error);
        }
      }

      setRouteValidatorFormValues((prev) => ({
        ...prev,
        file: { fileId: response.fileId, fileName: response.fileName, fileObject: selectedFile },
        extractedImages,
      }));
      setUploadProgress(100);
      setJustUploaded(true);
    } catch (error: any) {
      console.error("Error uploading file:", error);
      setUploadError(error?.data?.message || error?.data?.error || error?.message || "SERVER ISSUE - please try again later.");
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleBack = () => {
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      file: { fileId: "", fileName: "" },
      extractedImages: [],
      extractedText: "",
    }));
    setUploadError(null);
    setUploadProgress(0);
    setJustUploaded(false);
  };

  const handleConfirm = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  const selectedType = routeValidatorFormValues.documentType;
  const selectedTypeConfig = documentTypes.find((t) => t.id === selectedType);

  return (
    <Box sx={{ px: 4, pt: 2, pb: 6 }}>
      {/* Split layout */}
      <Box
        sx={{
          display: "flex",
          gap: 4,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Left — Document type selection */}
        <Box sx={{ flex: "0 0 280px" }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: "#1C1917",
              mb: 1.5,
            }}
          >
            Document Type
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {documentTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <Box
                  key={type.id}
                  onClick={() => !type.disabled && handleDocumentTypeSelect(type.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: "12px",
                    border: "1.5px solid",
                    borderColor: isSelected ? "#E86D5A" : "#E7E5E4",
                    bgcolor: isSelected ? "#FEF2F0" : "#FFFFFF",
                    cursor: type.disabled ? "not-allowed" : "pointer",
                    opacity: type.disabled ? 0.5 : 1,
                    transition: "all 0.15s ease",
                    "&:hover": {
                      borderColor: type.disabled ? "#E7E5E4" : isSelected ? "#D4553F" : "#D6D3D1",
                      bgcolor: type.disabled ? "#FFFFFF" : isSelected ? "#FEF2F0" : "#FAFAF9",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      bgcolor: isSelected ? "#E86D5A" : "#F5F5F4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} color={isSelected ? "#FFFFFF" : "#78716C"} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1C1917", lineHeight: 1.3 }}>
                      {type.name}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#A8A29E", lineHeight: 1.4 }}>
                      {type.description}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: "6px",
                      border: "1.5px solid",
                      borderColor: isSelected ? "#E86D5A" : "#D6D3D1",
                      bgcolor: isSelected ? "#E86D5A" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                      flexShrink: 0,
                    }}
                  >
                    {isSelected && <IconCheck size={14} color="#FFFFFF" strokeWidth={2.5} />}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Right — Upload area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: "#1C1917",
              mb: 1.5,
            }}
          >
            Upload Document
          </Typography>

          {showUploadComplete ? (
            /* Uploaded state */
            <Box
              sx={{
                border: "2px solid #E86D5A",
                borderRadius: "16px",
                bgcolor: "#FEF2F0",
                p: 3,
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    bgcolor: "#E86D5A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconCheck size={22} color="#FFFFFF" strokeWidth={2} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#1C1917" }}>
                    Upload complete
                  </Typography>
                  <Tooltip title={uploadedFileName} placement="top">
                    <Typography sx={{ fontSize: 13, color: "#78716C" }}>
                      {uploadedFileName.length > 40
                        ? uploadedFileName.substring(0, 40) + "..."
                        : uploadedFileName}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ ml: "auto" }}>
                  <Tooltip title="Remove" placement="top">
                    <Box
                      onClick={handleBack}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": { bgcolor: "rgba(232,109,90,0.15)" },
                      }}
                    >
                      <IconTrashFilled size={16} color="#A8A29E" />
                    </Box>
                  </Tooltip>
                </Box>
              </Box>
              <DefaultButton
                title="Continue to Review"
                type="primary"
                onClick={handleConfirm}
                style={{ borderRadius: "10px", height: 44, width: 200 }}
              />
            </Box>
          ) : selectedType ? (
            /* Drop zone */
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              sx={{
                border: "2px dashed",
                borderColor: "#E7E5E4",
                borderRadius: "16px",
                px: 3,
                cursor: isUploading ? "default" : "pointer",
                bgcolor: "#FAFAF9",
                transition: "all 0.2s ease",
                minHeight: 240,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: isUploading ? 0.7 : 1,
                "&:hover": {
                  borderColor: isUploading ? "#E7E5E4" : "#E86D5A",
                  bgcolor: isUploading ? "#FAFAF9" : "#FEF2F0",
                },
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelect}
                accept={selectedTypeConfig?.accept}
                disabled={isUploading}
              />
              {isUploading ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: "70%" }}>
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
                    value={uploadProgress}
                  />
                </Box>
              ) : uploadError ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 4 }}>
                  <Typography sx={{ color: "#DC5E5E", fontSize: 13, fontWeight: 500, textAlign: "center" }}>
                    {uploadError}
                  </Typography>
                  <Typography
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadError(null);
                      fileInputRef.current?.click();
                    }}
                    sx={{
                      color: "#E86D5A",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Try Again
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 4 }}>
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
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#1C1917", mb: 0.5, letterSpacing: "-0.01em" }}>
                      Drop your {selectedTypeConfig?.name} file here
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#A8A29E" }}>
                      or{" "}
                      <Box component="span" sx={{ color: "#E86D5A", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
                        browse files
                      </Box>
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#D6D3D1", mt: 1 }}>
                      {selectedTypeConfig?.accept?.split(",").map((ext) => ext.trim()).join(", ")} supported
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            /* No type selected yet */
            <Box
              sx={{
                border: "2px dashed #E7E5E4",
                borderRadius: "16px",
                minHeight: 240,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#FAFAF9",
              }}
            >
              <Typography sx={{ fontSize: 14, color: "#A8A29E" }}>
                Select a document type to upload
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentToReviewStep;
