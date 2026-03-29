import React from "react";
import { Box, Typography } from "@mui/material";
import { IconAlertTriangle } from "@tabler/icons-react";
import DefaultButton from "../layouts/DefaultButton";

export interface ErrorStateProps {
  title?: string;
  message: string;
  /** Primary action button */
  actionLabel?: string;
  onAction?: () => void;
  /** Secondary action (e.g. "Go back") */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      minHeight: 300,
      px: 4,
      py: 6,
    }}
  >
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: "14px",
        bgcolor: "#FEF2F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 0.5,
      }}
    >
      <IconAlertTriangle size={24} color="#E86D5A" strokeWidth={1.5} />
    </Box>
    <Typography
      sx={{
        fontSize: 18,
        fontWeight: 700,
        color: "#1C1917",
        letterSpacing: "-0.01em",
      }}
    >
      {title}
    </Typography>
    <Typography
      sx={{
        fontSize: 13,
        color: "#A8A29E",
        textAlign: "center",
        maxWidth: 360,
        lineHeight: 1.5,
      }}
    >
      {message}
    </Typography>
    {(actionLabel || secondaryLabel) && (
      <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
        {secondaryLabel && onSecondary && (
          <DefaultButton
            type="secondary"
            title={secondaryLabel}
            onClick={onSecondary}
            style={{ borderRadius: "8px", height: 40, width: 140, fontSize: 13 }}
          />
        )}
        {actionLabel && onAction && (
          <DefaultButton
            type="primary"
            title={actionLabel}
            onClick={onAction}
            style={{ borderRadius: "8px", height: 40, width: 140, fontSize: 13 }}
          />
        )}
      </Box>
    )}
  </Box>
);

export default ErrorState;
