import { useState } from "react";
import { Box, Popover, Typography } from "@mui/material";
import { IconXboxXFilled } from "@tabler/icons-react";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import TextArea from "../../../../../components/layouts/TextArea";
import { DiscussionTopicsFormValues } from "../../../../../types/discussionGuidesTypes";
import useOpenAI from "../../../../../hooks/useOpenAI";
import { discussionGuideFlowAtom } from "../../../../../atoms/discussionGuideAtom";
import { useAtom } from "jotai";
import { ChatCompletionMessageParam } from "openai/resources";

type FollowUpQuestionsModalProps = {
  sections: DiscussionTopicsFormValues[];
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  currentSectionIndex: number;
  currentQuestionIndex: number;
};

const FollowUpQuestionsModal = ({
  sections,
  open,
  onClose,
  anchorEl,
  currentSectionIndex,
  currentQuestionIndex,
}: FollowUpQuestionsModalProps) => {
  const { chatCompletionOpenAi } = useOpenAI();
  const [followUpQuestion, setFollowUpQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, setDiscussionGuideFlowValues] = useAtom(discussionGuideFlowAtom);

  const handleFollowUpQuestionsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFollowUpQuestion(event.target.value);
  };

  const handleGenerateFollowUpQuestions = async () => {
    setIsLoading(true);

    const mainQuestion =
      sections[currentSectionIndex].generatedAiQuestions?.[currentQuestionIndex]
        ?.question;

    if (!mainQuestion) return;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an AI assistant that generates follow-up questions based on a given question and the ${followUpQuestion}. The follow-up questions should not be numbered or bulleted.`,
      },
      {
        role: "user",
        content: `Generate 3-5 follow-up questions for this question: "${mainQuestion}". The follow-up questions should not be numbered or bulleted nor start with '-' before the question. Additionally, match the questions with the provided context: ${followUpQuestion}. Always keep the structure that was given on the prompt. Do not include the context as an output. Only generate questions.`,
      },
    ];

    const followUpQuestionsResponse = await chatCompletionOpenAi(messages);
    const followUpQuestions = followUpQuestionsResponse
      .split("\n")
      .filter(Boolean);

    const updatedSections = [...sections];
    updatedSections[currentSectionIndex].generatedAiQuestions = updatedSections[
      currentSectionIndex
    ].generatedAiQuestions.map((q, index) =>
      index === currentQuestionIndex ? { ...q, followUpQuestions } : q
    );

    setDiscussionGuideFlowValues((prevValues) => ({
      ...prevValues,
      discussionTopicsForm: {
        ...prevValues.discussionTopicsForm,
        sections: updatedSections,
      },
    }));

    setIsLoading(false);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            boxShadow: "0px 0px 14px 0px rgba(0, 0, 0, 0.25)",
            border: "1px solid #D6D3D1",
          },
        },
      }}
    >
      <Box
        sx={{
          marginTop: 1,
          pb: 2,
          pr: "20px",
          pl: "20px",
          pt: 4,
          backgroundColor: "white",
          borderRadius: 2,
          maxWidth: 500,
          position: "relative",
        }}
      >
        <Box sx={{ marginBottom: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              position: "absolute",
              top: 5,
              left: 8,
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Followup questions
          </Typography>

          <IconXboxXFilled
            onClick={onClose}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 30,
              height: 18,
              borderRadius: "50%",
              cursor: "pointer",
            }}
            size={15}
          />
        </Box>
        <TextArea
          name="followUpQuestion"
          topText="Provide direction for the followup questions:"
          onChange={handleFollowUpQuestionsChange}
          styles={{ width: 220, borderRadius: "5px" }}
          value={followUpQuestion}
          placeholder="Direction…"
        />
        <Box mt={2} display="flex" justifyContent="flex-start">
          <DefaultButton
            style={{
              borderRadius: "5px",
              height: "auto",
              padding: "5px 10px",
              lineHeight: "1em !important",
            }}
            textStyle={{ fontSize: "12px" }}
            title={isLoading ? "Generating..." : "Generate"}
            type="primary"
            onClick={() => handleGenerateFollowUpQuestions()}
          />
        </Box>
      </Box>
    </Popover>
  );
};

export default FollowUpQuestionsModal;
