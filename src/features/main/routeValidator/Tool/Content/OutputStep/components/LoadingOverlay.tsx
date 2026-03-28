import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { LoadingOverlayProps } from "../types";

/**
 * Loading overlay component shown during validation
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        zIndex: 1000,
        borderRadius: "8px",
      }}
    >
      <CircularProgress size={60} sx={{ marginBottom: 3 }} />
      <Typography
        sx={{
          fontSize: "18px",
          fontWeight: 600,
          color: "text.primary",
          textAlign: "center",
        }}
      >
        Validating your document...
      </Typography>
      <Typography
        sx={{
          fontSize: "14px",
          color: "text.secondary",
          textAlign: "center",
          marginTop: 1,
        }}
      >
        Please wait while we analyze your document for issues.
      </Typography>
    </Box>
  );
};

export default LoadingOverlay;
