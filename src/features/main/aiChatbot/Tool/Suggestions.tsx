import { Box, Typography } from "@mui/material";
import {
  IconListSearch,
  IconPencilBolt,
  IconReportAnalytics,
  IconFileSearch,
} from "@tabler/icons-react";

const SuggestionBox = () => {
  const suggestions = [
    {
      icon: <IconListSearch size={20} />,
      title: "Market Research",
      description: "I analyze trends and client data to uncover opportunities.",
    },
    {
      icon: <IconPencilBolt size={20} />,
      title: "Content Creation",
      description: "Get a first draft or refine existing messaging.",
    },
    {
      icon: <IconReportAnalytics size={20} />,
      title: "Competitive Analysis",
      description: "Track competitors and find areas to stand out.",
    },
    {
      icon: <IconFileSearch size={20} />,
      title: "Customer Insights",
      description: "Use feedback and behavior to sharpen strategies.",
    },
  ];

  return (
    <Box
      sx={{
        width: "50%",
        borderRadius: "13px",
        border: "1px solid #E7E5E4",
        padding: "20px 20px 10px 20px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)", // outer shadow
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Typography sx={{ fontSize: "16px", fontWeight: 550 }}>
          Not sure where to start?
        </Typography>

        {suggestions.map((item, index) => (
          <Box key={index} sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {item.icon}
              <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                {item.title}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "14px", marginLeft: "28px" }}>
              {item.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SuggestionBox;
