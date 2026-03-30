import React from "react";
import { Box, Typography } from "@mui/material";

/* ─── Shared help building blocks ─────────────────────────────────────── */

export const HelpPage: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <Box sx={{ p: 3, maxWidth: 720 }}>
    <Typography
      sx={{
        fontSize: 20,
        fontWeight: 800,
        color: "#1C1917",
        mb: 0.5,
        letterSpacing: "-0.02em",
      }}
    >
      {title}
    </Typography>
    <Typography
      sx={{ fontSize: 14, color: "#78716C", mb: 4, lineHeight: 1.5 }}
    >
      {description}
    </Typography>
    {children}
  </Box>
);

export const Section: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography
      sx={{
        fontSize: 16,
        fontWeight: 700,
        color: "#1C1917",
        mb: 1.5,
        letterSpacing: "-0.01em",
      }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

export const Step: React.FC<{
  number: number;
  title: string;
  children: React.ReactNode;
}> = ({ number, title, children }) => (
  <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: "8px",
        bgcolor: "#1C1917",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
        mt: "2px",
      }}
    >
      {number}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography
        sx={{ fontSize: 14, fontWeight: 700, color: "#1C1917", mb: 0.75 }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#78716C", lineHeight: 1.6 }}>
        {children}
      </Typography>
    </Box>
  </Box>
);

export const Feature: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "8px",
        bgcolor: "#F5F5F4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        mt: "2px",
      }}
    >
      <Icon size={16} color="#78716C" strokeWidth={1.5} />
    </Box>
    <Box>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: "#1C1917",
          lineHeight: 1.4,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#78716C", lineHeight: 1.5 }}>
        {description}
      </Typography>
    </Box>
  </Box>
);

export const Tip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      mt: 2,
      p: 2,
      borderRadius: "10px",
      bgcolor: "#FAFAF9",
      border: "1px solid #E7E5E4",
    }}
  >
    <Typography sx={{ fontSize: 12, color: "#A8A29E", lineHeight: 1.5 }}>
      <strong>Tip:</strong> {children}
    </Typography>
  </Box>
);
