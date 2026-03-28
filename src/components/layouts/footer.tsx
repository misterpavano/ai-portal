import React, { ReactNode } from "react";
import { Box } from "@mui/material";

interface FooterProps {
  children: ReactNode;
  footer: ReactNode;
}

const Footer: React.FC<FooterProps> = ({ children, footer }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>{children}</Box>
      <Box sx={{ flexShrink: 0, borderTop: "1.4px solid", borderColor: "neutral.200" }}>
        {footer}
      </Box>
    </Box>
  );
};

export default Footer;
