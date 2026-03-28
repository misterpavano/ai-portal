import React from "react";
import Box from "@mui/material/Box";
import { useAtom } from "jotai";
import { routeValidatorStepAtom } from "../../../../../atoms/routeValidatorAtom";
import DocumentToReviewStep from "./DocumentToReviewStep";
import TasksAndDirectionStep from "./TasksAndDirectionStep";
import OutputStep from "./OutputStep";

interface Step {
  label: string;
  component: React.ReactNode;
}

const RouteValidatorTool: React.FC = () => {
  const [step] = useAtom(routeValidatorStepAtom);

  const steps: Step[] = [
    {
      label: "Document to Review",
      component: <DocumentToReviewStep />,
    },
    {
      label: "Tasks & Direction",
      component: <TasksAndDirectionStep />,
    },
    {
      label: "Output",
      component: <OutputStep />,
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

export default RouteValidatorTool;

