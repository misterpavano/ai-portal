import { Box } from "@mui/material";
import { useAtom } from "jotai";
import {
  discussionGuideFlowAtom,
  discussionGuideStepAtom,
} from "../../../../atoms/discussionGuideAtom";
import DiscussionStep from "./Content/DiscussionStep";
import ReviewDiscussionGuide from "./Content/ReviewDiscussionGuide";
import StructureStep from "./Content/StructureStep";
import DiscussionGuideTypesStep from "./DiscussionGuideTypesStep";
import QuestionsStructureGenerated from "./Content/QuestionsStructureGenerated";

interface Step {
  label: string;
  component: React.ReactNode;
}

const DiscussionGuideTool: React.FC = () => {
  const [step, setCurrentStep] = useAtom(discussionGuideStepAtom);
  const [discussionGuideFlow, setDiscussionGuideFlowValues] = useAtom(
    discussionGuideFlowAtom
  );

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  const steps: Step[] = [
    {
      label: "Discussion",
      component: (
        <DiscussionGuideTypesStep
          nextStep={nextStep}
          setSelectedType={(type) => {
            setDiscussionGuideFlowValues((prevValues) => ({
              ...prevValues,
              type,
            }));
          }}
        />
      ),
    },
    { label: "Mandatory Inputs", component: <DiscussionStep /> },
    {
      label: "Summary Review",
      component: <QuestionsStructureGenerated />,
    },
    {
      label: "Structure",
      component: <StructureStep selectedType={discussionGuideFlow.type.name} />,
    },
    {
      label: "Output",
      component: <ReviewDiscussionGuide />,
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

export default DiscussionGuideTool;
