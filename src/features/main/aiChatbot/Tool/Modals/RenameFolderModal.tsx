import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";

interface RenameFolderModalProps {
  open: boolean;
  onClose: () => void;
  onRename: (folderName: string) => void;
  initialName?: string;
}

const RenameFolderModal: React.FC<RenameFolderModalProps> = ({
  open,
  onClose,
  onRename,
  initialName = "",
}) => {
  const [folderName, setFolderName] = useState(initialName);
  const [error, setError] = useState("");

  // ✅ Sync input with initialName whenever modal opens
  useEffect(() => {
    if (open) {
      setFolderName(initialName);
      setError("");
    }
  }, [open, initialName]);

  const handleRename = () => {
    if (!folderName.trim()) {
      setError("Please enter a folder name to rename.");
      return;
    }

    const validRegex = /^[A-Za-z0-9_-]+$/;
    if (!validRegex.test(folderName)) {
      setError(
        "Folder names can only contain letters, numbers, dashes, and underscores."
      );
      return;
    }

    onRename(folderName.trim());
    setFolderName("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setFolderName(initialName);
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: { width: 316, minWidth: 300, borderRadius: 12 },
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
        Rename Folder
        <IconButton onClick={handleClose} size="small">
          <IconX />
        </IconButton>
      </DialogTitle>
      <Divider style={{ borderColor: "#A8A29E", margin: "0 16px" }} />
      <DialogContent style={{ paddingTop: 16, paddingBottom: 16 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          InputProps={{
            style: { backgroundColor: "#FAFAF9", borderRadius: 6 },
          }}
        />
        {error && (
          <Typography
            color="red"
            variant="caption"
            style={{ marginTop: 4, display: "block" }}
          >
            {error}
          </Typography>
        )}
      </DialogContent>
      <Divider style={{ borderColor: "#A8A29E", margin: "0 16px" }} />
      <DialogActions
        style={{ justifyContent: "space-between", padding: "8px 16px" }}
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
          onClick={handleRename}
          variant="contained"
          style={{
            backgroundColor: "#78716C",
            border: "1px solid #57534E",
            color: "#fff",
            borderRadius: 6,
            textTransform: "none",
          }}
        >
          Rename
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameFolderModal;
