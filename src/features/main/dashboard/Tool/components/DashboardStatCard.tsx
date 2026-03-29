import { Box, Typography } from "@mui/material";
import { DashboardStat } from "../dashboardData";

type DashboardStatCardProps = {
  stat: DashboardStat;
  index: number;
};

const DashboardStatCard = ({ stat, index }: DashboardStatCardProps) => {
  const Icon = stat.icon;

  return (
    <Box
      sx={{
        px: 3,
        py: 3.5,
        borderRight: index < 3 ? { md: "1px solid rgba(255,255,255,0.08)" } : "none",
        borderBottom: index < 2 ? { xs: "1px solid rgba(255,255,255,0.08)", md: "none" } : { xs: index === 2 ? "1px solid rgba(255,255,255,0.08)" : "none", md: "none" },
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: "24px",
          right: "24px",
          height: "2px",
          background: "linear-gradient(90deg, #E86D5A, #C4A35A)",
          opacity: 0,
          transition: "opacity 0.2s ease",
        },
        "&:hover::before": {
          opacity: 1,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
        }}
      >
        <Icon size={16} color="#78716C" strokeWidth={1.5} />
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "#78716C",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {stat.label}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: { xs: 32, md: 38 },
          fontWeight: 800,
          color: "#FFFFFF",
          lineHeight: 1,
          letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {stat.value}
      </Typography>
    </Box>
  );
};

export default DashboardStatCard;
