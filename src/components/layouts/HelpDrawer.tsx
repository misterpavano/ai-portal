import React from "react";
import { Box, Drawer, IconButton, Typography } from "@mui/material";
import { IconX } from "@tabler/icons-react";

import RouteValidatorHelp from "../../features/main/routeValidator/Help/RouteValidatorHelp";

interface HelpDrawerProps {
  open: boolean;
  onClose: () => void;
}

const HelpDrawer: React.FC<HelpDrawerProps> = ({ open, onClose }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 520 },
          maxWidth: "100vw",
          borderLeft: "1px solid #E7E5E4",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 1.5,
          borderBottom: "1px solid #E7E5E4",
          minHeight: 56,
        }}
      >
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            color: "#1C1917",
            letterSpacing: "-0.01em",
          }}
        >
          Extra Editor Help
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#A8A29E",
            "&:hover": { color: "#1C1917", backgroundColor: "#F5F5F4" },
          }}
        >
          <IconX size={18} stroke={1.5} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <RouteValidatorHelp />
      </Box>
    </Drawer>
  );
};

export default HelpDrawer;
