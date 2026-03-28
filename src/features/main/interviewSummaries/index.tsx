import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Typography, styled } from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { IconHelp, IconPageBreak, IconTool } from "@tabler/icons-react";
import * as React from "react";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import InterviewSummariesHelp from "./Help/InterviewSummariesHelp";
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

const StyledTab = styled(Tab)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  "&.Mui-selected": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
  },
  "&:not(.Mui-selected)": {
    color: theme.palette.text.primary,
  },
}));

const StyledTabs = styled(TabList)(() => ({
  paddingLeft: 8,
  borderTopLeftRadius: "6px",
  borderBottom: "none",
}));

const InterviewSummaries: React.FC<InterviewSummariesProps> = ({
  handleDownloadFile,
  handleToplineDownloadFile,
}) => {
  const { data: toolsData, isLoading: isLoadingTools } = useGetToolsQuery();
  const [models] = useAtom(aiToolModelsAtom);
  const [step, setCurrentStep] = useAtom(interviesSummariesStepAtom);
  const isNextButtonVisible = step.currentStep !== 0;

  const [value, setValue] = React.useState("Tool");
  const [interviewSummariesFlow] = useAtom(interviewSummariesFormAtom);
  const tools = Array.isArray(toolsData) ? toolsData : (toolsData?.data ?? []);

  const chatMKGTool = tools.find((tool) => tool.name === "Meeting Summaries");

  // Get model from backend first (source of truth), fallback to atom, then default
  const backendModel = chatMKGTool?.model?.modelId;
  const atomModel = models["Meeting Summaries"];

  // Priority: Backend model > Atom model > Default
  const selectedModel = backendModel || atomModel || "gpt-3.5-turbo";

  // Log model selection for debugging
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
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
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
            border: "1.8px solid",
            borderColor: "neutral.200",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <TabContext value={value}>
            <Box
              sx={{
                borderBottom: 1.5,
                borderTopLeftRadius: "6px",
                borderColor: "primary.400",
              }}
            >
              <StyledTabs onChange={handleChange} aria-label="tabs">
                <StyledTab
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <IconTool size="14px" />
                      <Typography
                        variant="body"
                        sx={{ fontSize: "14px", fontWeight: "520" }}
                      >
                        Tool
                      </Typography>
                    </Box>
                  }
                  value="Tool"
                />
                <StyledTab
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <IconHelp size="14px" />
                      <Typography
                        variant="body"
                        sx={{ fontSize: "14px", fontWeight: "520" }}
                      >
                        Help
                      </Typography>
                    </Box>
                  }
                  value="Help"
                />
              </StyledTabs>
            </Box>
            <TabPanel sx={{ p: 0 }} value="Tool">
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
            </TabPanel>
            <TabPanel id="Help_MKGAI_Summary" sx={{ p: 0 }} value="Help">
              <InterviewSummariesHelp />
            </TabPanel>
          </TabContext>
        </Box>
      </Box>
    </>
  );
};

export default InterviewSummaries;
