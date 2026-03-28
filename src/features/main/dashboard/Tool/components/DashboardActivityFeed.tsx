import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ActivityItem } from "../dashboardData";
import DashboardSectionHeading from "./DashboardSectionHeading";

type DashboardActivityFeedProps = {
  items: ActivityItem[];
};

const DashboardActivityFeed = ({ items }: DashboardActivityFeedProps) => {
  const theme = useTheme();

  return (
    <Box>
      <DashboardSectionHeading>Recent Activity</DashboardSectionHeading>
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "neutral.300",
          borderRadius: 3,
          bgcolor: "common.white",
          boxShadow: theme.customShadows.raised,
          height: "100%",
        }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          {items.map((item, index) => (
            <Box key={`${item.action}-${item.time}`}>
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
                  <Typography variant="xsmall" sx={{ color: "neutral.500" }}>
                    {item.tool} · {item.time}
                  </Typography>
                </Box>
              </Box>
              {index < items.length - 1 && (
                <Divider sx={{ mx: 2.5, borderColor: "neutral.200" }} />
              )}
            </Box>
          ))}
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              borderTop: "1px solid",
              borderColor: "neutral.200",
            }}
          >
            <Typography variant="xsmall" sx={{ color: "neutral.500", textAlign: "center" }}>
              Showing last 4 activities
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardActivityFeed;
