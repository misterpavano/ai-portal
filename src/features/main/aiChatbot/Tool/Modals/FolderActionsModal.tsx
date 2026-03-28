import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { IconPencil, IconTrash } from "@tabler/icons-react";

interface FolderActionsModalProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
}

const FolderActionsModal: React.FC<FolderActionsModalProps> = ({
  anchorEl,
  open,
  onClose,
  onRename,
  onDelete,
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
          borderRadius: 2, // rounded corners
          minWidth: 160, // slightly wider
        },
      }}
    >
      <MenuItem
        sx={{ fontSize: "0.875rem", py: 1 }}
        onClick={() => {
          onRename();
          onClose();
        }}
      >
        <ListItemIcon>
          <IconPencil size={18} />
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{ fontSize: "0.875rem" }}>
          Rename
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

export default FolderActionsModal;
