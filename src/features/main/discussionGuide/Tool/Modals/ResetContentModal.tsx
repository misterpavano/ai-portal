import React from "react";
import { Dialog, Box, Typography } from "@mui/material";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { IconXboxXFilled } from "@tabler/icons-react";

type ResetContentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ResetContentModal: React.FC<ResetContentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="reset-content-title"
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
            sx={{
              fontWeight: "bold",
              fontSize: "16px",
              textAlign: "center",
              marginBottom: 2,
            }}
          >
            Reset content?
          </Typography>
          <Typography sx={{ fontSize: "13px", textAlign: "center" }}>
            You are about to lose the content generated on this screen. Click OK
            to proceed.
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
            title={"OK"}
            type="primary"
            onClick={onConfirm}
          />
        </Box>
      </Box>
    </Dialog>
  );
};

export default ResetContentModal;
