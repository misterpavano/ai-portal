import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextareaAutosize,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  AccordionDetails,
  Accordion,
  AccordionSummary,
} from "@mui/material";
import { useAtom } from "jotai";
import { routeValidatorFormAtom } from "../../../../../atoms/routeValidatorAtom";
import { useGetBrandGuidelinesQuery } from "../../../../../api/slices/routeValidatorSlice";
import {
  IconChevronDown,
  IconFile,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import {
  extractCommentsFromDocx,
  AnnotationSummary,
  ExtractedComment,
} from "./OutputStep/wordDocUtils/extractCommentsFromDocx";
import { extractCommentsFromPdf } from "./OutputStep/pdfUtils/extractCommentsFromPdf";

const GEMINI_MODEL_OPTIONS = [
  {
    value: "gemini-3-pro-image-preview",
    label: "Gemini 3 Pro Image (preview)",
  },
  { value: "gemini-3-pro-preview", label: "Gemini 3 Pro (preview)" },
  { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (preview)" },
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash (preview)" },
] as const;

const DEFAULT_GEMINI_MODEL = "gemini-3-pro-image-preview";

const TasksAndDirectionStep: React.FC = () => {
  const [routeValidatorFormValues, setRouteValidatorFormValues] = useAtom(
    routeValidatorFormAtom,
  );
  const { data: brandGuidelinesData, isLoading: isLoadingGuidelines } =
    useGetBrandGuidelinesQuery();
  const [showReviewSummary, setShowReviewSummary] = useState(false);
  const [annotationData, setAnnotationData] =
    useState<AnnotationSummary | null>(null);
  const [isExtractingComments, setIsExtractingComments] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const taskOptions = [
    "spell_check",
    "grammar_consistency",
    "organization_editorial_guideline",
    "client_brand_guideline",
    "wcag_compliance",
    "seo_checks",
  ];

  const taskDisplayNames: Record<string, string> = {
    spell_check: "Spell check",
    grammar_consistency: "Grammar consistency",
    wcag_compliance: "WCAG compliance",
    seo_checks: "SEO checks",
    organization_editorial_guideline: "AMA Guidelines",
    client_brand_guideline: "Client brand guideline",
  };

  const handleTaskToggle = (task: string) => {
    setRouteValidatorFormValues((prev) => {
      const currentTasks = prev.tasks || [];
      const newTasks = currentTasks.includes(task)
        ? currentTasks.filter((t) => t !== task)
        : [...currentTasks, task];
      return {
        ...prev,
        tasks: newTasks,
      };
    });
  };

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
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      useAnnotatedFile: event.target.checked,
    }));
  };

  const handleGeminiModelChange = (event: { target: { value: unknown } }) => {
    const value = event.target.value as string;
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      geminiModel: value || DEFAULT_GEMINI_MODEL,
    }));
  };

  const extractAnnotations = async (file: File) => {
    setIsExtractingComments(true);
    try {
      const fileName = file.name.toLowerCase();
      // Extract from .docx files
      if (fileName.endsWith(".docx")) {
        const extracted = await extractCommentsFromDocx(file);
        setAnnotationData(extracted);
        // Store annotation data in form values so it's accessible for validation
        setRouteValidatorFormValues((prev) => ({
          ...prev,
          annotationData: extracted,
        }));
      } else if (fileName.endsWith(".pdf")) {
        // Extract from PDF files
        const extracted = await extractCommentsFromPdf(file);
        setAnnotationData(extracted);
        setRouteValidatorFormValues((prev) => ({
          ...prev,
          annotationData: extracted,
        }));
      } else {
        // For other formats, show a message
        const emptyData = {
          summary:
            "Annotation extraction is currently only supported for Word documents (.docx) and PDF files (.pdf). Please upload a supported file to view annotations.",
          annotations: [],
        };
        setAnnotationData(emptyData);
        setRouteValidatorFormValues((prev) => ({
          ...prev,
          annotationData: emptyData,
        }));
      }
    } catch (error) {
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

  const handleRemoveFile = () => {
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      annotatedFile: null,
      annotationData: undefined,
    }));
    setAnnotationData(null);
    setShowReviewSummary(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const isWord = routeValidatorFormValues.documentType === "word";

  return (
    <Box sx={{ padding: "20px 0 60px 40px" }}>
      {/* Model selection: only for images/screenshots; Word uses static WORD_MODEL (gemini-2.5-pro) */}
      {!isWord && (
        <Box sx={{ marginBottom: 4, maxWidth: 500 }}>
          <Accordion
            defaultExpanded
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "neutral.400",
              borderRadius: 2,
              overflow: "hidden",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<IconChevronDown size={18} />}
              sx={{
                backgroundColor: "common.white",
                minHeight: 48,

                px: 2,
                "& .MuiAccordionSummary-content": { margin: 0 },
              }}
            >
              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                Gemini Model
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: "neutral.200", px: 2, py: 2 }}>
              <FormControl fullWidth size="small">
                <Select
                  labelId="gemini-model-select-label"
                  id="gemini-model-select"
                  value={
                    routeValidatorFormValues.geminiModel || DEFAULT_GEMINI_MODEL
                  }
                  onChange={handleGeminiModelChange}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 2,
                        mt: 1,
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.12)",
                      },
                    },
                    anchorOrigin: { vertical: "bottom", horizontal: "left" },
                    transformOrigin: { vertical: "top", horizontal: "left" },
                  }}
                  sx={{
                    backgroundColor: "common.white",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "neutral.400",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "neutral.400",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "neutral.400",
                    },
                    "& .MuiSelect-select": {
                      padding: "10px 14px",
                      fontSize: 14,
                      fontWeight: 400,
                    },
                  }}
                >
                  {GEMINI_MODEL_OPTIONS.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      sx={{ fontSize: 16, fontWeight: 500 }}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* Tasks Section */}
      <Accordion
        defaultExpanded
        disableGutters
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "neutral.400",
          borderRadius: 1,
          overflow: "hidden",
          mb: 4,
          maxWidth: 500,
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<IconChevronDown size={18} />}
          sx={{
            backgroundColor: "common.white",
            minHeight: 48,
            px: 2,
            py: 1,
            "& .MuiAccordionSummary-content": { margin: 0 },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
              Tasks
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                color: "neutral.700",
                fontStyle: "italic",
              }}
            >
              Select one or more tasks to check, or skip to provide <br />{" "}
              custom direction below
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: "neutral.200", px: 2, py: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 600,
            }}
          >
            {taskOptions.map((task) => (
              <FormControlLabel
                key={task}
                control={
                  <Checkbox
                    checked={
                      routeValidatorFormValues.tasks?.includes(task) || false
                    }
                    onChange={() => handleTaskToggle(task)}
                    sx={{
                      color: "neutral.700",
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "14px" }}>
                    {taskDisplayNames[task] || task}
                  </Typography>
                }
              />
            ))}
          </Box>

          {routeValidatorFormValues.tasks?.includes(
            "client_brand_guideline",
          ) && (
            <Box sx={{ marginTop: 3, maxWidth: 400 }}>
              <FormControl fullWidth>
                <InputLabel id="brand-guideline-select-label">
                  Client Brand Guideline
                </InputLabel>
                <Select
                  labelId="brand-guideline-select-label"
                  id="brand-guideline-select"
                  value={routeValidatorFormValues.brandGuideline || ""}
                  label="Client Brand Guideline"
                  onChange={(event) => {
                    const value = event.target.value as string;
                    setRouteValidatorFormValues((prev) => ({
                      ...prev,
                      brandGuideline: value,
                      // Derive clientBrand / selectedClient directly from brandGuideline
                      clientBrand: value,
                      selectedClient: value,
                    }));
                  }}
                  disabled={isLoadingGuidelines}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "neutral.400",
                    },
                  }}
                >
                  {isLoadingGuidelines ? (
                    <MenuItem value="" disabled>
                      Loading...
                    </MenuItem>
                  ) : brandGuidelinesData?.guidelines &&
                    brandGuidelinesData.guidelines.length > 0 ? (
                    brandGuidelinesData.guidelines.map(
                      (guideline: {
                        name: string;
                        fileName: string;
                        displayName: string;
                      }) => (
                        <MenuItem key={guideline.name} value={guideline.name}>
                          {guideline.displayName}
                        </MenuItem>
                      ),
                    )
                  ) : (
                    <MenuItem value="" disabled>
                      No brand guidelines available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Direction Section */}
      <Accordion
        defaultExpanded
        disableGutters
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "neutral.400",
          borderRadius: 1,
          overflow: "hidden",
          maxWidth: 500,
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<IconChevronDown size={18} />}
          sx={{
            backgroundColor: "common.white",
            minHeight: 48,
            px: 2,
            py: 1,
            "& .MuiAccordionSummary-content": { margin: 0 },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
              Direction
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                color: "neutral.700",
                fontStyle: "italic",
              }}
            >
              Provide custom instructions or upload an annotated file. You can
              use direction independently without selecting any tasks above.
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: "neutral.200", px: 2, py: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              maxWidth: 980,
            }}
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
                        color: "neutral.700",
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
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
                        color: "neutral.700",
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
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
                      backgroundColor: "white",
                      border: "1px solid",
                      borderColor: "neutral.400",
                      padding: 2,
                      display: "flex",
                      minHeight: "10px",
                      width: "95%",
                      cursor: "pointer",
                      flexDirection: "column",
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconFile color="#44403C" size={20} />
                      <Typography sx={{ color: "neutral.700", fontSize: "14px" }}>
                        Drop file here or{" "}
                        <Box
                          component="span"
                          sx={{
                            fontWeight: "bold",
                            textDecoration: "underline",
                          }}
                        >
                          Browse files
                        </Box>
                      </Typography>
                    </Box>
                  </Box>
                  {routeValidatorFormValues.annotatedFile && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        paddingLeft: 1,
                        width: "95%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          minWidth: 0,
                        }}
                      >
                        <IconFile color="#44403C" size={16} />
                        <Typography
                          sx={{
                            color: "neutral.700",
                            fontSize: "12px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {routeValidatorFormValues.annotatedFile.name}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        sx={{
                          color: "error.main",
                          "&:hover": {
                            backgroundColor: "rgba(211, 47, 47, 0.08)",
                          },
                        }}
                        aria-label="Remove file"
                      >
                        <IconTrash size={18} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Review Summary Link - only when "Upload annotated file" is checked and a file is uploaded */}
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
        </AccordionDetails>
      </Accordion>

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
              {annotationData.annotations.length > 0 && (
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

export default TasksAndDirectionStep;
