import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import relativeTime from "dayjs/plugin/relativeTime";
import { Box, CardContent, MenuItem, Stack, Typography } from "@mui/material";
import { Message } from "../../../../../../types/chatbotMessage";
import {
  IconFile,
  IconMessageChatbot,
  IconReload,
  IconNotes,
} from "@tabler/icons-react";
import Spinner from "../../../../../../components/layouts/Spinner";
import Select from "../../../../../../components/layouts/Select";
import { projectBriefFormAtom } from "../../../../../../atoms/projectBriefAtom";
import { useAtom } from "jotai";

type ProjectBriefChatbotContentProps = {
  isLoading: boolean;
  messages: Message[];
  suggestions: string[];
  isTyping: boolean;
  assistantId: string;
  handleSelect: (e: any) => void;
  projectTypes: { assistantId: string; label: string }[];
  selectedFile: File | null;
  classes: Record<string, string>;
  handleResendMessage: () => void;
  hasError: boolean;
};

const typingMessageStyle = {
  backgroundColor: "white",
  color: "black",
  padding: "15px",
  borderRadius: "15px 15px 0 15px",
  marginLeft: "25px",
  maxWidth: "100%",
  alignSelf: "flex-start",
  position: "relative",
};

const fileMessageStyle = {
  backgroundColor: "#FEF2F0",
  color: "#013499",
  padding: "8px",
  borderRadius: "8px",
  marginLeft: "auto",
  marginRight: "25px",
  maxWidth: "75%",
  alignSelf: "flex-end",
  position: "relative",
};

const avatarStyle = {
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  top: "28px",
  left: "-25px",
  width: "20px",
  height: "20px",
  backgroundColor: "#FDECEC",
  borderRadius: "40%",
};

const getAvatarStyle = (positionCase: any) => {
  switch (positionCase) {
    case "case1":
      return {
        ...avatarStyle,
        top: "20px",
      };
    case "case2":
      return {
        ...avatarStyle,
        top: "34px",
      };
    default:
      return avatarStyle;
  }
};

