import { Box, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardActivityFeed from "./components/DashboardActivityFeed";
import DashboardQuickActionCard from "./components/DashboardQuickActionCard";
import DashboardSectionHeading from "./components/DashboardSectionHeading";
import DashboardStatCard from "./components/DashboardStatCard";
import {
  dashboardStats,
  quickActions,
  recentActivity,
} from "./dashboardData";

const DashboardContent = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: "100%", maxWidth: 1120, mx: "auto", pb: 6 }}>
      <Box sx={{ mb: { xs: 4, md: 5 } }}>
        <Typography
          sx={{
            fontSize: 26,
            fontWeight: 700,
            color: "text.primary",
            mb: 0.75,
            lineHeight: 1.2,
          }}
        >
          Welcome back
        </Typography>
        <Typography variant="body" sx={{ color: "neutral.600" }}>
          Here&apos;s what&apos;s happening in your AI workspace today.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: { xs: 4, md: 5 } }}>
        {dashboardStats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <DashboardStatCard stat={stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <DashboardSectionHeading>Quick Actions</DashboardSectionHeading>
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

        <Grid item xs={12} md={5}>
          <DashboardActivityFeed items={recentActivity} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardContent;
