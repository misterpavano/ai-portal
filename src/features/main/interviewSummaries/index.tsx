import Box from "@mui/material/Box";
import { IconPageBreak } from "@tabler/icons-react";
import * as React from "react";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import InterviewSummariesTool from "./Tool/InterviewSummariesTool";
import { useAtom } from "jotai";
import {
  interviesSummariesStepAtom,
  interviewSummariesFormAtom,
} from "../../../atoms/interviewDiscusstionGuideAtom";
import InterviewSummariesFooter from "./Tool/Content/InterviewSummariesFooter";
import { aiToolModelsAtom } from "../../../atoms/toolsAtom";
import { useGetToolsQuery } from "../../../api/slices/toolsSlice";

interface InterviewSummariesProps {
  handleDownloadFile: (type: "Word" | "Powerpoint") => void;
  handleToplineDownloadFile: (type: "Word" | "Powerpoint") => void;
}

const InterviewSummaries: React.FC<InterviewSummariesProps> = ({
  handleDownloadFile,
  handleToplineDownloadFile,
}) => {
  const { data: toolsData, isLoading: isLoadingTools } = useGetToolsQuery();
  const [models] = useAtom(aiToolModelsAtom);
  const [step, setCurrentStep] = useAtom(interviesSummariesStepAtom);
  const isNextButtonVisible = step.currentStep !== 0;

  const [interviewSummariesFlow] = useAtom(interviewSummariesFormAtom);
  const tools = Array.isArray(toolsData) ? toolsData : (toolsData?.data ?? []);

  const chatMKGTool = tools.find((tool) => tool.name === "Meeting Summaries");

  const backendModel = chatMKGTool?.model?.modelId;
  const atomModel = models["Meeting Summaries"];
  const selectedModel = backendModel || atomModel || "gpt-3.5-turbo";

  React.useEffect(() => {
    if (!isLoadingTools && backendModel) {
      console.log(
        `🤖 [Meeting Summaries Header] Selected Model: ${selectedModel} (Backend: ${backendModel || "N/A"}, Atom: ${atomModel || "N/A"})`,
      );
    }
  }, [selectedModel, backendModel, atomModel, isLoadingTools]);

  const subtitleText = interviewSummariesFlow.type.name;

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  return (
    <>
      <HeaderTitle
        title="Meeting Summaries"
        subtitle={subtitleText}
        selectedModel={selectedModel}
        icon={<IconPageBreak width={18} height={18} color={"#FFFFFF"} />}
      />

      <Box sx={{ typography: "body1", p: 5 }}>
        <Box
          sx={{
            border: "1px solid",
            borderColor: "neutral.200",
            borderRadius: "10px",
            boxShadow:
              "0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)",
          }}
        >
          <Box sx={{ padding: 2 }}>
            <InterviewSummariesFooter
              step={step}
              setCurrentStep={setCurrentStep}
              nextStep={nextStep}
              isNextButtonVisible={isNextButtonVisible}
              handleDownloadFile={handleDownloadFile}
              handleToplineDownloadFile={handleToplineDownloadFile}
            />
          </Box>

          <InterviewSummariesTool />
        </Box>
      </Box>
    </>
  );
};

export default InterviewSummaries;
