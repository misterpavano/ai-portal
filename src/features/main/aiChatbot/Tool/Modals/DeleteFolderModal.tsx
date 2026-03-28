import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Typography,
  Button,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
} from "@mui/material";
import { IconX, IconFolder } from "@tabler/icons-react";

interface DeleteFolderModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: (option: "uncategorized" | "delete") => void;
  folderName: string;
}

const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({
  open,
  onClose,
  onDelete,
  folderName,
}) => {
  const [option, setOption] = useState<"uncategorized" | "delete">("uncategorized"); // default selection

  const handleDelete = () => {
    onDelete(option);
    setOption("uncategorized");
    onClose();
  };

  const handleClose = () => {
    setOption("uncategorized");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        Delete Folder
        <IconButton onClick={handleClose} size="small">
          <IconX />
        </IconButton>
      </DialogTitle>
      <Divider style={{ borderColor: "#A8A29E", margin: "0 16px" }} />
      <DialogContent style={{ paddingTop: 16, paddingBottom: 16 }}>
        {/* Folder name box */}
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#E7E5E4",
            borderRadius: 6,
            padding: "4px 8px",
            marginBottom: 12,
          }}
        >
          <IconFolder size={18} style={{ marginRight: 8 }} />
          <Typography>{folderName}</Typography>
        </Box>
        <Typography
          variant="body2"
          style={{ fontSize: 13, color: "#57534E", marginBottom: 12 }}
        >
          You’re about to delete this folder. You can choose to either delete
          all conversations inside it or simply remove the folder and mark those
          conversations as uncategorized. This action cannot be undone.
        </Typography>

        {/* Radio options */}
        <RadioGroup value={option} onChange={(e) => setOption(e.target.value as "uncategorized" | "delete")}>
          <FormControlLabel
            value="uncategorized"
            control={<Radio />}
            label="Mark all conversations within this folder as uncategorized."
            sx={{ "& .MuiFormControlLabel-label": { fontSize: "12px" } }}
          />
          <FormControlLabel
            value="delete"
            control={<Radio />}
            label="Delete all conversations within this folder."
            sx={{ "& .MuiFormControlLabel-label": { fontSize: "12px" } }}
          />
        </RadioGroup>
      </DialogContent>
      <Divider style={{ borderColor: "#A8A29E", margin: "0 16px" }} />
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
            marginRight: 8,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          style={{
            backgroundColor: "#78716C",
            border: "1px solid #57534E",
            color: "#fff",
            borderRadius: 6,
            textTransform: "none",
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteFolderModal;
