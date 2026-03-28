import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import finishedStepperBg from "../../../../../assets/images/FinishedStepper.png";
import lastStepperBng from "../../../../../assets/images/LastStepper.png";
import progressLastStepperBg from "../../../../../assets/images/ProgressLastStepper.png";
import progressStepperBg from "../../../../../assets/images/ProgressStepper.png";
import unStartedStepperBg from "../../../../../assets/images/UnStartedStepper.png";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { styled } from "@mui/system";
import { useAtom } from "jotai";
import { IconButton, Snackbar } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import ResetContentModal from "../../../discussionGuide/Tool/Modals/ResetContentModal";
import { initialProjectBrieftValues } from "../../../../../config/projectBriefValues";
import { meetingNotesDroppedItemsAtom } from "../../../../../atoms/dndAtom";
import { ProjectBriefStep } from "../../../../../types/projectBriefTypes";
import { projectBriefFormAtom } from "../../../../../atoms/projectBriefAtom";

type Step = {
  label: string;
  desc: string;
};

type ProjectBriefFooterProps = {
  step: ProjectBriefStep;
  setCurrentStep: (step: ProjectBriefStep) => void;
  nextStep: () => void;
  isNextButtonVisible: boolean;
  handleDownloadFile?: (type: "Word" | "Powerpoint") => void;
  handleToplineDownloadFile?: (type: "Word" | "Powerpoint") => void;
};

const steps: Step[] = [
  { label: "Selection", desc: "Select document type" },
  { label: "Introduction", desc: "Provide direction" },
  { label: "Review", desc: "Review generated content" },
];

const ProgressList = styled("ul")(() => ({
  padding: 0,
  listStyleType: "none",
  fontFamily: "arial",
  fontSize: "12px",
  clear: "both",
  lineHeight: "1em",
  display: "flex",
  width: "100%",
}));

const ProgressItem = styled("div")<{
  status: "UNSTART" | "PROGRESS" | "FINISH";
  isLastStep: boolean;
}>(({ status, isLastStep }) => ({
  background:
    isLastStep && status === "UNSTART"
      ? `url(${lastStepperBng})`
      : isLastStep && status === "PROGRESS"
      ? `url(${progressLastStepperBg})`
      : status === "UNSTART"
      ? `url(${unStartedStepperBg})`
      : status === "PROGRESS"
      ? `url(${progressStepperBg})`
      : `url(${finishedStepperBg})`,
  color: status === "FINISH" ? "#263238" : "white",
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  cursor: "pointer",
  alignItems: "center",
  flexDirection: "column",
  display: "flex",
  paddingTop: 7,
  width: 200,
  height: 56,
}));

const ProgressItemText = styled(Typography)<{
  status: "UNSTART" | "PROGRESS" | "FINISH";
}>(({ status }) => ({
  color: status === "UNSTART" ? "#B2B2B2" : "#263238",
  fontSize: "14px",
  fontWeight: 600,
}));

const ProgressItemDescriptionText = styled(Typography)<{
  status: "UNSTART" | "PROGRESS" | "FINISH";
}>(({ status }) => ({
  color: status === "UNSTART" ? "#B2B2B2" : "#263238",
  fontSize: "12px",
  fontWeight: 400,
}));

