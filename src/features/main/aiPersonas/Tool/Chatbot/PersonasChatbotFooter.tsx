import React from "react";
import {
  CardActions,
  IconButton,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import { IconArrowUp, IconFile, IconPlus, IconX } from "@tabler/icons-react";
import TextInput from "../../../../../components/layouts/TextInput";
import { Message } from "../../../../../types/chatbotMessage";

interface PersonasChatbotFooterProps {
  inputValue: string;
  isTyping: boolean;
  handleSendMessage: (message?: string) => void;
  messages: Message[];
  originalFileName: string | null;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  selectedFile: File | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: () => void;
  handleIconClick: () => void;
}

const PersonasChatbotFooter = ({
  inputValue,
  handleSendMessage,
  setInputValue,
  fileInputRef,
  selectedFile,
  originalFileName,
  handleFileSelect,
  handleRemoveFile,
  messages,
  handleIconClick,
}: PersonasChatbotFooterProps) => {
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

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 370,
          right: 0,
          margin: "0 180px 30px 180px",
          padding: "10px",
          backgroundColor: "#F5F5F4",
          borderRadius: "12px",
          zIndex: 1,
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
              {selectedFile && (
                <Box
                  sx={{
                    position: "relative",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    width: "290px",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "25px",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconFile color="#E86D5A" size={20} />
                    <Tooltip
                      placement="right-start"
                      title={originalFileName || selectedFile.name}
                      arrow
                    >
                      <Typography
                        sx={{
                          color: "#E86D5A",
                          fontWeight: 550,
                          fontSize: "14px",
                        }}
                      >
                        {(originalFileName || selectedFile.name).length > 25
                          ? (originalFileName || selectedFile.name).substring(
                              0,
                              17
                            ) + "..."
                          : originalFileName || selectedFile.name}
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
                <Box position="relative" flex="1">
                  <Box
                    sx={{
                      width: "30px",
                      backgroundColor: "white",
                      display: "flex",
                      alignItems: "center",
                      padding: "8px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                    onClick={handleIconClick}
                  >
                    <IconPlus size={16} color="black" />
                  </Box>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                    accept=".txt,.doc,.docx,.pdf,.xls,.xlsx,.csv"
                  />
                </Box>
                <IconButton
                  onClick={handleSend}
                  disabled={!inputValue.trim() && !selectedFile}
                  sx={{
                    backgroundColor:
                      inputValue || selectedFile ? "#E86D5A" : "grey",
                    borderRadius: "50%",
                    padding: "5px",
                    "&:hover": {
                      backgroundColor:
                        inputValue || selectedFile ? "#E86D5A" : "gray",
                    },
                  }}
                >
                  <IconArrowUp
                    size={16}
                    stroke={3}
                    color={inputValue || selectedFile ? "white" : "grey"}
                    fill="white"
                  />
                </IconButton>
              </Box>
            </Box>
          </CardActions>
        </Box>
      </Box>
    </>
  );
};

export default PersonasChatbotFooter;
