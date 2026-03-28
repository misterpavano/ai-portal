import React, { useEffect, useRef, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  IconArrowNarrowRight,
  IconContrast2,
  IconLayersIntersect,
} from "@tabler/icons-react";
import { useAtom } from "jotai";
import { InterviewGuideType } from "../../../../types/interviewSummaries";
import { modelIncompatibilityErrorAtom } from "../../../../atoms/interviewDiscusstionGuideAtom";
import { aiToolModelsAtom } from "../../../../atoms/toolsAtom";
import { useGetToolsQuery } from "../../../../api/slices/toolsSlice";
import {
  useCreateAssistantMutation,
  useCreateVectorStoreMutation,
  useDeleteAssistantMutation,
  useDeleteVectorStoreMutation,
} from "../../../../api/slices/openAiSlice";

interface InterviewSummariesStepProps {
  setSelectedType: (type: { name: string; id: string }) => void;
  nextStep: () => void;
}

// function filterOldMeetingAssistants(assistants: any) {
//   const thirtyMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 60;

//   return assistants.filter((assistant: any) => {
//     if (assistant.name !== null) {
//       const isMeetingAssistant = assistant.name.startsWith(
//         "Internal Meeting Summary Assistant"
//       );
//       const isOlderThan30Min = assistant.created_at < thirtyMinutesAgo;

//       return isMeetingAssistant && isOlderThan30Min;
//     }

//     return false;
//   });
// }

// function filterOldMeetingVectorStores(vectorStores: any) {
//   const thirtyMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 60;

//   return vectorStores.filter((vectorStore: any) => {
//     if (vectorStore.name !== null) {
//       const isMeetingVectorStore = vectorStore?.name.startsWith(
//         "Internal Meeting Summary Vector"
//       );
//       const isOlderThan30Min = vectorStore.created_at < thirtyMinutesAgo;
//       return isMeetingVectorStore && isOlderThan30Min;
//     }

//     return false;
//   });
// }