const ProjectBriefFooter: React.FC<ProjectBriefFooterProps> = ({
  step,
  nextStep,
  isNextButtonVisible,
  setCurrentStep,
}) => {
  const [projectBriefFromValues, setProjectBriefFormValues] =
    useAtom(projectBriefFormAtom);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const isDisabled = projectBriefFromValues.file.fileId === "";
  const [droppedItems, setDroppedItems] = useAtom(meetingNotesDroppedItemsAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [targetStep, setTargetStep] = useState<number | null>(null);

  const handleStepClick = (index: number) => {
    if (index < step.currentStep) {
      if (index === 0) {
        setProjectBriefFormValues(projectBriefFromValues);
      }
      if (step.currentStep === 3 && index < step.currentStep) {
        setShowResetModal(true);
        setTargetStep(index);
      } else {
        setCurrentStep({
          currentStep: index,
          isFinished: index === steps.length - 1,
        });
      }
    } else {
      console.log("Forward navigation by clicking is not allowed.");
    }
  };

  const isReviewDisabled = () => {
    if (droppedItems.length === 0) {
      return true;
    }
    return false;
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleReturnToFirstStep = () => {
    handleCloseSnackbar();
    setCurrentStep({ currentStep: 0, isFinished: false });
    setProjectBriefFormValues(initialProjectBrieftValues);
    setDroppedItems([]);
  };

  const handleResetConfirm = () => {
    if (targetStep !== null) {
      setCurrentStep({
        currentStep: targetStep,
        isFinished: targetStep === steps.length - 1,
      });
    }
    setShowResetModal(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleResetClose = () => {
    setShowResetModal(false);
  };

  const handleNextButtonClick = () => {
    if (step.currentStep === 3) {
      setIsModalOpen(true);
    } else {
      nextStep();
    }
  };

  const isButtonDisabled = () => {
    switch (getNextButtonTitle()) {
      case "Next":
        return isDisabled;
      case "Review":
        return isReviewDisabled();
      default:
        return false;
    }
  };

  const getNextButtonTitle = () => {
    switch (step.currentStep) {
      case 2:
        return "Review";
      case 3:
        return "Output";
      default:
        return "Next";
    }
  };

  const getClickId = () => {
    switch (getNextButtonTitle()) {
      case "Review":
        return "review_summary_button";
      case "Output":
        return "output_summary_btn";
      default:
        return "Next_Submit_Summary";
    }
  };

  const getClickClass = () => {
    switch (getNextButtonTitle()) {
      case "Review":
        return "review_button_confirmation";
      case "Output":
        return "output_summary";
      default:
        return "";
    }
  };

  return (
    <>
      <Box
        sx={{
          pt: 1,
          pl: 6,
          pr: 6,
          backgroundColor: "background.paper",
          borderTop: 1,
          borderColor: "primary.400",
        }}
      >
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <ProgressList>
              {steps.map((currStep, index) => {
                const status =
                  index < step.currentStep
                    ? "FINISH"
                    : index === step.currentStep
                    ? "PROGRESS"
                    : "UNSTART";
                const isLastStep = index === steps.length - 1;
                return (
                  <ProgressItem
                    onClick={() => handleStepClick(index)}
                    key={index}
                    status={status}
                    isLastStep={isLastStep}
                  >
                    <ProgressItemText status={status}>
                      {currStep.label}
                    </ProgressItemText>
                    <ProgressItemDescriptionText status={status}>
                      {currStep.desc}
                    </ProgressItemDescriptionText>
                  </ProgressItem>
                );
              })}
            </ProgressList>
          </Grid>
          <Grid item>
            {isNextButtonVisible && (
              <DefaultButton
                style={{
                  width: 100,
                  borderRadius: "15px",
                  height: 45,
                  marginBottom: 1.5,
                }}
                disabled={isButtonDisabled()}
                type="primary"
                title={getNextButtonTitle()}
                id={getClickId()}
                className={getClickClass()}
                onClick={handleNextButtonClick}
              />
            )}
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={snackbarOpen}
        onClose={handleCloseSnackbar}
        message={
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              color: "black",
            }}
          >
            <Typography sx={{ fontSize: "14px" }}>
              Your output has been successfully downloaded.
            </Typography>
            <Typography sx={{ fontSize: "12px", marginBottom: "10px" }}>
              You may return to the first step to begin a new process.
            </Typography>
            <DefaultButton
              textStyle={{ fontSize: "12px" }}
              style={{ width: "150px" }}
              onClick={handleReturnToFirstStep}
              title="Return to first step"
              type="primary"
            />
          </Box>
        }
        action={
          <Box sx={{ marginBottom: "50px" }}>
            <IconButton onClick={handleCloseSnackbar}>
              <IconX size={20} />
            </IconButton>
          </Box>
        }
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          backgroundColor: "white",
          color: "black",
          "& .MuiPaper-root": {
            backgroundColor: "inherit",
          },
        }}
      />
      <ResetContentModal
        isOpen={showResetModal}
        onClose={handleResetClose}
        onConfirm={handleResetConfirm}
      />
    </>
  );
};

export default ProjectBriefFooter;
