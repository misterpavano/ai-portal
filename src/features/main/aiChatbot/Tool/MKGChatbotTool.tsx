import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Message } from "../../../../types/chatbotMessage";
import AIChatbotHeader from "./MKGChatbotHeader";
import AIChatbotFooter from "./MKGChatbotFooter";
import AIChatbotContent from "./MKGChatbotContent";
import useStyles from "./MKGChatbotStyles";
import { ChatCompletionMessageParam } from "openai/resources";
import { assistantPrompt } from "../../../../prompts/chatMKG/prompts";
import ChatFolders from "./ChatFolders";
import { useGetToolsQuery } from "../../../../api/slices/toolsSlice";
import {
  useAddFileToVectorStoreMutation,
  useAskQuestionBasedOnFileMutation,
  useChatCompletionOpenAiMutation,
  useCreateThreadMutation,
  useLazyGetTranscriptionStatusQuery,
  useTranscribeAudioMutation,
  useUploadFileMutation,
} from "../../../../api/slices/openAiSlice";
import {
  useCreateConversationMutation,
  useUpdateConversationMutation,
  useCreateMessageMutation,
  useLazyFetchMessagesQuery,
  useLazyFetchConversationQuery,
  useGenerateConversationTitleMutation,
  useFetchFoldersQuery,
  useDeleteMessageMutation,
} from "../../../../api/slices/conversationsApiSlice";
import { extractErrorMessage } from "../../../../utils/authErrorMessage";
import { useGetAvailableModelsQuery } from "../../../../api/slices/modelsSlice";
import { useGetToolAvailableModelsStatusQuery } from "../../../../api/slices/toolsSlice";
import { TranscriptData } from "../../../../types/response/openai";
// import TranscriptBox from "../../interviewSummaries/Tool/Modals/TranscriptBox";
import ConversationDetailsModal from "./Modals/ConversationDetailsModal";
import { IConversation } from "../../../../types/response/conversations";

type AIChatbotToolProps = {
  clientName: string;
  assistantId: string;
  vectorStoreId: string;
};

