import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Divider,
} from "@mui/material";
import {
  IconProgressCheck,
  IconBroadcast,
  IconArrowRight,
  IconFileAnalytics,
  IconClock,
  IconCheck,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useTheme } from "@mui/material/styles";

// ── Mock data ────────────────────────────────────────────────────────────────

const mockStats = [
  {
    label: "Documents Processed",
    value: "47",
    icon: <IconFileAnalytics size={20} />,
  },
  {
    label: "Sessions Today",
    value: "3",
    icon: <IconClock size={20} />,
  },
  {
    label: "Tasks Completed",
    value: "12",
    icon: <IconCheck size={20} />,
  },
  {
    label: "Efficiency Gain",
    value: "68%",
    icon: <IconTrendingUp size={20} />,
  },
];

const quickActions = [
  {
    title: "Route Assistant",
    description:
      "Validate and review route documents with AI-powered analysis",
    path: "/route-assistant",
    icon: <IconProgressCheck size={26} />,
  },
  {
    title: "Audio to Text",
    description:
      "Transcribe audio files into structured, reviewable text content",
    path: "/audio-to-text",
    icon: <IconBroadcast size={26} />,
  },
];

const mockActivity = [
  {
    action: "Route document validated",
    tool: "Route Assistant",
    time: "2 hours ago",
  },
  {
    action: "Audio file transcribed",
    tool: "Audio to Text",
    time: "5 hours ago",
  },
  {
    action: "Route review completed",
    tool: "Route Assistant",
    time: "Yesterday",
  },
  {
    action: "Transcription exported",
    tool: "Audio to Text",
    time: "2 days ago",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

const DashboardContent = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ maxWidth: 1100, pb: 6 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 5 }}>
        <Typography
          sx={{
            fontSize: 26,
            fontWeight: 700,
            color: "text.primary",
            mb: 0.75,
            lineHeight: 1.2,
          }}
        >
          Welcome back 👋
        </Typography>
        <Typography sx={{ color: "neutral.600", fontSize: 14 }}>
          Here's what's happening in your AI workspace today.
        </Typography>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {mockStats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "neutral.300",
                borderRadius: 3,
                bgcolor: "white",
                boxShadow: theme.customShadows.raised,
              }}
            >
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    bgcolor: "accent.50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "accent.main",
                    mb: 2,
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography
                  sx={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "text.primary",
                    lineHeight: 1,
                    mb: 0.5,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "neutral.600" }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions + Recent Activity */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={7}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              mb: 2,
            }}
          >
            Quick Actions
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {quickActions.map((action) => (
              <Card
                key={action.title}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "neutral.300",
                  borderRadius: 3,
                  bgcolor: "white",
                  boxShadow: theme.customShadows.raised,
                  transition: "all 150ms ease-out",
                  "&:hover": {
                    borderColor: "accent.main",
                    boxShadow: theme.customShadows.elevated,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(action.path)}
                  sx={{ borderRadius: 3 }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 2.5,
                            bgcolor: "accent.50",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "accent.main",
                            flexShrink: 0,
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "text.primary",
                              mb: 0.25,
                            }}
                          >
                            {action.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: "neutral.600",
                              lineHeight: 1.4,
                            }}
                          >
                            {action.description}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ flexShrink: 0, pl: 1 }}>
                        <IconArrowRight
                          size={16}
                          color={theme.palette.neutral[500]}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={5}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              mb: 2,
            }}
          >
            Recent Activity
          </Typography>
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "neutral.300",
              borderRadius: 3,
              bgcolor: "white",
              boxShadow: theme.customShadows.raised,
            }}
          >
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              {mockActivity.map((item, index) => (
                <React.Fragment key={index}>
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: "success.main",
                        flexShrink: 0,
                        mt: "2px",
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "text.primary",
                          fontWeight: 500,
                          mb: 0.25,
                        }}
                        noWrap
                      >
                        {item.action}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "neutral.500" }}>
                        {item.tool} · {item.time}
                      </Typography>
                    </Box>
                  </Box>
                  {index < mockActivity.length - 1 && (
                    <Divider sx={{ mx: 2.5, borderColor: "neutral.200" }} />
                  )}
                </React.Fragment>
              ))}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderTop: "1px solid",
                  borderColor: "neutral.200",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "neutral.500",
                    textAlign: "center",
                  }}
                >
                  Showing last 4 activities
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardContent;
