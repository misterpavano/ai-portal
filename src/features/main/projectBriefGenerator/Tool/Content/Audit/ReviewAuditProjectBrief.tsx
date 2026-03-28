import {
  Box,
  LinearProgress,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import AuditProjectBriefHeader from "./AuditProjectBriefHeader";
import useOpenAI from "../../../../../../hooks/useOpenAI";
import { useEffect, useRef, useState } from "react";
import { projectBriefFormAtom } from "../../../../../../atoms/projectBriefAtom";
import { useAtom } from "jotai";
import {
  auditProjectBriefInstructionText,
  auditPromptText,
} from "../../../../../../prompts/projectBriefGenerator/instructionText";
import {
  AuditResponse,
  ProjectBriefFlow,
} from "../../../../../../types/projectBriefTypes";
import {
  removeNewLinesAndEmptyLines,
  safeJSONParse,
} from "../../../../../../utils/textFormatter";

type TProjectType = {
  assistantId: string;
  sheetUrl: string;
  label: string;
};

interface AuditProjectBriefContentProps {
  assistantId: string;
  handleSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  projectTypes: TProjectType[];
  questions: string | undefined;
}

const ReviewAuditProjectBrief = ({
  assistantId,
  handleSelect,
  projectTypes,
  questions,
}: AuditProjectBriefContentProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectBriefFormValue, setProjectBriefFormValues] =
    useAtom(projectBriefFormAtom);
  const {
    askQuestionBasedOnFileWithoutPrompt,
    updateAssistantInstructions,
    createThread,
  } = useOpenAI();

  const fetchOpenedQuestion = async () => {
    setLoading(true);
    setError(null);

    try {
      const instructions = auditProjectBriefInstructionText(questions || "");
      const thread = await createThread();

      await updateAssistantInstructions(assistantId, instructions);

      const prompt = auditPromptText(
        questions || "",
        projectBriefFormValue.file
      );
      const response = await askQuestionBasedOnFileWithoutPrompt(
        thread.id,
        assistantId,
        prompt
      );

      console.log("Raw response:", response);

      let parsedResponse: AuditResponse;

      try {
        parsedResponse = safeJSONParse(removeNewLinesAndEmptyLines(response));
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        setError("Invalid response format received.");
        return;
      }

      console.log("Parsed response:", parsedResponse);

      const formattedResponse: AuditResponse = {
        auditQuestions: parsedResponse.auditQuestions || [],
      };

      console.log("Formatted response:", formattedResponse);

      setProjectBriefFormValues((prevValues) => {
        const newValues: ProjectBriefFlow = {
          ...prevValues,
          generatedProjectBrief: {
            ...prevValues.generatedProjectBrief,
            generatedAudit: formattedResponse,
          },
        };

        console.log("Updated form values:", newValues);
        return newValues;
      });
    } catch (err) {
      console.error("Error fetching opened question:", err);
      setError("An error occurred while fetching the question.");
    } finally {
      setLoading(false);
    }
  };

  const hasFetched = useRef(false);

  const totalQuestions =
    projectBriefFormValue.generatedProjectBrief.generatedAudit.auditQuestions
      .length;
  const answeredCount =
    projectBriefFormValue.generatedProjectBrief.generatedAudit.auditQuestions.filter(
      (q) => q.answered
    ).length;

  const progressPercentage = totalQuestions
    ? (answeredCount / totalQuestions) * 100
    : 0;

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchOpenedQuestion();
    }
  }, []);

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "80vh",
      }}
    >
      <AuditProjectBriefHeader
        clientName="Audit Project Brief"
        assistantId={assistantId}
        handleSelect={handleSelect}
        projectTypes={projectTypes}
      />
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <Box>
          {loading ? (
            <Box sx={{ padding: "0 160px 0 160px" }}>
              <Box sx={{ marginBottom: 4 }}>
                <Skeleton variant="text" width="100%" height={30} />
                <Skeleton variant="text" width="100%" height={80} />
                <Skeleton variant="text" width="100%" height={80} />
                <Skeleton variant="text" width="100%" height={80} />
              </Box>
              <Box>
                <Skeleton variant="text" width="100%" height={30} />
                <Skeleton variant="text" width="100%" height={80} />
                <Skeleton variant="text" width="100%" height={80} />
                <Skeleton variant="text" width="100%" height={80} />
              </Box>
            </Box>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : !error ? (
            <Box sx={{ padding: "20px 160px 0 160px" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#FAFAF9",
                  gap: "5px",
                  width: "100%",
                  marginBottom: 1,
                  padding: "10px",
                  borderRadius: "20px 20px 10px 0px",
                  border: "1px solid #F1F1F1",
                }}
              >
                <Typography
                  sx={{ fontWeight: 400, lineHeight: "22.4px" }}
                  fontSize={14}
                >
                  Uploaded Document:
                </Typography>
                <Box
                  sx={{
                    borderRadius: "8px",
                    width: "80%",
                    backgroundColor: "#FEF2F0",
                    padding: "10px",
                  }}
                >
                  <Tooltip
                    placement="right-start"
                    title={projectBriefFormValue.file.fileName}
                    arrow
                  >
                    <Typography
                      sx={{
                        color: "#013499",
                        fontWeight: 500,
                        fontSize: "14px",
                      }}
                    >
                      {projectBriefFormValue.file.fileName.length > 35
                        ? projectBriefFormValue.file.fileName.substring(0, 35) +
                          "..."
                        : projectBriefFormValue.file.fileName}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
              <Box
                sx={{
                  padding: "20px 20px 0 20px",
                  border: "1px dotted #D5D5D5",
                  position: "relative",
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Typography variant="h2" sx={{ fontSize: "18px" }}>
                    Open Questions
                  </Typography>
                  <Typography sx={{ fontSize: "14px" }}>
                    (the * represents mandatory questions)
                  </Typography>
                </Box>
                {projectBriefFormValue.generatedProjectBrief.generatedAudit
                  .auditQuestions.length === 0 ? (
                  <p>No audit questions available.</p>
                ) : (
                  <ul>
                    {projectBriefFormValue.generatedProjectBrief.generatedAudit.auditQuestions.map(
                      (questionItem, index) => (
                        <Box key={index} sx={{ paddingBottom: "14px" }}>
                          <strong>{index + 1})</strong> {questionItem.question}
                          <strong>
                            {""}
                            {questionItem.answered ? (
                              <strong style={{ color: "#2AAA00" }}>
                                {" "}
                                Answered:
                              </strong>
                            ) : (
                              ""
                            )}
                          </strong>{" "}
                          {questionItem.answered ? (
                            questionItem.answer
                          ) : (
                            <strong style={{ color: "#910000" }}>
                              Unanswered
                            </strong>
                          )}
                        </Box>
                      )
                    )}
                  </ul>
                )}
                <Box
                  sx={{
                    position: "sticky",
                    left: 0,
                    bottom: 0,
                    right: 0,
                    height: "30px",
                    background:
                      "linear-gradient(to top, #ffffff, rgba(255, 255, 255, 0))",
                    pointerEvents: "none",
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  backgroundColor: "#FAFAF9",
                  gap: "120px",
                  width: "100%",
                  height: "45px",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 20px 0 20px",
                  borderRadius: "0 0 20px 20px",
                  border: "1px dotted #D5D5D5",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#FAFAF9",
                    width: "50%",
                  }}
                >
                  <LinearProgress
                    variant="determinate"
                    value={progressPercentage}
                    sx={{
                      height: 8,
                      borderRadius: "20px",
                      backgroundColor: "#D6D3D1",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: "20px",
                        backgroundColor: "#E86D5A",
                      },
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#FAFAF9",
                    width: "50%",
                  }}
                >
                  <Typography
                    sx={{ fontWeight: 400, lineHeight: "22.4px" }}
                    fontSize={14}
                  >
                    <span style={{ color: "#2AAA00" }}>{answeredCount}</span>{" "}
                    answered from {totalQuestions} questions
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default ReviewAuditProjectBrief;
