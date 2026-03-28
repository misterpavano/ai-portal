import { Box, Drawer, IconButton, Tooltip, Typography } from "@mui/material";
import { IconInfoCircle, IconXboxXFilled } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";
import {
  initialValuesActionItemsForm,
  initialValuesDetailedInsightsForm,
  initialValuesKeyRecommendationForm,
  initialValuesKeyTakeawaysForm,
} from "../../../../../config/interviewSummariesValues";
import {
  ActionItemsFormValues,
  DetailedInsightsFormValues,
  KeyRecommendationFormValues,
  KeyTakeawaysFormValues,
} from "../../../../../types/interviewSummaries";
import ActionItemsForm from "../Forms/ActionItemsForm";
import DetailedInsightsForm from "../Forms/DetailedInsightsForm";
import DiscussionTopicsForm from "../Forms/DiscussionTopics";
import KeyRecommendationsForm from "../Forms/KeyRecommendations";
import KeyTakeawaysForm from "../Forms/KeyTakeawaysForm";

export type InterviewSummariesDrawerProps = {
  open: boolean;
  onClose: () => void;
  text: string;
};

const InteviewSummariesDrawer = ({
  open,
  onClose,
  text,
}: InterviewSummariesDrawerProps) => {
  const [, setInterviewSummariesFormValues] = useAtom(
    interviewSummariesFormAtom
  );

  const handleSubmitDetailedInsightsForm = (
    formValues: DetailedInsightsFormValues
  ) => {
    setInterviewSummariesFormValues((prevValues) => ({
      ...prevValues,
      detailedInsights: formValues,
    }));
    onClose();
  };

  const handleSubmitKeyRecommendationForm = (
    formValues: KeyRecommendationFormValues
  ) => {
    setInterviewSummariesFormValues((prevValues) => ({
      ...prevValues,
      keyRecommendation: formValues,
    }));
    onClose();
  };

  const handleSubmitActionItemsForm = (formValues: ActionItemsFormValues) => {
    setInterviewSummariesFormValues((prevValues) => ({
      ...prevValues,
      actionItems: formValues,
    }));
    onClose();
  };

  const handleSubmitKeyTakeawaysForm = (formValues: KeyTakeawaysFormValues) => {
    setInterviewSummariesFormValues((prevValues) => ({
      ...prevValues,
      keyTakeaways: formValues,
    }));
    onClose();
  };

  const renderForm = () => {
    switch (text) {
      case "Discussion Topics":
        return <DiscussionTopicsForm isLoading={false} />;
      case "Action Items":
        return (
          <ActionItemsForm
            handleSubmit={handleSubmitActionItemsForm}
            initialValues={initialValuesActionItemsForm}
          />
        );
      case "Key Recommendations":
        return (
          <KeyRecommendationsForm
            handleSubmit={handleSubmitKeyRecommendationForm}
            initialValues={initialValuesKeyRecommendationForm}
          />
        );
      case "Key takeaways":
        return (
          <KeyTakeawaysForm
            handleSubmit={handleSubmitKeyTakeawaysForm}
            initialValues={initialValuesKeyTakeawaysForm}
          />
        );
      case "Detailed Insights":
        return (
          <DetailedInsightsForm
            handleSubmit={handleSubmitDetailedInsightsForm}
            initialValues={initialValuesDetailedInsightsForm}
          />
        );
      default:
        return <Typography variant="body1">No data for this item</Typography>;
    }
  };

  const descriptionText = (text: string) => {
    switch (text) {
      case "Discussion Topics":
        return "This is the section for discussion topics.";
      case "Action Items":
        return "*Definition of Action Items: Follow ups assigned to specific members or teams on the client side";
      case "Key Recommendations":
        return "*Definition: Key recommendations that the advisors provide our clients OR key recommendations that we provide based on what we glean from the discussion.";
      case "Key takeaways":
        return "*Definition: Key takeaways highlight and/or summarize the most salient and important insights that were mentioned and discussed during the interview/meeting ";
      case "Detailed Insights":
        return "*Definition: Bulleted list of detailed notes/meeting minutes and insights that go beyond the high level “Key takeaways”; these detailed notes/insights are organized by topic/theme.";
      default:
        return "";
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 550, padding: 4 }} role="presentation">
        <IconButton onClick={onClose} sx={{ float: "right", color: "black" }}>
          <IconXboxXFilled />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            marginTop: "16px",
            fontSize: "16px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          {text}
          {text === "Discussion Topics" && (
            <Tooltip title="You have the option to use the discussion topics generated below and/or add your own discussion topics">
              <IconInfoCircle size={18} style={{ marginLeft: "6px" }} />
            </Tooltip>
          )}
        </Typography>
        <Typography sx={{ fontSize: "12px" }}>
          {descriptionText(text)}
        </Typography>
        <Box sx={{ marginTop: "40px" }}>{renderForm()}</Box>
      </Box>
    </Drawer>
  );
};

export default InteviewSummariesDrawer;
