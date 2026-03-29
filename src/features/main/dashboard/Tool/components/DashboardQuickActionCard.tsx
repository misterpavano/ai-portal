import { Box, Typography } from "@mui/material";
import { IconArrowUpRight } from "@tabler/icons-react";
import { QuickAction } from "../dashboardData";

type DashboardQuickActionCardProps = {
  action: QuickAction;
  onSelect: (path: string) => void;
};

const DashboardQuickActionCard = ({
  action,
  onSelect,
}: DashboardQuickActionCardProps) => {
  const Icon = action.icon;

  return (
    <Box
      onClick={() => onSelect(action.path)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2.5,
        p: 2.5,
        borderRadius: "14px",
        border: "1px solid #E7E5E4",
        bgcolor: "#FFFFFF",
        cursor: "pointer",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: "#E86D5A",
          bgcolor: "#FEF2F0",
          transform: "translateX(4px)",
          "& .action-arrow": {
            opacity: 1,
            color: "#E86D5A",
          },
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "12px",
          bgcolor: "#1C1917",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} color="#FFFFFF" strokeWidth={1.5} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            color: "#1C1917",
            mb: 0.25,
            letterSpacing: "-0.01em",
          }}
        >
          {action.title}
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            color: "#78716C",
            lineHeight: 1.5,
          }}
        >
          {action.description}
        </Typography>
      </Box>
      <Box
        className="action-arrow"
        sx={{
          opacity: 0.3,
          color: "#A8A29E",
          transition: "all 0.15s ease",
          flexShrink: 0,
        }}
      >
        <IconArrowUpRight size={18} />
      </Box>
    </Box>
  );
};

export default DashboardQuickActionCard;
