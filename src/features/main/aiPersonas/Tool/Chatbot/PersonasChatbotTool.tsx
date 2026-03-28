import { useCallback, useRef, useState } from "react";
import { Box } from "@mui/material";
import { ChatCompletionMessageParam } from "openai/resources";
import { Message } from "../../../../../types/chatbotMessage";
import useStyles from "./PersonasStyle";
import useOpenAI from "../../../../../hooks/useOpenAI";
import { convertToTxtFile } from "../../../../../utils/convertToTxt";
import PersonasChatbotFooter from "./PersonasChatbotFooter";
import PersonasChatbotContent from "./PersonasChatbotContent";
import PersonasChatbotHeader from "./PersonasChatbotHeader";

const initialMessage = (name: string): Message => ({
  name,
  role: "assistant",
  content:
    "Hedgehox is a digital marketing agency specializing in pharmaceutical marketing, founded by experienced digital strategists.",
});

type AIPersonasChatbotToolProps = {
  clientName: string;
  assistantId: string;
  vectorStoreId: string;
};

const AIPersonasChatbotTool = ({
  clientName,
  assistantId,
  vectorStoreId,
}: AIPersonasChatbotToolProps) => {
  const {
    createThread,
    askQuestionBasedOnFile,
    chatCompletionOpenAi,
    uploadFile,
    addFileToVectorStore,
  } = useOpenAI();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    initialMessage(clientName),
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hasError, setHasError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  const classes = useStyles();
  const [lastAttempt, setLastAttempt] = useState<(() => Promise<void>) | null>(
    null
  );

  const handleSendMessage = useCallback(
    async (messageContent?: string) => {
      const messageToSend = messageContent || inputValue || "";
      if (messageToSend.trim() === "") return;

      const userMessage: Message = {
        name: "User",
        role: "user",
        content: messageToSend,
        isFile: false,
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInputValue("");
      setIsTyping(true);
      setHasError(false);

      const timeoutId = setTimeout(() => {
        setIsTyping(false);
        setHasError(true);
      }, 30000);

      try {
        const mappedMessages: ChatCompletionMessageParam[] = messages.map(
          (msg) => ({
            role: msg.role,
            content: msg.content,
            name: msg.name,
          })
        );

        const assistantMessageContent = await chatCompletionOpenAi([
          ...mappedMessages,
          { role: "user", content: messageToSend },
        ]);

        const assistantMessage: Message = {
          name: "Assistant",
          role: "assistant",
          content: assistantMessageContent,
          isFile: false,
        };

        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        clearTimeout(timeoutId);

        setLastAttempt(null);
      } catch (error) {
        console.error("Error processing message:", error);
        setHasError(true);

        setLastAttempt(() => () => handleSendMessage(messageToSend));
      } finally {
        setIsTyping(false);
      }
    },
    [inputValue, messages, chatCompletionOpenAi]
  );

  const handleFileMessage = useCallback(async () => {
    if (!selectedFile || !inputValue.trim()) return;

    setIsTyping(true);
    setHasError(false);

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

    setMessages((prevMessages) => [
      ...prevMessages,
      fileMessage,
      userInstructionMessage,
    ]);

    try {
      const uploadResponse = await uploadFile({
        file: selectedFile,
        purpose: "assistants",
      });

      const fileId = uploadResponse.id;
      await addFileToVectorStore(vectorStoreId, fileId);

      const thread = await createThread();
      const assistantMessageContent = await askQuestionBasedOnFile(
        thread.id,
        assistantId,
        `Please analyze the attached file (File Name:${selectedFile.name} with File Id: ${fileId}) and provide insights. ${inputValue}. DO NOT INCLUDE ANY SOURCE REFERENCES: Do not include any source indicators, footnotes, or references like "[4: 17+source]" or any similar format. Do not mention the name of the file`
      );

      const assistantMessage: Message = {
        name: "Assistant",
        role: "assistant",
        content: assistantMessageContent,
        isFile: false,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      // Save successful attempt
      setLastAttempt(null);
    } catch (error) {
      console.error("Error processing file:", error);
      setHasError(true);

      // Save failed attempt for resend
      setLastAttempt(() => handleFileMessage);
    } finally {
      setIsTyping(false);
      setSelectedFile(null);
      setInputValue("");
    }
  }, [
    selectedFile,
    inputValue,
    vectorStoreId,
    assistantId,
    uploadFile,
    addFileToVectorStore,
    createThread,
    askQuestionBasedOnFile,
  ]);

  const handleMessage = useCallback(() => {
    if (selectedFile) {
      handleFileMessage();
    } else if (inputValue.trim()) {
      handleSendMessage();
    }
  }, [selectedFile, inputValue, handleFileMessage, handleSendMessage]);

  const handleResendMessage = useCallback(() => {
    if (lastAttempt) {
      lastAttempt();
    }
  }, [lastAttempt]);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        try {
          const { file: processedFile, originalFileName } =
            await convertToTxtFile(file);
          setSelectedFile(processedFile);
          setOriginalFileName(originalFileName);
          setHasError(false);
        } catch (error) {
          console.error("Error processing file:", error);
          setHasError(true);
        }
      }
    },
    []
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setHasError(false);
  }, []);

  const handleIconClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
      }}
    >
      <PersonasChatbotHeader
        clientName={clientName}
        isTyping={isTyping}
        classes={classes}
      />
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <PersonasChatbotContent
          messages={messages}
          isTyping={isTyping}
          classes={classes}
          handleResendMessage={handleResendMessage}
          hasError={hasError}
          selectedFile={selectedFile}
        />
      </Box>
      <PersonasChatbotFooter
        messages={messages}
        inputValue={inputValue}
        isTyping={isTyping}
        handleSendMessage={handleMessage}
        setInputValue={setInputValue}
        fileInputRef={fileInputRef}
        selectedFile={selectedFile}
        originalFileName={originalFileName}
        handleFileSelect={handleFileSelect}
        handleRemoveFile={handleRemoveFile}
        handleIconClick={handleIconClick}
      />
    </Box>
  );
};

export default AIPersonasChatbotTool;
