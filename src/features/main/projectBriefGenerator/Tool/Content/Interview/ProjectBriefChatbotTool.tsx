import { Box } from "@mui/material";
import mammoth from "mammoth";
import { useCallback, useEffect, useRef, useState } from "react";
import ProjectBriefChatbotContent from "./ProjectBriefChatbotContent";
import ProjectBriefChatbotFooter from "./ProjectBriefChatbotFooter";
import { Paragraph, Document, Packer, TextRun } from "docx";
import saveAs from "file-saver";
import dayjs from "dayjs";
import ProjectBriefChatbotHeader from "./ProjectBriefChatbotHeader";
import { useAtom } from "jotai";
import { projectBriefFormAtom } from "../../../../../../atoms/projectBriefAtom";
import useOpenAI from "../../../../../../hooks/useOpenAI";
import { Message } from "../../../../../../types/chatbotMessage";
import useStyles from "../../../../mkgChatbot/Tool/MKGChatbotStyles";
import {
  auditProjectBriefInstructionText,
  projectBriefInstructionText,
} from "../../../../../../prompts/projectBriefGenerator/instructionText";
import { projectBriefSlice } from "../../../../../../api/slices/projectBriefSlice";

type TProjectType = {
  assistantId: string;
  sheetUrl: string;
  label: string;
};

const projectTypes: TProjectType[] = [
  {
    label: "Select project type",
    assistantId: "",
    sheetUrl: "",
  },
  {
    label: "Hedgehox",
    assistantId: "asst_VHJmr5SHVZPb0VM7NMUuvjuI",
    sheetUrl:
      "AKfycby3X8O1NIiRrpPz1mL6zAURDGiMpHYlGqVQ4DFlcN8xyPH0OMb2xZZgYnS3o9ZSEfur-A/exec",
  },
];

