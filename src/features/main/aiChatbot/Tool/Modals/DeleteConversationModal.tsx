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
  Divider,
} from "@mui/material";
import { IconX, IconMessages } from "@tabler/icons-react";

interface DeleteConversationModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  conversationTitle: string;
  isLoading?: boolean;
}

const DeleteConversationModal: React.FC<DeleteConversationModalProps> = ({
  open,
  onClose,
  onDelete,
  conversationTitle,
  isLoading = false,
}) => {
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
        Delete Conversation
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </DialogTitle>
      <Divider style={{ borderColor: "#A8A29E", margin: "0 16px" }} />
      <DialogContent>
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            padding: "16px 0",
          }}
        >
          <Box
            style={{
              display: "flex",
              gap: 10,
              padding: "10px 10px",
              backgroundColor: "#F5F5F4",
              borderRadius: "8px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <IconMessages size={32} color="#57534E" />
            <Typography
              variant="body1"
              style={{ fontWeight: 600, color: "#555555" }}
            >
              {conversationTitle}
            </Typography>
          </Box>

          {/* Warning Message */}
          <Typography
            variant="body2"
            style={{ textAlign: "center", color: "#57534E" }}
          >
            You're about to delete this conversation. This will permanently
            remove all messages and any uploaded files linked to it. This action
            cannot be undone.
          </Typography>
        </Box>
      </DialogContent>
      <Divider style={{ borderColor: "#A8A29E", margin: "8px 16px" }} />
      <DialogActions
        style={{ justifyContent: "space-between", padding: "14px 16px" }}
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
          onClick={onDelete}
          variant="contained"
          style={{
            backgroundColor: "#78716C",
            border: "1px solid #57534E",
            color: "#ffffff",
            borderRadius: 6,
            textTransform: "none",
          }}
          disabled={isLoading}
        >
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConversationModal;
