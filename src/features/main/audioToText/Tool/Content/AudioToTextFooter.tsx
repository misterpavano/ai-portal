import React from "react";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { styled } from "@mui/system";
import { useAtom } from "jotai";
import { audioToTextFormAtom } from "../../../../../atoms/audioToTextAtom";
import { AudioToTextStep } from "../../../../../types/audioToText";
import { useState } from "react";
import {
  IconSquareArrowDownFilled,
  IconX,
  IconXboxXFilled,
} from "@tabler/icons-react";
import ResetContentModal from "../../../discussionGuide/Tool/Modals/ResetContentModal";
import { audioToTextValues } from "../../../../../config/audioToTextValues";
import {
  useDeleteFileFromVectorStoreMutation,
  useDeleteFileFromStorageMutation,
  useDeleteVectorStoreMutation,
  useDeleteAssistantMutation,
} from "../../../../../api/slices/openAiSlice";

type Step = {
  label: string;
  desc: string;
};

type AudioToTextFooterProps = {
  step: AudioToTextStep;
  setCurrentStep: (step: AudioToTextStep) => void;
  nextStep: () => void;
  isNextButtonVisible: boolean;
  handleDownloadFile: (type: "Word" | "Powerpoint") => void;
};

const steps: Step[] = [
  {
    label: "Upload Audio File",
    desc: "Provide the file to transcribe.",
  },
  { label: "Preview", desc: "Preview the output" },
];

const ProgressList = styled("div")(() => ({
  padding: 0,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  width: "100%",
}));

type StepStatus = "UNSTART" | "PROGRESS" | "FINISH";

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
    textAlign: "center" as const,
    lineHeight: 1.3,
    color: status === "PROGRESS" ? "#44403C" : "#A8A29E",
  }),
);

const AudioToTextFooter = ({
  step,
  nextStep,
  isNextButtonVisible,
  setCurrentStep,
  handleDownloadFile,
}: AudioToTextFooterProps) => {
  const [audioToTextFormValues, setAudioToTextFormValues] =
    useAtom(audioToTextFormAtom);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const isDisabled = !audioToTextFormValues.uploadedFile;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [targetStep, setTargetStep] = useState<number | null>(null);
  const [deleteFileFromVectorStore] = useDeleteFileFromVectorStoreMutation();
  const [deleteFileFromStorage] = useDeleteFileFromStorageMutation();
  const [deleteVectorStore] = useDeleteVectorStoreMutation();
  const [deleteAssistant] = useDeleteAssistantMutation();

  const handleStepClick = (index: number) => {
    if (index === 0) {
      setAudioToTextFormValues(audioToTextValues);
    }
    if (step.currentStep === 1 && index < step.currentStep) {
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleResetClose = () => {
    setShowResetModal(false);
  };

  const handleNextButtonClick = () => {
    if (step.currentStep === 1) {
      setIsModalOpen(true);
    } else {
      nextStep();
    }
  };

  const isButtonDisabled = () => {
    switch (getNextButtonTitle()) {
      case "Next":
        return isDisabled;

      default:
        return false;
    }
  };

  const getNextButtonTitle = () => {
    switch (step.currentStep) {
      case 1:
        return "Download";
      default:
        return "Next";
    }
  };

  const getClickId = () => {
    switch (getNextButtonTitle()) {
      case "Download":
        return "download_transcript_button";
      default:
        return "next_transcribe_button";
    }
  };

  const getClickClass = () => {
    switch (getNextButtonTitle()) {
      case "Download":
        return "download_transcript";
      default:
        return "";
    }
  };

  const generateOutput = () => {
    handleCloseModal();
    handleDownloadFile("Word");
    setSnackbarOpen(true);
  };

  const generatePPT = () => {
    handleCloseModal();
    handleDownloadFile("Powerpoint");
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleReturnToFirstStep = async () => {
    handleCloseSnackbar();

    const vectorStoreId = audioToTextFormValues.vectorStoreId;
    const assistantId = audioToTextFormValues.assistantId;

    // Delete file from vector store if it exists
    if (audioToTextFormValues.file?.fileId && vectorStoreId) {
      try {
        await deleteFileFromVectorStore({
          vectorStoreId: vectorStoreId,
          file_id: audioToTextFormValues.file.fileId,
        }).unwrap();
        console.log("✅ File deleted from vector store");
      } catch (error) {
        console.error("❌ Error deleting file from vector store:", error);
      }

      try {
        await deleteFileFromStorage(audioToTextFormValues.file.fileId).unwrap();
        console.log("✅ File deleted from storage");
      } catch (error) {
        console.error("❌ Error deleting file from storage:", error);
      }
    }

    // Delete assistant if it exists
    if (assistantId) {
      try {
        await deleteAssistant(assistantId).unwrap();
        console.log("✅ Assistant deleted");
      } catch (error) {
        console.error("❌ Error deleting assistant:", error);
      }
    }

    // Delete vector store if it exists
    if (vectorStoreId) {
      try {
        await deleteVectorStore(vectorStoreId).unwrap();
        console.log("✅ Vector store deleted");
      } catch (error) {
        console.error("❌ Error deleting vector store:", error);
      }
    }

    setCurrentStep({ currentStep: 0, isFinished: false });
    setAudioToTextFormValues(audioToTextValues);
  };

  const renderDownloadOptions = () => {
    return (
      <>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <DialogContentText
            sx={{ color: "common.black", fontSize: "14px", cursor: "pointer" }}
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
      </>
    );
  };

  return (
    <>
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
              id="dialog-title"
            >
              Download
            </DialogTitle>
            <IconButton
              onClick={handleCloseModal}
              sx={{ float: "right", color: "common.black" }}
            >
              <IconXboxXFilled />
            </IconButton>
          </Box>
          <Box></Box>
        </Box>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {renderDownloadOptions()}
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
              color: "common.black",
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
          backgroundColor: "common.white",
          color: "common.black",
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

export default AudioToTextFooter;
