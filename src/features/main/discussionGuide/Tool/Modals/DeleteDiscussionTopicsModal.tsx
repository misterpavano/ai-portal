import { useState } from "react";
import { Box, Popover, Typography } from "@mui/material";
import { IconXboxXFilled } from "@tabler/icons-react";
import DefaultButton from "../../../../../components/layouts/DefaultButton";

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  onDelete: () => void;
}

const DeleteDiscussionTopicsModal: React.FC<DeleteModalProps> = ({
  open,
  onClose,
  anchorEl,
  onDelete,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = () => {
    setIsLoading(true);
    onDelete();
    setIsLoading(false);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0px 0px 14px 0px rgba(0, 0, 0, 0.25)",
          border: "1px solid #D6D3D1",
        },
      }}
    >
      <Box
        sx={{
          marginTop: 1,
          pb: 2,
          pr: "20px",
          pl: "20px",
          pt: 4,
          backgroundColor: "white",
          borderRadius: 2,
          width: 250,
          position: "relative",
        }}
      >
        <Box sx={{ marginBottom: 1 }}>
          <IconXboxXFilled
            onClick={onClose}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 30,
              height: 18,
              borderRadius: "50%",
              cursor: "pointer",
            }}
            size={15}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Typography
            sx={{ fontWeight: "bold", fontSize: "16px", textAlign: "center" }}
          >
            Are you sure?
          </Typography>
          <Typography sx={{ fontSize: "13px", textAlign: "center" }}>
            You want to remove this topic and all questions within this topic?
          </Typography>
        </Box>
        <Box px={1} gap={2} mt={2} display="flex" justifyContent="center">
          <DefaultButton
            style={{
              borderRadius: "5px",
              height: "auto",
              padding: "5px 10px",
              lineHeight: "1em !important",
              width: "100%",
              flex: 1,
            }}
            textStyle={{ fontSize: "12px" }}
            title={"Cancel"}
            type="secondary"
            onClick={onClose}
            disabled={isLoading}
          />
          <DefaultButton
            style={{
              borderRadius: "5px",
              height: "auto",
              padding: "5px 10px",
              lineHeight: "1em !important",
              width: "100%",
              flex: 1,
            }}
            textStyle={{ fontSize: "12px" }}
            title={isLoading ? "Removing..." : "Remove"}
            type="primary"
            onClick={handleDelete}
            disabled={isLoading}
          />
        </Box>
      </Box>
    </Popover>
  );
};

export default DeleteDiscussionTopicsModal;
