import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  LinearProgress,
  CircularProgress,
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
} from "@tabler/icons-react";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { useUploadDocumentMutation } from "../../../../../api/slices/routeValidatorSlice";
import JSZip from "jszip";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Use CDN worker so it loads on staging/production even when /pdf.worker.min.mjs isn't served
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/legacy/build/pdf.worker.min.mjs`;

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

  // Check if file is already uploaded from form state
  const fileUploaded = !!routeValidatorFormValues.file?.fileName;
  const uploadedFileName = routeValidatorFormValues.file?.fileName || "";

  // Track step changes to detect when navigating back to step 0
  useEffect(() => {
    // If we're navigating back to step 0 from a later step, reset justUploaded
    if (currentStepState.currentStep === 0 && previousStepRef.current > 0) {
      setJustUploaded(false);
    }
    previousStepRef.current = currentStepState.currentStep;
  }, [currentStepState.currentStep]);

  // Show "Upload complete" only if we just uploaded a file (not when navigating back)
  const showUploadComplete =
    fileUploaded && justUploaded && currentStepState.currentStep === 0;

  const documentTypes = [
    {
      id: "route",
      name: "PDF Document",
      description: "Route provided as a PDF document.",
      icon: <IconFileTypePdf size={40} />,
      accept: ".pdf",
      disabled: false,
    },
    {
      id: "screenshots",
      name: "ZIP File",
      description: "Route provided as a ZIP file.",
      icon: <IconFileZip size={40} />,
      accept: ".zip",
      disabled: false, // Temporarily disabled
    },
    {
      id: "word",
      name: "Word Document",
      description: "Route provided as a Word document (.doc, .docx).",
      icon: <IconFileTypeDocx size={40} />,
      accept: ".doc,.docx",
      disabled: false, // Temporarily disabled
    },
  ];

  const handleDocumentTypeSelect = (typeId: string) => {
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      documentType: typeId,
      file: { fileId: "", fileName: "" }, // Clear previous file on type change
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
        if (prev >= 90) {
          return 90;
        }
        return Math.min(prev + 10, 90);
      });
    }, 300);

    try {
      // Upload file to backend
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await uploadDocument(formData).unwrap();

      console.log("[DocumentToReviewStep] Upload response:", response);

      // Extract images from ZIP file if it's a screenshots type
      let extractedImages: { id: string; url: string; name: string }[] = [];

      if (routeValidatorFormValues.documentType === "screenshots") {
        try {
          console.log(
            "[DocumentToReviewStep] Extracting images from ZIP file...",
          );
          const zip = await JSZip.loadAsync(selectedFile);

          const imageExtensions = [
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".bmp",
            ".webp",
          ];

          // Collect image entries then sort by filename so page 1..N matches backend (backend sorts the same way)
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
            const nameA = (
              a.filename.split("/").pop() || a.filename
            ).toLowerCase();
            const nameB = (
              b.filename.split("/").pop() || b.filename
            ).toLowerCase();
            return nameA.localeCompare(nameB, undefined, { numeric: true });
          });

          for (
            let imageIndex = 0;
            imageIndex < imageEntries.length;
            imageIndex++
          ) {
            const { filename, file } = imageEntries[imageIndex];
            try {
              const blob = await file.async("blob");
              if (blob.size === 0) continue;
              const imageUrl = URL.createObjectURL(blob);
              extractedImages.push({
                id: `img-${imageIndex + 1}`,
                url: imageUrl,
                name: filename,
              });
            } catch (error) {
              console.error(
                `[DocumentToReviewStep] Error processing image ${filename}:`,
                error,
              );
            }
          }

          console.log(
            `[DocumentToReviewStep] Extracted ${extractedImages.length} images from ZIP`,
          );
        } catch (error) {
          console.error("Error extracting ZIP file:", error);
          // Continue with upload even if extraction fails
        }
      }

      // Extract images from PDF file (render each page as an image)
      if (routeValidatorFormValues.documentType === "route") {
        try {
          console.log(
            "[DocumentToReviewStep] Extracting images from PDF file...",
          );
          const arrayBuffer = await selectedFile.arrayBuffer();
          const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer })
            .promise;
          const numPages = pdfDoc.numPages;
          const RENDER_SCALE = 2; // 2x scale for good quality (match PDF clarity)
          // JPEG quality for extracted page images (keeps export PDF size reasonable vs PNG)
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

              // Fill white background before rendering PDF content
              context.fillStyle = "#ffffff";
              context.fillRect(0, 0, canvas.width, canvas.height);

              const renderTask = page.render({
                canvas,
                canvasContext: context,
                viewport: viewport,
              });
              await renderTask.promise;

              console.log(
                `[DocumentToReviewStep] PDF page ${pageNum} rendered: ${canvas.width}x${canvas.height}`,
              );

              // Use JPEG (not PNG) to keep export PDF size small; PNG would make export ~10x larger
              const blob: Blob = await new Promise((resolve) =>
                canvas.toBlob((b) => resolve(b!), "image/jpeg", JPEG_QUALITY),
              );
              if (!blob || blob.size === 0) continue;

              const imageUrl = URL.createObjectURL(blob);
              extractedImages.push({
                id: `img-${pageNum}`,
                url: imageUrl,
                name: `page-${String(pageNum).padStart(3, "0")}.jpg`,
              });
            } catch (pageError) {
              console.error(
                `[DocumentToReviewStep] Error rendering PDF page ${pageNum}:`,
                pageError,
              );
            }
          }

          console.log(
            `[DocumentToReviewStep] Extracted ${extractedImages.length} images from PDF (${numPages} pages)`,
          );
        } catch (error) {
          console.error("Error extracting PDF file:", error);
          // Continue with upload even if extraction fails
        }
      }

      // Update form state with file info and extracted images
      setRouteValidatorFormValues((prev) => ({
        ...prev,
        file: {
          fileId: response.fileId,
          fileName: response.fileName,
          fileObject: selectedFile, // Store file object for later use
        },
        extractedImages, // Store extracted images
      }));

      setUploadProgress(100);
      setJustUploaded(true); // Mark that we just uploaded a file
    } catch (error: any) {
      console.error("Error uploading file:", error);
      setUploadError(
        error?.data?.message ||
          error?.data?.error ||
          error?.message ||
          "SERVER ISSUE - please try again later.",
      );
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
      // Clear the input value to fix the bug where selecting the same file again doesn't trigger onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleBack = () => {
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      file: {
        fileId: "",
        fileName: "",
      },
      extractedImages: [],
      extractedText: "",
    }));
    setUploadError(null);
    setUploadProgress(0);
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
    <Box sx={{ padding: "20px 0 20px 20px" }}>
      <Typography
        sx={{
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#A8A29E",
          borderBottom: "1px solid #E7E5E4",
          paddingBottom: "12px",
          marginBottom: "16px",
        }}
      >
        Select a document type:
      </Typography>

      {!showUploadComplete ? (
        <>
          <Grid container spacing={1.5} sx={{ maxWidth: 540, marginBottom: 4 }}>
            {documentTypes.map((type) => (
              <Grid item xs={12} sm={4} key={type.id}>
                <Box
                  onClick={() =>
                    !type.disabled && handleDocumentTypeSelect(type.id)
                  }
                  sx={{
                    width: 160,
                    height: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: "12px",
                    border: "1px solid #E7E5E4",
                    borderLeft:
                      selectedType === type.id
                        ? "3px solid #E86D5A"
                        : "1px solid #E7E5E4",
                    borderRadius: "10px",
                    padding: "20px 16px",
                    overflow: "hidden",
                    cursor: type.disabled ? "not-allowed" : "pointer",
                    backgroundColor:
                      selectedType === type.id ? "#FAFAF9" : "#FFFFFF",
                    opacity: type.disabled ? 0.5 : 1,
                    transition: "all 200ms ease-out",
                    boxShadow:
                      selectedType === type.id
                        ? "0 4px 12px rgba(28,25,23,0.08), 0 2px 4px rgba(28,25,23,0.04)"
                        : "0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)",
                    "&:hover": {
                      backgroundColor: type.disabled
                        ? "#FFFFFF"
                        : selectedType === type.id
                          ? "#FAFAF9"
                          : "#FAFAF9",
                      boxShadow: type.disabled
                        ? "0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)"
                        : "0 4px 12px rgba(28,25,23,0.08), 0 2px 4px rgba(28,25,23,0.04)",
                      transform:
                        type.disabled || selectedType === type.id
                          ? "none"
                          : "translateY(-1px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: "#44403C",
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      "& svg": { width: 36, height: 36 },
                    }}
                  >
                    {type.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#1C1917",
                      textAlign: "center",
                      lineHeight: 1.2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      flexShrink: 0,
                    }}
                  >
                    {type.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      fontWeight: 400,
                      color: "#A8A29E",
                      textAlign: "center",
                      lineHeight: 1.4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      flexShrink: 0,
                    }}
                  >
                    {type.description}
                  </Typography>
                  {type.disabled && (
                    <Typography
                      sx={{
                        fontSize: "10px",
                        color: "#78716C",
                        textAlign: "center",
                        flexShrink: 0,
                      }}
                    >
                      Coming soon
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>

          {selectedType && (
            <Box sx={{ width: 460 }}>
              <Box sx={{ pb: 0.5, mb: 1 }}>
                <Typography sx={{ fontSize: "12px", color: "#78716C" }}>
                  You can either drag and drop the file into the section below
                  or browse to attach it.
                  {selectedTypeConfig?.accept && (
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      {" "}
                      (
                      {selectedTypeConfig.accept
                        .split(",")
                        .map((ext) => ext.trim())
                        .join(", ")}
                      )
                    </Box>
                  )}
                </Typography>
              </Box>
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                sx={{
                  backgroundColor: "#FAFAF9",
                  border: "1px dashed #D6D3D1",
                  borderRadius: "10px",
                  padding: "20px",
                  display: "flex",
                  minHeight: "10px",
                  width: "95%",
                  cursor: "pointer",
                  flexDirection: "column",
                  opacity: isUploading ? 0.6 : 1,
                }}
                onClick={() => !isUploading && fileInputRef.current?.click()}
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
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      width: "100%",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        color="error"
                        variant="determinate"
                        value={uploadProgress}
                      />
                    </Box>
                    <CircularProgress
                      size={20}
                      sx={{ color: "error.main" }}
                    />
                  </Box>
                ) : uploadError ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{ color: "error.main", fontSize: "12px" }}
                    >
                      {uploadError}
                    </Typography>
                    <Typography
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadError(null);
                        fileInputRef.current?.click();
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
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconFile color="#A8A29E" size={20} />
                    <Typography
                      sx={{ color: "#78716C", fontSize: "13px" }}
                    >
                      Drop file here or{" "}
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 600,
                          color: "#1C1917",
                          textDecoration: "underline",
                        }}
                      >
                        Browse files
                      </Box>
                      {selectedTypeConfig?.accept && (
                        <Box
                          component="span"
                          sx={{ ml: 0.5, fontSize: "11px", color: "#A8A29E" }}
                        >
                          (
                          {selectedTypeConfig.accept
                            .split(",")
                            .map((ext) => ext.trim())
                            .join(", ")}
                          )
                        </Box>
                      )}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ maxWidth: 980 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              marginBottom: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#3D9A5C",
              }}
            >
              Upload complete
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#44403C" }}>
              {uploadedFileName}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
            <DefaultButton
              title="Back"
              type="secondary"
              onClick={handleBack}
              style={{ width: 100 }}
            />
            <DefaultButton
              title="Confirm"
              type="primary"
              onClick={handleConfirm}
              style={{ width: 100 }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DocumentToReviewStep;

// const renderTask = page.render({
//   canvas,
//   canvasContext: context,
//   viewport: viewport,
// });
// await renderTask.promise;