const ProjectBriefChatbotTool = () => {
  const {
    createThread,
    askQuestionBasedOnFileWithoutPrompt,
    updateAssistantInstructions,
  } = useOpenAI();
  const [initialUpload, setInitialUpload] = useState(true);
  const [assistantId, setAssistantId] = useState<string>(
    projectTypes[0].assistantId
  );
  const selectedProjectType = projectTypes.find(
    (projectType) => projectType.assistantId === assistantId
  );
  const { data, isLoading } = projectBriefSlice.useGetDataFromSheetQuery(
    selectedProjectType?.sheetUrl || "",
    { skip: !assistantId }
  );
  const [isLoadingInitialHiddenMessage, setIsLoadingInitialHiddenMessage] =
    useState<boolean>(false);
  const [wordExportContent, setWordExportContent] = useState("");
  const [projectBriefFromValues] = useAtom(projectBriefFormAtom);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [threadId, setThreadId] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasError, setHasError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const classes = useStyles();

  const disableTextInput = !assistantId;

  const instructionsText = (questions: string, sections: string) => {
    if (projectBriefFromValues.type.name === "Interview") {
      return projectBriefInstructionText(questions, sections);
    } else if (projectBriefFromValues.type.name === "Audit") {
      return auditProjectBriefInstructionText(questions);
    }
    return "";
  };

  const handleCreateThread = useCallback(async () => {
    if (!assistantId) return;

    const thread = await createThread();
    setThreadId(thread.id);

    if (projectBriefFromValues.type.name === "Interview") {
      setIsLoadingInitialHiddenMessage(true);
      await handleInitialHiddenMessage(thread.id);
      setIsLoadingInitialHiddenMessage(false);
    }
  }, [createThread, assistantId, projectBriefFromValues.type]);

  const handleInitialHiddenMessage = useCallback(
    async (threadId: string) => {
      try {
        const initialPrompt = `Start with questions, but for website briefs, include a bolded callout suggesting they coordinate with the Digital Strategy Team on a website strategy and measurement/analytics before completing the brief, if possible. Highlight that this will provide better data to input. If they haven’t done this, encourage them to do so as soon as possible and definitely before the kickoff.`;
        const response = await askQuestionBasedOnFileWithoutPrompt(
          threadId,
          assistantId,
          initialPrompt
        );
        const assistantMessage: Message = {
          name: "Assistant",
          role: "assistant",
          content: response,
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } catch (error) {
        console.error("Error sending initial hidden message:", error);
      }
    },
    [askQuestionBasedOnFileWithoutPrompt, assistantId]
  );

  useEffect(() => {
    if (data && assistantId) {
      updateAssistantInstructions(
        assistantId,
        instructionsText(data.questions, data.sections)
      );
      handleCreateThread();
    }
  }, [assistantId, data, handleCreateThread, updateAssistantInstructions]);

  const handleSelect = async (e: any) => {
    setAssistantId(e.target.value);
  };

  const handleSendMessage = useCallback(
    async (messageContent?: string) => {
      const messageToSend = messageContent || inputValue;

      if (messageToSend.trim() !== "" || selectedFile) {
        setSuggestions([]);
        setHasError(false);

        if (selectedFile && messageToSend.trim() !== "") {
          // This block will be executed only during the initial upload
          const fileMessage: Message = {
            name: "User",
            role: "user",
            content: selectedFile.name,
            isFile: true,
          };
          setMessages((prevMessages) => [...prevMessages, fileMessage]);

          const textMessage: Message = {
            name: "User",
            role: "user",
            content: messageToSend,
            isFile: false,
          };
          setMessages((prevMessages) => [...prevMessages, textMessage]);

          setInputValue("");
          setIsTyping(true);
          setSelectedFile(null);
          setInitialUpload(false); // Set initialUpload to false after the first upload

          const timeoutId = setTimeout(() => {
            setIsTyping(false);
          }, 30000);

          try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const { value } = await mammoth.extractRawText({ arrayBuffer });
            const combinedContent = `${value}\n\n${messageToSend}`;
            const response = await askQuestionBasedOnFileWithoutPrompt(
              threadId,
              assistantId,
              combinedContent
            );

            clearTimeout(timeoutId);

            const assistantMessage: Message = {
              name: "Assistant",
              role: "assistant",
              content: response,
            };

            setMessages((prevMessages) => [...prevMessages, assistantMessage]);

            setIsTyping(false);
            setInitialUpload(false);
          } catch (error) {
            clearTimeout(timeoutId);
            setIsTyping(false);
            setHasError(true);
          }
        } else {
          // This block will be executed for all subsequent uploads
          let userMessage: Message;
          if (selectedFile) {
            userMessage = {
              name: "User",
              role: "user",
              content: selectedFile.name,
              isFile: true,
            };
          } else {
            userMessage = {
              name: "User",
              role: "user",
              content: messageToSend,
              isFile: false,
            };
          }

          setMessages((prevMessages) => [...prevMessages, userMessage]);
          setInputValue("");
          setIsTyping(true);
          setSelectedFile(null);
          setInitialUpload(false);

          const timeoutId = setTimeout(() => {
            setIsTyping(false);
          }, 30000);

          try {
            let response = "";
            if (selectedFile) {
              const arrayBuffer = await selectedFile.arrayBuffer();
              const { value } = await mammoth.extractRawText({ arrayBuffer });
              response = await askQuestionBasedOnFileWithoutPrompt(
                threadId,
                assistantId,
                value
              );
            } else {
              response = await askQuestionBasedOnFileWithoutPrompt(
                threadId,
                assistantId,
                messageToSend
              );
            }

            clearTimeout(timeoutId);

            const assistantMessage: Message = {
              name: "Assistant",
              role: "assistant",
              content: response,
            };

            const overviewMessage = response.includes("Project Overview");
            const requirementsMessage = response.includes(
              "Technical Requirements"
            );
            if (
              (overviewMessage && requirementsMessage) ||
              response?.includes("READY FOR DOWNLOAD") ||
              response?.includes("Ready for Download")
            ) {
              setWordExportContent(response);
            }

            setMessages((prevMessages) => [...prevMessages, assistantMessage]);

            setIsTyping(false);
            setInitialUpload(false);
          } catch (error) {
            clearTimeout(timeoutId);
            setIsTyping(false);
            setHasError(true);
          }
        }
      }
    },
    [
      askQuestionBasedOnFileWithoutPrompt,
      assistantId,
      inputValue,
      selectedFile,
      threadId,
    ]
  );

  type ExportOverviewToWord = (content: string) => Promise<void>;

  const formatWordExportContent = (content: string) => {
    const sectionMatches =
      content.match(/\*\*[^*]+:\*\*[\s\S]+?(?=\n\s*\*\*|$)/g) || [];

    let cleanContent = sectionMatches.join("\n").trim();

    const paragraphs: Paragraph[] = [
      new Paragraph({
        children: [
          new TextRun({
            text: "_".repeat(70),
            size: 24,
            color: "000000",
          }),
        ],
        spacing: { before: 200, after: 200 },
      }),
      new Paragraph({ text: "" }),
    ];

    const lines = cleanContent.split("\n");

    lines.forEach((line) => {
      line = line.trim();
      if (!line) return;

      if (line.match(/^\*\*[^*]+:\*\*$/)) {
        paragraphs.push(new Paragraph({ text: "" }));

        const title = line.replace(/\*\*/g, "").trim();
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 32,
                color: "000000",
              }),
            ],
          })
        );
        paragraphs.push(new Paragraph({ text: "" }));
      } else if (line.includes("**")) {
        const matches = line.match(/\*\*([^*]+)::?\*\*\s*(.*)/) || [];
        if (matches.length >= 3) {
          const label = matches[1].trim();
          const value = matches[2].trim();

          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: label + ": ",
                  bold: true,
                  size: 24,
                  color: "000000",
                }),
                new TextRun({
                  text: value,
                  size: 24,
                  color: "000000",
                }),
              ],
            })
          );
        }
      } else if (
        !line.match(/^[-\s]*$/) &&
        !line.toLowerCase().includes("ready for download")
      ) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 24,
                color: "000000",
              }),
            ],
          })
        );
      }
    });

    paragraphs.push(
      new Paragraph({ text: "" }),
      new Paragraph({
        children: [
          new TextRun({
            text: "_".repeat(70),
            size: 24,
            color: "000000",
          }),
        ],
        spacing: { before: 200, after: 200 },
      })
    );

    return paragraphs;
  };

  const exportOverviewToWord: ExportOverviewToWord = async (content) => {
    const paragraphs = formatWordExportContent(content);

    const doc = new Document({
      sections: [
        {
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "ProjectBrief_" + dayjs().format("DD_MM_YYYY") + ".docx");
  };

  const handleExport = () => {
    exportOverviewToWord(wordExportContent);
  };

  const handleResendMessage = useCallback(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user") {
      handleSendMessage(lastMessage.content);
    }
  }, [messages, handleSendMessage]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
      }}
    >
      <ProjectBriefChatbotHeader
        clientName="Project Brief Generator"
        isTyping={isTyping}
        classes={classes}
        assistantId={assistantId}
        handleSelect={handleSelect}
        projectTypes={projectTypes}
        wordExportContent={wordExportContent}
        exportOverviewToWord={handleExport}
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
        <ProjectBriefChatbotContent
          isLoading={isLoading || isLoadingInitialHiddenMessage}
          messages={messages}
          isTyping={isTyping}
          suggestions={suggestions}
          assistantId={assistantId}
          handleSelect={handleSelect}
          projectTypes={projectTypes}
          classes={classes}
          handleResendMessage={handleResendMessage}
          hasError={hasError}
          selectedFile={selectedFile}
        />
      </Box>
      <ProjectBriefChatbotFooter
        disableTextInput={disableTextInput}
        inputValue={inputValue}
        isTyping={isTyping}
        handleSendMessage={handleSendMessage}
        setInputValue={setInputValue}
        fileInputRef={fileInputRef}
        selectedFile={selectedFile}
        handleFileSelect={handleFileSelect}
        handleRemoveFile={handleRemoveFile}
        handleIconClick={handleIconClick}
      />
    </Box>
  );
};

export default ProjectBriefChatbotTool;
