import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Typography, styled } from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { IconBroadcast, IconHelp, IconTool } from "@tabler/icons-react";
import * as React from "react";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import { useAtom } from "jotai";
import { audioToTextStepAtom } from "../../../atoms/audioToTextAtom";
import AudioToTextFooter from "./Tool/Content/AudioToTextFooter";
import AudioToTextTools from "./Tool/AudioToTextTool";
import AudioToTextHelp from "./Help/AudioToTextHelp";

interface AudioToTextProps {
  handleDownloadFile: (type: "Word" | "Powerpoint") => void;
}

const StyledTab = styled(Tab)(() => ({
  backgroundColor: "#FFFFFF",
  textTransform: "none",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  "&.Mui-selected": {
    backgroundColor: "#FFFFFF",
    color: "#1C1917",
    fontWeight: 600,
    borderBottom: "2px solid #1C1917",
  },
  "&:not(.Mui-selected)": {
    color: "#44403C",
  },
}));

const StyledTabs = styled(TabList)(() => ({
  paddingLeft: 8,
  borderTopLeftRadius: "10px",
  borderBottom: "none",
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const STEP_LABELS = ["Upload & Configure", "Preview"];

const AudioToText: React.FC<AudioToTextProps> = ({ handleDownloadFile }) => {
  const [step, setCurrentStep] = useAtom(audioToTextStepAtom);

  const [value, setValue] = React.useState("Tool");

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const breadcrumb =
    value === "Tool" ? [STEP_LABELS[step.currentStep]] : undefined;

  return (
    <>
      <HeaderTitle
        title="Audio To Text"
        subtitle="Transcribe audio files into structured, reviewable text"
        icon={<IconBroadcast width={18} height={18} color={"#FFFFFF"} />}
        breadcrumb={breadcrumb}
      />

      <Box sx={{ typography: "body1", p: 3 }}>
        <Box
          sx={{
            border: "1px solid",
            borderColor: "#E7E5E4",
            borderRadius: "10px",
            boxShadow:
              "0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <TabContext value={value}>
            <Box
              sx={{
                borderBottom: "1px solid #E7E5E4",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
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
              <AudioToTextTools />

              {/* Action bar: only shows on preview step */}
              <Box sx={{ px: 3, pb: step.currentStep === 1 ? 2 : 0 }}>
                <AudioToTextFooter
                  step={step}
                  setCurrentStep={setCurrentStep}
                  nextStep={nextStep}
                  isNextButtonVisible={step.currentStep === 1}
                  handleDownloadFile={handleDownloadFile}
                />
              </Box>
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value="Help">
              <AudioToTextHelp />
            </TabPanel>
          </TabContext>
        </Box>
      </Box>
    </>
  );
};

export default AudioToText;
