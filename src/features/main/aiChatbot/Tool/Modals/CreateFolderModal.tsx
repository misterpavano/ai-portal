import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";

interface CreateFolderModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (folderName: string) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!folderName.trim()) {
      setError("Please enter a folder name to create a new folder.");
      return;
    }

    const validRegex = /^[A-Za-z0-9_-]+$/;
    if (!validRegex.test(folderName)) {
      setError(
        "Folder names can only contain letters, numbers, dashes, and underscores."
      );
      return;
    }

    onCreate(folderName.trim());
    setFolderName("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setFolderName("");
    setError("");
    onClose();
  };

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
        Create Folder
        <IconButton onClick={handleClose} size="small">
          <IconX />
        </IconButton>
      </DialogTitle>
      <Divider style={{ borderColor: "#A8A29E", margin: "0 16px" }} />
      <DialogContent style={{ paddingTop: 16, paddingBottom: 16 }}>
        <Typography variant="subtitle2" gutterBottom style={{ fontSize: 14 }}>
          Folder Name:
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          InputProps={{
            style: {
              backgroundColor: "#FAFAF9",
              borderRadius: 6,
            },
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
        <Typography
          variant="body2"
          style={{ marginTop: "10px", color: "#57534E", fontSize: 13 }}
        >
          Use folders to group and organize your AI bot conversations by
          project, topic, or client for quick access and cleaner navigation.
        </Typography>
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
          onClick={handleCreate}
          variant="contained"
          style={{
            backgroundColor: "#78716C",
            border: "1px solid #57534E",
            color: "#ffffff",
            borderRadius: 6,
            textTransform: "none",
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateFolderModal;
