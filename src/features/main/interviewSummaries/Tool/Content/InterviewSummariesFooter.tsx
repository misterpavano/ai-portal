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
import {
  assistantIdMeetingSummaryAtom,
  interviewSummariesFormAtom,
  interviewSummariesInitializationAtom,
  modelIncompatibilityErrorAtom,
  vectorStoreIdMeetingSummaryAtom,
} from "../../../../../atoms/interviewDiscusstionGuideAtom";
import { aiToolModelsAtom } from "../../../../../atoms/toolsAtom";
import { InterviewSummariesStep } from "../../../../../types/interviewSummaries";
import { useState } from "react";
import {
  IconSquareArrowDownFilled,
  IconX,
  IconXboxXFilled,
} from "@tabler/icons-react";
import ResetContentModal from "../../../discussionGuide/Tool/Modals/ResetContentModal";
import { initialInterviewSummariesValues } from "../../../../../config/interviewSummariesValues";
import {
  useDeleteAssistantMutation,
  useDeleteFileFromStorageMutation,
  useDeleteVectorStoreMutation,
  useLazyGetFilesFromVectorStoreQuery,
} from "../../../../../api/slices/openAiSlice";

type Step = {
  label: string;
  desc: string;
};

type InterviewSummariesFooterProps = {
  step: InterviewSummariesStep;
  setCurrentStep: (step: InterviewSummariesStep) => void;
  nextStep: () => void;
  isNextButtonVisible: boolean;
  handleDownloadFile: (type: "Word" | "Powerpoint") => void;
  handleToplineDownloadFile: (type: "Word" | "Powerpoint") => void;
};

const steps: Step[] = [
  { label: "Selection", desc: "Select document type" },
  { label: "Introduction", desc: "Provide direction" },
  { label: "Structure", desc: "Create document structure" },
  { label: "Review", desc: "Review generated content" },
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
      ? `white`
      : isLastStep && status === "PROGRESS"
        ? `#DC5E5E`
        : status === "UNSTART"
          ? `white`
          : status === "PROGRESS"
            ? `#DC5E5E`
            : `#DBDBDB`,
  color: status === "FINISH" ? "#263238" : "white",
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
      ? `black`
      : isLastStep && status === "PROGRESS"
        ? `white`
        : status === "UNSTART"
          ? `black`
          : status === "PROGRESS"
            ? `white`
            : `#939393`,
  fontSize: "14px",
  fontWeight: 600,
}));

const ProgressItemDescriptionText = styled(Typography)<{
  status: "UNSTART" | "PROGRESS" | "FINISH";
}>(({ status }) => ({
  color: status === "PROGRESS" ? "white" : "#939393",
  fontSize: "12px",
  fontWeight: 400,
}));

