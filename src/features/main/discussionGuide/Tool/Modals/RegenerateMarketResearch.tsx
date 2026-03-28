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
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
}

const RegenerateMarketReserachModal: React.FC<RegenerateModalProps> = ({
  open,
  onClose,
  anchorEl,
  isLoading,
  setLoading,
  setFieldValue,
}) => {
  const [discussionGuideFlow, setDiscussionGuideFlow] = useAtom(
    discussionGuideFlowAtom
  );
  const { chatCompletionOpenAi } = useOpenAI();
  const [initialFormValues, setFormInitialValues] = useState(
    discussionGuideFlow.marketResearchForm
  );
  const [direction, setDirection] = useState(
    discussionGuideFlow.marketResearchForm.direction || ""
  );

  const handleRegenerateMarketResearch = async () => {
    setLoading(true);
    try {
      const prompt = `Revise the following market research disclosure using the content below as a baseline. Apply the following direction to revise the content. ${direction} It is important that you adhere to the direction. The baseline content is: ${initialFormValues.marketResearchDisclousers}`;

      const response = await chatCompletionOpenAi([
        { role: "system", content: "I am a bot generating content response" },
        { role: "user", content: prompt },
      ]);

      const newMarketResearchDisclousers = response;
      console.log("response", response);

      const updatedFormValues = {
        ...initialFormValues,
        marketResearchDisclousers: newMarketResearchDisclousers,
      };

      setFormInitialValues(updatedFormValues);
      setFieldValue("marketResearchDisclousers", newMarketResearchDisclousers);
      setDiscussionGuideFlow((prev) => ({
        ...prev,
        marketResearchForm: updatedFormValues,
      }));
    } catch (error) {
      console.error("Error fetching AI content:", error);
    } finally {
      setLoading(false);
      setDirection("");
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
          name="direction"
          topText="Provide directions"
          styles={{ width: 220, borderRadius: "5px" }}
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          placeholder="Enter directions here..."
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
            onClick={handleRegenerateMarketResearch}
            disabled={isLoading}
          />
        </Box>
      </Box>
    </Popover>
  );
};

export default RegenerateMarketReserachModal;
