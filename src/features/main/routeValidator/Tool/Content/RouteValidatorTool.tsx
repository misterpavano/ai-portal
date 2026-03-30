import React from "react";
import Box from "@mui/material/Box";
import { useAtom } from "jotai";
import { routeValidatorStepAtom } from "../../../../../atoms/routeValidatorAtom";
import DocumentToReviewStep from "./DocumentToReviewStep";
import TasksAndDirectionStep from "./TasksAndDirectionStep";
import OutputStep from "./OutputStep";

const RouteValidatorTool: React.FC = () => {
  const [step] = useAtom(routeValidatorStepAtom);

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
        {step.currentStep < 2 ? (
          <>
            <DocumentToReviewStep />
            <TasksAndDirectionStep />
          </>
        ) : (
          <OutputStep />
        )}
      </Box>
    </Box>
  );
};

export default RouteValidatorTool;

