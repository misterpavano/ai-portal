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

  const selectedType = routeValidatorFormValues.documentType;
  const selectedTypeConfig = documentTypes.find((t) => t.id === selectedType);

  return (
    <Box sx={{ px: 4, pt: 2, pb: 6 }}>
      {/* Split layout: Upload left (40%), Document Type right (60%) */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
          alignItems: { md: "stretch" },
          mb: 4,
        }}
      >
        {/* Left - Upload */}
        <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 320px" }, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Typography
            sx={{ fontSize: 13, fontWeight: 700, color: "#1C1917", mb: 1.5 }}
          >
            Upload Document
          </Typography>

          <FileDropzone
            file={
              routeValidatorFormValues.file?.fileObject ??
              (fileUploaded
                ? ({ name: routeValidatorFormValues.file.fileName } as File)
                : null)
            }
            status={dropzoneStatus}
            progress={uploadProgress}
            errorMessage={uploadError ?? undefined}
            accept={selectedTypeConfig?.accept}
            headline={selectedType ? `Drop your ${selectedTypeConfig?.name} file here` : "Drop your file here"}
            formatHint={selectedTypeConfig?.formatHint ?? "PDF, ZIP, DOC, DOCX supported"}
            fillHeight
            onFileSelected={processFile}
            onRemove={handleRemove}
            onRetry={() => {
              setUploadError(null);
              setDropzoneStatus("idle");
            }}
          />
        </Box>

        {/* Right - Document Type Options */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Typography
            sx={{ fontSize: 13, fontWeight: 700, color: "#1C1917", mb: 1.5 }}
          >
            Document Type
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, justifyContent: "space-between" }}>
            {documentTypes.map((type) => (
              <OptionCard
                key={type.id}
                checked={selectedType === type.id}
                onChange={() => handleDocumentTypeSelect(type.id)}
                icon={type.icon}
                title={type.name}
                description={type.description}
                disabled={type.disabled}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentToReviewStep;
