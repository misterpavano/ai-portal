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

const ProgressList = styled("ul")(() => ({
  padding: 0,
  listStyleType: "none",
  fontFamily: "arial",
  fontSize: "12px",
  clear: "both",
  gap: 4,
  lineHeight: "1em",
  display: "flex",
  width: "100%",
}));

const ProgressItem = styled("div")<{
  status: "UNSTART" | "PROGRESS" | "FINISH";
  isLastStep: boolean;
}>(({ status, isLastStep }) => ({
  backgroundColor:
    isLastStep && status === "UNSTART"
      ? `#ffffff`
      : isLastStep && status === "PROGRESS"
        ? `#E86D5A`
        : status === "UNSTART"
          ? `#ffffff`
          : status === "PROGRESS"
            ? `#E86D5A`
            : `#D6D3D1`,
  color: status === "FINISH" ? "#1C1917" : "#ffffff",
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  cursor: "pointer",
  alignItems: "center",
  flexDirection: "column",
  display: "flex",
  padding: "6px 0",
  borderRadius: "10px",
  width: 200,
}));

const ProgressItemText = styled(Typography)<{
  status: "UNSTART" | "PROGRESS" | "FINISH";
  isLastStep: boolean;
}>(({ status, isLastStep }) => ({
  color:
    isLastStep && status === "UNSTART"
      ? `#1C1917`
      : isLastStep && status === "PROGRESS"
        ? `#ffffff`
        : status === "UNSTART"
          ? `#1C1917`
          : status === "PROGRESS"
            ? `#ffffff`
            : `#A8A29E`,
  fontSize: "14px",
  fontWeight: 600,
}));

const ProgressItemDescriptionText = styled(Typography)<{
  status: "UNSTART" | "PROGRESS" | "FINISH";
}>(({ status }) => ({
  color: status === "PROGRESS" ? "#ffffff" : "#A8A29E",
  fontSize: "12px",
  fontWeight: 400,
}));

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
          pt: 1,
          pl: 2,
          pr: 6,
          backgroundColor: "#FFFFFF",
          borderRadius: "10px",
          borderColor: "primary.400",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
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
                    <ProgressItemText status={status} isLastStep={isLastStep}>
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
