import React from "react";
import { useAtom } from "jotai";
import { RouteValidatorStep } from "../../../../../types/routeValidator";
import { routeValidatorFormAtom } from "../../../../../atoms/routeValidatorAtom";
import StepperFooter, {
  StepDef,
} from "../../../../../components/shared/StepperFooter";

type RouteValidatorFooterProps = {
  step: RouteValidatorStep;
  setCurrentStep: (step: RouteValidatorStep) => void;
  nextStep: () => void;
  isNextButtonVisible: boolean;
};

const steps: StepDef[] = [
  { label: "Document to Review", desc: "Upload the document" },
  { label: "Tasks & Direction", desc: "Select checks or provide guidance" },
  { label: "Output", desc: "Review AI-generated annotations" },
];

const RouteValidatorFooter: React.FC<RouteValidatorFooterProps> = ({
  step,
  nextStep,
  isNextButtonVisible,
  setCurrentStep,
}) => {
  const [routeValidatorFormValues] = useAtom(routeValidatorFormAtom);

  const handleStepClick = (index: number) => {
    setCurrentStep({
      currentStep: index,
      isFinished: index === steps.length - 1,
    });
  };

  const isButtonDisabled = () => {
    switch (step.currentStep) {
      case 0:
        return !routeValidatorFormValues.file?.fileName;
      case 1: {
        const hasTasks = routeValidatorFormValues.tasks?.length > 0;
        const hasAdditionalNotes = routeValidatorFormValues.useAdditionalNotes;
        const hasAnnotatedFile =
          routeValidatorFormValues.useAnnotatedFile &&
          routeValidatorFormValues.annotatedFile !== null;
        const hasDirection = hasAdditionalNotes || hasAnnotatedFile;
        const hasBrandGuidelineTask =
          routeValidatorFormValues.tasks?.includes("client_brand_guideline");
        const hasBrandGuidelineSelected =
          !!routeValidatorFormValues.brandGuideline;

        if (!hasTasks && !hasDirection) return true;
        if (hasTasks && hasBrandGuidelineTask && !hasBrandGuidelineSelected)
          return true;
        return false;
      }
      case 2:
        return !routeValidatorFormValues.validationResults;
      default:
        return false;
    }
  };

  if (step.currentStep === 2) return null;

  return (
    <StepperFooter
      steps={steps}
      currentStep={step.currentStep}
      onStepClick={handleStepClick}
      showAction={isNextButtonVisible}
      actionLabel="Next"
      actionDisabled={isButtonDisabled()}
      onAction={nextStep}
    />
  );
};

export default RouteValidatorFooter;
