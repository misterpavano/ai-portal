import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CircularProgress, Backdrop } from "@mui/material";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import {
  assistantIdMeetingSummaryAtom,
  interviewSummariesFormAtom,
  interviewSummariesInitializationAtom,
  modelIncompatibilityErrorAtom,
  vectorStoreIdMeetingSummaryAtom,
} from "../../../../../atoms/interviewDiscusstionGuideAtom";
import InputDescriptionBox from "../../../../../components/layouts/InputDescriptionBox";
import InterviewDiscussionForm from "../Forms/InterviewDiscussionForm";
import InterviewSummariesNotes from "./InterviewSummariesNotes";
import dayjs from "dayjs";
import {
  useCreateAssistantMutation,
  useCreateVectorStoreMutation,
  useDeleteAssistantMutation,
  useDeleteFileFromStorageMutation,
  useDeleteFileFromVectorStoreMutation,
  useFetchAssistantsQuery,
  useFetchVectorStoresQuery,
  useLazyGetFilesFromVectorStoreQuery,
  useUpdateAssistantMutation,
} from "../../../../../api/slices/openAiSlice";
import { aiToolModelsAtom } from "../../../../../atoms/toolsAtom";
import { useGetToolsQuery } from "../../../../../api/slices/toolsSlice";

const InterviewDiscussionStep = () => {
  const [interviewSummariesFormValues, setInterviewSummariesFormValues] =
    useAtom(interviewSummariesFormAtom);
  const [isExpanded, setIsExpanded] = useState(false);
  const [models] = useAtom(aiToolModelsAtom);
  const { data: toolsData } = useGetToolsQuery();

  // Get model from backend first (source of truth), fallback to atom, then default
  const tools = Array.isArray(toolsData) ? toolsData : (toolsData?.data ?? []);
  const meetingSummariesTool = tools.find(
    (tool) => tool.name === "Meeting Summaries",
  );
  const backendModel = meetingSummariesTool?.model?.modelId;
  const atomModel = models["Meeting Summaries"];

  const selectedModel = backendModel || atomModel || "gpt-3.5-turbo";

  const getAssistantCompatibleModel = (model: string): string => {
    const modelLower = model.toLowerCase().trim();
    if (modelLower === "gpt-4.1-mini" || modelLower.includes("gpt-4.1-mini")) {
      return "gpt-4.1-mini";
    }
    return "gpt-3.5-turbo";
  };

  const assistantCompatibleModel = getAssistantCompatibleModel(selectedModel);

  console.log(
    ` [InterviewDiscussionStep] Selected Model: ${selectedModel} (Backend: ${
      backendModel || "N/A"
    }, Atom: ${atomModel || "N/A"})`,
  );
  console.log(
    ` [InterviewDiscussionStep] Assistant Compatible Model: ${assistantCompatibleModel} (mapped from ${selectedModel})`,
  );

  if (backendModel && atomModel && backendModel !== atomModel) {
    console.warn(
      `[WARNING] Model mismatch detected! Backend has "${backendModel}" but Atom has "${atomModel}". Using backend model: ${backendModel}`,
    );
  }

  if (selectedModel !== assistantCompatibleModel) {
    console.log(
      `[INFO] Model mapped from ${selectedModel} to ${assistantCompatibleModel} for Assistants API compatibility`,
    );
  }
  const [, setInitializationComplete] = useAtom(
    interviewSummariesInitializationAtom,
  );
  const [, setAssistantId] = useAtom(assistantIdMeetingSummaryAtom);
  const [, setVectorStoreId] = useAtom(vectorStoreIdMeetingSummaryAtom);
  const [modelErrorState, setModelErrorState] = useAtom(
    modelIncompatibilityErrorAtom,
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const previousModelRef = useRef<string>(selectedModel);
  const isInitialMountRef = useRef<boolean>(true);

  const modelError =
    modelErrorState?.model === selectedModel ? modelErrorState.error : null;

  // Clear error when model changes - user is trying a new model
  // But only if it's not the initial mount (to preserve persisted error)
  useEffect(() => {
    // Skip clearing on initial mount - let the compatibility checks handle it
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    // Only clear if model actually changed and there's an error for the previous model
    if (
      modelErrorState?.error &&
      modelErrorState?.model &&
      previousModelRef.current !== selectedModel &&
      modelErrorState.model === previousModelRef.current
    ) {
      console.log("🔄 Model changed, clearing previous error to allow retry");
      setModelErrorState({ error: null, model: null });
      setSnackbarOpen(false);
    }
    previousModelRef.current = selectedModel;
  }, [selectedModel, modelErrorState, setModelErrorState]); // eslint-disable-line react-hooks/exhaustive-deps

  const [createVectorStore] = useCreateVectorStoreMutation();
  const [createAssistant] = useCreateAssistantMutation();
  const [updateAssistant] = useUpdateAssistantMutation();
  const [deleteAssistant] = useDeleteAssistantMutation();
  const [deleteFileFromStorage] = useDeleteFileFromStorageMutation();
  const [deleteFileFromVectorStore] = useDeleteFileFromVectorStoreMutation();
  const [getFilesFromVectorStore] = useLazyGetFilesFromVectorStoreQuery();
  const { isLoading: isLoadingVectorStores } =
    useFetchVectorStoresQuery(undefined);
  const { isLoading: isLoadingAssistants } = useFetchAssistantsQuery(undefined);

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (isLoadingAssistants || isLoadingVectorStores) {
      console.log("⏳ Waiting for queries to load...", {
        isLoadingAssistants,
        isLoadingVectorStores,
      });
      return;
    }

    const createAssistantVectorStores = async () => {
      setIsInitializing(true);
      try {
        // Check if assistant and vector store already exist (from a previous step or ongoing flow)
        const existingVectorStoreId = localStorage.getItem(
          "vectorStoreIdMeetingSummary",
        );
        const existingAssistantId = localStorage.getItem(
          "assistantIdMeetingSummary",
        );
        const existingAssistantModel = localStorage.getItem(
          "assistantModelMeetingSummary",
        );

        // If both exist, check if model changed
        if (existingAssistantId && existingVectorStoreId) {
          // Check if assistant-compatible model changed - if so, we need to update or recreate the assistant
          // We compare against assistantCompatibleModel because that's what the assistant actually uses
          if (
            existingAssistantModel &&
            existingAssistantModel !== assistantCompatibleModel
          ) {
            console.log("🔄 Model changed detected:", {
              oldModel: existingAssistantModel,
              newModel: assistantCompatibleModel,
              selectedModel: selectedModel,
            });

            try {
              // Try to update the assistant's model and ensure vector store is assigned
              console.log("🔄 Updating assistant model and vector store...");
              const updatedAssistant = await updateAssistant({
                assistantId: existingAssistantId,
                model: assistantCompatibleModel,
                vectorStoreId: existingVectorStoreId,
              }).unwrap();
              console.log(
                "✅ Assistant model and vector store updated:",
                updatedAssistant.id,
              );

              // Update localStorage with assistant-compatible model (what the assistant actually uses)
              localStorage.setItem(
                "assistantModelMeetingSummary",
                assistantCompatibleModel,
              );

              // Clear any model error on successful update
              setModelErrorState({ error: null, model: selectedModel });
              // Continue with existing assistant and vector store
            } catch (updateError: any) {
              // Check if assistant doesn't exist (404 or similar)
              const errorStatus =
                updateError?.status ||
                updateError?.data?.status ||
                updateError?.response?.status;
              const errorCode = updateError?.data?.code || updateError?.code;
              const errorMessage =
                updateError?.data?.message || updateError?.message || "";

              if (
                errorStatus === 404 ||
                errorCode === "assistant_not_found" ||
                errorMessage?.toLowerCase().includes("not found")
              ) {
                console.warn(
                  "⚠️ Assistant not found (may have been deleted), creating new assistant and vector store",
                );
                // Clear the stored assistant ID since it doesn't exist
                localStorage.removeItem("assistantIdMeetingSummary");
                localStorage.removeItem("assistantModelMeetingSummary");

                // Create new vector store
                console.log(
                  "🆕 Creating new vector store (assistant was deleted)...",
                );
                const newVectorStore = await createVectorStore({
                  name:
                    "Internal Meeting Summary Vector " +
                    dayjs().format("DD/MM/YYYY/ HH:mm:ss"),
                }).unwrap();
                console.log("✅ New vector store created:", newVectorStore.id);

                // Create new assistant with new vector store
                const newAssistant = await createAssistant({
                  name:
                    "Internal Meeting Summary Assistant " +
                    dayjs().format("DD/MM/YYYY/ HH:mm:ss"),
                  instructions: `The assistant will act as a detailed summarization assistant with the ability to:
        Parse transcript files (e.g., DOCX, PDF, etc.).
        Extract key information and generate concise overviews.
        Return the summarized content in a structured format or document (e.g., DOCX or plain text).`,
                  vectorStoreId: newVectorStore.id,
                  model: assistantCompatibleModel,
                }).unwrap();
                console.log("✅ New assistant created:", newAssistant.id);

                localStorage.setItem(
                  "assistantIdMeetingSummary",
                  newAssistant.id,
                );
                localStorage.setItem(
                  "vectorStoreIdMeetingSummary",
                  newVectorStore.id,
                );
                localStorage.setItem(
                  "assistantModelMeetingSummary",
                  assistantCompatibleModel,
                );
                setAssistantId(newAssistant.id);
                setVectorStoreId(newVectorStore.id);
                setInitializationComplete(true);
                setModelErrorState({ error: null, model: selectedModel });
                setIsInitializing(false);
                return;
              } else {
                console.warn(
                  "⚠️ Failed to update assistant model, recreating assistant:",
                  updateError,
                );

                // Check if it's a model incompatibility error (only if assistant exists)
                const isModelIncompatible =
                  errorCode === "unsupported_model" ||
                  errorMessage
                    ?.toLowerCase()
                    .includes("cannot be used with the assistants api") ||
                  errorMessage?.toLowerCase().includes("unsupported model");

                if (isModelIncompatible) {
                  const fullErrorMessage =
                    updateError?.data?.message ||
                    `The model '${selectedModel}' cannot be used with the Assistants API. Please select a different model.`;
                  setModelErrorState({
                    error: fullErrorMessage,
                    model: selectedModel,
                  });
                  setSnackbarOpen(true);
                  setInitializationComplete(false);
                  setIsInitializing(false);
                  return;
                }

                // If update fails and assistant exists, try to delete old assistant
                try {
                  await deleteAssistant(existingAssistantId).unwrap();
                  console.log("✅ Old assistant deleted");
                } catch (deleteError: any) {
                  console.warn(
                    "⚠️ Could not delete old assistant:",
                    deleteError,
                  );
                }
              }

              // Create new assistant with new model (or because old one was deleted)
              const assistant = await createAssistant({
                name:
                  "Internal Meeting Summary Assistant " +
                  dayjs().format("DD/MM/YYYY/ HH:mm:ss"),
                instructions: `The assistant will act as a detailed summarization assistant with the ability to:
        Parse transcript files (e.g., DOCX, PDF, etc.).
        Extract key information and generate concise overviews.
        Return the summarized content in a structured format or document (e.g., DOCX or plain text).`,
                vectorStoreId: existingVectorStoreId,
                model: assistantCompatibleModel,
              }).unwrap();
              console.log("✅ New assistant created:", assistant.id);

              localStorage.setItem("assistantIdMeetingSummary", assistant.id);
              localStorage.setItem(
                "assistantModelMeetingSummary",
                assistantCompatibleModel,
              );
              setAssistantId(assistant.id);
              setInitializationComplete(true);
              setIsInitializing(false);
              return;
            }
          }

          console.log("✅ Using existing assistant and vector store:", {
            assistantId: existingAssistantId,
            vectorStoreId: existingVectorStoreId,
            model: existingAssistantModel || selectedModel,
          });

          // Ensure vector store is assigned to assistant (in case it was lost)
          try {
            console.log("🔗 Ensuring vector store is assigned to assistant...");
            await updateAssistant({
              assistantId: existingAssistantId,
              vectorStoreId: existingVectorStoreId,
            }).unwrap();
            console.log("✅ Vector store assigned to assistant");
          } catch (updateError: any) {
            console.warn(
              "⚠️ Could not update assistant vector store (may already be assigned):",
              updateError,
            );
            // Continue anyway - vector store might already be assigned
          }

          // Clear all files from the vector store to avoid confusion
          // This is best-effort - if it fails, we'll continue anyway
          try {
            console.log(
              "🧹 Attempting to clear files from existing vector store...",
            );
            const filesResponse = await getFilesFromVectorStore(
              existingVectorStoreId,
            ).unwrap();

            const filesArray = filesResponse
              ? Array.isArray(filesResponse)
                ? filesResponse
                : (filesResponse as any)?.data || []
              : [];

            const existingFiles = Array.isArray(filesArray) ? filesArray : [];
            console.log(
              `📄 Found ${existingFiles.length} files in vector store`,
            );

            if (existingFiles.length === 0) {
              console.log("✅ Vector store is already empty");
            } else {
              // Try to remove files from vector store, but don't fail the entire flow if it errors
              // Files may be in an invalid state or already deleted
              let successCount = 0;
              let failCount = 0;

              for (const file of existingFiles) {
                // Log the file object structure for debugging
                console.log(
                  "🔍 File object from vector store:",
                  JSON.stringify(file, null, 2),
                );

                // OpenAI vector store files list returns objects with 'id' property that is the file_id
                // NOT the vector store file association ID
                const fileIdFromResponse =
                  (file as any)?.id || (file as any)?.file_id || "";

                if (!existingVectorStoreId) {
                  console.warn(
                    "⚠️ No vector store ID available while clearing files. Skipping.",
                  );
                  break;
                }

                if (!fileIdFromResponse) {
                  console.warn(
                    "⚠️ Skipping file with no ID in vector store list. File object:",
                    file,
                  );
                  failCount++;
                  continue;
                }

                // Validate that fileId doesn't look like a vector store ID
                if (fileIdFromResponse.startsWith("vs_")) {
                  console.error(
                    "⚠️ Invalid file ID - appears to be a vector store ID:",
                    fileIdFromResponse,
                  );
                  console.error("⚠️ Full file object:", file);
                  failCount++;
                  continue;
                }

                // Validate that vectorStoreId is valid
                if (!existingVectorStoreId.startsWith("vs_")) {
                  console.error(
                    "⚠️ Invalid vector store ID format:",
                    existingVectorStoreId,
                  );
                  failCount++;
                  continue;
                }

                console.log("🔍 Attempting to delete:", {
                  vectorStoreId: existingVectorStoreId,
                  file_id: fileIdFromResponse,
                });

                try {
                  // Try to remove the file from the vector store association
                  await deleteFileFromVectorStore({
                    vectorStoreId: existingVectorStoreId,
                    file_id: fileIdFromResponse,
                  }).unwrap();
                  console.log(
                    "✅ File removed from vector store:",
                    fileIdFromResponse,
                  );
                  successCount++;

                  // Optionally try to delete from storage (non-critical)
                  try {
                    await deleteFileFromStorage(fileIdFromResponse).unwrap();
                    console.log(
                      "✅ File deleted from storage:",
                      fileIdFromResponse,
                    );
                  } catch (storageError: any) {
                    // Storage deletion is optional - file is already removed from vector store
                    console.log(
                      "ℹ️ File removed from vector store (storage cleanup skipped):",
                      fileIdFromResponse,
                    );
                  }
                } catch (error: any) {
                  // File might already be removed, in invalid state, or backend has issues
                  // Log but continue - this is best-effort cleanup
                  console.log(
                    "ℹ️ Could not remove file (may already be removed or in invalid state):",
                    fileIdFromResponse,
                  );
                  failCount++;
                }
              }

              console.log(
                `✅ Vector store cleanup attempted: ${successCount} succeeded, ${failCount} skipped`,
              );
            }
          } catch (error: any) {
            // If we can't even fetch files, the vector store might be empty or have issues
            // Continue anyway - the important thing is we're using the existing resources
            console.log(
              "ℹ️ Could not fetch files from vector store (may be empty or have issues):",
              error,
            );
            console.log(
              "ℹ️ Continuing with existing assistant and vector store...",
            );
          }

          // Update atoms to trigger re-renders
          setAssistantId(existingAssistantId);
          setVectorStoreId(existingVectorStoreId);
          setInitializationComplete(true);
          setIsInitializing(false);
          return;
        }

        // Only create new resources if they don't exist (new flow)
        console.log("🚀 Starting new assistant and vector store creation");

        // Create new vector store
        console.log("🆕 Creating new vector store...");
        const vectorStore = await createVectorStore({
          name:
            "Internal Meeting Summary Vector " +
            dayjs().format("DD/MM/YYYY/ HH:mm:ss"),
        }).unwrap();
        console.log("✅ Vector store created:", vectorStore.id);

        // Create new assistant
        console.log("🆕 Creating new assistant...");
        const assistant = await createAssistant({
          name:
            "Internal Meeting Summary Assistant " +
            dayjs().format("DD/MM/YYYY/ HH:mm:ss"),
          instructions: `The assistant will act as a detailed summarization assistant with the ability to:
        Parse transcript files (e.g., DOCX, PDF, etc.).
        Extract key information and generate concise overviews.
        Return the summarized content in a structured format or document (e.g., DOCX or plain text).`,
          vectorStoreId: vectorStore.id,
          model: assistantCompatibleModel,
        }).unwrap();
        console.log("✅ Assistant created:", assistant.id);

        localStorage.setItem("assistantIdMeetingSummary", assistant.id);
        localStorage.setItem("vectorStoreIdMeetingSummary", vectorStore.id);
        localStorage.setItem(
          "assistantModelMeetingSummary",
          assistantCompatibleModel,
        );

        // Update atoms to trigger re-renders in components using them
        setAssistantId(assistant.id);
        setVectorStoreId(vectorStore.id);

        console.log("💾 Saved new IDs to localStorage:", {
          assistantId: assistant.id,
          vectorStoreId: vectorStore.id,
          assistantModel: assistantCompatibleModel,
          selectedModel: selectedModel,
        });

        // Mark initialization as complete
        setInitializationComplete(true);
        // Clear any previous model error
        setModelErrorState({ error: null, model: selectedModel });
        setIsInitializing(false);
      } catch (error: any) {
        console.error("❌ Error creating assistant and vector stores:", error);

        // Check if it's a model incompatibility error
        const errorCode = error?.data?.code || error?.code;
        const errorMessage = error?.data?.message || error?.message || "";
        const isModelIncompatible =
          errorCode === "unsupported_model" ||
          errorMessage
            ?.toLowerCase()
            .includes("cannot be used with the assistants api") ||
          errorMessage?.toLowerCase().includes("unsupported model");

        if (isModelIncompatible) {
          // Store the error message to show to user and disable the tool
          const fullErrorMessage =
            error?.data?.message ||
            `The model '${selectedModel}' cannot be used with the Assistants API. Please select a different model.`;
          setModelErrorState({ error: fullErrorMessage, model: selectedModel });
          setSnackbarOpen(true);
          // Don't mark as complete - tool should be disabled
          setInitializationComplete(false);
        } else {
          // For other errors, mark as complete to allow user to proceed
          setInitializationComplete(true);
          setModelErrorState({ error: null, model: selectedModel });
        }
        setIsInitializing(false);
      }
    };

    createAssistantVectorStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoadingAssistants,
    isLoadingVectorStores,
    selectedModel, // Now included to detect model changes and update/recreate assistant
    setInitializationComplete,
    setAssistantId,
    setVectorStoreId,
    updateAssistant,
    deleteAssistant,
    createAssistant,
  ]);

  useEffect(() => {
    if (
      interviewSummariesFormValues.objectives ||
      interviewSummariesFormValues.summaryType
    ) {
      setInterviewSummariesFormValues(interviewSummariesFormValues);
    } else {
      setInterviewSummariesFormValues(interviewSummariesFormValues);
    }
  }, [interviewSummariesFormValues, setInterviewSummariesFormValues]);

  const getText = (type: string) => {
    if (type === "Advisory Boards") {
      return (
        <>
          Please provide clear guidance so the AI can understand the purpose of
          this request. Include details such as the healthcare professional’s
          name and their discipline, along with client names and company. For
          example:{" "}
          <i>
            “Summarize the meeting notes from an advisory board meeting that
            convened the following oncologists: Dr Nasir Felous, Dr Sarah
            Robinson, Dr Leslie Anderson, and Dr Rodrigo Volino. The meeting was
            attended by the following Novartis clients: Jon Oliver, Laura Passe,
            and Daniel Mitchell.”
          </i>
        </>
      );
    } else if (type === "1on1/TLE interviews") {
      return (
        <>
          Please provide clear direction for AI to understand the purpose of
          this request. Include at least the healthcare professional’s name and
          their discipline, along with any client names (as needed). For
          example:{" "}
          <i>
            “Summarize the meeting notes from an interview with Dr. Kathy Smith,
            a neurologist. The meeting was attended by the following Pfizer
            clients: Mike Jones, Tyler Lockhart, and Kristen Lynch.”
          </i>
        </>
      );
    }
  };

  // Determine if we should show loading overlay
  const showLoadingOverlay =
    isInitializing || isLoadingAssistants || isLoadingVectorStores;

  return (
    <>
      {showLoadingOverlay && (
        <Backdrop
          open={true}
          sx={{
            position: "fixed",
            zIndex: (theme) => theme.zIndex.modal - 1,
            backgroundColor: "transparent",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: "red" }} />
          <Typography
            sx={{
              color: "white",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            Loading vector store and assistant...
          </Typography>
        </Backdrop>
      )}
      {/* <Snackbar
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Model Incompatibility Error
          </Typography>
          <Typography sx={{ fontSize: "14px" }}>
            {modelError ||
              "The selected model cannot be used with the Assistants API."}
          </Typography>
          <Typography sx={{ fontSize: "12px", mt: 1, fontStyle: "italic" }}>
            Please change the model in the tool settings to continue.
          </Typography>
        </Alert>
      </Snackbar> */}

      {modelError && (
        <Box
          sx={{
            padding: "20px",
            margin: "0 20px 20px 20px",
            backgroundColor: "#FDF8ED",
            border: "2px solid #ffc107",
            borderRadius: "8px",
          }}
        >
          <Typography sx={{ fontWeight: "bold", color: "#856404", mb: 1 }}>
            ⚠️ Model Incompatibility
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
          padding: "0 20px 20px 20px",
          height: isExpanded ? "60vh" : "",
          opacity: modelError || showLoadingOverlay ? 0.4 : 1,
          pointerEvents: modelError || showLoadingOverlay ? "none" : "auto",
          position: "relative",
        }}
        gap={4}
        display="flex"
        flexDirection="row"
      >
        <Box sx={{ marginTop: 4, flexBasis: "50%" }}>
          <InterviewDiscussionForm
            initialValues={interviewSummariesFormValues}
            setInterviewDiscussionFormValues={setInterviewSummariesFormValues}
            modelError={modelError}
          />
        </Box>
        <Box display="flex" flexDirection="column" sx={{ flexBasis: "50%" }}>
          {!isExpanded && (
            <InputDescriptionBox
              marginTop="55px"
              text={getText(interviewSummariesFormValues.type.name)}
            />
          )}
          {!isExpanded && (
            <InputDescriptionBox
              marginTop={
                interviewSummariesFormValues.type.name === "Advisory Boards"
                  ? interviewSummariesFormValues.inputMode === "notes"
                    ? "34px"
                    : "70px"
                  : interviewSummariesFormValues.type.name ===
                      "1on1/TLE interviews"
                    ? interviewSummariesFormValues.inputMode === "notes"
                      ? "50px"
                      : "85px"
                    : "50px"
              }
              text="Please paste the meeting notes or transcript in the box below. For longer transcripts, you can upload the document using the tool below."
            />
          )}

          {isExpanded && (
            <InterviewSummariesNotes onExpandClick={handleExpandClick} />
          )}
        </Box>
      </Box>
    </>
  );
};

export default InterviewDiscussionStep;
