import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Button,
  IconButton,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { IConversation, IFolder } from "../../../../../types/response/conversations";

interface MoveToFolderModalProps {
  open: boolean;
  onClose: () => void;
  onMove: (conversationId: string, folderId: string | undefined) => void;
  conversation: IConversation | null;
  folders: IFolder[];
}

const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({
  open,
  onClose,
  onMove,
  conversation,
  folders,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>("");

  useEffect(() => {
    if (conversation && open) {
      setSelectedFolder(conversation.folderId || "");
    }
  }, [conversation, open]);

  const handleMove = () => {
    if (!conversation) return;
    // If empty string, pass undefined to move to uncategorized
    const folderId = selectedFolder ? selectedFolder : undefined;
    onMove(conversation.id, folderId);
    onClose();
  };

  const handleClose = () => {
    setSelectedFolder(conversation?.folderId || "");
    onClose();
  };

  if (!conversation) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        Move to Folder
        <IconButton onClick={handleClose} size="small">
          <IconX />
        </IconButton>
      </DialogTitle>
      <Divider style={{ borderColor: "#A8A29E", margin: "0 16px" }} />
      <DialogContent style={{ paddingTop: 16, paddingBottom: 16 }}>
        <Typography variant="subtitle2" gutterBottom style={{ fontSize: 14 }}>
          Select Folder:
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            style={{ backgroundColor: "#FAFAF9", borderRadius: 8 }}
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            displayEmpty
            disabled={conversation?.isTemporary}
            renderValue={(selected) => {
              if (!selected) {
                return "Uncategorized";
              }
              const folder = folders.find((f) => f.id === selected);
              return folder ? folder.name : "Uncategorized";
            }}
          >
            <MenuItem value="">
              <em>Uncategorized</em>
            </MenuItem>
            {folders.map((folder) => (
              <MenuItem key={folder.id} value={folder.id}>
                {folder.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {conversation?.isTemporary && (
          <Typography
            variant="caption"
            style={{ color: "#57534E", marginTop: "4px", display: "block" }}
          >
            Temporary conversations cannot be moved to folders
          </Typography>
        )}
      </DialogContent>
      <Divider style={{ borderColor: "#A8A29E", margin: "8px 16px" }} />
      <DialogActions
        style={{ justifyContent: "space-between", padding: "10px 16px" }}
      >
        <Button
          onClick={handleClose}
          variant="contained"
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
          onClick={handleMove}
          variant="contained"
          disabled={conversation?.isTemporary}
          style={{
            backgroundColor: "#78716C",
            border: "1px solid #57534E",
            color: "#ffffff",
            borderRadius: 6,
            textTransform: "none",
          }}
        >
          Move
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveToFolderModal;

