import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { styled } from "@mui/system";
import { useAtom } from "jotai";
import { RouteValidatorStep } from "../../../../../types/routeValidator";
import { routeValidatorFormAtom } from "../../../../../atoms/routeValidatorAtom";

type Step = {
  label: string;
  desc: string;
};

type RouteValidatorFooterProps = {
  step: RouteValidatorStep;
  setCurrentStep: (step: RouteValidatorStep) => void;
  nextStep: () => void;
  isNextButtonVisible: boolean;
};

const steps: Step[] = [
  { label: "Document to Review", desc: "Upload the document" },
  { label: "Tasks & Direction", desc: "Select checks or provide guidance" },
  { label: "Output", desc: "Review AI-generated annotations" },
];

type StepStatus = "UNSTART" | "PROGRESS" | "FINISH";

const ProgressList = styled("div")(() => ({
  padding: 0,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  width: "100%",
}));

const StepCircle = styled("div")<{ status: StepStatus }>(({ status }) => ({
  width: 20,
  height: 20,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  fontSize: "11px",
  fontWeight: 600,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  lineHeight: 1,
  transition: "all 0.2s ease",
  ...(status === "PROGRESS" && {
    backgroundColor: "#1C1917",
    color: "#FFFFFF",
    border: "none",
  }),
  ...(status === "FINISH" && {
    backgroundColor: "#E86D5A",
    color: "#FFFFFF",
    border: "none",
  }),
  ...(status === "UNSTART" && {
    backgroundColor: "transparent",
    color: "#A8A29E",
    border: "1px solid #E7E5E4",
  }),
}));

const ConnectorLine = styled("div")<{ completed: boolean }>(
  ({ completed }) => ({
    height: "1px",
    flex: 1,
    minWidth: 32,
    marginTop: 10,
    backgroundColor: completed ? "#E86D5A" : "#E7E5E4",
    transition: "background-color 0.2s ease",
  }),
);

const StepItem = styled("div")(() => ({
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  cursor: "pointer",
  minWidth: 120,
  maxWidth: 160,
}));

const StepLabel = styled(Typography)<{ status: StepStatus }>(({ status }) => ({
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  marginTop: 8,
  textAlign: "center" as const,
  lineHeight: 1.3,
  transition: "color 0.2s ease",
  ...(status === "PROGRESS" && {
    color: "#1C1917",
  }),
  ...(status === "FINISH" && {
    color: "#44403C",
  }),
  ...(status === "UNSTART" && {
    color: "#A8A29E",
  }),
}));

const StepDescription = styled(Typography)<{ status: StepStatus }>(
  ({ status }) => ({
    fontSize: "11px",
    fontWeight: 400,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    marginTop: 2,
    textAlign: "center" as const,
    lineHeight: 1.3,
    color: status === "PROGRESS" ? "#44403C" : "#A8A29E",
  }),
);

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
        // Document to Review - need file uploaded
        return !routeValidatorFormValues.file?.fileName;
      case 1:
        // Tasks & Direction - need either tasks selected OR direction provided
        // Direction can be used independently without selecting any tasks
        // If tasks are selected and client_brand_guideline is selected, brandGuideline must also be selected
        const hasTasks = routeValidatorFormValues.tasks?.length > 0;
        // Direction is valid if checkbox is checked (allows independent use without tasks)
        const hasAdditionalNotes = routeValidatorFormValues.useAdditionalNotes;
        const hasAnnotatedFile =
          routeValidatorFormValues.useAnnotatedFile &&
          routeValidatorFormValues.annotatedFile !== null;
        const hasDirection = hasAdditionalNotes || hasAnnotatedFile;
        const hasBrandGuidelineTask = routeValidatorFormValues.tasks?.includes(
          "client_brand_guideline",
        );
        const hasBrandGuidelineSelected =
          !!routeValidatorFormValues.brandGuideline;

        // Must have either tasks or direction (direction can be used independently)
        if (!hasTasks && !hasDirection) {
          return true;
        }

        // If tasks are selected and brand guideline task is selected, brand guideline must be selected
        if (hasTasks && hasBrandGuidelineTask && !hasBrandGuidelineSelected) {
          return true;
        }

        return false;
      case 2:
        // Output step - need validation results
        return !routeValidatorFormValues.validationResults;
      default:
        return false;
    }
  };

  const getNextButtonTitle = () => {
    return "Next";
  };

  if (step.currentStep === 2) return null;

  return (
    <Box
      sx={{
        pt: 3,
        pb: 3,
        pl: 4,
        pr: 4,
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
      }}
    >
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item xs>
          <ProgressList>
            {steps.map((currStep, index) => {
              const status: StepStatus =
                index < step.currentStep
                  ? "FINISH"
                  : index === step.currentStep
                    ? "PROGRESS"
                    : "UNSTART";
              const isLastStep = index === steps.length - 1;
              const isLineCompleted = index < step.currentStep;

              return (
                <React.Fragment key={index}>
                  <StepItem onClick={() => handleStepClick(index)}>
                    <StepCircle status={status}>
                      {status === "FINISH" ? "✓" : index + 1}
                    </StepCircle>
                    <StepLabel status={status}>{currStep.label}</StepLabel>
                    <StepDescription status={status}>
                      {currStep.desc}
                    </StepDescription>
                  </StepItem>
                  {!isLastStep && <ConnectorLine completed={isLineCompleted} />}
                </React.Fragment>
              );
            })}
          </ProgressList>
        </Grid>
        <Grid item>
          {isNextButtonVisible && (
            <DefaultButton
              style={{
                width: 100,
                borderRadius: "6px",
                height: 40,
              }}
              disabled={isButtonDisabled()}
              type="primary"
              title={getNextButtonTitle()}
              onClick={nextStep}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default RouteValidatorFooter;
