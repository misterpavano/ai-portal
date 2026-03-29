import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextareaAutosize,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useAtom } from "jotai";
import { routeValidatorFormAtom } from "../../../../../atoms/routeValidatorAtom";
import { IconFile, IconX } from "@tabler/icons-react";
import {
  extractCommentsFromDocx,
  AnnotationSummary,
  ExtractedComment,
} from "./OutputStep/wordDocUtils/extractCommentsFromDocx";
import { extractCommentsFromPdf } from "./OutputStep/pdfUtils/extractCommentsFromPdf";

const DirectionStep: React.FC = () => {
  const [routeValidatorFormValues, setRouteValidatorFormValues] = useAtom(
    routeValidatorFormAtom,
  );
  const [showReviewSummary, setShowReviewSummary] = useState(false);
  const [annotationData, setAnnotationData] =
    useState<AnnotationSummary | null>(null);
  const [isExtractingComments, setIsExtractingComments] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAdditionalNotesChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      additionalNotes: event.target.value,
    }));
  };

  const handleUseAdditionalNotesChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      useAdditionalNotes: event.target.checked,
    }));
  };

  const handleUseAnnotatedFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const checked = event.target.checked;
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      useAnnotatedFile: checked,
      ...(checked ? {} : { annotatedFile: null, annotationData: undefined }),
    }));
    if (!checked) setShowReviewSummary(false);
  };

  const handleRemoveAnnotatedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      annotatedFile: null,
      annotationData: undefined,
    }));
    setAnnotationData(null);
    setShowReviewSummary(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const extractAnnotations = async (file: File) => {
    setIsExtractingComments(true);
    try {
      const name = file.name.toLowerCase();
      if (name.endsWith(".docx")) {
        const extracted = await extractCommentsFromDocx(file);
        setAnnotationData(extracted);
        setRouteValidatorFormValues((prev) => ({
          ...prev,
          annotationData: extracted,
        }));
      } else if (name.endsWith(".pdf")) {
        const extracted = await extractCommentsFromPdf(file);
        setAnnotationData(extracted);
        setRouteValidatorFormValues((prev) => ({
          ...prev,
          annotationData: extracted,
        }));
      } else {
        const emptyData = {
          summary:
            "Annotation extraction is supported for PDF and Word (.docx) only. Please upload a PDF or .docx file to view annotations.",
          annotations: [],
        };
        setAnnotationData(emptyData);
        setRouteValidatorFormValues((prev) => ({
          ...prev,
          annotationData: emptyData,
        }));
      }
    } catch (error) {
      console.error("Error extracting annotations:", error);
      const errorData = {
        summary: `Error extracting annotations: ${error instanceof Error ? error.message : "Unknown error"}`,
        annotations: [],
      };
      setAnnotationData(errorData);
      setRouteValidatorFormValues((prev) => ({
        ...prev,
        annotationData: errorData,
      }));
    } finally {
      setIsExtractingComments(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setRouteValidatorFormValues((prev) => ({
        ...prev,
        annotatedFile: selectedFile as any,
      }));
      await extractAnnotations(selectedFile);
      setShowReviewSummary(true);
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setRouteValidatorFormValues((prev) => ({
        ...prev,
        annotatedFile: droppedFile as any,
      }));
      await extractAnnotations(droppedFile);
      setShowReviewSummary(true);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleCloseDialog = () => {
    setShowReviewSummary(false);
  };

  // Extract annotations when file is selected and dialog is opened
  useEffect(() => {
    if (
      showReviewSummary &&
      routeValidatorFormValues.annotatedFile &&
      !annotationData &&
      !isExtractingComments
    ) {
      extractAnnotations(routeValidatorFormValues.annotatedFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReviewSummary, routeValidatorFormValues.annotatedFile]);

  return (
    <Box sx={{ padding: "20px 0 20px 20px" }}>
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
          Guidance
        </Typography>
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 700,
            color: "#1C1917",
            letterSpacing: "-0.01em",
          }}
        >
          Direction
        </Typography>
      </Box>

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 980 }}
      >
        {/* Additional Notes Section */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginBottom: 1,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={routeValidatorFormValues.useAdditionalNotes}
                  onChange={handleUseAdditionalNotesChange}
                  sx={{
                    color: "#A8A29E",
                    "&.Mui-checked": { color: "#E86D5A" },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#1C1917" }}>
                  Additional notes for AI Review
                </Typography>
              }
            />
          </Box>
          {routeValidatorFormValues.useAdditionalNotes && (
            <TextareaAutosize
              minRows={8}
              value={routeValidatorFormValues.additionalNotes}
              onChange={handleAdditionalNotesChange}
              placeholder="Enter additional notes..."
              style={{
                width: "95%",
                padding: "12px",
                border: "1px solid #E7E5E4",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          )}
        </Box>

        {/* Upload Annotated File Section */}
        <Box
          sx={{
            width: 400,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginBottom: 1,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={routeValidatorFormValues.useAnnotatedFile}
                  onChange={handleUseAnnotatedFileChange}
                  sx={{
                    color: "#A8A29E",
                    "&.Mui-checked": { color: "#E86D5A" },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#1C1917" }}>
                  Upload annotated file from previous round
                </Typography>
              }
            />
          </Box>
          {routeValidatorFormValues.useAnnotatedFile && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                sx={{
                  border: "1px dashed #D6D3D1",
                  borderRadius: "10px",
                  padding: 2.5,
                  display: "flex",
                  minHeight: "10px",
                  width: "95%",
                  cursor: "pointer",
                  flexDirection: "column",
                  backgroundColor: "#FAFAF9",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: "#E86D5A",
                    backgroundColor: "#FEF2F0",
                  },
                }}
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx"
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 0.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconFile color="#44403C" size={20} />
                    <Typography sx={{ color: "neutral.700", fontSize: "14px" }}>
                      Drop file here or{" "}
                      <Box
                        component="span"
                        sx={{ fontWeight: "bold", textDecoration: "underline" }}
                      >
                        Browse files
                      </Box>
                    </Typography>
                  </Box>
                  <Typography sx={{ color: "neutral.500", fontSize: "12px" }}>
                    Accepted files: PDF and Word
                  </Typography>
                </Box>
              </Box>
              {routeValidatorFormValues.annotatedFile && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    paddingLeft: 1,
                  }}
                >
                  <IconFile color="#44403C" size={16} />
                  <Typography sx={{ color: "neutral.700", fontSize: "12px" }}>
                    {routeValidatorFormValues.annotatedFile.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleRemoveAnnotatedFile}
                    aria-label="Remove file"
                    sx={{ ml: 0.5, padding: 0.25 }}
                  >
                    <IconX size={16} color="#44403C" />
                  </IconButton>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Review Summary Link - only when checkbox is checked and a file is uploaded */}
        {routeValidatorFormValues.useAnnotatedFile &&
          routeValidatorFormValues.annotatedFile && (
            <Box>
              <Typography
                onClick={() => setShowReviewSummary(true)}
                sx={{
                  color: "#E86D5A",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Review Summary
              </Typography>
            </Box>
          )}
      </Box>

      {/* Review Summary Dialog */}
      <Dialog
        open={showReviewSummary}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          Annotation Summary
          <IconButton onClick={handleCloseDialog} size="small">
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {isExtractingComments ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 4,
              }}
            >
              <CircularProgress />
              <Typography sx={{ marginLeft: 2 }}>
                Extracting annotations...
              </Typography>
            </Box>
          ) : annotationData ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography
                sx={{ fontSize: "14px", color: "neutral.700", marginBottom: 1 }}
              >
                {annotationData.summary}
              </Typography>
              {annotationData.annotations.length === 0 ? (
                <Typography sx={{ fontSize: "14px", color: "neutral.600" }}>
                  No annotations found in this file. The PDF may use a comment
                  format we don&apos;t yet extract, or the file may have no
                  comments.
                </Typography>
              ) : (
                <Box>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    {annotationData.annotations.map(
                      (annotation: ExtractedComment, index: number) => (
                        <Box
                          key={annotation.id || index}
                          sx={{
                            padding: 1.5,
                            backgroundColor: "neutral.100",
                            borderRadius: 1,
                          }}
                        >
                          {annotation.issue && (
                            <Typography
                              sx={{
                                fontSize: "14px",
                                lineHeight: 1.6,
                                fontWeight: 500,
                                marginBottom: 0.5,
                              }}
                            >
                              {annotation.type && `[${annotation.type}] `}
                              {annotation.issue}
                            </Typography>
                          )}
                          {annotation.reasoning && (
                            <Typography
                              sx={{
                                fontSize: "13px",
                                lineHeight: 1.6,
                                color: "neutral.700",
                                marginBottom: 0.5,
                              }}
                            >
                              <strong>Reasoning:</strong> {annotation.reasoning}
                            </Typography>
                          )}
                          {annotation.recommendation && (
                            <Typography
                              sx={{
                                fontSize: "13px",
                                lineHeight: 1.6,
                                color: "neutral.700",
                              }}
                            >
                              <strong>Recommendation:</strong>{" "}
                              {annotation.recommendation}
                            </Typography>
                          )}
                          {!annotation.issue &&
                            !annotation.reasoning &&
                            !annotation.recommendation && (
                              <>
                                <Typography
                                  sx={{ fontSize: "14px", lineHeight: 1.6 }}
                                >
                                  {annotation.text}
                                </Typography>
                                {annotation.associatedText && (
                                  <Typography
                                    sx={{
                                      fontSize: "13px",
                                      lineHeight: 1.6,
                                      color: "neutral.700",
                                      marginTop: 0.5,
                                      fontStyle: "italic",
                                    }}
                                  >
                                    <strong>Associated text:</strong> "
                                    {annotation.associatedText}"
                                  </Typography>
                                )}
                              </>
                            )}
                          {annotation.associatedText &&
                            (annotation.issue ||
                              annotation.reasoning ||
                              annotation.recommendation) && (
                              <Typography
                                sx={{
                                  fontSize: "13px",
                                  lineHeight: 1.6,
                                  color: "neutral.700",
                                  marginTop: 0.5,
                                  fontStyle: "italic",
                                }}
                              >
                                <strong>Associated text:</strong> "
                                {annotation.associatedText}"
                              </Typography>
                            )}
                          {annotation.author &&
                            annotation.author !== "Unknown" && (
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  color: "neutral.500",
                                  marginTop: 0.5,
                                }}
                              >
                                — {annotation.author}
                                {annotation.date &&
                                  !Number.isNaN(
                                    new Date(annotation.date).getTime(),
                                  ) &&
                                  ` • ${new Date(annotation.date).toLocaleDateString()}`}
                              </Typography>
                            )}
                        </Box>
                      ),
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <Typography sx={{ fontSize: "14px", lineHeight: 1.6 }}>
                No annotation data available. Please upload an annotated file to
                view the summary.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DirectionStep;
