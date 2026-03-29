import { Box, Typography } from "@mui/material";
import { ActivityItem } from "../dashboardData";

type DashboardActivityFeedProps = {
  items: ActivityItem[];
};

const DashboardActivityFeed = ({ items }: DashboardActivityFeedProps) => {
  return (
    <Box>
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
          Activity
        </Typography>
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 700,
            color: "#1C1917",
            letterSpacing: "-0.01em",
          }}
        >
          Recent
        </Typography>
      </Box>

      {/* Timeline */}
      <Box sx={{ position: "relative" }}>
        {/* Vertical line */}
        <Box
          sx={{
            position: "absolute",
            left: "11px",
            top: "12px",
            bottom: "12px",
            width: "1px",
            bgcolor: "#E7E5E4",
          }}
        />

        {items.map((item, index) => (
          <Box
            key={`${item.action}-${item.time}`}
            sx={{
              display: "flex",
              gap: 2,
              py: 2,
              position: "relative",
              "&:first-of-type": { pt: 0 },
              "&:last-of-type": { pb: 0 },
            }}
          >
            {/* Dot */}
            <Box
              sx={{
                width: 23,
                display: "flex",
                justifyContent: "center",
                flexShrink: 0,
                pt: "3px",
              }}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  bgcolor: index === 0 ? "#E86D5A" : "#D6D3D1",
                  border: "2px solid",
                  borderColor: index === 0 ? "#FEF2F0" : "#F5F5F4",
                  boxShadow: index === 0 ? "0 0 0 2px #E86D5A" : "none",
                  zIndex: 1,
                }}
              />
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1C1917",
                  mb: 0.25,
                  lineHeight: 1.3,
                }}
              >
                {item.action}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#A8A29E",
                }}
              >
                {item.tool} &middot; {item.time}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DashboardActivityFeed;
