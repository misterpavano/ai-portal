import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextareaAutosize,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useAtom } from "jotai";
import { routeValidatorFormAtom } from "../../../../../atoms/routeValidatorAtom";
import { useGetBrandGuidelinesQuery } from "../../../../../api/slices/routeValidatorSlice";
import {
  IconFile,
  IconTrash,
  IconTrashFilled,
  IconX,
  IconAbc,
  IconTextGrammar,
  IconBook2,
  IconPalette,
  IconAccessible,
  IconSeo,
  IconUpload,
} from "@tabler/icons-react";
import OptionCard from "../../../../../components/shared/OptionCard";
import {
  extractCommentsFromDocx,
  AnnotationSummary,
  ExtractedComment,
} from "./OutputStep/wordDocUtils/extractCommentsFromDocx";
import { extractCommentsFromPdf } from "./OutputStep/pdfUtils/extractCommentsFromPdf";

const DEFAULT_GEMINI_MODEL = "gemini-3-pro-image-preview";

const taskConfig = [
  {
    id: "spell_check",
    label: "Spell check",
    description: "Find and flag spelling errors",
    icon: IconAbc,
  },
  {
    id: "grammar_consistency",
    label: "Grammar consistency",
    description: "Check grammar and style consistency",
    icon: IconTextGrammar,
  },
  {
    id: "organization_editorial_guideline",
    label: "AMA Guidelines",
    description: "Validate against AMA editorial standards",
    icon: IconBook2,
  },
  {
    id: "client_brand_guideline",
    label: "Client brand guideline",
    description: "Check compliance with brand standards",
    icon: IconPalette,
  },
  {
    id: "wcag_compliance",
    label: "WCAG compliance",
    description: "Verify web accessibility standards",
    icon: IconAccessible,
  },
  {
    id: "seo_checks",
    label: "SEO checks",
    description: "Analyze search optimization factors",
    icon: IconSeo,
  },
];

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

  // Set default Gemini model on mount if not set (hidden from user)
  useEffect(() => {
    if (!routeValidatorFormValues.geminiModel) {
      setRouteValidatorFormValues((prev) => ({
        ...prev,
        geminiModel: DEFAULT_GEMINI_MODEL,
      }));
    }
  }, []);

  const handleTaskToggle = (task: string) => {
    setRouteValidatorFormValues((prev) => {
      const currentTasks = prev.tasks || [];
      const newTasks = currentTasks.includes(task)
        ? currentTasks.filter((t) => t !== task)
        : [...currentTasks, task];
      return { ...prev, tasks: newTasks };
    });
  };

  const handleAdditionalNotesChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setRouteValidatorFormValues((prev) => ({
      ...prev,
      additionalNotes: event.target.value,
      useAdditionalNotes: event.target.value.length > 0,
    }));
  };

  const extractAnnotations = async (file: File) => {
    setIsExtractingComments(true);
    try {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith(".docx")) {
        const extracted = await extractCommentsFromDocx(file);
        setAnnotationData(extracted);
        setRouteValidatorFormValues((prev) => ({
          ...prev,
          annotationData: extracted,
        }));
      } else if (fileName.endsWith(".pdf")) {
        const extracted = await extractCommentsFromPdf(file);
        setAnnotationData(extracted);
        setRouteValidatorFormValues((prev) => ({
          ...prev,
          annotationData: extracted,
        }));
      } else {
        const emptyData = {
          summary:
            "Annotation extraction is currently only supported for Word documents (.docx) and PDF files (.pdf).",
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
        useAnnotatedFile: true,
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
        useAnnotatedFile: true,
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
      useAnnotatedFile: false,
    }));
    setAnnotationData(null);
    setShowReviewSummary(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
    <Box sx={{ px: 4, pt: 0, pb: 3 }}>
      {/* ── Tasks (3x2 grid, full width) ── */}
      <Box sx={{ mb: 3 }}>
        <Box>
          <Typography
            sx={{ fontSize: 13, fontWeight: 700, color: "#1C1917", mb: 1.5 }}
          >
            Tasks
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
              gap: 2,
              flex: 1,
              alignContent: "space-between",
            }}
          >
            {taskConfig.map((task) => (
              <OptionCard
                key={task.id}
                checked={
                  routeValidatorFormValues.tasks?.includes(task.id) || false
                }
                onChange={() => handleTaskToggle(task.id)}
                icon={task.icon}
                title={task.label}
                description={task.description}
              />
            ))}
          </Box>

          {routeValidatorFormValues.tasks?.includes(
            "client_brand_guideline",
          ) && (
            <Box sx={{ mt: 2 }}>
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
                      clientBrand: value,
                      selectedClient: value,
                    }));
                  }}
                  disabled={isLoadingGuidelines}
                  sx={{
                    borderRadius: "10px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#E7E5E4",
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
        </Box>
      </Box>

      {/* ── Full width: Additional Notes ── */}
      <Box>
        <Typography
          sx={{ fontSize: 13, fontWeight: 700, color: "#1C1917", mb: 1 }}
        >
          Additional Notes
        </Typography>
        <TextareaAutosize
          minRows={4}
          maxRows={8}
          value={routeValidatorFormValues.additionalNotes || ""}
          onChange={handleAdditionalNotesChange}
          placeholder='e.g. "Focus on the claims table in section 3" or "Check that all footnotes match their references"'
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1.5px solid #E7E5E4",
            borderRadius: "10px",
            fontSize: "14px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            resize: "vertical",
            lineHeight: 1.6,
            color: "#1C1917",
            boxSizing: "border-box",
            transition: "border-color 0.15s ease",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#E86D5A";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#E7E5E4";
          }}
        />
      </Box>

      {/* Review Summary Dialog */}
      <Dialog
        open={showReviewSummary}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ style: { borderRadius: "12px" } }}
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
                              - {annotation.author}
                              {annotation.date &&
                                !Number.isNaN(
                                  new Date(annotation.date).getTime(),
                                ) &&
                                ` \u2022 ${new Date(annotation.date).toLocaleDateString()}`}
                            </Typography>
                          )}
                      </Box>
                    ),
                  )}
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
