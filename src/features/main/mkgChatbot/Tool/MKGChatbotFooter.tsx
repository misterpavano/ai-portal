import React, { useState } from "react";
import {
  CardActions,
  IconButton,
  Box,
  Typography,
  Tooltip,
  Popover,
} from "@mui/material";
import TextInput from "../../../../components/layouts/TextInput";
import {
  IconArrowUp,
  IconChevronDown,
  IconFile,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { Message } from "../../../../types/chatbotMessage";
import SuggestionBox from "./Suggestions";

const models = [
  {
    name: "gpt-3.5-turbo",
    displayName: "GPT-3.5",
    description:
      "Quick content creation, summaries, and everyday writing tasks.",
  },
  {
    name: "gpt-4-turbo",
    displayName: "GPT-4",
    description:
      "In-depth content creation, advanced analysis, and complex reasoning.",
  },
  {
    name: "gpt-4o",
    displayName: "GPT-4o",
    description:
      "Best overall; excels in both content creation and data analysis.",
  },
  {
    name: "gpt-4o-mini",
    displayName: "GPT-4o mini",
    description:
      "Fast, efficient responses for general tasks, not deep analysis.",
  },
  {
    name: "gpt-o1",
    displayName: "o1",
    description:
      "Strongest for logic-heavy tasks like coding, math, and structured analysis.",
  },
];

interface MKGChatbotFooterProps {
  inputValue: string;
  isTyping: boolean;
  handleSendMessage: (message?: string) => void;
  messages: Message[];
  originalFileName: string | null;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  selectedFile: File | null;
  hasError: boolean;
  selectedModel?: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: () => void;
  handleIconClick: () => void;
}

const MKGChatbotFooter = ({
  inputValue,
  handleSendMessage,
  setInputValue,
  fileInputRef,
  selectedFile,
  originalFileName,
  handleFileSelect,
  handleRemoveFile,
  hasError,
  selectedModel,
  setSelectedModel,
  messages,
  handleIconClick,
}: MKGChatbotFooterProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleSend = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!inputValue.trim() && !selectedFile) return;

    handleSendMessage();
    const syntheticEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    setInputValue("");
    handleRemoveFile();
  };

  const handleSuggestionClick = (message: string) => {
    setInputValue(message);
    handleSendMessage();
  };

  const isInitialScreen = messages.length === 0;

  return (
    <>
      <Box
        sx={{
          margin: "0 180px 30px 180px",
          padding: "10px",
          backgroundColor: "#F5F5F4",
          borderRadius: "12px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#F5F5F4",
            borderRadius: "12px",
            width: "100%",
          }}
        >
          <CardActions
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              position: "sticky",
              gap: 10,
            }}
            disableSpacing
          >
            <Box
              sx={{
                width: "100%",
              }}
            >
              {(selectedFile || hasError) && (
                <Box
                  sx={{
                    position: "relative",
                    backgroundColor: hasError ? "#F5C4C4" : "#FFFFFF",
                    borderRadius: "12px",
                    width: "290px",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "25px",
                    border: hasError ? "1px solid red" : "none",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconFile color={hasError ? "red" : "#E86D5A"} size={20} />
                    <Tooltip
                      placement="right-start"
                      title={
                        hasError
                          ? "File size exceeds 1MB"
                          : originalFileName || selectedFile?.name
                      }
                      arrow
                    >
                      <Typography
                        sx={{
                          color: hasError ? "red" : "#E86D5A",
                          fontWeight: 550,
                          fontSize: "14px",
                        }}
                      >
                        {hasError
                          ? "File size exceeds 20MB limit"
                          : (originalFileName || selectedFile?.name || "")
                              ?.length > 25
                          ? (
                              originalFileName ||
                              selectedFile?.name ||
                              ""
                            ).substring(0, 17) + "..."
                          : originalFileName || selectedFile?.name || ""}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "-6px",
                      right: "10px",
                      backgroundColor: "black",
                      borderRadius: "50%",
                      width: "15px",
                      height: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={handleRemoveFile}
                  >
                    <IconX size={11} color="white" />
                  </Box>
                </Box>
              )}
              <TextInput
                maxRows={3}
                multiline
                inputBaseStyles={{
                  maxHeight: "120px",
                  overflowY: "auto",
                }}
                inputType="InputBase"
                value={inputValue || ""}
                onChange={(e) => setInputValue(e.target.value)}
                inputStyles={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "8px",
                  padding: "0 14px 20px 0",
                  backgroundColor: "#F5F5F4",
                  color: "#060606",
                  outline: "none",
                }}
                placeholder="Type a message..."
                onEnterPressed={() => {
                  handleSendMessage();
                  setInputValue("");
                  handleRemoveFile();
                }}
              />
              <Box
                sx={{ display: "flex", width: "100%", alignItems: "center" }}
              >
                <Box
                  sx={{
                    position: "relative",
                    flex: "1",
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: "27px",
                      height: "27px",
                      backgroundColor: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                    onClick={handleIconClick}
                  >
                    <IconPlus size={16} />
                  </Box>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                    accept=".txt,.doc,.docx,.pdf,.xls,.xlsx,.csv,.pptx"
                  />
                  <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    PaperProps={{
                      sx: {
                        borderRadius: "12px",
                        border: "1px solid #E5E5E5",
                        padding: "10px",
                        width: "280px",
                      },
                    }}
                    sx={{
                      height: "440px",
                      gap: "10px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {models.map((model) => (
                        <Box
                          key={model.name}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            cursor: "pointer",
                            padding: "8px",
                            borderRadius: "8px",
                            backgroundColor:
                              selectedModel === model.name
                                ? "#FEF2F0"
                                : "transparent",
                            "&:hover": { backgroundColor: "#FEF2F0" },
                          }}
                          onClick={() => {
                            setSelectedModel(model.name);
                            handleClose();
                          }}
                        >
                          <Typography
                            sx={{ fontSize: "14px", fontWeight: 550 }}
                          >
                            {model.displayName}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#A8A29E",
                              marginBottom: 0.5,
                            }}
                          >
                            ChatGPT
                          </Typography>
                          <Typography sx={{ fontSize: "12px", color: "gray" }}>
                            {model.description}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Popover>
                  <Box
                    onClick={handleClick}
                    sx={{
                      backgroundColor: "#E7E5E4",
                      minWidth: "43px",
                      justifyContent: "center",
                      height: "27px",
                      display: "flex",
                      alignItems: "center",
                      paddingX: "6px",
                      gap: "4px",
                      borderRadius: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <Typography>
                      {models.find((m) => m.name === selectedModel)
                        ?.displayName || "GPT-4o"}
                    </Typography>
                    <IconChevronDown size={15} color="black" />
                  </Box>
                </Box>
                <IconButton
                  onClick={handleSend}
                  disabled={!inputValue.trim() && !selectedFile}
                  sx={{
                    backgroundColor: hasError
                      ? "#E86D5A"
                      : inputValue || selectedFile
                      ? "#E86D5A"
                      : "grey",
                    borderRadius: "50%",
                    padding: "5px",
                    "&:hover": {
                      backgroundColor: hasError
                        ? "#E86D5A"
                        : inputValue || selectedFile
                        ? "#E86D5A"
                        : "gray",
                    },
                  }}
                >
                  <IconArrowUp
                    size={16}
                    stroke={3}
                    color={
                      hasError
                        ? "grey"
                        : inputValue || selectedFile
                        ? "white"
                        : "grey"
                    }
                    fill="white"
                  />
                </IconButton>
              </Box>
            </Box>
          </CardActions>
        </Box>
      </Box>
      {isInitialScreen && (
        <Box
          sx={{
            margin: "0 180px 0 180px",
            borderRadius: "12px",
            display: "flex",
            gap: "20px",
          }}
        >
          <SuggestionBox />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "50%",
              borderRadius: "13px",
              border: "1px solid #E7E5E4",
              padding: "20px 20px 50px 20px",
              backgroundColor: "#FEF2F0",
            }}
          >
            <Typography sx={{ fontSize: "16px", fontWeight: 550 }}>
              📂 Need to upload files?
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Click{" "}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  backgroundColor: "white",
                  borderRadius: "4px",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  border: "1px solid #ccc",
                }}
              >
                <IconPlus size={14} color="black" />
              </Box>{" "}
              or drag a file to chatbox to upload.
            </Typography>
            <Typography sx={{ fontSize: "12px", fontWeight: 550 }}>
              I support Word, PPT, Excel, and PDF (max 20MB).{" "}
              <Typography
                component="span"
                sx={{ fontSize: "12px", fontWeight: 400 }}
              >
                Scanned images, encrypted files, or complex formatting may be
                inaccurate.{" "}
              </Typography>
              <Typography
                component="span"
                sx={{ fontSize: "12px", fontWeight: 400, color: "#C97500" }}
              >
                Review responses before sharing.
              </Typography>
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

export default MKGChatbotFooter;
