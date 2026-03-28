import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { IconFileText, IconTrash, IconFolder } from "@tabler/icons-react";

interface ConversationActionsModalProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onViewDetails: () => void;
  onDelete: () => void;
  onMoveToFolder: () => void;
}

const ConversationActionsModal: React.FC<ConversationActionsModalProps> = ({
  anchorEl,
  open,
  onClose,
  onViewDetails,
  onDelete,
  onMoveToFolder,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: 160,
        },
      }}
    >
      <MenuItem
        onClick={() => {
          onViewDetails();
          onClose();
        }}
        sx={{ fontSize: "0.875rem", py: 1 }}
      >
        <ListItemIcon>
          <IconFileText size={18} />
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{ fontSize: "0.875rem" }}>
          Conversation Details
        </ListItemText>
      </MenuItem>
      <MenuItem
        onClick={() => {
          onMoveToFolder();
          onClose();
        }}
        sx={{ fontSize: "0.875rem", py: 1 }}
      >
        <ListItemIcon>
          <IconFolder size={18} />
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{ fontSize: "0.875rem" }}>
          Move to Folder
        </ListItemText>
      </MenuItem>
      <MenuItem
        sx={{ fontSize: "0.875rem", py: 1 }}
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        <ListItemIcon style={{ minWidth: "36px" }}>
          <IconTrash size={20} />
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{ fontSize: "0.875rem" }}>
          Delete
        </ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default ConversationActionsModal;
