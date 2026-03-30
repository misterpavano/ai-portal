import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useAtom } from "jotai";
import {
  routeValidatorFormAtom,
  routeValidatorStepAtom,
} from "../../../../../atoms/routeValidatorAtom";
import {
  IconFileTypePdf,
  IconFileZip,
  IconFileTypeDocx,
} from "@tabler/icons-react";
import OptionCard from "../../../../../components/shared/OptionCard";
import FileDropzone, {
  DropzoneStatus,
} from "../../../../../components/shared/FileDropzone";
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
    formatHint: "PDF supported",
    disabled: false,
  },
  {
    id: "screenshots",
    name: "ZIP",
    description: "Route as screenshots",
    icon: IconFileZip,
    accept: ".zip",
    formatHint: "ZIP archive supported",
    disabled: false,
  },
  {
    id: "word",
    name: "Word",
    description: "Route as .doc/.docx",
    icon: IconFileTypeDocx,
    accept: ".doc,.docx",
    formatHint: "DOC, DOCX supported",
    disabled: false,
  },
];

const DocumentToReviewStep: React.FC = () => {
  const [routeValidatorFormValues, setRouteValidatorFormValues] = useAtom(
    routeValidatorFormAtom,
  );
  const [currentStepState, setCurrentStep] = useAtom(routeValidatorStepAtom);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dropzoneStatus, setDropzoneStatus] = useState<DropzoneStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const previousStepRef = useRef<number>(0);

  const [uploadDocument] = useUploadDocumentMutation();

  const fileUploaded = !!routeValidatorFormValues.file?.fileName;

  useEffect(() => {
    if (currentStepState.currentStep === 0 && previousStepRef.current > 0) {
      // Returning to this step from a later one
    }
    previousStepRef.current = currentStepState.currentStep;
  }, [currentStepState.currentStep]);

  // Sync dropzone status from persisted form state
  useEffect(() => {
    if (fileUploaded && dropzoneStatus === "idle") {
      setDropzoneStatus("uploaded");
    }
  }, [fileUploaded]);

  const handleDocumentTypeSelect = (typeId: string) => {
    // Toggle: if same type clicked, deselect
    const newType =
      routeValidatorFormValues.documentType === typeId ? "" : typeId;
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      documentType: newType,
      file: { fileId: "", fileName: "" },
      extractedImages: [],
      extractedText: "",
    }));
    setDropzoneStatus("idle");
    setUploadError(null);
  };

  const processFile = async (selectedFile: File) => {
    setDropzoneStatus("uploading");
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
          const imageExtensions = [
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".bmp",
            ".webp",
          ];
          const imageEntries: {
            filename: string;
            file: (typeof zip.files)[string];
          }[] = [];
          for (const [filename, file] of Object.entries(zip.files)) {
            if (file.dir) continue;
            const baseName = filename.split("/").pop() || filename;
            if (
              baseName.startsWith(".") ||
              baseName.startsWith("._") ||
              filename.includes("__MACOSX")
            )
              continue;
            const isImage = imageExtensions.some((ext) =>
              filename.toLowerCase().endsWith(ext),
            );
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
              extractedImages.push({
                id: `img-${i + 1}`,
                url: URL.createObjectURL(blob),
                name: filename,
              });
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
          const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer })
            .promise;
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
              await page.render({ canvas, canvasContext: context, viewport })
                .promise;
              const blob: Blob = await new Promise((resolve) =>
                canvas.toBlob(
                  (b) => resolve(b!),
                  "image/jpeg",
                  JPEG_QUALITY,
                ),
              );
              if (!blob || blob.size === 0) continue;
              extractedImages.push({
                id: `img-${pageNum}`,
                url: URL.createObjectURL(blob),
                name: `page-${String(pageNum).padStart(3, "0")}.jpg`,
              });
            } catch (pageError) {
              console.error(
                `Error rendering PDF page ${pageNum}:`,
                pageError,
              );
            }
          }
        } catch (error) {
          console.error("Error extracting PDF file:", error);
        }
      }

      setRouteValidatorFormValues((prev) => ({
        ...prev,
        file: {
          fileId: response.fileId,
          fileName: response.fileName,
          fileObject: selectedFile,
        },
        extractedImages,
      }));
      setUploadProgress(100);
      setDropzoneStatus("uploaded");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      setUploadError(
        error?.data?.message ||
          error?.data?.error ||
          error?.message ||
          "SERVER ISSUE - please try again later.",
      );
      setDropzoneStatus("error");
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);
    }
  };

  const handleRemove = () => {
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      file: { fileId: "", fileName: "" },
      extractedImages: [],
      extractedText: "",
    }));
    setUploadError(null);
    setUploadProgress(0);
    setDropzoneStatus("idle");
  };

  // Auto-detect document type from file extension
  const autoDetectType = (file: File): string => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf")) return "route";
    if (name.endsWith(".zip")) return "screenshots";
    if (name.endsWith(".doc") || name.endsWith(".docx")) return "word";
    return "route";
  };

  const processFileWithAutoDetect = async (selectedFile: File) => {
    const detectedType = autoDetectType(selectedFile);
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      documentType: detectedType,
    }));
    await processFile(selectedFile);
  };

  const mainFileInputRef = React.useRef<HTMLInputElement>(null);
  const annotatedFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAnnotatedFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRouteValidatorFormValues((prev) => ({
        ...prev,
        annotatedFile: file as any,
        useAnnotatedFile: true,
      }));
    }
  };

  const handleMainFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFileWithAutoDetect(file);
  };

  return (
    <Box sx={{ px: 4, pt: 2, pb: 3 }}>
      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
        {/* Upload Document - compact bar */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1C1917", mb: 1 }}>
            Upload Document
          </Typography>
          <input
            type="file"
            ref={mainFileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.zip,.doc,.docx"
            onChange={handleMainFileSelect}
          />
          {fileUploaded ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                borderRadius: "10px",
                border: "1.5px solid #E86D5A",
                bgcolor: "#FEF2F0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#E86D5A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconFileTypePdf color="#FFFFFF" size={14} />
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1C1917", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {routeValidatorFormValues.file?.fileName || routeValidatorFormValues.file?.fileObject?.name}
                </Typography>
              </Box>
              <Box onClick={handleRemove} sx={{ cursor: "pointer", color: "#A8A29E", "&:hover": { color: "#E86D5A" }, flexShrink: 0, ml: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Remove</Typography>
              </Box>
            </Box>
          ) : (
            <Box
              onClick={() => mainFileInputRef.current?.click()}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                borderRadius: "10px",
                border: "1.5px dashed #D6D3D1",
                bgcolor: "#FAFAF9",
                cursor: "pointer",
                transition: "all 0.15s ease",
                "&:hover": { borderColor: "#E86D5A", bgcolor: "#FEF2F0" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <IconUpload color="#A8A29E" size={16} strokeWidth={1.5} />
                <Typography sx={{ fontSize: 13, color: "#78716C" }}>
                  PDF, ZIP, DOC, DOCX
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#E86D5A" }}>Browse</Typography>
            </Box>
          )}
        </Box>

        {/* Annotated File - compact bar */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1C1917", mb: 1 }}>
            Annotated File <Box component="span" sx={{ fontWeight: 400, color: "#A8A29E" }}>(optional)</Box>
          </Typography>
          <input
            type="file"
            ref={annotatedFileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.doc,.docx"
            onChange={handleAnnotatedFileSelect}
          />
          {routeValidatorFormValues.annotatedFile ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                borderRadius: "10px",
                border: "1.5px solid #E86D5A",
                bgcolor: "#FEF2F0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#E86D5A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconFileTypePdf color="#FFFFFF" size={14} />
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1C1917", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {routeValidatorFormValues.annotatedFile.name}
                </Typography>
              </Box>
              <Box
                onClick={() => {
                  setRouteValidatorFormValues((prev) => ({ ...prev, annotatedFile: null, annotationData: undefined, useAnnotatedFile: false }));
                  if (annotatedFileInputRef.current) annotatedFileInputRef.current.value = "";
                }}
                sx={{ cursor: "pointer", color: "#A8A29E", "&:hover": { color: "#E86D5A" }, flexShrink: 0, ml: 1 }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Remove</Typography>
              </Box>
            </Box>
          ) : (
            <Box
              onClick={() => annotatedFileInputRef.current?.click()}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                borderRadius: "10px",
                border: "1.5px dashed #D6D3D1",
                bgcolor: "#FAFAF9",
                cursor: "pointer",
                transition: "all 0.15s ease",
                "&:hover": { borderColor: "#E86D5A", bgcolor: "#FEF2F0" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <IconUpload color="#A8A29E" size={16} strokeWidth={1.5} />
                <Typography sx={{ fontSize: 13, color: "#78716C" }}>
                  PDF, DOC, DOCX
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#E86D5A" }}>Browse</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentToReviewStep;
