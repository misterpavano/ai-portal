import React, { useEffect, useMemo, useState } from "react";
import {
  CardActions,
  IconButton,
  Box,
  Typography,
  Popover,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import TextInput from "../../../../components/layouts/TextInput";
import {
  IconBrandTelegram,
  IconChevronDown,
  IconEye,
  IconEyeDotted,
  IconFile,
  IconFolder,
  IconPlus,
  IconWorld,
  IconX,
  IconPlayerStopFilled,
} from "@tabler/icons-react";
import { Message } from "../../../../types/chatbotMessage";
import SuggestionBox from "./Suggestions";
import HelpBox from "./HelpBox";
import { TAiTool } from "../../../../types/local/tools";
import { TAiModel } from "../../../../types/local/models";
import { useFetchFoldersQuery } from "../../../../api/slices/conversationsApiSlice";
import { IFolder } from "../../../../types/response/conversations";

interface AIChatbotFooterProps {
  tools: TAiTool[];
  availableModels: TAiModel[];
  inputValue: string;
  isTyping: boolean;
  messages: Message[];
  handleSendMessage: (message?: string) => void;
  originalFileName: string | null;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  selectedFile: File | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: () => void;
  handleIconClick: () => void;
  handleRetryClick: () => void;
  hasError: boolean;
  selectedModel?: string;
  setSelectedModel: (model: string) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isTranscribing: boolean;
  transcribe?: string;
  onOpenTranscript?: () => void;
  transcriptionError?: string | null;
  isTemporaryMode?: boolean;
  setIsTemporaryMode?: React.Dispatch<React.SetStateAction<boolean>>;
  currentFolderName?: string | null;
  currentFolderId?: string | null;
  currentConversationId?: string | null;
  onChangeConversationFolder?: (folderId: string | null) => Promise<void>;
  isConversationTemporary?: boolean;
  onConvertTemporaryConversation?: () => Promise<void>;
  isConvertingTemporary?: boolean;
  isLoadingConversation?: boolean;
  isAnimating?: boolean;
  onFastForwardAnimation?: () => void;
}

const AIChatbotFooter = ({
  tools,
  availableModels,
  inputValue,
  handleSendMessage,
  setInputValue,
  messages,
  fileInputRef,
  selectedFile,
  originalFileName,
  handleFileSelect,
  hasError,
  handleRemoveFile,
  handleIconClick,
  handleRetryClick,
  selectedModel,
  setSelectedModel,
  webSearchEnabled,
  setWebSearchEnabled,
  isTranscribing,
  transcribe,
  onOpenTranscript,
  transcriptionError,
  isTemporaryMode = false,
  setIsTemporaryMode,
  currentFolderName = null,
  currentFolderId = null,
  currentConversationId = null,
  onChangeConversationFolder,
  isConversationTemporary = false,
  onConvertTemporaryConversation,
  isConvertingTemporary = false,
  isLoadingConversation = false,
  isAnimating = false,
  onFastForwardAnimation,
}: AIChatbotFooterProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] =
    useState<string>("uncategorized");
  const [assigningFolder, setAssigningFolder] = useState(false);
  const { data: foldersData = [], isLoading: foldersLoading } =
    useFetchFoldersQuery(undefined, {
      skip: !folderDialogOpen,
    });
  const folders = useMemo<IFolder[]>(
    () => (Array.isArray(foldersData) ? foldersData : []),
    [foldersData],
  );

  const chatAITool = tools.find((tool) => tool.name === "ChatAI");
  const currentModel = chatAITool?.model;

  // availableModels is already filtered in AIChatbotTool to include:
  // 1. Globally visible models (status === "show")
  // 2. Models marked as available for ChatAI
  const chatAIModels = availableModels;

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isLoadingConversation || chatAIModels.length === 0) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const canAssignFolder =
    Boolean(currentConversationId) &&
    !isConversationTemporary &&
    !isLoadingConversation;

  const handleOpenFolderDialog = () => {
    if (!canAssignFolder) return;
    setFolderDialogOpen(true);
  };

  const handleCloseFolderDialog = () => {
    if (assigningFolder) return;
    setFolderDialogOpen(false);
  };

  useEffect(() => {
    if (folderDialogOpen) {
      setSelectedFolderId(currentFolderId ?? "uncategorized");
    }
  }, [folderDialogOpen, currentFolderId]);

  const handleConfirmFolderSelection = async () => {
    if (!onChangeConversationFolder || !currentConversationId) {
      setFolderDialogOpen(false);
      return;
    }

    const folderId =
      selectedFolderId === "uncategorized" ? null : selectedFolderId;

    try {
      setAssigningFolder(true);
      await onChangeConversationFolder(folderId);
      setFolderDialogOpen(false);
    } catch (error) {
      console.error("Failed to assign folder:", error);
    } finally {
      setAssigningFolder(false);
    }
  };

  const folderTooltip = !currentConversationId
    ? "Select or create a conversation to assign a folder."
    : isConversationTemporary
      ? "Temporary conversations cannot be assigned to folders."
      : isLoadingConversation
        ? "Please wait while the conversation loads."
        : "Change folder";

  const isExistingConversation = Boolean(currentConversationId);
  const temporaryIndicatorActive = isExistingConversation
    ? isConversationTemporary
    : isTemporaryMode;

  const temporaryTooltip = isExistingConversation
    ? isConversationTemporary
      ? "Temporary conversation. Click to make it permanent."
      : "Permanent conversation."
    : temporaryIndicatorActive
      ? "Temporary conversation will auto-delete after 24 hours."
      : "Permanent conversation (default).";

  const canToggleTemporary = isExistingConversation
    ? isConversationTemporary &&
      !isConvertingTemporary &&
      !isLoadingConversation
    : Boolean(setIsTemporaryMode) &&
      messages.length === 0 &&
      !isLoadingConversation;

  const handleTemporaryToggle = async () => {
    if (!canToggleTemporary) return;

    if (isExistingConversation) {
      if (isConversationTemporary && onConvertTemporaryConversation) {
        try {
          await onConvertTemporaryConversation();
        } catch (error) {
          console.error("Failed to convert temporary conversation:", error);
        }
      }
    } else if (setIsTemporaryMode) {
      setIsTemporaryMode(!isTemporaryMode);
    }
  };

  const renderFileStatusText = () => {
    if (transcriptionError) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ color: "red", fontWeight: 550, fontSize: "14px" }}>
            {transcriptionError}
          </Typography>
          <ReplayIcon
            onClick={handleRetryClick}
            sx={{
              color: "red",
              cursor: "pointer",
              "&:hover": { color: "darkred" },
            }}
          />
        </Box>
      );
    }

    if (hasError) return "File size exceeds 20MB limit";

    if (isTranscribing) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            sx={{ color: "#2688ac", fontWeight: 550, fontSize: "14px" }}
          >
            Transcribing audio
          </Typography>
          <CircularProgress size={18} sx={{ color: "#2688ac" }} />
        </Box>
      );
    }

    const name = originalFileName || selectedFile?.name || "";
    return name.length > 25 ? name.substring(0, 17) + "..." : name;
  };

  const handleSend = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!inputValue.trim() && !selectedFile) return;

    // Don't allow sending while transcribing
    if (isTranscribing) return;

    handleSendMessage();
    setInputValue("");
    handleRemoveFile();
  };

  const isInitialScreen = messages.length === 0;

  return (
    <>
      <Box
        sx={{
          margin: isInitialScreen ? "80px 40px 40px 40px" : "0 40px 40px 40px",
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
              {(selectedFile || hasError || isTranscribing) && (
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
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <IconFile
                      color={
                        hasError ? "red" : isTranscribing ? "#2688ac" : "black"
                      }
                      size={20}
                    />
                    <Typography
                      sx={{
                        color: hasError ? "red" : "black",
                        fontWeight: 550,
                        fontSize: "14px",
                      }}
                    >
                      {renderFileStatusText()}
                    </Typography>
                    {transcribe && !isTranscribing && !hasError && (
                      <IconButton
                        size="small"
                        onClick={onOpenTranscript}
                        sx={{
                          color: "red",
                          "&:hover": {
                            backgroundColor: "transparent",
                            color: "red",
                          },
                        }}
                      >
                        <IconEye size={18} />
                      </IconButton>
                    )}
                  </Box>

                  {!isTranscribing && (
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
                  )}
                </Box>
              )}

              <TextInput
                maxRows={3}
                multiline
                inputBaseStyles={{
                  maxHeight: "120px",
                  overflowY: "auto",
                  opacity: isLoadingConversation ? 0.5 : 1,
                  pointerEvents: isLoadingConversation ? "none" : "auto",
                }}
                inputType="InputBase"
                value={inputValue || ""}
                onChange={(e) => setInputValue(e.target.value)}
                inputStyles={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "8px",
                  padding: "8px 14px 8px 14px",
                  backgroundColor: "white",
                  color: "#060606",
                  outline: "none",
                  marginBottom: 2,
                }}
                placeholder="Ask anything..."
                onEnterPressed={() => {
                  if (!isLoadingConversation) {
                    handleSendMessage();
                    setInputValue("");
                    handleRemoveFile();
                  }
                }}
                disabled={isLoadingConversation}
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
                      borderRadius: "4px",
                      cursor: isLoadingConversation ? "not-allowed" : "pointer",
                      opacity: isLoadingConversation ? 0.5 : 1,
                      pointerEvents: isLoadingConversation ? "none" : "auto",
                    }}
                    onClick={
                      isLoadingConversation ? undefined : handleIconClick
                    }
                  >
                    <IconPlus size={16} />
                  </Box>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                    accept=".txt,.doc,.docx,.pdf,.xls,.xlsx,.csv,.pptx,audio/*"
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
                      {chatAIModels.length === 0 ? (
                        <Typography sx={{ padding: "8px", color: "gray" }}>
                          No models available
                        </Typography>
                      ) : (
                        chatAIModels.map((model) => (
                          <Box
                            key={model.modelId}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              cursor: "pointer",
                              padding: "8px",
                              borderRadius: "8px",
                              backgroundColor:
                                (selectedModel || currentModel?.modelId) ===
                                model.modelId
                                  ? "#FEF2F0"
                                  : "transparent",
                              "&:hover": { backgroundColor: "#FEF2F0" },
                            }}
                            onClick={() => {
                              setSelectedModel(model.modelId);
                              handleClose();
                            }}
                          >
                            <Typography
                              sx={{ fontSize: "14px", fontWeight: 550 }}
                            >
                              {model.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#A8A29E",
                                marginBottom: 0.5,
                              }}
                            >
                              {model.provider}
                            </Typography>
                            {model.description && (
                              <Typography
                                sx={{ fontSize: "12px", color: "gray" }}
                              >
                                {model.description}
                              </Typography>
                            )}
                          </Box>
                        ))
                      )}
                    </Box>
                  </Popover>
                  <Box
                    onClick={handleClick}
                    sx={{
                      backgroundColor: "white",
                      minWidth: "43px",
                      justifyContent: "center",
                      height: "27px",
                      display: "flex",
                      alignItems: "center",
                      paddingX: "6px",
                      gap: "4px",
                      borderRadius: "4px",
                      cursor: isLoadingConversation ? "not-allowed" : "pointer",
                      opacity: isLoadingConversation ? 0.5 : 1,
                      pointerEvents: isLoadingConversation ? "none" : "auto",
                    }}
                  >
                    <Typography>
                      {(() => {
                        const activeModelId =
                          selectedModel || currentModel?.modelId;
                        if (!activeModelId) {
                          return "Select Model";
                        }
                        const model =
                          chatAIModels.find(
                            (m) => m.modelId === activeModelId,
                          ) || currentModel;
                        return model?.name || activeModelId;
                      })()}
                    </Typography>
                    <IconChevronDown size={15} color="black" />
                  </Box>
                  <Tooltip title={temporaryTooltip}>
                    <Box
                      sx={{
                        width: "27px",
                        height: "27px",
                        backgroundColor: temporaryIndicatorActive
                          ? "#DC5E5E"
                          : "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "4px",
                        cursor: canToggleTemporary ? "pointer" : "not-allowed",
                        opacity: canToggleTemporary ? 1 : 0.5,
                      }}
                      onClick={handleTemporaryToggle}
                    >
                      {isConvertingTemporary ? (
                        <CircularProgress
                          size={16}
                          sx={{
                            color: temporaryIndicatorActive ? "white" : "#57534E",
                          }}
                        />
                      ) : temporaryIndicatorActive ? (
                        <IconEyeDotted size={18} color="white" />
                      ) : (
                        <IconEye size={18} color="black" />
                      )}
                    </Box>
                  </Tooltip>
                  <Box
                    onClick={
                      isLoadingConversation
                        ? undefined
                        : () => setWebSearchEnabled(!webSearchEnabled)
                    }
                    sx={{
                      width: "27px",
                      height: "27px",
                      backgroundColor: webSearchEnabled ? "#F5C4C4" : "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "4px",
                      cursor: isLoadingConversation ? "not-allowed" : "pointer",
                      opacity: isLoadingConversation ? 0.5 : 1,
                      pointerEvents: isLoadingConversation ? "none" : "auto",
                    }}
                  >
                    <IconWorld
                      size={18}
                      color={webSearchEnabled ? "red" : "black"}
                    />
                  </Box>

                  <Box
                    sx={{
                      backgroundColor: "white",
                      minWidth: "43px",
                      justifyContent: "center",
                      height: "27px",
                      display: "flex",
                      alignItems: "center",
                      paddingX: "6px",
                      gap: "4px",
                      borderRadius: "4px",
                      cursor: canAssignFolder ? "pointer" : "not-allowed",
                      opacity: canAssignFolder ? 1 : 0.5,
                    }}
                    onClick={handleOpenFolderDialog}
                  >
                    <Tooltip title={folderTooltip}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <IconFolder size={18} color="black" />
                        <Typography>
                          {currentFolderName || "Uncategorized"}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
                {isAnimating && onFastForwardAnimation && (
                  <IconButton
                    onClick={onFastForwardAnimation}
                    sx={{
                      backgroundColor: "red",
                      borderRadius: "50%",
                      padding: "5px",
                      marginRight: "8px",
                      "&:hover": {
                        backgroundColor: "darkred",
                      },
                    }}
                  >
                    <IconPlayerStopFilled
                      size={22}
                      stroke={2}
                      color="white"
                      fill="white"
                    />
                  </IconButton>
                )}
                <IconButton
                  data-click-class="ChatAI_Chat_Submission_Arrow"
                  data-click-id="Submission_Success"
                  onClick={handleSend}
                  disabled={
                    (!inputValue.trim() && !selectedFile) ||
                    hasError ||
                    isTranscribing ||
                    isLoadingConversation
                  }
                  sx={{
                    backgroundColor: hasError
                      ? "red"
                      : isTranscribing
                        ? "grey"
                        : inputValue || selectedFile
                          ? "red"
                          : "grey",
                    borderRadius: "50%",
                    padding: "5px",
                    "&:hover": {
                      backgroundColor: hasError
                        ? "darkred"
                        : isTranscribing
                          ? "gray"
                          : inputValue || selectedFile
                            ? "darkred"
                            : "gray",
                    },
                  }}
                >
                  <IconBrandTelegram
                    size={22}
                    stroke={2}
                    color={
                      hasError || isTranscribing
                        ? "grey"
                        : inputValue || selectedFile
                          ? "white"
                          : "grey"
                    }
                    fill={
                      hasError
                        ? "white"
                        : isTranscribing
                          ? "white"
                          : inputValue || selectedFile
                            ? "red"
                            : "white"
                    }
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
            margin: "0 40px 10px 40px",
            borderRadius: "12px",
            display: "flex",
            gap: "20px",
          }}
        >
          <SuggestionBox />
          <HelpBox />
        </Box>
      )}
      <Dialog
        open={folderDialogOpen}
        onClose={handleCloseFolderDialog}
        PaperProps={{
          style: { width: 416, minWidth: 400, borderRadius: 12 },
        }}
      >
        <DialogTitle
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          Select Folder
        </DialogTitle>
        <Divider style={{ borderColor: "#A8A29E", margin: "0 16px" }} />
        <DialogContent style={{ paddingTop: 16, paddingBottom: 16 }}>
          {foldersLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 3,
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List sx={{ maxHeight: 280, overflowY: "auto" }}>
              {folders.map((folder) => (
                <ListItemButton
                  key={folder.id}
                  selected={selectedFolderId === folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                >
                  <IconFolder size={18} style={{ paddingRight: 6 }} />
                  <ListItemText primary={folder.name} />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <Divider style={{ borderColor: "#A8A29E", margin: "0 16px" }} />
        <DialogActions
          style={{ justifyContent: "space-between", padding: "14px 16px" }}
        >
          <Button
            variant="contained"
            style={{
              backgroundColor: "#F5F5F4",
              border: "1px solid #78716C",
              color: "#78716C",
              borderRadius: 6,
              textTransform: "none",
              marginRight: 8,
            }}
            onClick={handleCloseFolderDialog}
            disabled={assigningFolder}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmFolderSelection}
            disabled={assigningFolder || foldersLoading}
            style={{
              backgroundColor: "#78716C",
              border: "1px solid #57534E",
              color: "#fff",
              borderRadius: 6,
              textTransform: "none",
            }}
          >
            {assigningFolder ? "Saving..." : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AIChatbotFooter;
