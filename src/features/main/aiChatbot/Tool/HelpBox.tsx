import { Box, Typography } from "@mui/material";
import {
  IconListSearch,
  IconFiles,
  IconAlertTriangleFilled,
} from "@tabler/icons-react";

const HelpBox = () => {
  const helps = [
    {
      icon: <IconListSearch size={20} />,
      description:
        "Click the plus button or drag a file to the chatbot to upload a file.",
    },
    {
      icon: <IconFiles size={20} />,
      description:
        "I support Word, PPT, Excel, and PDF (max 20MB). Scanned images, encrypted files, or complex formatting may be inaccurate.",
    },
    {
      icon: <IconAlertTriangleFilled size={20} />,
      description: "Always review responses before sharing.",
    },
  ];

  return (
    <Box
      sx={{
        width: "50%",
        height: "220px",
        borderRadius: "13px",
        border: "1px solid #E7E5E4",
        padding: "20px 20px 10px 20px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)", // outer shadow
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Typography sx={{ fontSize: "16px", fontWeight: 550 }}>
          Need to upload a file?
        </Typography>

        {helps.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            {/* Fixed width icon container */}
            <Box
              sx={{ width: "24px", display: "flex", justifyContent: "center" }}
            >
              {item.icon}
            </Box>
            <Typography sx={{ fontSize: "14px" }}>
              {item.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default HelpBox;
