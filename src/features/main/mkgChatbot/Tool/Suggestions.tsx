import { Box, Typography } from "@mui/material";

const SuggestionBox = () => {
  return (
    <Box
      sx={{
        width: "50%",
        borderRadius: "13px",
        border: "1px solid #E7E5E4",
        padding: "20px 20px 10px 20px",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Typography sx={{ fontSize: "16px", fontWeight: 550 }}>
          Not sure where to start?
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: "14px" }}>
            🔍 <b>Market Research</b> – I analyze trends and client data to
            uncover opportunities.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: "14px" }}>
            📝 <b>Content Creation</b> – Get a first draft or refine existing
            messaging.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: "14px" }}>
            📊 <b>Competitive Analysis</b> – Track competitors and find areas to
            stand out.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: "14px" }}>
            💡 <b>Customer Insights</b> – Use feedback and behavior to sharpen
            strategies.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SuggestionBox;
