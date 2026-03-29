import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { useAtom } from "jotai";
import { audioToTextFormAtom } from "../../../../../atoms/audioToTextAtom";
import { AudioToTextStep } from "../../../../../types/audioToText";
import { IconArrowLeft } from "@tabler/icons-react";
import ResetContentModal from "../../../discussionGuide/Tool/Modals/ResetContentModal";
import { audioToTextValues } from "../../../../../config/audioToTextValues";
import {
  useDeleteFileFromVectorStoreMutation,
  useDeleteFileFromStorageMutation,
  useDeleteVectorStoreMutation,
  useDeleteAssistantMutation,
} from "../../../../../api/slices/openAiSlice";

type AudioToTextFooterProps = {
  step: AudioToTextStep;
  setCurrentStep: (step: AudioToTextStep) => void;
  nextStep: () => void;
  isNextButtonVisible: boolean;
  handleDownloadFile: (type: "Word" | "Powerpoint") => void;
};

const AudioToTextFooter = ({
  step,
  setCurrentStep,
  handleDownloadFile,
}: AudioToTextFooterProps) => {
  const [audioToTextFormValues, setAudioToTextFormValues] =
    useAtom(audioToTextFormAtom);
  const [showResetModal, setShowResetModal] = useState(false);
  const [deleteFileFromVectorStore] = useDeleteFileFromVectorStoreMutation();
  const [deleteFileFromStorage] = useDeleteFileFromStorageMutation();
  const [deleteVectorStore] = useDeleteVectorStoreMutation();
  const [deleteAssistant] = useDeleteAssistantMutation();

  const cleanupAndReset = async () => {
    const vectorStoreId = audioToTextFormValues.vectorStoreId;
    const assistantId = audioToTextFormValues.assistantId;

    if (audioToTextFormValues.file?.fileId && vectorStoreId) {
      try {
        await deleteFileFromVectorStore({
          vectorStoreId,
          file_id: audioToTextFormValues.file.fileId,
        }).unwrap();
      } catch (error) {
        console.error("Error deleting file from vector store:", error);
      }
      try {
        await deleteFileFromStorage(
          audioToTextFormValues.file.fileId,
        ).unwrap();
      } catch (error) {
        console.error("Error deleting file from storage:", error);
      }
    }

    if (assistantId) {
      try {
        await deleteAssistant(assistantId).unwrap();
      } catch (error) {
        console.error("Error deleting assistant:", error);
      }
    }

    if (vectorStoreId) {
      try {
        await deleteVectorStore(vectorStoreId).unwrap();
      } catch (error) {
        console.error("Error deleting vector store:", error);
      }
    }

    setCurrentStep({ currentStep: 0, isFinished: false });
    setAudioToTextFormValues(audioToTextValues);
  };

  const handleBackToUpload = () => {
    if (step.currentStep === 1) {
      setShowResetModal(true);
    }
  };

  const handleResetConfirm = async () => {
    setShowResetModal(false);
    await cleanupAndReset();
  };

  const handleDownload = () => {
    handleDownloadFile("Word");
  };

  // Step 0: no footer needed (Transcribe Audio button is inline in the upload form)
  if (step.currentStep === 0) return null;

  // Step 1 (Preview): action bar with Back, Download, New Transcription
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pt: 2,
          pb: 2,
          px: 1,
        }}
      >
        {/* Left: Back to upload */}
        <Box
          onClick={handleBackToUpload}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            cursor: "pointer",
            color: "#78716C",
            transition: "color 0.15s ease",
            "&:hover": { color: "#1C1917" },
          }}
        >
          <IconArrowLeft size={16} strokeWidth={1.5} />
          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
            Back to upload
          </Typography>
        </Box>

        {/* Right: Download + New Transcription */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <DefaultButton
            type="secondary"
            title="New Transcription"
            onClick={() => setShowResetModal(true)}
            style={{
              borderRadius: "8px",
              height: 40,
              width: 160,
              fontSize: 13,
            }}
          />
          <DefaultButton
            type="primary"
            title="Download as Word"
            onClick={handleDownload}
            style={{
              borderRadius: "8px",
              height: 40,
              width: 170,
              fontSize: 13,
            }}
          />
        </Box>
      </Box>

      <ResetContentModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetConfirm}
      />
    </>
  );
};

export default AudioToTextFooter;
