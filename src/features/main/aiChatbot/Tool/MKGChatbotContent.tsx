import React, { useEffect, useRef, useState, useCallback } from "react";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Box,
  CardContent,
  Chip,
  Stack,
  Typography,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Message } from "../../../../types/chatbotMessage";
import {
  IconReload,
  IconMessageChatbot,
  IconEyeDotted,
  IconCopy,
  IconMessages,
  IconFolderOpen,
  IconAdjustmentsAlt,
} from "@tabler/icons-react";
import {
  cleanLine,
  stripHtmlAndMarkdown,
} from "../../../../utils/textFormatter";

type AIChatbotContentProps = {
  messages: Message[];
  isTyping: boolean;
  selectedFile: File | null;
  classes: Record<string, string>;
  handleResendMessage: () => void;
  hasError: boolean;
  errorMessage?: string | null;
  isTranscribing: boolean;
  isTemporaryConversation?: boolean;
  isLoadingConversation?: boolean;
  isNewMessage?: boolean;
  onTypingComplete?: () => void;
  conversationTitle?: string | null;
  folderName?: string | null;
  onOpenConversationDetails?: () => void;
  onAnimationStateChange?: (isAnimating: boolean) => void;
  onFastForwardAnimation?: (fastForwardFn: () => void) => void;
  onRegenerate?: () => void;
};

