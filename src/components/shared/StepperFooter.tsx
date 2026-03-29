import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { styled } from "@mui/system";
import DefaultButton from "../layouts/DefaultButton";

export type StepDef = {
  label: string;
  desc: string;
};

type StepStatus = "UNSTART" | "PROGRESS" | "FINISH";

export interface StepperFooterProps {
  steps: StepDef[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  /** Show the primary action button */
  showAction?: boolean;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
  /** Optional secondary action (left of primary) */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/* ── styled primitives ── */

const ProgressList = styled("div")({
  padding: 0,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  width: "100%",
});

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

const StepItem = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  cursor: "pointer",
  minWidth: 120,
  maxWidth: 160,
});

const StepLabel = styled(Typography)<{ status: StepStatus }>(({ status }) => ({
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  marginTop: 8,
  textAlign: "center",
  lineHeight: 1.3,
  transition: "color 0.2s ease",
  ...(status === "PROGRESS" && { color: "#1C1917" }),
  ...(status === "FINISH" && { color: "#44403C" }),
  ...(status === "UNSTART" && { color: "#A8A29E" }),
}));

const StepDescription = styled(Typography)<{ status: StepStatus }>(
  ({ status }) => ({
    fontSize: "11px",
    fontWeight: 400,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    marginTop: 2,
    textAlign: "center",
    lineHeight: 1.3,
    color: status === "PROGRESS" ? "#44403C" : "#A8A29E",
  }),
);

/* ── component ── */

const StepperFooter: React.FC<StepperFooterProps> = ({
  steps,
  currentStep,
  onStepClick,
  showAction = true,
  actionLabel = "Next",
  actionDisabled = false,
  onAction,
  secondaryLabel,
  onSecondary,
}) => {
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
            {steps.map((step, index) => {
              const status: StepStatus =
                index < currentStep
                  ? "FINISH"
                  : index === currentStep
                    ? "PROGRESS"
                    : "UNSTART";
              const isLastStep = index === steps.length - 1;
              const isLineCompleted = index < currentStep;

              return (
                <React.Fragment key={index}>
                  <StepItem onClick={() => onStepClick?.(index)}>
                    <StepCircle status={status}>
                      {status === "FINISH" ? "✓" : index + 1}
                    </StepCircle>
                    <StepLabel status={status}>{step.label}</StepLabel>
                    <StepDescription status={status}>
                      {step.desc}
                    </StepDescription>
                  </StepItem>
                  {!isLastStep && (
                    <ConnectorLine completed={isLineCompleted} />
                  )}
                </React.Fragment>
              );
            })}
          </ProgressList>
        </Grid>
        {(showAction || secondaryLabel) && (
          <Grid item>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {secondaryLabel && onSecondary && (
                <DefaultButton
                  style={{ width: 100, borderRadius: "6px", height: 40 }}
                  type="secondary"
                  title={secondaryLabel}
                  onClick={onSecondary}
                />
              )}
              {showAction && onAction && (
                <DefaultButton
                  style={{ width: 100, borderRadius: "6px", height: 40 }}
                  disabled={actionDisabled}
                  type="primary"
                  title={actionLabel}
                  onClick={onAction}
                />
              )}
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default StepperFooter;
