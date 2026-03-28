import React from "react";
import {
  CardActions,
  IconButton,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  IconArrowUp,
  IconFile,
  IconPaperclip,
  IconX,
} from "@tabler/icons-react";
import TextInput from "../../../../../../components/layouts/TextInput";

interface ProjectBriefChatbotFooterProps {
  inputValue: string;
  isTyping: boolean;
  handleSendMessage: () => void;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  selectedFile: File | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: () => void;
  handleIconClick: () => void;
  disableTextInput: boolean;
}

const ProjectBriefChatbotFooter = ({
  inputValue,
  handleSendMessage,
  setInputValue,
  selectedFile,
  handleRemoveFile,
  handleIconClick,
  handleFileSelect,
  fileInputRef,
  disableTextInput,
}: ProjectBriefChatbotFooterProps) => {
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
    <Box
      sx={{
        bottom: 0,
        left: 370,
        right: 0,
        margin: "0 160px 30px 160px",
        padding: "10px",
        backgroundColor: "#F5F5F4",
        borderRadius: "12px",
        zIndex: 1,
      }}
    >
      <Tooltip
        title={
          disableTextInput
            ? "Please select the project type to enable the text field."
            : ""
        }
        placement="top-start"
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
          {selectedFile && (
            <Box
              sx={{
                backgroundColor: "#FEF2F0",
                color: "white",
                borderRadius: "12px",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginRight: "25px",
                gap: 10,
                marginBottom: "170px",
                position: "absolute",
              }}
            >
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconFile color="#013499" size={20} />
                <Tooltip
                  placement="right-start"
                  title={selectedFile.name}
                  arrow
                >
                  <Typography
                    sx={{ color: "#013499", fontWeight: 550, fontSize: "14px" }}
                  >
                    {selectedFile.name.length > 25
                      ? selectedFile.name.substring(0, 25) + "..."
                      : selectedFile.name}
                  </Typography>
                </Tooltip>
              </Box>

              <IconX
                cursor="pointer"
                onClick={handleRemoveFile}
                size={16}
                color="#013499"
              />
            </Box>
          )}
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
                marginBottom: "10px",
              }}
            >
              <Box
                sx={{
                  width: "30px",
                  backgroundColor: disableTextInput ? "#f4f4f4" : "white",
                  display: "flex",
                  alignItems: "center",
                  padding: "8px",
                  borderRadius: "8px",
                  cursor: disableTextInput ? "not-allowed" : "pointer",
                }}
                onClick={handleIconClick}
              >
                <IconPaperclip
                  color={disableTextInput ? "grey" : "black"}
                  size={16}
                />
              </Box>

              <input
                disabled={disableTextInput}
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelect}
                accept=".txt,.doc,.docx"
              />
              <Box
                sx={{ display: "flex", width: "100%", alignItems: "center" }}
              >
                <Box position="relative" flex="1">
                  <TextInput
                    disabled={disableTextInput}
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
                      padding: "10px 14px 0 10px",
                      backgroundColor: "#F5F5F4",
                      color: "#060606",
                      outline: "none",
                    }}
                    placeholder="Type a message..."
                    onEnterPressed={() => {
                      console.log("Enter pressed in TextInput");
                      handleSendMessage();
                      setInputValue("");
                      handleRemoveFile();
                    }}
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
      </Tooltip>
    </Box>
  );
};

export default ProjectBriefChatbotFooter;
