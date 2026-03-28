import { Box, Popover, Typography } from "@mui/material";
import { IconXboxXFilled } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { useState } from "react";
import { discussionGuideFlowAtom } from "../../../../../atoms/discussionGuideAtom";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import TextArea from "../../../../../components/layouts/TextArea";
import useOpenAI from "../../../../../hooks/useOpenAI";

interface RegenerateModalProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  isIntroductionLoading: boolean;
  setIntroductionLoading: (loading: boolean) => void;
}

const RegenerateIntroductionModal: React.FC<RegenerateModalProps> = ({
  open,
  onClose,
  anchorEl,
  setIntroductionLoading,
}) => {
  const [discussionGuideFlow, setDiscussionGuideFlowValues] = useAtom(
    discussionGuideFlowAtom
  );
  const { chatCompletionOpenAi } = useOpenAI();
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState(
    discussionGuideFlow.introductionForm.additionalNote || ""
  );

  const handleRegenerate = async () => {
    try {
      setIsLoading(true);
      setIntroductionLoading(true);
      const introductionResponse = await chatCompletionOpenAi([
        { role: "system", content: "I am a bot generating content response" },
        {
          role: "user",
          content: `The Background and Introduction section of the discussion guide will be a maximum of ${discussionGuideFlow.introductionForm.maxCharacterCount} words. The audience for this discussion is/are: ${discussionGuideFlow.introductionForm.audience}. Only address these individuals based on their audience value. The purpose of the conversation is: ${discussionGuideFlow.introductionForm.purpose}. Only prepare content for this purpose. Additional note: ${note}. Please follow the example below when generating this content: Hi, my name is [NAME] and I'll be conducting this focus group discussion. Thank you all for taking the time to speak with me today. The purpose of this focus group is to capture feedback from {audience identified above} like yourselves on {purpose identified above}. We are here to learn from your experiences and want to understand individual opinions as well have you collectively work together to identify any opportunities for refinement and identify potential objections to the messages.`,
        },
      ]);

      setDiscussionGuideFlowValues((prevValues) => ({
        ...prevValues,
        discussionGuideGeneratedAi: {
          ...prevValues.discussionGuideGeneratedAi,
          introductionGenerated: introductionResponse,
        },
        introductionForm: {
          ...prevValues.introductionForm,
          additionalNote: note,
        },
      }));
    } catch (error) {
      console.error("Error fetching AI content:", error);
    } finally {
      setIsLoading(false);
      setIntroductionLoading(false);
      onClose();
    }
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
        horizontal: "left",
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0px 0px 14px 0px rgba(0, 0, 0, 0.25)",
          border: "1px solid #D6D3D1",
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
            Regenerate Content
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
          name="additionalNote"
          topText="Provide additional notes and direction"
          styles={{ width: 220, borderRadius: "5px" }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter additional note here..."
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
            title={isLoading ? "Regenerating..." : "Regenerate"}
            type="primary"
            onClick={handleRegenerate}
            disabled={isLoading}
          />
        </Box>
      </Box>
    </Popover>
  );
};

export default RegenerateIntroductionModal;
