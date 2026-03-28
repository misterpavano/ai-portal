import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
} from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/system";
import {
  IconSquareArrowDownFilled,
  IconX,
  IconXboxXFilled,
} from "@tabler/icons-react";
import { useAtom } from "jotai";
import { useState } from "react";
import finishedStepperBg from "../../../../../assets/images/FinishedStepper.png";
import lastStepperBng from "../../../../../assets/images/LastStepper.png";
import progressLastStepperBng from "../../../../../assets/images/ProgressLastStepper.png";
import progressStepperBg from "../../../../../assets/images/ProgressStepper.png";
import unStartedStepperBg from "../../../../../assets/images/UnStartedStepper.png";
import { discussionGuideFlowAtom } from "../../../../../atoms/discussionGuideAtom";
import { droppedItemsAtom } from "../../../../../atoms/dndAtom";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { initalDiscussionGuideFlowValues } from "../../../../../config/discussionGuideInitialValues";
import { DiscussionGuideStep } from "../../../../../types/discussionGuidesTypes";
import ResetContentModal from "../Modals/ResetContentModal";

type Step = {
  label: string;
  desc: string;
};

type DiscussionGuideFooterProps = {
  step: DiscussionGuideStep;
  setCurrentStep: (step: DiscussionGuideStep) => void;
  nextStep: () => void;
  isNextButtonVisible: boolean;
  handleDownloadFile: (type: "Word" | "Powerpoint") => void;
};

const steps: Step[] = [
  { label: "Selection", desc: "Select document type" },
  { label: "Introduction", desc: "Provide direction" },
  { label: "Summary Review", desc: "Confirm definition docs" },
  { label: "Structure", desc: "Create document structure" },
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
      ? `url(${progressLastStepperBng})`
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

const DiscussionGuideFooter = ({
  step,
  setCurrentStep,
  nextStep,
  isNextButtonVisible,
  handleDownloadFile,
}: DiscussionGuideFooterProps) => {
  const [discussionGuideFlow, setDiscussionGuideFlowValues] = useAtom(
    discussionGuideFlowAtom
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [droppedItems, setDroppedItems] = useAtom(droppedItemsAtom);
  const {
    discussionObjectives,
    audienceDiscussionObjectives,
    respondentTypeObjectives,
    caveatsDiscussionObjectives,
    communicationStyleDiscussionObjectives,
    lengthDiscussionObjectives,
    questionsId,
    structureId,
  } = discussionGuideFlow;

  const isIntroductionDisabled =
    discussionObjectives !== "" && questionsId !== "" && structureId !== "";

  const areOtherObjectivesFilled =
    audienceDiscussionObjectives !== "" &&
    respondentTypeObjectives !== "" &&
    caveatsDiscussionObjectives !== "" &&
    communicationStyleDiscussionObjectives !== "" &&
    lengthDiscussionObjectives !== "";

  const isDisabled = !isIntroductionDisabled && !areOtherObjectivesFilled;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [targetStep, setTargetStep] = useState<number | null>(null);

  const isReviewDisabled = () => {
    if (droppedItems.length === 0) {
      return true;
    }
    for (const item of droppedItems) {
      switch (item.title) {
        case "Background & Introduction":
          if (
            discussionGuideFlow.introductionForm.maxCharacterCount === "" ||
            discussionGuideFlow.introductionForm.audience === "" ||
            discussionGuideFlow.introductionForm.purpose === ""
          ) {
            return true;
          }
          break;
        case "Discussion Flow":
          if (discussionGuideFlow.discussionFlowForm.sections.length === 0) {
            console.log("Discussion Flow");
            return true;
          }
          break;

        case "Market Research Disclosures":
          if (
            discussionGuideFlow.marketResearchForm.marketResearchDisclousers ===
            ""
          ) {
            return true;
          }
          break;
        case "Discussion Topics":
          if (discussionGuideFlow.discussionTopicsForm.sections.length === 0) {
            return true;
          }
          break;
        default:
          return true;
      }
    }
    return false;
  };

  const generateOutput = () => {
    handleCloseModal();
    handleDownloadFile("Word");
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleReturnToFirstStep = () => {
    handleCloseSnackbar();
    setCurrentStep({ currentStep: 0, isFinished: false });
    setDiscussionGuideFlowValues(initalDiscussionGuideFlowValues);
    setDroppedItems([]);
  };

  const handleStepClick = (index: number) => {
    if (index === 0) {
      setDiscussionGuideFlowValues(initalDiscussionGuideFlowValues);
    }
    if (step.currentStep === 3 && index < step.currentStep) {
      setShowResetModal(true);
      setTargetStep(index);
    } else if (index < step.currentStep || !isDisabled) {
      setCurrentStep({
        currentStep: index,
        isFinished: index === steps.length - 1,
      });
    }
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

  const handleResetClose = () => {
    setShowResetModal(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNextButtonClick = () => {
    if (step.currentStep === 4) {
      // Review
      setIsModalOpen(true);
    } else {
      nextStep();
    }
  };

  const getNextButtonTitle = () => {
    switch (step.currentStep) {
      case 3:
        return "Review";
      case 4:
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
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        PaperProps={{
          style: {
            borderRadius: "20px",
            width: "284px",
            position: "absolute",
            bottom: 70,
            right: 0,
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <DialogTitle
              sx={{ fontSize: "14px", fontWeight: 600 }}
              id="Download_Powerpoint"
              className="PowerPoint_Download"
              data-click-text="Download as PowerPoint"
            >
              Download
            </DialogTitle>
            <IconButton
              onClick={handleCloseModal}
              sx={{ float: "right", color: "black" }}
            >
              <IconXboxXFilled />
            </IconButton>
          </Box>
          <Box></Box>
        </Box>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <DialogContentText
              sx={{ color: "black", fontSize: "14px", cursor: "pointer" }}
              id="Download_Word"
              className="Word_Download"
              data-click-text="Download as Word"
              onClick={generateOutput}
            >
              Download as Word
            </DialogContentText>
            <IconSquareArrowDownFilled
              onClick={generateOutput}
              style={{ cursor: "pointer" }}
              size={20}
            />
          </Box>
        </DialogContent>
      </Dialog>
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

export default DiscussionGuideFooter;
