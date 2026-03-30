import React from "react";
import { Box } from "@mui/material";
import { useAtom } from "jotai";
import { RouteValidatorStep } from "../../../../../types/routeValidator";
import { routeValidatorFormAtom } from "../../../../../atoms/routeValidatorAtom";
import DefaultButton from "../../../../../components/layouts/DefaultButton";

type RouteValidatorFooterProps = {
  step: RouteValidatorStep;
  setCurrentStep: (step: RouteValidatorStep) => void;
  nextStep: () => void;
  isNextButtonVisible: boolean;
};

const RouteValidatorFooter: React.FC<RouteValidatorFooterProps> = ({
  step,
  setCurrentStep,
}) => {
  const [routeValidatorFormValues] = useAtom(routeValidatorFormAtom);

  // Hide on output step
  if (step.currentStep >= 2) return null;

  const isDisabled = !routeValidatorFormValues.file?.fileName;

  const handleAnalyze = () => {
    setCurrentStep({ currentStep: 2, isFinished: true });
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", px: 4, pb: 3 }}>
      <DefaultButton
        type="primary"
        title="Analyze Document"
        onClick={handleAnalyze}
        disabled={isDisabled}
        style={{
          borderRadius: "10px",
          height: 48,
          paddingLeft: 32,
          paddingRight: 32,
          fontSize: 15,
        }}
      />
    </Box>
  );
};

export default RouteValidatorFooter;
