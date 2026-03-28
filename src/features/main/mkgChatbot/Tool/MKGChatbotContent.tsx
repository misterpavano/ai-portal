import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import relativeTime from "dayjs/plugin/relativeTime";
import { Box, CardContent, Stack, Typography } from "@mui/material";
import { Message } from "../../../../types/chatbotMessage";
import { IconFile, IconReload, IconMessageChatbot } from "@tabler/icons-react";

type MKGChatbotContentProps = {
  messages: Message[];
  isTyping: boolean;
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
  const displayFileName = message.originalFileName || message.content;
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
            <IconMessageChatbot color="#E86D5A" size={15} />
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
            ) : isFileMessage ? (
              displayFileName
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

const MKGChatbotContent = ({
  messages,
  classes,
  isTyping,
  selectedFile,
  handleResendMessage,
  hasError,
}: MKGChatbotContentProps) => {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [displayResponse, setDisplayResponse] = useState<string>("");
  const [completedTyping, setCompletedTyping] = useState<boolean>(false);
  const currentMessage = messages[messages.length - 1]?.content || "";
  const isCurrentMessageFromAssistant =
    messages[messages.length - 1]?.role === "assistant";

  const isInitialScreen = messages.length === 0;

  useEffect(() => {
    if (isCurrentMessageFromAssistant) {
      setCompletedTyping(false);

      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayResponse(currentMessage.slice(0, i));
        i++;

        if (i > currentMessage.length) {
          clearInterval(intervalId);
          setCompletedTyping(true);
        }
      }, 20);

      return () => clearInterval(intervalId);
    } else {
      setDisplayResponse(currentMessage);
      setCompletedTyping(true);
    }
  }, [currentMessage, isCurrentMessageFromAssistant]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping, displayResponse]);

  return (
    <>
      <Box
        sx={{
          paddingX: "160px",
          height: isInitialScreen ? "" : "72vh",
          overflow: isInitialScreen ? "" : "scroll",
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
          {!isInitialScreen && (
            <Typography
              variant="subtitle2"
              style={{ textAlign: "center", marginBottom: "8px" }}
            >
              {getCurrentDate()}
            </Typography>
          )}
          {isInitialScreen && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                textAlign: "center",
                pt: selectedFile ? 0 : 10,
              }}
            >
              <Typography
                sx={{
                  fontSize: "28px",
                  fontWeight: 600,
                  fontFamily: "Inter, Arial, sans-serif",
                  pb: 2,
                }}
              >
                What can I help you with today?
              </Typography>
            </Box>
          )}

          {messages.slice(0, -1).map((message, index) => (
            <React.Fragment key={index}>
              {renderChatMessage(message, message.role === "user")}
            </React.Fragment>
          ))}

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
                  <IconMessageChatbot color="#E86D5A" size={15} />
                </Box>
                <Typography variant="body1" display="inline">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {displayResponse}
                  </ReactMarkdown>
                </Typography>
              </Box>
            </Box>
          )}

          {isTyping && (
            <Box
              sx={{
                backgroundColor: "#F5F5F4",
                color: "black",
                padding: "20px 10px 20px 10px",
                borderRadius: "15px 15px 15px 0",
                width: "55px",
                alignSelf: "flex-start",
                position: "relative",
                margin: "25px",
              }}
            >
              <Box sx={getAvatarStyle("case1")}>
                <IconMessageChatbot color="#E86D5A" size={15} />
              </Box>
              <Stack direction="row">
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

export default MKGChatbotContent;
