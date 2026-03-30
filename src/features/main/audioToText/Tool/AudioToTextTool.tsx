import { Box } from "@mui/material";
import { useAtom } from "jotai";
import { useEffect } from "react";
import dayjs from "dayjs";
import AudioToTextUploads from "./Content/AudioToTextUploads";
import TranscriptionPreview from "./Content/TranscriptionPreview";
import {
  audioToTextFormAtom,
  audioToTextStepAtom,
} from "../../../../atoms/audioToTextAtom";
import {
  useCreateAssistantMutation,
  useCreateVectorStoreMutation,
} from "../../../../api/slices/openAiSlice";
import { aiToolModelsAtom } from "../../../../atoms/toolsAtom";

interface Step {
  label: string;
  component: React.ReactNode;
}

const AudioToTextTools: React.FC = () => {
  const [audioToTextFormValues, setAudiotToTextFormValues] =
    useAtom(audioToTextFormAtom);
  const [step, setCurrentStep] = useAtom(audioToTextStepAtom);
  const [models] = useAtom(aiToolModelsAtom);
  const selectedModel = models["Audio to Text"] || "gpt-3.5-turbo";
  const [createVectorStore] = useCreateVectorStoreMutation();
  const [createAssistant] = useCreateAssistantMutation();

  // Create vector store and assistant when moving to TranscriptionPreview (disabled in demo mode)
  useEffect(() => {
    if (true) return; // eslint-disable-line -- Demo mode: skip real API init
    const initializeVectorStoreAndAssistant = async () => {
      // Only create if we're on step 1 (TranscriptionPreview) and they don't exist yet
      if (
        step.currentStep === 1 &&
        !audioToTextFormValues.vectorStoreId &&
        !audioToTextFormValues.assistantId
      ) {
        try {
          console.log("🆕 Creating vector store for Audio to Text...");
          const vectorStore = await createVectorStore({
            name:
              "Audio to Text Vector " + dayjs().format("DD/MM/YYYY/ HH:mm:ss"),
          }).unwrap();
          console.log("✅ Vector store created:", vectorStore.id);

          console.log("🆕 Creating assistant for Audio to Text...");
          const assistant = await createAssistant({
            name:
              "Audio to Text Assistant " +
              dayjs().format("DD/MM/YYYY/ HH:mm:ss"),
            instructions: `You are an assistant that helps analyze and summarize transcribed audio files. Your role is to answer questions about the transcribed content and provide summaries based on the files available in your vector store. Do not mention or refer to file names, file IDs, or any metadata in your responses. Focus only on the discussion, topics, and insights contained within the transcription. If you cannot find the relevant content, simply state that you need more time to process the file.`,
            vectorStoreId: vectorStore.id,
            model: selectedModel,
          }).unwrap();
          console.log("✅ Assistant created:", assistant.id);

          // Store in atom
          setAudiotToTextFormValues((prev) => ({
            ...prev,
            vectorStoreId: vectorStore.id,
            assistantId: assistant.id,
          }));
        } catch (error) {
          console.error("❌ Error creating vector store and assistant:", error);
        }
      }
    };

    initializeVectorStoreAndAssistant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.currentStep]);

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  const steps: Step[] = [
    {
      label: "Introduction",
      component: (
        <AudioToTextUploads
          initialValues={audioToTextFormValues}
          setAudioToTextFormValues={setAudiotToTextFormValues}
          nextStep={nextStep}
        />
      ),
    },
    {
      label: "Output",
      component: <TranscriptionPreview onCancel={() => setCurrentStep({ currentStep: 0, isFinished: false })} />,
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

export default AudioToTextTools;