const typingMessageStyle = {
  backgroundColor: "#F5F5F4",
  color: "black",
  padding: "0 8px",
  borderRadius: "0px 15px 15px 15px",
  marginLeft: "25px",
  marginRight: "auto",
  marginBottom: "2px",
  maxWidth: "75%",
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
  top: "1px",
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
        top: "1px",
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

const renderChatMessage = (
  message: Message,
  isUser: boolean,
  onCopyMessage?: (content: string) => void,
  showRegenerate?: boolean,
  onRegenerate?: () => void
) => {
  const isFileMessage = message.isFile;
  const messageStyle = isFileMessage
    ? fileMessageStyle
    : {
        backgroundColor: "#F5F5F4",
        color: "black",
        padding: isUser ? "15px" : "8px",
        borderRadius: isUser ? "15px 15px 0 15px" : "0 15px 15px 15px",
        marginLeft: isUser ? "auto" : "25px",
        marginRight: isUser ? "25px" : "auto",
        marginBottom: "2px",
        maxWidth: isUser ? "75%" : "75%",
        alignSelf: isUser ? "flex-end" : "flex-start",
        position: "relative",
      };

  if (!isUser && !isFileMessage) {
    return (
      <Box sx={messageStyle}>
        <Box sx={avatarStyle}>
          <IconMessageChatbot color="red" size={15} />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            variant="body1"
            component="div"
            sx={{
              "& p": {
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                alignItems: "center",
                margin: 0,
              },
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, children, href, ...props }) => {
                  if (!href) return <>{children}</>;

                  const cleanHref = href.replace(/[,;]$/, "");

                  const displayHref =
                    cleanHref.length > 30
                      ? cleanHref.slice(0, 27) + "..."
                      : cleanHref;

                  return (
                    <Chip
                      label={displayHref}
                      clickable
                      size="small"
                      sx={{
                        backgroundColor: "#78716C",
                        color: "white",
                        "&:hover": { backgroundColor: "#78716C" },
                      }}
                      onClick={() => window.open(cleanHref, "_blank")}
                    />
                  );
                },
                p: ({ node, children, ...props }) => (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {children}
                  </Box>
                ),
              }}
            >
              {cleanLine(message.content)}
            </ReactMarkdown>
          </Typography>
          {onCopyMessage && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "4px",
                marginTop: "4px",
              }}
            >
              <CopyButton content={message.content} onCopy={onCopyMessage} />
              {showRegenerate && onRegenerate && (
                <RegenerateButton onRegenerate={onRegenerate} />
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // For user messages, keep the original rendering
  const lines = message.content.split("\n");

  return (
    <Box sx={messageStyle}>
      {!isUser && (
        <Box sx={avatarStyle}>
          <IconMessageChatbot color="red" size={15} />
        </Box>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {lines.map((line, idx) => {
          const cleanedLine = cleanLine(line);
          const urls = Array.from(
            cleanedLine.matchAll(/https?:\/\/[^\s,]+/g)
          ).map((m) => m[0].replace(/[,;]$/, ""));
          let textParts = cleanedLine.split(/https?:\/\/[^\s,]+/g);
          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {textParts.map((text, i) =>
                text ? (
                  <Typography key={`text-${i}`} variant="body1">
                    {text}
                  </Typography>
                ) : null
              )}
              {urls.map((url, i) => (
                <Chip
                  key={`url-${i}`}
                  label={url.length > 30 ? url.slice(0, 27) + "..." : url}
                  clickable
                  size="small"
                  sx={{
                    backgroundColor: "#78716C",
                    color: "white",
                    "&:hover": { backgroundColor: "#78716C" },
                  }}
                  onClick={() => window.open(url, "_blank")}
                />
              ))}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

const getCurrentDate = (): string => {
  return dayjs().format("MMMM DD YYYY, hh:mm A");
};

const CopyButton = ({
  content,
  onCopy,
}: {
  content: string;
  onCopy: (content: string) => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleCopy = async () => {
    try {
      const plainText = stripHtmlAndMarkdown(content);
      console.log("Original:", content);
      console.log("Stripped:", plainText);

      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTooltipOpen(true);
      onCopy(plainText);

      setTimeout(() => {
        setCopied(false);
        setTooltipOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Tooltip
      title={copied ? "Message was copied" : "Copy message"}
      placement="top"
      arrow
      open={copied ? tooltipOpen : undefined}
      onClose={() => setTooltipOpen(false)}
    >
      <IconButton
        onClick={handleCopy}
        size="small"
        sx={{
          padding: "4px",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <IconCopy size={16} color={copied ? "#4caf50" : "#57534E"} />
      </IconButton>
    </Tooltip>
  );
};

const RegenerateButton = ({ onRegenerate }: { onRegenerate: () => void }) => {
  return (
    <Tooltip title="Regenerate response" placement="top" arrow>
      <IconButton
        onClick={onRegenerate}
        size="small"
        sx={{
          padding: "4px",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <IconReload size={16} color="#57534E" />
      </IconButton>
    </Tooltip>
  );
};

const AIChatbotContent = ({
  messages,
  classes,
  isTyping,
  handleResendMessage,
  selectedFile,
  hasError,
  errorMessage,
  isTranscribing,
  isTemporaryConversation = false,
  isLoadingConversation = false,
  isNewMessage = false,
  onTypingComplete,
  conversationTitle,
  folderName,
  onOpenConversationDetails,
  onAnimationStateChange,
  onFastForwardAnimation,
  onRegenerate,
}: AIChatbotContentProps) => {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [displayResponse, setDisplayResponse] = useState<string>("");
  const [completedTyping, setCompletedTyping] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnimatedMessageRef = useRef<string>("");
  const isAnimatingRef = useRef<boolean>(false);
  const userHasScrolledUpRef = useRef<boolean>(false);
  const lastScrollTopRef = useRef<number>(0);

  const currentMessage = messages[messages.length - 1]?.content || "";
  const isCurrentMessageFromAssistant =
    messages[messages.length - 1]?.role === "assistant";

  const handleCopyMessage = (content: string) => {
    // This callback can be used for additional logic if needed
  };

  const handleFastForward = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isAnimatingRef.current = false;
    setIsAnimating(false);
    setDisplayResponse(currentMessage);
    setCompletedTyping(true);
    if (onTypingComplete) {
      onTypingComplete();
    }
    if (onAnimationStateChange) {
      onAnimationStateChange(false);
    }
  }, [currentMessage, onTypingComplete, onAnimationStateChange]);

  // Expose fast-forward function to parent via callback
  React.useEffect(() => {
    if (onFastForwardAnimation) {
      onFastForwardAnimation(handleFastForward);
    }
  }, [handleFastForward, onFastForwardAnimation]);

  // Check if user is near the bottom of the chat
  const isNearBottom = useCallback(() => {
    if (!chatContainerRef.current) return true;
    const container = chatContainerRef.current;
    const threshold = 100; // pixels from bottom
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom <= threshold;
  }, []);

  const isInitialScreen = messages.length === 0;

  useEffect(() => {
    const isSameMessage = lastAnimatedMessageRef.current === currentMessage;
    if (
      isAnimatingRef.current &&
      isSameMessage &&
      isCurrentMessageFromAssistant &&
      isNewMessage
    ) {
      return;
    }
    const messageChanged = lastAnimatedMessageRef.current !== currentMessage;
    const shouldAnimate =
      isCurrentMessageFromAssistant &&
      isNewMessage &&
      messageChanged &&
      !isAnimatingRef.current;

    if (shouldAnimate) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Reset scroll flag when new message starts - if user is at bottom, allow auto-scroll
      if (chatContainerRef.current && isNearBottom()) {
        userHasScrolledUpRef.current = false;
      }

      isAnimatingRef.current = true;
      setIsAnimating(true);
      lastAnimatedMessageRef.current = currentMessage;
      setCompletedTyping(false);
      if (onAnimationStateChange) {
        onAnimationStateChange(true);
      }
      let i = 0;

      intervalRef.current = setInterval(() => {
        setDisplayResponse(currentMessage.slice(0, i));
        i++;
        if (i > currentMessage.length) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          isAnimatingRef.current = false;
          setIsAnimating(false);
          setCompletedTyping(true);
          if (onAnimationStateChange) {
            onAnimationStateChange(false);
          }
          if (onTypingComplete) {
            onTypingComplete();
          }
        }
      }, 10);
    } else if (!isCurrentMessageFromAssistant || !isNewMessage) {
      if (intervalRef.current && !isCurrentMessageFromAssistant) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        isAnimatingRef.current = false;
        setIsAnimating(false);
        if (onAnimationStateChange) {
          onAnimationStateChange(false);
        }
      }
      setDisplayResponse(currentMessage);
      setCompletedTyping(true);
    }
  }, [
    currentMessage,
    isCurrentMessageFromAssistant,
    isNewMessage,
    onTypingComplete,
    onAnimationStateChange,
    isNearBottom,
  ]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Handle scroll events to detect user scrolling up
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // If user scrolled up (scrollTop decreased), mark that user has scrolled up
      if (currentScrollTop < lastScrollTopRef.current) {
        userHasScrolledUpRef.current = true;
      }

      // If user is near bottom, reset the flag (they're back at bottom)
      const distanceFromBottom = scrollHeight - currentScrollTop - clientHeight;
      if (distanceFromBottom <= 100) {
        userHasScrolledUpRef.current = false;
      }

      lastScrollTopRef.current = currentScrollTop;
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Auto-scroll only if user hasn't scrolled up or is near bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      // Only auto-scroll if user hasn't manually scrolled up OR is near bottom
      if (!userHasScrolledUpRef.current || isNearBottom()) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
        // Reset the flag after auto-scrolling
        userHasScrolledUpRef.current = false;
      }
    }
  }, [messages, isTyping, displayResponse, isNearBottom]);

  return (
    <>
      <Box
        sx={{
          height: isInitialScreen ? "" : "72vh",
          overflow: isInitialScreen ? "" : "scroll",
        }}
        ref={chatContainerRef}
      >
        {!isTemporaryConversation && conversationTitle && (
          <Box
            sx={{
              backgroundColor: "#E7E5E4",
              color: "black",
              width: "100%",
              borderRadius: 0,
              marginBottom: "16px",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "95%",
                padding: "14px 16px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: "0 0 auto",
                }}
              >
                <IconMessages size={18} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "gray",
                  }}
                >
                  {conversationTitle}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: "0 0 auto",
                }}
              >
                {folderName && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <IconFolderOpen size={18} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 550,
                        fontSize: "14px",
                        color: "gray",
                      }}
                    >
                      {folderName}
                    </Typography>
                    {onOpenConversationDetails && (
                      <IconButton
                        size="small"
                        onClick={onOpenConversationDetails}
                        sx={{
                          padding: "2px",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <IconAdjustmentsAlt size={16} />
                      </IconButton>
                    )}
                  </Box>
                )}
                {!folderName && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      Uncategorized
                    </Typography>
                    {onOpenConversationDetails && (
                      <IconButton
                        size="small"
                        onClick={onOpenConversationDetails}
                        sx={{
                          padding: "2px",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <IconAdjustmentsAlt size={16} />
                      </IconButton>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
        {isTemporaryConversation && (
          <Alert
            severity="info"
            icon={<IconEyeDotted size={20} />}
            sx={{
              backgroundColor: "#DC5E5E",
              color: "white",
              borderRadius: 0,
              marginBottom: "16px",
              position: "sticky",
              top: 0,
              zIndex: 10,
              "& .MuiAlert-icon": {
                color: "white",
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Temporary Conversation
            </Typography>
          </Alert>
        )}
        <Box sx={{ paddingX: "40px" }}>
          <CardContent
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {!isLoadingConversation && !isInitialScreen && (
              <Typography
                variant="subtitle2"
                style={{ textAlign: "center", marginBottom: "8px" }}
              >
                {getCurrentDate()}
              </Typography>
            )}

            {!isLoadingConversation && isInitialScreen && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  textAlign: "center",
                  pt: selectedFile || isTranscribing ? 0 : 10,
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

            {!isLoadingConversation &&
              messages
                .slice(0, -1)
                .map((message, index) => (
                  <React.Fragment key={index}>
                    {renderChatMessage(
                      message,
                      message.role === "user",
                      handleCopyMessage,
                      false,
                      undefined
                    )}
                  </React.Fragment>
                ))}

            {!isLoadingConversation &&
              !isCurrentMessageFromAssistant &&
              messages.length > 0 && (
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

            {!isLoadingConversation &&
              !completedTyping &&
              isCurrentMessageFromAssistant &&
              messages.length > 0 && (
                <Box
                  sx={{
                    ...typingMessageStyle,
                    maxWidth: "75%",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box sx={getAvatarStyle("case1")}>
                      <IconMessageChatbot color="red" size={15} />
                    </Box>
                    <Typography
                      variant="body1"
                      display="inline"
                      sx={{ flex: 1 }}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, children, href, ...props }) => {
                            if (!href) return <>{children}</>;

                            const cleanHref = href.replace(/[,;]$/, "");

                            const displayHref =
                              cleanHref.length > 60
                                ? cleanHref.slice(0, 57) + "..."
                                : cleanHref;

                            return (
                              <Chip
                                label={displayHref}
                                clickable
                                size="small"
                                sx={{
                                  backgroundColor: "#78716C",
                                  color: "white",
                                  "&:hover": { backgroundColor: "#78716C" },
                                }}
                                onClick={() => window.open(cleanHref, "_blank")}
                              />
                            );
                          },
                        }}
                      >
                        {cleanLine(displayResponse)}
                      </ReactMarkdown>
                    </Typography>
                  </Box>
                </Box>
              )}

            {!isLoadingConversation &&
              completedTyping &&
              isCurrentMessageFromAssistant && (
                <React.Fragment>
                  {renderChatMessage(
                    {
                      name: "Assistant",
                      role: "assistant",
                      content: currentMessage,
                    },
                    false,
                    handleCopyMessage,
                    true,
                    onRegenerate
                  )}
                </React.Fragment>
              )}

            {/* Typing indicator at the bottom */}
            {!isLoadingConversation && isTyping && (
              <Box
                sx={{
                  backgroundColor: "#F5F5F4",
                  color: "black",
                  padding: "20px 0 20px 10px",
                  borderRadius: "0 15px 15px 15px",
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
                  <Typography
                    sx={{ fontSize: "14px", color: "red", fontWeight: 600 }}
                  >
                    {errorMessage ||
                      "There was an error generating the response"}
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
      </Box>
    </>
  );
};

export default AIChatbotContent;