const InterviewSummariesFooter = ({
  step,
  nextStep,
  isNextButtonVisible,
  setCurrentStep,
  handleDownloadFile,
  handleToplineDownloadFile,
}: InterviewSummariesFooterProps) => {
  const [interviewSummariesFormValues, setInterviewSummariesFormValues] =
    useAtom(interviewSummariesFormAtom);
  const [isInitializationComplete] = useAtom(
    interviewSummariesInitializationAtom,
  );
  const [modelErrorState] = useAtom(modelIncompatibilityErrorAtom);
  const [models] = useAtom(aiToolModelsAtom);
  const selectedModel = models["Meeting Summaries"] || "gpt-3.5-turbo";
  // Extract error message - show it only if it's for the current model
  const modelError =
    modelErrorState?.model === selectedModel ? modelErrorState.error : null;
  const [assistantId, setAssistantId] = useAtom(assistantIdMeetingSummaryAtom);
  const [vectorStoreId, setVectorStoreId] = useAtom(
    vectorStoreIdMeetingSummaryAtom,
  );
  const [deleteAssistant] = useDeleteAssistantMutation();
  const [deleteVectorStore] = useDeleteVectorStoreMutation();
  const [deleteFileFromStorage] = useDeleteFileFromStorageMutation();
  const [getFilesFromVectorStore] = useLazyGetFilesFromVectorStoreQuery();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Check if discussion topics exist (for step 2 -> step 3)
  const hasDiscussionTopics =
    interviewSummariesFormValues.discussionTopics?.sections &&
    interviewSummariesFormValues.discussionTopics.sections.length > 0;

  const isDisabled =
    ((interviewSummariesFormValues.objectivesSummary === "" ||
      interviewSummariesFormValues.objectives === "") &&
      !interviewSummariesFormValues.file?.fileName) ||
    !isInitializationComplete ||
    !!modelError; // Disable if model is incompatible
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [targetStep, setTargetStep] = useState<number | null>(null);

  const cleanupResources = async () => {
    try {
      // Delete files from vector store first
      if (vectorStoreId) {
        console.log("🧹 Cleaning up vector store:", vectorStoreId);
        try {
          const filesResponse =
            await getFilesFromVectorStore(vectorStoreId).unwrap();
          const filesArray = filesResponse
            ? Array.isArray(filesResponse)
              ? filesResponse
              : (filesResponse as any)?.data || []
            : [];

          const existingFiles = Array.isArray(filesArray) ? filesArray : [];
          console.log(`📄 Found ${existingFiles.length} files to delete`);

          // Delete all files
          for (const file of existingFiles) {
            if (file?.id) {
              try {
                await deleteFileFromStorage(file.id).unwrap();
                console.log("✅ File deleted:", file.id);
              } catch (error: any) {
                console.error("❌ Error deleting file:", file.id, error);
              }
            }
          }
        } catch (error: any) {
          console.warn("⚠️ Could not fetch files from vector store:", error);
        }

        // Delete vector store
        try {
          await deleteVectorStore(vectorStoreId).unwrap();
          console.log("✅ Vector store deleted");
        } catch (error: any) {
          console.error("❌ Error deleting vector store:", error);
        }
      }

      // Delete assistant
      if (assistantId) {
        console.log("🧹 Cleaning up assistant:", assistantId);
        try {
          await deleteAssistant(assistantId).unwrap();
          console.log("✅ Assistant deleted");
        } catch (error: any) {
          console.error("❌ Error deleting assistant:", error);
        }
      }

      // Clear localStorage and atoms
      localStorage.removeItem("assistantIdMeetingSummary");
      localStorage.removeItem("vectorStoreIdMeetingSummary");
      localStorage.removeItem("assistantModelMeetingSummary");
      setAssistantId("");
      setVectorStoreId("");
      console.log("🧹 Cleaned up localStorage and atoms");
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
    }
  };

  const handleStepClick = async (index: number) => {
    // If going back to step 0, cleanup resources to start a fresh flow
    if (index === 0 && step.currentStep > 0) {
      await cleanupResources();
      setInterviewSummariesFormValues(initialInterviewSummariesValues);
    } else if (index === 0) {
      setInterviewSummariesFormValues(initialInterviewSummariesValues);
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

  const handleResetConfirm = async () => {
    if (targetStep !== null) {
      // If resetting to step 0, cleanup resources
      if (targetStep === 0) {
        await cleanupResources();
        setInterviewSummariesFormValues(initialInterviewSummariesValues);
      }
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
        // Disable Review button (step 2 -> step 3) if no discussion topics exist
        return !hasDiscussionTopics;
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

    // Cleanup: Delete assistant and vector store at the end of the flow
    await cleanupResources();

    // Reset form and step
    setCurrentStep({ currentStep: 0, isFinished: false });
    setInterviewSummariesFormValues(initialInterviewSummariesValues);
  };

  const renderDownloadOptions = () => {
    const { type } = interviewSummariesFormValues;

    if (type.name === "Transcript Based Summary") {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <DialogContentText
            sx={{ color: "black", fontSize: "14px", cursor: "pointer" }}
            id="Download_Powerpoint"
            className="PowerPoint_Download"
            data-click-text="Download as PowerPoint"
            onClick={generatePPT}
          >
            Download as PowerPoint
          </DialogContentText>
          <IconSquareArrowDownFilled
            onClick={generatePPT}
            style={{ cursor: "pointer" }}
            size={20}
          />
        </Box>
      );
    }

    if (type.name === "Advisory Boards") {
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <DialogContentText
              sx={{ color: "black", fontSize: "14px", cursor: "pointer" }}
              id="Download_Powerpoint"
              className="PowerPoint_Download"
              data-click-text="Download as PowerPoint"
              onClick={generatePPT}
            >
              Download as PowerPoint
            </DialogContentText>
            <IconSquareArrowDownFilled
              onClick={generatePPT}
              style={{ cursor: "pointer" }}
              size={20}
            />
          </Box>
        </>
      );
    }

    if (type.name === "1on1/TLE interviews") {
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <DialogContentText
              sx={{ color: "black", fontSize: "14px", cursor: "pointer" }}
              id="Download_Powerpoint"
              className="PowerPoint_Download"
              data-click-text="Download as PowerPoint"
              onClick={generatePPT}
            >
              Download as PowerPoint
            </DialogContentText>
            <IconSquareArrowDownFilled
              onClick={generatePPT}
              style={{ cursor: "pointer" }}
              size={20}
            />
          </Box>
        </>
      );
    }

    return null;
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

export default InterviewSummariesFooter;
