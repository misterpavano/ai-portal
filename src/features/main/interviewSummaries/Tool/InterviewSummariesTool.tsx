import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import {
  interviesSummariesStepAtom,
  interviewSummariesFormAtom,
} from "../../../../atoms/interviewDiscusstionGuideAtom";
import { aiToolModelsAtom } from "../../../../atoms/toolsAtom";
import { initialInterviewSummariesValues } from "../../../../config/interviewSummariesValues";
import InterviewDiscussionStep from "./Content/InterviewDiscussionStep";
import InterviewStructureStep from "./Content/InterviewStructureStep";
import ReviewInterviewSummaries from "./Content/ReviewInterviewSummaries";
import InterviewSummariesTypesStep from "./InterviewSummariesTypesStep";

interface Step {
  label: string;
  component: React.ReactNode;
}

const InterviewSumariesTools: React.FC = () => {
  const [step, setCurrentStep] = useAtom(interviesSummariesStepAtom);
  const [interviewSummariesFormValues, setInterviewSummariesFormValues] =
    useAtom(interviewSummariesFormAtom);
  const [models] = useAtom(aiToolModelsAtom);
  const selectedModel = models["Meeting Summaries"] || "gpt-3.5-turbo";
  const previousModelRef = useRef<string>(selectedModel);

  // Reset experience to step 0 when model changes
  useEffect(() => {
    // Only reset if model actually changed (not on initial load)
    if (previousModelRef.current !== selectedModel && previousModelRef.current !== "") {
      console.log("🔄 Model changed, resetting Meeting Summaries experience to step 0");
      setCurrentStep({ currentStep: 0, isFinished: false });
      setInterviewSummariesFormValues(initialInterviewSummariesValues);
    }
    previousModelRef.current = selectedModel;
  }, [selectedModel, setCurrentStep, setInterviewSummariesFormValues]);

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  console.log("checked", interviewSummariesFormValues.generateTopicsChecked);
  const steps: Step[] = [
    {
      label: "Introduction",
      component: (
        <InterviewSummariesTypesStep
          nextStep={nextStep}
          setSelectedType={(type) => {
            setInterviewSummariesFormValues((prevValues) => ({
              ...prevValues,
              type,
            }));
          }}
        />
      ),
    },
    {
      label: "Mandatory Inputs",
      component: <InterviewDiscussionStep />,
    },
    {
      label: "Structure",
      component: (
        <InterviewStructureStep
          selectedType={interviewSummariesFormValues.type.name}
        />
      ),
    },
    {
      label: "Output",
      component: <ReviewInterviewSummaries />,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "50vh",
        width: "100%",
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {steps[step.currentStep].component}
      </Box>
    </Box>
  );
};

export default InterviewSumariesTools;