const renderChatMessage = (message: Message, isUser: boolean) => {
  const isFileMessage = message.isFile;
  const messageStyle = isFileMessage
    ? fileMessageStyle
    : {
        backgroundColor: isUser ? "#F5F5F4" : "white",
        color: "black",
        padding: isUser ? "15px" : "10px 8px 0 8px",
        borderRadius: isUser ? "15px 15px 0 15px" : "15px 15px 15px 0",
        marginLeft: isUser ? "auto" : "25px",
        marginRight: isUser ? "25px" : "auto",
        marginBottom: "2px",
        maxWidth: isUser ? "75%" : "100%",
        alignSelf: isUser ? "flex-end" : "flex-start",
        position: "relative",
      };

  dayjs.extend(relativeTime);

  return (
    <>
      <Box sx={messageStyle}>
        {!isUser && (
          <Box sx={avatarStyle}>
            <IconMessageChatbot color="red" size={15} />
          </Box>
        )}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {isFileMessage && <IconFile color="#013499" size={20} />}
          <Typography
            sx={{
              fontWeight: isFileMessage ? 550 : "normal",
              fontSize: isFileMessage ? "14px" : "16px",
            }}
          >
            {!isUser ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            ) : (
              message.content
            )}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

const getCurrentDate = (): string => {
  return dayjs().format("MMMM DD YYYY, hh:mm A");
};

const ProjectBriefChatbotContent = ({
  isLoading,
  messages,
  suggestions,
  classes,
  isTyping,
  handleResendMessage,
  hasError,
  assistantId,
  handleSelect,
  projectTypes,
}: ProjectBriefChatbotContentProps) => {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [displayResponse, setDisplayResponse] = useState<string>("");
  const [completedTyping, setCompletedTyping] = useState<boolean>(false);
  const [projectBriefFromValues] = useAtom(projectBriefFormAtom);
  const currentMessage = messages[messages.length - 1]?.content || "";
  const isCurrentMessageFromAssistant =
    messages[messages.length - 1]?.role === "assistant";
  const emptyAssistantId = "";

  useEffect(() => {
    if (isLoading) {
      setDisplayResponse("");
      setCompletedTyping(false);
    } else if (isCurrentMessageFromAssistant) {
      setCompletedTyping(false);

      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayResponse(currentMessage.slice(0, i + 1));
        i++;

        if (i >= currentMessage.length) {
          clearInterval(intervalId);
          setCompletedTyping(true);
        }
      }, 20);

      return () => clearInterval(intervalId);
    } else {
      setDisplayResponse(currentMessage);
      setCompletedTyping(true);
    }
  }, [currentMessage, isCurrentMessageFromAssistant, isLoading]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, suggestions, isTyping, displayResponse]);

  return (
    <>
      <Box
        sx={{
          paddingX: "160px",
          height: "72vh",
          overflowY: "auto",
        }}
        ref={chatContainerRef}
      >
        <CardContent
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {!emptyAssistantId.includes(assistantId) && (
            <Typography
              variant="subtitle2"
              style={{ textAlign: "center", marginBottom: "8px" }}
            >
              {getCurrentDate()}
            </Typography>
          )}

          {messages.slice(0, -1).map((message, index) => (
            <React.Fragment key={index}>
              {renderChatMessage(message, message.role === "user")}
            </React.Fragment>
          ))}

          {isLoading && projectBriefFromValues.type.name === "Interview" ? (
            <Box
              sx={{
                backgroundColor: "#F5F5F4",
                color: "black",
                padding: "20px 0 20px 10px",
                borderRadius: "15px 15px 15px 0",
                width: "50px",
                alignSelf: "flex-start",
                position: "relative",
                margin: "25px",
              }}
            >
              <Box sx={getAvatarStyle("case1")}>
                <IconMessageChatbot color="red" size={15} />
              </Box>
              <Stack direction="row" spacing={1}>
                <Stack className={classes.typingDot}></Stack>
                <Stack className={classes.typingDot}></Stack>
                <Stack className={classes.typingDot}></Stack>
              </Stack>
            </Box>
          ) : (
            isLoading && (
              <Box
                sx={{
                  marginTop: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Spinner />
              </Box>
            )
          )}

          {!isCurrentMessageFromAssistant && messages.length > 0 && (
            <Box
              sx={{
                backgroundColor: "#F5F5F4",
                color: "black",
                padding: "15px",
                borderRadius: "15px 15px 0 15px",
                marginLeft: "auto",
                marginRight: "25px",
                maxWidth: "75%",
                alignSelf: "flex-end",
                position: "relative",
              }}
            >
              <Typography variant="body1" display="inline">
                {currentMessage}
              </Typography>
            </Box>
          )}

          {!completedTyping && isCurrentMessageFromAssistant && (
            <Box sx={typingMessageStyle}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={getAvatarStyle("case2")}>
                  <IconMessageChatbot color="red" size={15} />
                </Box>
                <Typography variant="body1" display="inline">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {displayResponse}
                  </ReactMarkdown>
                </Typography>
              </Box>
            </Box>
          )}

          {emptyAssistantId.includes(assistantId) && (
            <Box
              sx={{
                marginTop: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <IconNotes size={54} />
              <Typography
                style={{
                  fontSize: "14px",
                  textAlign: "center",
                  color: "black",
                  fontWeight: 600,
                }}
              >
                Please select the project type to enable the text field.
              </Typography>
              <Select
                styles={{ width: "100%", height: "40px", fontSize: "14px" }}
                onSelect={handleSelect}
                value={assistantId}
              >
                {projectTypes.map((projectType) => (
                  <MenuItem
                    key={projectType.assistantId}
                    value={projectType.assistantId}
                  >
                    {projectType.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}

          {isTyping && (
            <Box
              sx={{
                backgroundColor: "#F5F5F4",
                color: "black",
                padding: "20px 0 20px 10px",
                borderRadius: "15px 15px 15px 0",
                width: "50px",
                alignSelf: "flex-start",
                position: "relative",
                margin: "25px",
              }}
            >
              <Box sx={getAvatarStyle("case1")}>
                <IconMessageChatbot color="red" size={15} />
              </Box>
              <Stack direction="row" spacing={1}>
                <Stack className={classes.typingDot}></Stack>
                <Stack className={classes.typingDot}></Stack>
                <Stack className={classes.typingDot}></Stack>
              </Stack>
            </Box>
          )}

          {completedTyping && isCurrentMessageFromAssistant && (
            <React.Fragment>
              {renderChatMessage(
                {
                  name: "Assistant",
                  role: "assistant",
                  content: currentMessage,
                },
                false
              )}
            </React.Fragment>
          )}

          {hasError && (
            <Box
              sx={{
                border: "1px solid red",
                backgroundColor: "#FDECEC",
                color: "black",
                padding: "10px",
                borderRadius: "8px 8px 8px 0px",
                width: "auto",
                alignSelf: "flex-start",
                position: "relative",
                margin: "25px",
              }}
            >
              <Box sx={{ marginBottom: 2 }}>
                <Typography sx={{ fontSize: "14px", color: "red" }}>
                  There was an error generating the response
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: "12px", color: "red" }}>
                  Resend the message
                </Typography>
                <IconReload
                  size={15}
                  style={{ cursor: "pointer", color: "red" }}
                  onClick={handleResendMessage}
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Box>
    </>
  );
};

export default ProjectBriefChatbotContent;
