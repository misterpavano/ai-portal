import { styled } from "@mui/material";
import Box from "@mui/material/Box";
import { IconRoute } from "@tabler/icons-react";
import * as React from "react";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import { useAtom } from "jotai";
import { routeValidatorStepAtom } from "../../../atoms/routeValidatorAtom";
import RouteValidatorTool from "./Tool/Content/RouteValidatorTool";
import RouteValidatorFooter from "./Tool/Content/RouteValidatorFooter";

const STEP_LABELS = ["Configure", "Output"];

const RouteValidator = () => {
  const [step, setCurrentStep] = useAtom(routeValidatorStepAtom);

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  const breadcrumb = [step.currentStep < 2 ? STEP_LABELS[0] : STEP_LABELS[1]];

  return (
    <>
      <HeaderTitle
        title="Extra Editor"
        subtitle="Validate and review documents"
        icon={<IconRoute width={18} height={18} color={"#FFFFFF"} />}
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
          <RouteValidatorTool />
          <RouteValidatorFooter
            step={step}
            setCurrentStep={setCurrentStep}
            nextStep={nextStep}
            isNextButtonVisible={step.currentStep < 2}
          />
        </Box>
      </Box>
    </>
  );
};

export default RouteValidator;
