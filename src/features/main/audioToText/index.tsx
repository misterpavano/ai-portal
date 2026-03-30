import Box from "@mui/material/Box";
import { IconBroadcast } from "@tabler/icons-react";
import * as React from "react";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import { useAtom } from "jotai";
import { audioToTextStepAtom } from "../../../atoms/audioToTextAtom";
import AudioToTextFooter from "./Tool/Content/AudioToTextFooter";
import AudioToTextTools from "./Tool/AudioToTextTool";

interface AudioToTextProps {
  handleDownloadFile: (type: "Word" | "Powerpoint") => void;
}

const STEP_LABELS = ["Upload & Configure", "Preview"];

const AudioToText: React.FC<AudioToTextProps> = ({ handleDownloadFile }) => {
  const [step, setCurrentStep] = useAtom(audioToTextStepAtom);

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  const breadcrumb = [STEP_LABELS[step.currentStep]];

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
        </Box>
      </Box>
    </>
  );
};

export default AudioToText;
