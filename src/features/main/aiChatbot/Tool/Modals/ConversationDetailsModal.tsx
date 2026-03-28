import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { IconX, IconClock } from "@tabler/icons-react";
import {
  IConversation,
  IConversationFile,
  IFolder,
  IMessage,
} from "../../../../../types/response/conversations";
import {
  useFetchConversationQuery,
  useFetchMessagesQuery,
  usePurgeConversationMutation,
} from "../../../../../api/slices/conversationsApiSlice";
import PurgeFilesConfirmModal from "./PurgeFilesConfirmModal";

interface ConversationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  conversation: IConversation | null;
  folders: IFolder[];
  onSave: (
    conversationId: string,
    updates: { title?: string; folderId?: string },
  ) => void;
}

const ConversationDetailsModal: React.FC<ConversationDetailsModalProps> = ({
  open,
  onClose,
  conversation,
  folders,
  onSave,
}) => {
  const [title, setTitle] = React.useState("");
  const [selectedFolder, setSelectedFolder] = React.useState("");
  const conversationId = conversation?.id ?? "";

  const {
    data: conversationDetails,
    isFetching: conversationFetching,
    isError: conversationError,
    refetch: refetchConversationDetails,
  } = useFetchConversationQuery(conversationId, {
    skip: !open || !conversationId,
  });

  const {
    data: messagesData,
    isFetching: messagesFetching,
    isError: messagesError,
  } = useFetchMessagesQuery(conversationId, {
    skip: !open || !conversationId,
  });

  const effectiveConversation = conversationDetails ?? conversation ?? null;
  const files: IConversationFile[] = React.useMemo(
    () => effectiveConversation?.files ?? [],
    [effectiveConversation?.files],
  );
  const filesLoading = open && (conversationFetching || messagesFetching);
  const filesError = conversationError || messagesError;

  const detectedPdfMentions = React.useMemo(() => {
    if (!Array.isArray(messagesData)) return [];
    const mentions = new Set<string>();
    const pattern = /[^\s"'()]+\.(pdf|mp3|mp4|jpg|jpeg|png)\b/gi;
    messagesData.forEach((message: IMessage) => {
      const content = message?.content || "";
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => mentions.add(match));
      }
    });
    return Array.from(mentions);
  }, [messagesData]);

  // Check if PDF mentions in messages were sent AFTER the purge
  const pdfMentionsAfterPurge = React.useMemo(() => {
    if (!Array.isArray(messagesData) || !effectiveConversation?.lastPurgeLog) {
      return detectedPdfMentions;
    }

    const purgeDate = new Date(effectiveConversation.lastPurgeLog.createdAt);
    const mentionsAfterPurge = new Set<string>();
    const pattern = /[^\s"'()]+\.(pdf|mp3|mp4|jpg|jpeg|png)\b/gi;

    messagesData.forEach((message: IMessage) => {
      const messageDate = new Date(message.createdAt);
      if (messageDate > purgeDate) {
        const content = message?.content || "";
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach((match) => mentionsAfterPurge.add(match));
        }
      }
    });

    return Array.from(mentionsAfterPurge);
  }, [messagesData, effectiveConversation?.lastPurgeLog, detectedPdfMentions]);

  // Check if files were uploaded AFTER the purge
  const filesAfterPurge = React.useMemo(() => {
    if (!effectiveConversation?.lastPurgeLog) {
      return files;
    }

    const purgeDate = new Date(effectiveConversation.lastPurgeLog.createdAt);
    return files.filter((file) => {
      const fileDate = new Date(file.createdAt);
      return fileDate > purgeDate;
    });
  }, [files, effectiveConversation?.lastPurgeLog]);

  React.useEffect(() => {
    if (!effectiveConversation) {
      setPurgeCleared(false);
      return;
    }

    // Only set purgeCleared to true if there's a purge log AND no files/mentions after the purge
    const hasFilesAfterPurge = filesAfterPurge.length > 0;
    const hasMentionsAfterPurge = pdfMentionsAfterPurge.length > 0;

    setPurgeCleared(
      Boolean(effectiveConversation.lastPurgeLog) &&
        !hasFilesAfterPurge &&
        !hasMentionsAfterPurge,
    );
  }, [
    effectiveConversation,
    conversationId,
    filesAfterPurge,
    pdfMentionsAfterPurge,
  ]);

  const [triggerPurgeConversation, { isLoading: purgeLoading }] =
    usePurgeConversationMutation();
  const [showPurgeConfirm, setShowPurgeConfirm] = React.useState(false);
  const [purgeCleared, setPurgeCleared] = React.useState(false);

  React.useEffect(() => {
    if (!effectiveConversation) return;
    setTitle(effectiveConversation.title);
    setSelectedFolder(effectiveConversation.folderId || "");
  }, [effectiveConversation]);

  React.useEffect(() => {
    if (open && conversationId) {
      refetchConversationDetails();
    }
  }, [open, conversationId, refetchConversationDetails]);

  const handleSave = () => {
    if (effectiveConversation) {
      const updates: { title?: string; folderId?: string } = {
        title,
      };

      // Only include folderId if conversation is not temporary
      if (!effectiveConversation.isTemporary) {
        updates.folderId = selectedFolder || undefined;
      }

      onSave(effectiveConversation.id, updates);
      onClose();
    }
  };

  const rawHasUploadedFiles = filesAfterPurge.length > 0;
  const rawHasPdfMentions = pdfMentionsAfterPurge.length > 0;
  const shouldShowFileNotice =
    !purgeCleared && (rawHasUploadedFiles || rawHasPdfMentions);

  const handlePurgeFiles = async () => {
    if (!effectiveConversation) return;
    if (!rawHasUploadedFiles && !rawHasPdfMentions) {
      return;
    }

    try {
      const response = await triggerPurgeConversation(
        effectiveConversation.id,
      ).unwrap();
      if (response?.message) {
        console.info("Conversation purge recorded:", response.message);
      }

      setPurgeCleared(true);
      setShowPurgeConfirm(false);

      try {
        await refetchConversationDetails();
      } catch (refetchError) {
        console.error(
          "Failed to refetch conversation after purge:",
          refetchError,
        );
      }

      onClose();
    } catch (error) {
      console.error("Failed to purge files:", error);
    }
  };

  if (!effectiveConversation) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          width: 416,
          minWidth: 400,
          borderRadius: 12,
          padding: "0px",
        },
      }}
    >
      <DialogTitle
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        <Box style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          Conversation Details
          {conversation?.isTemporary && (
            <Chip
              icon={<IconClock size={14} />}
              label="Temporary"
              size="small"
              color="warning"
              style={{ fontSize: "11px" }}
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </DialogTitle>
      <Divider style={{ borderColor: "#A8A29E", margin: "0 16px" }} />
      <DialogContent style={{ paddingTop: 16, paddingBottom: 16 }}>
        <Box style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Temporary Conversation Alert */}
          {conversation?.isTemporary && (
            <Alert severity="info" icon={<IconClock size={20} />}>
              <Typography variant="body2" style={{ fontSize: "13px" }}>
                This is a temporary conversation. It will be automatically
                deleted after 24 hours of inactivity and cannot be assigned to
                folders.
              </Typography>
            </Alert>
          )}

          {/* Conversation Title */}
          <Box>
            <Typography
              variant="subtitle2"
              gutterBottom
              style={{ fontSize: 14 }}
            >
              Conversation Title:
            </Typography>
            <TextField
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter conversation title"
              variant="outlined"
              size="small"
              InputProps={{
                style: {
                  backgroundColor: "#FAFAF9",
                  borderRadius: 6,
                },
              }}
            />
          </Box>

          {/* AI Model */}
          <Box>
            <Typography
              variant="subtitle2"
              gutterBottom
              style={{ fontSize: 14 }}
            >
              Model:
            </Typography>
            <TextField
              fullWidth
              value={effectiveConversation.aiModel || "N/A"}
              disabled
              variant="outlined"
              size="small"
              InputProps={{
                style: {
                  backgroundColor: "#FAFAF9",
                  borderRadius: 6,
                },
              }}
            />
          </Box>

          {/* Folder */}
          <Box>
            <Typography
              variant="subtitle2"
              gutterBottom
              style={{ fontSize: 14 }}
            >
              Folder:
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                style={{ backgroundColor: "#FAFAF9", borderRadius: 8 }}
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                displayEmpty
                disabled={effectiveConversation?.isTemporary}
                renderValue={(selected) => {
                  const folder = folders.find((f) => f.id === selected);
                  return folder ? folder.name : selected;
                }}
              >
                {folders.map((folder) => (
                  <MenuItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {effectiveConversation?.isTemporary && (
              <Typography
                variant="caption"
                style={{ color: "#57534E", marginTop: "4px", display: "block" }}
              >
                Temporary conversations cannot be assigned to folders
              </Typography>
            )}
          </Box>

          {/* Files Info */}
          <Box>
            <Typography
              variant="subtitle2"
              gutterBottom
              style={{ fontSize: 14 }}
            >
              Files:
            </Typography>
            <Box
              style={{
                padding: "12px",
                backgroundColor: "#F5F5F4",
                borderRadius: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {filesLoading ? (
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CircularProgress size={18} />
                  <Typography variant="body2" style={{ color: "#57534E" }}>
                    Checking for files...
                  </Typography>
                </Box>
              ) : filesError ? (
                <Typography variant="body2" style={{ color: "#DC5E5E" }}>
                  Unable to load files for this conversation right now.
                </Typography>
              ) : !shouldShowFileNotice ? (
                <Typography variant="body2" style={{ color: "#57534E" }}>
                  {purgeCleared
                    ? "Files were purged for this conversation. No files found in the vector store."
                    : "No files found in the vector store for this conversation."}
                </Typography>
              ) : (
                <>
                  <Typography variant="body2" style={{ color: "#1C1917" }}>
                    Files uploaded to this chat exist on the vector store.
                  </Typography>
                  <Box
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setShowPurgeConfirm(true)}
                      disabled={purgeLoading}
                      style={{
                        textTransform: "none",
                        color: "#DC5E5E",
                        padding: 0,
                        minWidth: 0,
                      }}
                    >
                      {purgeLoading ? "Purging..." : "Purge files"}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <Divider style={{ borderColor: "#A8A29E", margin: "8px 16px" }} />
      <DialogActions
        style={{ justifyContent: "space-between", padding: "12px 16px" }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          style={{
            backgroundColor: "#F5F5F4",
            border: "1px solid #78716C",
            color: "#78716C",
            borderRadius: 6,
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          style={{
            backgroundColor: "#78716C",
            border: "1px solid #57534E",
            color: "#ffffff",
            borderRadius: 6,
            textTransform: "none",
          }}
        >
          Save
        </Button>
      </DialogActions>
      <PurgeFilesConfirmModal
        open={showPurgeConfirm}
        onClose={() => setShowPurgeConfirm(false)}
        onConfirm={handlePurgeFiles}
        loading={purgeLoading}
      />
    </Dialog>
  );
};

export default ConversationDetailsModal;