const InterviewSummariesTypesStep: React.FC<InterviewSummariesStepProps> = ({
  setSelectedType,
  nextStep,
}) => {
  const [modelErrorState, setModelErrorState] = useAtom(
    modelIncompatibilityErrorAtom,
  );
  const [models] = useAtom(aiToolModelsAtom);
  const { data: toolsData } = useGetToolsQuery();

  // Get model from backend first (source of truth), fallback to atom, then default
  // Use useMemo to prevent recalculation on every render
  const selectedModel = useMemo(() => {
    const tools = Array.isArray(toolsData)
      ? toolsData
      : (toolsData?.data ?? []);
    const meetingSummariesTool = tools.find(
      (tool) => tool.name === "Meeting Summaries",
    );
    const backendModel = meetingSummariesTool?.model?.modelId;
    const atomModel = models["Meeting Summaries"];

    const model = backendModel || atomModel || "o3-pro";

    return model;
  }, [toolsData, models]);
  console.log(
    "🤖 [InterviewSummariesTypesStep] Selected Model: ",
    selectedModel,
  );
  const modelError =
    modelErrorState?.model === selectedModel ? modelErrorState.error : null;
  const [createAssistant] = useCreateAssistantMutation();
  const [createVectorStore] = useCreateVectorStoreMutation();
  const [deleteAssistant] = useDeleteAssistantMutation();
  const [deleteVectorStore] = useDeleteVectorStoreMutation();
  const hasCheckedModelRef = useRef<string | null>(null);
  const [isCheckingModel, setIsCheckingModel] = useState(true);

  // Synchronous check for known incompatible models - runs immediately on render
  // This prevents any race conditions on hard reload
  const isKnownIncompatibleModel = useMemo(() => {
    if (!selectedModel) return false;
    const modelLower = selectedModel.toLowerCase();
    return (
      modelLower.startsWith("o1-") ||
      modelLower.startsWith("o3-") ||
      modelLower.startsWith("o4-") ||
      modelLower.startsWith("gpt-5") ||
      modelLower === "o1" ||
      modelLower === "o3" ||
      modelLower === "o4"
    );
  }, [selectedModel]);

  // Set error immediately for known incompatible models (synchronous, before useEffect)
  useEffect(() => {
    if (isKnownIncompatibleModel && selectedModel) {
      console.log(
        "🚫 Known incompatible model detected (sync):",
        selectedModel,
      );
      const errorMessage = `The model '${selectedModel}' cannot be used with the Assistants API. Please select a different model.`;
      setModelErrorState({ error: errorMessage, model: selectedModel });
      hasCheckedModelRef.current = selectedModel;
      setIsCheckingModel(false);
    }
  }, [isKnownIncompatibleModel, selectedModel, setModelErrorState]);

  // Check model compatibility when component loads or model changes
  useEffect(() => {
    // Skip if it's a known incompatible model (already handled above)
    if (isKnownIncompatibleModel) {
      return;
    }

    const checkModelCompatibility = async () => {
      setIsCheckingModel(true);

      // Skip if we've already checked this exact model (prevents duplicate checks and loops)
      if (hasCheckedModelRef.current === selectedModel) {
        console.log(
          "⏭️ Skipping model compatibility check - already checked:",
          selectedModel,
        );
        // If we already have an error for this model, preserve it
        if (
          modelErrorState?.model === selectedModel &&
          modelErrorState?.error
        ) {
          console.log(
            "✅ Preserving existing error for model:",
            selectedModel,
            modelErrorState.error,
          );
        }
        setIsCheckingModel(false);
        return;
      }

      // Mark as checking immediately to prevent concurrent checks
      hasCheckedModelRef.current = selectedModel;
      try {
        // Create a test vector store
        const testVectorStore = await createVectorStore({
          name: `Test Vector Store ${Date.now()}`,
        }).unwrap();

        // Try to create a test assistant with the selected model
        const testAssistant = await createAssistant({
          name: `Test Assistant ${Date.now()}`,
          instructions: "Test assistant for model validation",
          vectorStoreId: testVectorStore.id,
          model: selectedModel,
        }).unwrap();

        // CRITICAL: Check if the backend silently changed the model
        // If the response model doesn't match the requested model, it means the backend
        // fell back to a compatible model, which indicates incompatibility
        const actualModel = testAssistant.model;
        console.log(
          "🔍 Model check - Requested:",
          selectedModel,
          "Actual:",
          actualModel,
        );

        if (actualModel !== selectedModel) {
          // Backend silently changed the model - this means the requested model is incompatible
          const errorMessage = `The model '${selectedModel}' cannot be used with the Assistants API. The backend automatically switched to '${actualModel}'. Please select a different model.`;
          setModelErrorState({ error: errorMessage, model: selectedModel });
          console.log("❌ Model incompatibility detected (silent fallback):", {
            requested: selectedModel,
            actual: actualModel,
          });

          // Clean up test resources
          try {
            await deleteAssistant(testAssistant.id).unwrap();
            await deleteVectorStore(testVectorStore.id).unwrap();
          } catch (cleanupError) {}
          setIsCheckingModel(false);
          return;
        }

        // If successful and models match, clean up test resources and clear error
        try {
          await deleteAssistant(testAssistant.id).unwrap();
          await deleteVectorStore(testVectorStore.id).unwrap();
        } catch (cleanupError) {}

        // Only clear error if we successfully verified compatibility with the exact model
        setModelErrorState({ error: null, model: selectedModel });
        console.log("✅ Model compatibility verified:", selectedModel);
        setIsCheckingModel(false);
        // hasCheckedModelRef is already set above
      } catch (error: any) {
        // Check if it's a model incompatibility error
        const errorCode = error?.data?.code || error?.code;
        const errorMessage =
          error?.data?.message || error?.message || error?.data?.details || "";
        const isModelIncompatible =
          errorCode === "unsupported_model" ||
          errorMessage
            ?.toLowerCase()
            .includes("cannot be used with the assistants api") ||
          errorMessage?.toLowerCase().includes("unsupported model") ||
          errorMessage?.toLowerCase().includes("model not found") ||
          errorMessage?.toLowerCase().includes("invalid model");

        if (isModelIncompatible) {
          const fullErrorMessage =
            error?.data?.message ||
            `The model '${selectedModel}' cannot be used with the Assistants API. Please select a different model.`;
          setModelErrorState({ error: fullErrorMessage, model: selectedModel });
          console.log(
            "❌ Model incompatibility detected:",
            selectedModel,
            fullErrorMessage,
          );
          setIsCheckingModel(false);
          // hasCheckedModelRef is already set above
        } else {
          // For other errors (network, timeout, etc.), preserve existing error if it exists
          // Only clear if we don't have an existing error for this model
          if (
            !modelErrorState?.error ||
            modelErrorState?.model !== selectedModel
          ) {
            setModelErrorState({ error: null, model: selectedModel });
            console.log(
              "⚠️ Non-model error occurred, but no existing error to preserve",
            );
          } else {
            console.log(
              "⚠️ Non-model error occurred, preserving existing error:",
              modelErrorState.error,
            );
          }
          setIsCheckingModel(false);
          // hasCheckedModelRef is already set above
        }
      }
    };

    checkModelCompatibility();
    // Only depend on selectedModel - modelErrorState changes should not trigger re-check
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel, isKnownIncompatibleModel]);

  const types: InterviewGuideType[] = [
    "Advisory Boards",
    "1on1/TLE interviews",
  ];

  const typeToIcon: Record<InterviewGuideType, JSX.Element> = {
    "Advisory Boards": <IconContrast2 size={18} />,
    "1on1/TLE interviews": <IconLayersIntersect size={18} />,
  };

  const typeToDescription: Record<InterviewGuideType, string> = {
    "Advisory Boards":
      "Generate a summary from an advisory board meeting that gathered insights from a group of experts (e.g., physicians, NPs/PAs, patients, payers, etc.).",
    "1on1/TLE interviews":
      "Generate a summary of insights from a conversation with 1 expert during a 1:1 meeting or Thought Leader Engagement.",
  };

  // Map types to their unique IDs
  const typeToId: Record<InterviewGuideType, string> = {
    "Advisory Boards": "Proceed_to_Advisory_Boards",
    "1on1/TLE interviews": "Proceed_to_1on1_TLE_Interviews",
  };

  return (
    <Box sx={{ padding: "20px 0 20px 20px", position: "relative" }}>
      {/* Loading overlay to prevent interaction during model check */}
      {isCheckingModel && (
        <Backdrop
          open={true}
          sx={{
            position: "absolute",
            zIndex: 1000,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: "red" }} />
          <Typography sx={{ color: "#57534E", fontSize: "18px", fontWeight: 500 }}>
            Checking model compatibility...
          </Typography>
        </Backdrop>
      )}

      {modelError && (
        <Box
          sx={{
            padding: "20px",
            margin: "0 0 20px 0",
            backgroundColor: "#FDF8ED",
            border: "2px solid #ffc107",
            borderRadius: "8px",
          }}
        >
          <Typography sx={{ fontWeight: "bold", color: "#856404", mb: 1 }}>
            ⚠️ Model Incompatibility Error
          </Typography>
          <Typography sx={{ color: "#856404", fontSize: "14px", mb: 1 }}>
            {modelError}
          </Typography>
          <Typography sx={{ color: "#856404", fontSize: "12px" }}>
            The tool is disabled until you select a compatible model. Please
            change the model in the tool settings.
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          opacity: modelError ? 0.5 : 1,
          pointerEvents: modelError ? "none" : "auto",
        }}
      >
        <Grid container columnSpacing={6} rowSpacing={2} sx={{ maxWidth: 980 }}>
          {types.map((name, key) => (
            <Grid item lg={6} xs={12} sm={6} key={key}>
              <Box
                key={key}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  border: "1px solid #E7E7E7",
                  borderRadius: "8px",
                  padding: "15px",
                  width: "100%",
                  height: 140,
                  marginBottom: "10px",
                  opacity: 1,
                  filter: "none",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 540,
                      fontSize: "16px",
                      lineHeight: "19px",
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 0.5,
                    }}
                  >
                    {typeToIcon[name]}
                    <Box sx={{ ml: 1 }}>{name}</Box>
                  </Typography>
                  <Typography sx={{ fontSize: "14px" }}>
                    {typeToDescription[name]}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    width: 280,
                    height: 30,
                  }}
                >
                  <Button
                    id={typeToId[name]}
                    disabled={!!modelError}
                    sx={{
                      display: "flex",
                      gap: "10px",
                      border: "1.5px solid black",
                      fontSize: "12px",
                      height: 30,
                      pointerEvents: "auto",
                    }}
                    onClick={() => {
                      setSelectedType({ name, id: typeToId[name] });
                      nextStep();
                    }}
                  >
                    Proceed to {name}
                    <IconArrowNarrowRight size={15} />
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default InterviewSummariesTypesStep;