const AIChatbotTool = ({
  clientName,
  assistantId,
  vectorStoreId,
}: AIChatbotToolProps) => {
  const [chatCompletionOpenAi] = useChatCompletionOpenAiMutation();
  const [uploadFile] = useUploadFileMutation();
  const [addFileToVectorStore] = useAddFileToVectorStoreMutation();
  const [createThread] = useCreateThreadMutation();
  const [askQuestionBasedOnFile] = useAskQuestionBasedOnFileMutation();
  const { data: toolsData } = useGetToolsQuery();
  const { data: modelsData } = useGetAvailableModelsQuery();
  const { data: folders = [] } = useFetchFoldersQuery();
  const { data: chatAIAvailabilityStatus } =
    useGetToolAvailableModelsStatusQuery("ChatAI");
  const [transcribeAudio] = useTranscribeAudioMutation();
  const [getTranscriptionStatus] = useLazyGetTranscriptionStatusQuery();
  const [createConversation] = useCreateConversationMutation();
  const [updateConversation] = useUpdateConversationMutation();
  const [createMessage] = useCreateMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [fetchMessages] = useLazyFetchMessagesQuery();
  const [fetchConversation] = useLazyFetchConversationQuery();
  const [generateConversationTitle] = useGenerateConversationTitleMutation();

  const classes = useStyles();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setRequestTimedOut] = useState(false);
  const [hasUploadError, setHasUploadError] = useState(false);
  const [transcriptText, setTranscriptText] = useState<string | TranscriptData>(
    "",
  );
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null,
  );

  const [lastAttempt, setLastAttempt] = useState<(() => Promise<void>) | null>(
    null,
  );
  const [lastFailedMessage, setLastFailedMessage] = useState<{
    text: string;
    file: File | null;
    fileName: string | null;
    isFileMessage: boolean;
  } | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [openTranscriptModal, setOpenTranscriptModal] = useState(false);
  const [transcriptResetKey, setTranscriptResetKey] = useState(0);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [currentConversationModel, setCurrentConversationModel] = useState<
    string | null
  >(null);
  const [currentConversationFolderName, setCurrentConversationFolderName] =
    useState<string | null>(null);
  const [currentConversationTitle, setCurrentConversationTitle] = useState<
    string | null
  >(null);
  const [currentConversationFolderId, setCurrentConversationFolderId] =
    useState<string | null>(null);
  const [createTemporaryConversation, setCreateTemporaryConversation] =
    useState(false);
  const [isCurrentConversationTemporary, setIsCurrentConversationTemporary] =
    useState(false);
  const [isConvertingTemporary, setIsConvertingTemporary] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [openConversationDetails, setOpenConversationDetails] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<IConversation | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const fastForwardAnimationRef = useRef<(() => void) | null>(null);

  const tools = useMemo(
    () => (Array.isArray(toolsData) ? toolsData : (toolsData?.data ?? [])),
    [toolsData],
  );

  const availableModels = useMemo(() => {
    const allModels = Array.isArray(modelsData)
      ? modelsData
      : (modelsData?.data ?? []);
    // Filter by global visibility (status === "show")
    const globallyVisible = allModels.filter((m) => m.status === "show");

    // If availability status is loaded, filter by it
    // Default to true (available) if not explicitly set to false
    if (chatAIAvailabilityStatus) {
      return globallyVisible.filter(
        (m) => chatAIAvailabilityStatus[m.id] !== false,
      );
    }

    // If availability status not loaded yet, return all globally visible models
    // This prevents flickering while data loads (default behavior is available)
    return globallyVisible;
  }, [modelsData, chatAIAvailabilityStatus]);

  const chatAITool = tools.find((tool) => tool.name === "ChatAI");

  const defaultModelId = useMemo(() => {
    if (chatAITool?.model?.modelId) {
      return chatAITool.model.modelId;
    }

    const visibleModel = availableModels.find((m) => m.status === "show");
    if (visibleModel) {
      return visibleModel.modelId;
    }

    return availableModels[0]?.modelId || "";
  }, [chatAITool?.model?.modelId, availableModels]);

  const selectedModel = currentConversationModel || defaultModelId;

  useEffect(() => {
    if (!currentConversationId && !currentConversationModel && defaultModelId) {
      setCurrentConversationModel(defaultModelId);
    }
  }, [currentConversationId, currentConversationModel, defaultModelId]);

  const handleModelChange = async (newModelId: string) => {
    const modelExists = availableModels.some((m) => m.modelId === newModelId);
    if (!modelExists) {
      console.error("Model not found");
      return;
    }

    try {
      if (currentConversationId) {
        await updateConversation({
          id: currentConversationId,
          data: { aiModel: newModelId },
        }).unwrap();
      }
      setCurrentConversationModel(newModelId);
    } catch (error) {
      console.error("Failed to update conversation model:", error);
    }
  };

  const handleConversationFolderChange = useCallback(
    async (folderId: string | null) => {
      if (!currentConversationId) {
        return;
      }

      try {
        await updateConversation({
          id: currentConversationId,
          data: { folderId },
        }).unwrap();

        const refreshedConversation = await fetchConversation(
          currentConversationId,
          true,
        ).unwrap();

        setCurrentConversationFolderId(refreshedConversation.folderId ?? null);

        if (refreshedConversation.folder) {
          setCurrentConversationFolderName(refreshedConversation.folder.name);
        } else {
          setCurrentConversationFolderName("Uncategorized");
        }
      } catch (error) {
        console.error("Failed to update conversation folder:", error);
        throw error;
      }
    },
    [currentConversationId, updateConversation, fetchConversation],
  );

  const handleConvertTemporaryConversation = useCallback(async () => {
    if (!currentConversationId || !isCurrentConversationTemporary) {
      return;
    }

    try {
      setIsConvertingTemporary(true);
      const updatedConversation = await updateConversation({
        id: currentConversationId,
        data: { isTemporary: false },
      }).unwrap();

      setIsCurrentConversationTemporary(
        updatedConversation.isTemporary || false,
      );
      setCreateTemporaryConversation(false);

      const refreshedConversation = await fetchConversation(
        currentConversationId,
        true,
      ).unwrap();
      setCurrentConversationFolderId(refreshedConversation.folderId ?? null);
      if (refreshedConversation.folder) {
        setCurrentConversationFolderName(refreshedConversation.folder.name);
      } else {
        setCurrentConversationFolderName("Uncategorized");
      }
    } catch (error) {
      console.error("Failed to convert temporary conversation:", error);
      throw error;
    } finally {
      setIsConvertingTemporary(false);
    }
  }, [
    currentConversationId,
    isCurrentConversationTemporary,
    updateConversation,
    fetchConversation,
  ]);

  const handleOpenConversationDetails = useCallback(async () => {
    if (!currentConversationId) {
      return;
    }

    try {
      const conversation = await fetchConversation(
        currentConversationId,
        true,
      ).unwrap();
      setSelectedConversation(conversation);
      setOpenConversationDetails(true);
    } catch (error) {
      console.error("Failed to fetch conversation details:", error);
    }
  }, [currentConversationId, fetchConversation]);

  const handleCloseConversationDetails = useCallback(() => {
    setOpenConversationDetails(false);
    setSelectedConversation(null);
  }, []);

  const handleSaveConversationDetails = useCallback(
    async (
      conversationId: string,
      updates: { title?: string; folderId?: string },
    ) => {
      try {
        const updatedConversation = await updateConversation({
          id: conversationId,
          data: updates,
        }).unwrap();

        // Update local state if this is the current conversation
        if (conversationId === currentConversationId) {
          if (updates.title) {
            setCurrentConversationTitle(updates.title);
          }
          if (updates.folderId !== undefined) {
            setCurrentConversationFolderId(updates.folderId);
            if (updates.folderId) {
              const folder = folders.find((f) => f.id === updates.folderId);
              setCurrentConversationFolderName(folder?.name || "Uncategorized");
            } else {
              setCurrentConversationFolderName("Uncategorized");
            }
          }
        }
      } catch (error) {
        console.error("Failed to update conversation:", error);
        throw error;
      }
    },
    [currentConversationId, updateConversation, folders],
  );

  // Create conversation on first message
  const createNewConversation = useCallback(async () => {
    try {
      // Use user-selected model if available, otherwise default to tool's configured model
      const defaultModel = currentConversationModel || defaultModelId;

      const conversation = await createConversation({
        isTemporary: createTemporaryConversation,
        aiModel: defaultModel,
        // folderId will be auto-assigned to "Uncategorized" by backend
      }).unwrap();

      setCurrentConversationId(conversation.id);
      setCurrentConversationModel(conversation.aiModel || defaultModel);
      setIsCurrentConversationTemporary(conversation.isTemporary || false);
      setCurrentConversationTitle(conversation.title || null);

      let folderName: string | null = null;
      let folderId: string | null = conversation.folderId ?? null;

      if (conversation.folder) {
        folderName = conversation.folder.name;
      } else if (!conversation.isTemporary && folderId) {
        try {
          const detailedConversation = await fetchConversation(
            conversation.id,
            true,
          ).unwrap();
          folderId = detailedConversation.folderId ?? folderId;
          folderName = detailedConversation.folder?.name ?? "Uncategorized";
        } catch (error) {
          console.warn(
            "Failed to fetch conversation details for folder info:",
            error,
          );
        }
      }

      if (!folderName) {
        folderName = conversation.isTemporary ? null : "Uncategorized";
      }

      setCurrentConversationFolderName(folderName);
      setCurrentConversationFolderId(folderId);

      return conversation.id;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      return null;
    }
  }, [
    createConversation,
    defaultModelId,
    createTemporaryConversation,
    currentConversationModel,
    fetchConversation,
  ]);

  // Save message to database
  const saveMessageToConversation = useCallback(
    async (
      conversationId: string,
      role: "user" | "assistant",
      content: string,
    ) => {
      try {
        const result = await createMessage({
          conversationId,
          data: { role, content },
        }).unwrap();
        return result;
      } catch (error) {
        console.error("Failed to save message:", error);
        return null;
      }
    },
    [createMessage],
  );

  const handleRetryUpload = useCallback(() => {
    setSelectedFile(null);
    setOriginalFileName(null);
    setHasUploadError(false);
    setTranscriptionError(null);
    setTranscriptText("");
    setTranscriptResetKey((prev) => prev + 1); // Reset transcript state

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }, []);

  const handleSendMessage = useCallback(
    async (messageContent?: string) => {
      const messageToSend = messageContent || inputValue || "";
      if (messageToSend.trim() === "") return;

      const isFirstUserMessage = messages.length === 0;

      // Create conversation on first message
      let conversationId = currentConversationId;
      if (!conversationId && isFirstUserMessage) {
        conversationId = await createNewConversation();
      }

      const userMessage: Message = {
        name: "User",
        role: "user",
        content: messageToSend,
        isFile: false,
      };

      setIsNewMessage(false); // Reset flag when user sends a message
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInputValue("");
      setIsTyping(true);

      // Save user message to database
      if (conversationId) {
        await saveMessageToConversation(conversationId, "user", messageToSend);
        if (isFirstUserMessage) {
          try {
            const updatedConversation = await generateConversationTitle({
              conversationId,
              previewText: messageToSend,
            }).unwrap();
            setCurrentConversationTitle(updatedConversation.title || null);
            if (updatedConversation.folder) {
              setCurrentConversationFolderName(updatedConversation.folder.name);
              setCurrentConversationFolderId(
                updatedConversation.folderId ?? null,
              );
            } else {
              setCurrentConversationFolderName("Uncategorized");
              setCurrentConversationFolderId(null);
            }
          } catch (error) {
            console.error("Failed to generate conversation title:", error);
          }
        }
      }

      setHasError(false);
      setErrorMessage(null);
      setRequestTimedOut(false);

      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }

      messageTimeoutRef.current = setTimeout(() => {
        setRequestTimedOut(true);
      }, 30_000);

      try {
        const mappedMessages: ChatCompletionMessageParam[] = messages
          .filter((msg) => typeof msg.content === "string")
          .map((msg) => ({
            role: msg.role,
            content: msg.content!,
            name: msg.name,
          }));

        const messagePayload: ChatCompletionMessageParam[] = webSearchEnabled
          ? [...mappedMessages, { role: "user", content: messageToSend }]
          : [
              { role: "system", content: assistantPrompt },
              ...mappedMessages,
              { role: "user", content: messageToSend },
            ];

        const assistantMessageResponse = await chatCompletionOpenAi({
          messages: messagePayload,
          model: selectedModel,
          web_search: webSearchEnabled,
          search_provider: "tavily",
          search_max_results: 10,
        }).unwrap();

        const assistantMessageContent =
          assistantMessageResponse?.choices?.[0]?.message?.content || "";

        const assistantMessage: Message = {
          name: "Assistant",
          role: "assistant",
          content: assistantMessageContent || "Failed to respond",
          isFile: false,
        };

        setIsNewMessage(true);

        // Save assistant message to database and get the ID
        let savedMessageId: string | undefined;
        if (conversationId && assistantMessageContent) {
          const savedMessage = await saveMessageToConversation(
            conversationId,
            "assistant",
            assistantMessageContent,
          );
          savedMessageId = savedMessage?.id;
        }

        // Update assistant message with ID from database
        const assistantMessageWithId: Message = {
          ...assistantMessage,
          id: savedMessageId,
        };

        setMessages((prevMessages) => [
          ...prevMessages,
          assistantMessageWithId,
        ]);

        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
          messageTimeoutRef.current = null;
        }
        setRequestTimedOut(false);

        setLastAttempt(null);
        setLastFailedMessage(null);
      } catch (error) {
        console.error("Error processing message:", error);
        setHasError(true);
        setErrorMessage(extractErrorMessage(error));
        // Store the failed message details for resend
        setLastFailedMessage({
          text: messageToSend,
          file: null,
          fileName: null,
          isFileMessage: false,
        });
        setLastAttempt(null);

        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
          messageTimeoutRef.current = null;
        }
      } finally {
        setIsTyping(false);
      }
    },
    [
      inputValue,
      messages,
      chatCompletionOpenAi,
      webSearchEnabled,
      selectedModel,
      currentConversationId,
      createNewConversation,
      saveMessageToConversation,
      generateConversationTitle,
    ],
  );

  const handleFileMessage = useCallback(async () => {
    if (!selectedFile || !inputValue.trim()) return;

    const isFirstInteraction = messages.length === 0;

    // Create conversation on first message
    let conversationId = currentConversationId;
    if (!conversationId && isFirstInteraction) {
      conversationId = await createNewConversation();
    }

    setIsTyping(true);
    setHasError(false);
    setErrorMessage(null);
    setRequestTimedOut(false);

    if (fileTimeoutRef.current) {
      clearTimeout(fileTimeoutRef.current);
      fileTimeoutRef.current = null;
    }
    fileTimeoutRef.current = setTimeout(() => {
      setRequestTimedOut(true);
    }, 30_000);

    const fileMessage: Message = {
      name: "User",
      role: "user",
      content: originalFileName || selectedFile.name,
      isFile: true,
    };

    const userInstructionMessage: Message = {
      name: "User",
      role: "user",
      content: inputValue.trim(),
      isFile: false,
    };

    setIsNewMessage(false); // Reset flag when user sends a message
    setMessages((prevMessages) => [
      ...prevMessages,
      fileMessage,
      userInstructionMessage,
    ]);

    // Save user messages to database
    if (conversationId) {
      await saveMessageToConversation(
        conversationId,
        "user",
        originalFileName || selectedFile.name,
      );
      await saveMessageToConversation(
        conversationId,
        "user",
        inputValue.trim(),
      );
      if (isFirstInteraction) {
        try {
          const updatedConversation = await generateConversationTitle({
            conversationId,
            previewText: inputValue.trim(),
          }).unwrap();
          setCurrentConversationTitle(updatedConversation.title || null);
          if (updatedConversation.folder) {
            setCurrentConversationFolderName(updatedConversation.folder.name);
            setCurrentConversationFolderId(
              updatedConversation.folderId ?? null,
            );
          } else {
            setCurrentConversationFolderName("Uncategorized");
            setCurrentConversationFolderId(null);
          }
        } catch (error) {
          console.error("Failed to generate conversation title:", error);
        }
      }
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadResponse = await uploadFile(formData).unwrap();

      const fileId = uploadResponse.id;
      await addFileToVectorStore({
        vectorId: vectorStoreId,
        file_id: uploadResponse.id,
      }).unwrap();

      const thread = await createThread().unwrap();

      const assistantMessageResponse = await askQuestionBasedOnFile({
        threadId: thread.id,
        assistantId,
        message: `Please analyze the attached file (File Name:${selectedFile.name} with File Id: ${fileId}) and provide insights. ${inputValue}. DO NOT INCLUDE ANY SOURCE REFERENCES: Do not include any source indicators, footnotes, or references like "[4: 17+source]" or any similar format. Do not mention the name of the file`,
        assistantPrompt,
        web_search: webSearchEnabled,
        search_provider: "tavily",
        search_max_results: 10,
      }).unwrap();

      const assistantMessage: Message = {
        name: "Assistant",
        role: "assistant",
        content: assistantMessageResponse.content,
        isFile: false,
      };

      setIsNewMessage(true);

      // Save assistant message to database and get the ID
      let savedMessageId: string | undefined;
      if (conversationId && assistantMessageResponse.content) {
        const savedMessage = await saveMessageToConversation(
          conversationId,
          "assistant",
          assistantMessageResponse.content,
        );
        savedMessageId = savedMessage?.id;
      }

      // Update assistant message with ID from database
      const assistantMessageWithId: Message = {
        ...assistantMessage,
        id: savedMessageId,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessageWithId]);

      if (fileTimeoutRef.current) {
        clearTimeout(fileTimeoutRef.current);
        fileTimeoutRef.current = null;
      }
      setRequestTimedOut(false);
      setLastAttempt(null);
      setLastFailedMessage(null);
      // Reset transcript state after successful file message send
      setTranscriptText("");
      setTranscriptResetKey((prev) => prev + 1);

      // Clear file and input only on success
      setIsTyping(false);
      setSelectedFile(null);
      setInputValue("");
    } catch (error) {
      console.error("Error processing file:", error);
      setHasError(true);
      setErrorMessage(extractErrorMessage(error));
      // Store the failed file message details for resend
      setLastFailedMessage({
        text: inputValue.trim(),
        file: selectedFile,
        fileName: originalFileName || selectedFile?.name || null,
        isFileMessage: true,
      });
      setLastAttempt(null);

      if (fileTimeoutRef.current) {
        clearTimeout(fileTimeoutRef.current);
        fileTimeoutRef.current = null;
      }

      // Don't clear file and input on error - keep them for resend
      setIsTyping(false);
    }
  }, [
    selectedFile,
    inputValue,
    originalFileName,
    vectorStoreId,
    assistantId,
    webSearchEnabled,
    uploadFile,
    addFileToVectorStore,
    createThread,
    askQuestionBasedOnFile,
    currentConversationId,
    messages.length,
    createNewConversation,
    saveMessageToConversation,
    generateConversationTitle,
  ]);

  const handleMessage = useCallback(() => {
    if (selectedFile) {
      handleFileMessage();
    } else if (inputValue.trim()) {
      handleSendMessage();
    }
  }, [selectedFile, inputValue, handleFileMessage, handleSendMessage]);

  const handleResendMessage = useCallback(() => {
    if (!lastFailedMessage) return;

    // Clear error state
    setHasError(false);
    setErrorMessage(null);
    setLastAttempt(null);

    // Remove the last failed message(s) from the UI
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];

      if (lastFailedMessage.isFileMessage) {
        // For file messages, remove both the file message and the instruction message
        // They are the last two user messages
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].role === "user") {
          newMessages.pop();
          // Check if the previous one is also a user message (the file message)
          if (
            newMessages.length > 0 &&
            newMessages[newMessages.length - 1].role === "user" &&
            newMessages[newMessages.length - 1].isFile
          ) {
            newMessages.pop();
          }
        }
      } else {
        // For regular messages, remove the last user message
        if (
          newMessages.length > 0 &&
          newMessages[newMessages.length - 1].role === "user"
        ) {
          newMessages.pop();
        }
      }

      return newMessages;
    });

    // Restore the input and file
    setInputValue(lastFailedMessage.text);

    if (lastFailedMessage.isFileMessage && lastFailedMessage.file) {
      setSelectedFile(lastFailedMessage.file);
      setOriginalFileName(lastFailedMessage.fileName);
    } else {
      setSelectedFile(null);
      setOriginalFileName(null);
    }

    // Clear the failed message state
    setLastFailedMessage(null);
  }, [lastFailedMessage]);

  const handleRegenerate = useCallback(async () => {
    // Only regenerate if the last message is from assistant
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant") return;

    // Find the last user message
    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserMessageIndex = i;
        break;
      }
    }

    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];
    const messageContent = lastUserMessage.content;

    // Remove the last assistant message(s) - there might be multiple if there were errors
    const updatedMessages = [...messages];
    const assistantMessagesToDelete: string[] = [];

    while (
      updatedMessages.length > 0 &&
      updatedMessages[updatedMessages.length - 1].role === "assistant"
    ) {
      const assistantMessage = updatedMessages.pop()!;
      // Collect message IDs for database deletion
      if (assistantMessage.id && currentConversationId) {
        assistantMessagesToDelete.push(assistantMessage.id);
      }
    }

    // Delete old assistant messages from database
    if (currentConversationId && assistantMessagesToDelete.length > 0) {
      try {
        await Promise.all(
          assistantMessagesToDelete.map((messageId) =>
            deleteMessage({
              conversationId: currentConversationId,
              messageId,
            }).unwrap(),
          ),
        );
      } catch (error) {
        console.error("Failed to delete old assistant messages:", error);
        // Continue with regeneration even if deletion fails
      }
    }

    // Update messages state without the assistant response
    setMessages(updatedMessages);

    // Clear error state
    setHasError(false);
    setErrorMessage(null);
    setIsTyping(true);
    setIsNewMessage(false);

    // Clear any existing timeout
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }

    messageTimeoutRef.current = setTimeout(() => {
      setRequestTimedOut(true);
    }, 30_000);

    try {
      // Build message payload using the updated messages (without the removed assistant response)
      // The user message is already in updatedMessages, so we just map all messages
      const mappedMessages: ChatCompletionMessageParam[] = updatedMessages
        .filter((msg) => typeof msg.content === "string")
        .map((msg) => ({
          role: msg.role,
          content: msg.content!,
          name: msg.name,
        }));

      // Don't add the user message again - it's already in mappedMessages
      const messagePayload: ChatCompletionMessageParam[] = webSearchEnabled
        ? mappedMessages
        : [{ role: "system", content: assistantPrompt }, ...mappedMessages];

      const assistantMessageResponse = await chatCompletionOpenAi({
        messages: messagePayload,
        model: selectedModel,
        web_search: webSearchEnabled,
        search_provider: "tavily",
        search_max_results: 10,
      }).unwrap();

      const assistantMessageContent =
        assistantMessageResponse?.choices?.[0]?.message?.content || "";

      const assistantMessage: Message = {
        name: "Assistant",
        role: "assistant",
        content: assistantMessageContent || "Failed to respond",
        isFile: false,
      };

      setIsNewMessage(true);

      // Save assistant message to database and get the ID
      let savedMessageId: string | undefined;
      if (currentConversationId && assistantMessageContent) {
        const savedMessage = await saveMessageToConversation(
          currentConversationId,
          "assistant",
          assistantMessageContent,
        );
        savedMessageId = savedMessage?.id;
      }

      // Update assistant message with ID from database
      const assistantMessageWithId: Message = {
        ...assistantMessage,
        id: savedMessageId,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessageWithId]);

      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
      setRequestTimedOut(false);

      setLastAttempt(null);
      setLastFailedMessage(null);
    } catch (error) {
      console.error("Error regenerating message:", error);
      setHasError(true);
      setErrorMessage(extractErrorMessage(error));
      setLastAttempt(null);
      setLastFailedMessage(null);

      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
    } finally {
      setIsTyping(false);
    }
  }, [
    messages,
    chatCompletionOpenAi,
    webSearchEnabled,
    selectedModel,
    currentConversationId,
    saveMessageToConversation,
    assistantPrompt,
    deleteMessage,
  ]);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const isAudio = file.type.startsWith("audio/");

      // Reset transcript state when new file is selected
      setTranscriptText("");
      setTranscriptResetKey((prev) => prev + 1);

      // Reset input value immediately to fix macOS file picker issue
      // This prevents the dialog from reopening unexpectedly
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Only transcribe audio files
      if (isAudio) {
        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append("file", file);

          // enqueue job
          const { jobId } = await transcribeAudio(formData).unwrap();
          setJobId(jobId); // save Job ID for polling
        } catch (err) {
          console.error("Error enqueuing transcription job:", err);
          setHasUploadError(true);
          setSelectedFile(null);
          setOriginalFileName(null);
          setIsTranscribing(false);
        }
      } else {
        // For non-audio files, set the file directly
        setSelectedFile(file);
        setOriginalFileName(file.name);
        setIsTranscribing(false);
        setHasUploadError(false);
        setTranscriptionError(null);
      }
    },
    [transcribeAudio],
  );

  const getTranscriptText = (
    transcript: string | TranscriptData | null,
  ): string => {
    if (!transcript) return "";
    if (typeof transcript === "string") return transcript;
    if (typeof transcript === "object" && transcript.fullText) {
      return transcript.fullText;
    }
    return "";
  };

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const status = await getTranscriptionStatus(jobId).unwrap();

        if (status.state === "completed") {
          clearInterval(interval);

          if (status.transcript) {
            setTranscriptText(status.transcript);

            const text = getTranscriptText(status.transcript);

            const textBlob = new Blob([text], { type: "text/plain" });
            const textFile = new File([textBlob], `transcript-${jobId}.txt`, {
              type: "text/plain",
            });

            setSelectedFile(textFile);
            setOriginalFileName(textFile.name);
            setHasUploadError(false);
            setTranscriptionError(null);
          } else {
            console.error("Transcript is empty");
            setHasUploadError(true);
            setTranscriptionError("Transcription failed. Try again.");
          }

          setIsTranscribing(false);
          setJobId(null);
        } else if (status.state === "failed") {
          clearInterval(interval);
          console.error("Transcription job failed");
          setHasUploadError(true);
          setIsTranscribing(false);
          setJobId(null);
          setTranscriptionError("Transcription failed. Try again.");
        }
      } catch (err) {
        console.error("Error fetching transcription status:", err);
        clearInterval(interval);
        setIsTranscribing(false);
        setTranscriptionError("An error occurred. Please try again.");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [jobId, getTranscriptionStatus]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setOriginalFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setHasUploadError(false);
    setIsTranscribing(false);
    setJobId(null);
    setTranscriptionError(null);
    setTranscriptText("");
    setTranscriptResetKey((prev) => prev + 1); // Reset transcript state
  }, []);

  const handleIconClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
    setCurrentConversationModel(null);
    setCurrentConversationTitle(null);
    setCurrentConversationFolderName(null);
    setCurrentConversationFolderId(null);
    setIsCurrentConversationTemporary(false);
    setIsNewMessage(false);
    setInputValue("");
    setSelectedFile(null);
    setOriginalFileName(null);
    setHasError(false);
    setErrorMessage(null);
    setHasUploadError(false);
    setTranscriptionError(null);
    setTranscriptText("");
    setIsTyping(false);
    setLastAttempt(null);
    setLastFailedMessage(null);
  }, []);

  const handleCreateNewConversation = useCallback(async () => {
    handleClearChat();
    // Reset temporary mode to default (permanent)
    setCreateTemporaryConversation(false);

    // Reset model selection to tool's configured default for new chat
    if (defaultModelId) {
      setCurrentConversationModel(defaultModelId);
    } else {
      setCurrentConversationModel(null);
    }
  }, [handleClearChat, defaultModelId]);

  const handleLoadConversation = useCallback(
    async (conversationId: string) => {
      setIsLoadingConversation(true);
      try {
        // Fetch conversation details to get isTemporary status
        const conversation = await fetchConversation(conversationId).unwrap();

        // Fetch messages for the conversation
        const messagesResult = await fetchMessages(conversationId).unwrap();

        // Convert API messages to chat Message format
        // Identify file messages by checking if content looks like a filename
        const chatMessages: Message[] = messagesResult.map((msg, index) => {
          // Check if this message looks like a file message
          // File messages typically have file extensions and are followed by another user message
          const hasFileExtension = !!msg.content.match(
            /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|jpg|jpeg|png|gif|mp3|mp4|wav|zip|rar|tar|gz)$/i,
          );
          const nextMessageIsUser =
            index < messagesResult.length - 1 &&
            messagesResult[index + 1]?.role === "user";
          const nextMessageIsNotFile =
            nextMessageIsUser &&
            !messagesResult[index + 1]?.content.match(
              /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|jpg|jpeg|png|gif|mp3|mp4|wav|zip|rar|tar|gz)$/i,
            );

          const isFileMessage =
            msg.role === "user" &&
            (hasFileExtension || (nextMessageIsUser && nextMessageIsNotFile));

          return {
            name: msg.role === "user" ? "User" : "Assistant",
            role: msg.role,
            content: msg.content,
            timestamp: msg.createdAt,
            isFile: isFileMessage,
            id: msg.id, // Preserve message ID for deletion
          };
        });

        // Set the conversation state
        setCurrentConversationId(conversationId);
        setIsCurrentConversationTemporary(conversation.isTemporary || false);
        setIsNewMessage(false); // Mark as loaded, not new
        setMessages(chatMessages);
        setCurrentConversationTitle(conversation.title || null);

        // Set the conversation's folder name
        if (conversation.folder) {
          setCurrentConversationFolderName(conversation.folder.name);
        } else {
          // If no folder, it's uncategorized
          setCurrentConversationFolderName("Uncategorized");
        }
        setCurrentConversationFolderId(conversation.folderId ?? null);

        // Set the conversation's model and update the tool's model to match
        if (conversation.aiModel) {
          setCurrentConversationModel(conversation.aiModel);
        } else {
          // If conversation has no model, use tool's configured default and save it
          if (defaultModelId) {
            setCurrentConversationModel(defaultModelId);
            try {
              await updateConversation({
                id: conversationId,
                data: { aiModel: defaultModelId },
              }).unwrap();
            } catch (error) {
              console.error(
                "Failed to save default model to conversation:",
                error,
              );
            }
          }
        }

        // Clear any errors or file states
        setHasError(false);
        setSelectedFile(null);
        setOriginalFileName(null);
        setInputValue("");
        setIsTyping(false); // Ensure typing is stopped
      } catch (error) {
        console.error("Failed to load conversation:", error);
        setHasError(true);
      } finally {
        setIsLoadingConversation(false);
      }
    },
    [fetchMessages, fetchConversation, defaultModelId, updateConversation],
  );

  const isInitialScreen = messages.length === 0;

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
      }}
    >
      <AIChatbotHeader
        clientName={clientName}
        isTyping={isTyping}
        classes={classes}
      />

      <Box
        style={{
          margin: "20px",
          border: "1px solid #D6D3D1",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 100px)",
          overflow: "hidden",
        }}
      >
        <ChatFolders
          onClearChat={handleClearChat}
          onCreateNewConversation={handleCreateNewConversation}
          onLoadConversation={handleLoadConversation}
          currentConversationId={currentConversationId}
          onConversationUpdated={(conversation) => {
            // Update folder name and title when conversation is updated
            if (conversation.id === currentConversationId) {
              setCurrentConversationTitle(conversation.title || null);
              if (conversation.folder) {
                setCurrentConversationFolderName(conversation.folder.name);
              } else {
                setCurrentConversationFolderName("Uncategorized");
              }
              setCurrentConversationFolderId(conversation.folderId ?? null);
            }
          }}
        />

        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: isInitialScreen ? "" : 1,
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {isLoadingConversation && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                flexDirection: "column",
                gap: 2,
              }}
            >
              <CircularProgress size={40} />
              <Typography variant="body2" sx={{ color: "#57534E" }}>
                Loading conversation...
              </Typography>
            </Box>
          )}
          <AIChatbotContent
            messages={messages}
            isTyping={isTyping && !isLoadingConversation}
            classes={classes}
            handleResendMessage={handleResendMessage}
            hasError={hasError}
            errorMessage={errorMessage}
            selectedFile={selectedFile}
            isTranscribing={isTranscribing}
            isTemporaryConversation={isCurrentConversationTemporary}
            isLoadingConversation={isLoadingConversation}
            isNewMessage={isNewMessage}
            onTypingComplete={() => setIsNewMessage(false)}
            conversationTitle={currentConversationTitle}
            folderName={currentConversationFolderName}
            onOpenConversationDetails={handleOpenConversationDetails}
            onAnimationStateChange={setIsAnimating}
            onFastForwardAnimation={(fn) => {
              fastForwardAnimationRef.current = fn;
            }}
            onRegenerate={handleRegenerate}
          />

          <AIChatbotFooter
            tools={tools}
            availableModels={availableModels}
            selectedModel={selectedModel}
            setSelectedModel={handleModelChange}
            inputValue={inputValue}
            isTyping={isTyping}
            messages={messages}
            handleSendMessage={handleMessage}
            setInputValue={setInputValue}
            fileInputRef={fileInputRef}
            selectedFile={selectedFile}
            originalFileName={originalFileName}
            hasError={hasUploadError}
            handleFileSelect={handleFileSelect}
            handleRemoveFile={handleRemoveFile}
            handleIconClick={handleIconClick}
            handleRetryClick={handleRetryUpload}
            transcriptionError={transcriptionError}
            webSearchEnabled={webSearchEnabled}
            setWebSearchEnabled={setWebSearchEnabled}
            isTranscribing={isTranscribing}
            transcribe={getTranscriptText(transcriptText)}
            onOpenTranscript={() => setOpenTranscriptModal(true)}
            isTemporaryMode={createTemporaryConversation}
            setIsTemporaryMode={setCreateTemporaryConversation}
            currentFolderName={currentConversationFolderName}
            currentFolderId={currentConversationFolderId}
            currentConversationId={currentConversationId}
            onChangeConversationFolder={handleConversationFolderChange}
            isConversationTemporary={isCurrentConversationTemporary}
            onConvertTemporaryConversation={handleConvertTemporaryConversation}
            isConvertingTemporary={isConvertingTemporary}
            isLoadingConversation={isLoadingConversation}
            isAnimating={isAnimating}
            onFastForwardAnimation={() => {
              if (fastForwardAnimationRef.current) {
                fastForwardAnimationRef.current();
              }
            }}
          />
        </Box>
      </Box>
      {/* <TranscriptBox
        open={openTranscriptModal}
        onClose={() => setOpenTranscriptModal(false)}
        transcript={transcriptText}
        resetKey={transcriptResetKey}
      /> */}
      <ConversationDetailsModal
        open={openConversationDetails}
        onClose={handleCloseConversationDetails}
        conversation={selectedConversation}
        folders={folders}
        onSave={handleSaveConversationDetails}
      />
    </Box>
  );
};

export default AIChatbotTool;
