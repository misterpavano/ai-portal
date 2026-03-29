import { Box, Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import DashboardActivityFeed from "./components/DashboardActivityFeed";
import DashboardQuickActionCard from "./components/DashboardQuickActionCard";
import DashboardStatCard from "./components/DashboardStatCard";
import { dashboardStats, quickActions, recentActivity } from "./dashboardData";

const DashboardContent = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", pb: 8 }}>
      {/* Hero greeting — editorial style */}
      <Box
        sx={{
          mb: 5,
          pt: 1,
          borderBottom: "1px solid",
          borderColor: "neutral.300",
          pb: 4,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: 800,
            color: "#1C1917",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            mb: 1,
          }}
        >
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 17
            ? "afternoon"
            : "evening"}
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            color: "#78716C",
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        >
          Here's your workspace overview for{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Typography>
      </Box>

      {/* Stats ribbon — horizontal, no cards, clean data */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 0,
          mb: 5,
          bgcolor: "#1C1917",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {dashboardStats.map((stat, index) => (
          <DashboardStatCard key={stat.label} stat={stat} index={index} />
        ))}
      </Box>

      {/* Main content — asymmetric split */}
      <Grid container spacing={4}>
        {/* Left column — tools */}
        <Grid item xs={12} md={7}>
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#A8A29E",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                mb: 0.5,
              }}
            >
              Tools
            </Typography>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: "#1C1917",
                letterSpacing: "-0.01em",
              }}
            >
              Quick Actions
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {quickActions.map((action) => (
              <DashboardQuickActionCard
                key={action.title}
                action={action}
                onSelect={navigate}
              />
            ))}
          </Box>
        </Grid>

        {/* Right column — activity */}
        <Grid item xs={12} md={5}>
          <DashboardActivityFeed items={recentActivity} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardContent;
