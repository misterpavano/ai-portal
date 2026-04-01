import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  IconProgressCheck,
  IconUpload,
  IconListCheck,
  IconFileAnalytics,
  IconArrowRight,
  IconApps,
} from "@tabler/icons-react";

const steps = [
  {
    number: 1,
    icon: IconUpload,
    title: "Upload Your Document",
    description:
      "Drop in a PDF, ZIP of screenshots, or Word document. If you have an annotated version from a prior review, upload that too for context.",
  },
  {
    number: 2,
    icon: IconListCheck,
    title: "Select Tasks & Direction",
    description:
      "Choose automated checks like spell check, grammar, AMA guidelines, brand compliance, WCAG, or SEO. Add custom notes to focus the review.",
  },
  {
    number: 3,
    icon: IconFileAnalytics,
    title: "Review Annotated Results",
    description:
      "Get page-by-page findings with issue type, location, and recommendations. Download as Word or PDF when ready.",
  },
];

const DashboardContent = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: "100%", maxWidth: 860, mx: "auto", pb: 8 }}>
      {/* Welcome hero */}
      <Box sx={{ mb: 6, pt: 1 }}>
        <Typography
          sx={{
            fontSize: { xs: 28, md: 38 },
            fontWeight: 800,
            color: "#1C1917",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            mb: 1.5,
          }}
        >
          Welcome to Kalabria
        </Typography>
        <Typography
          sx={{
            fontSize: 16,
            color: "#78716C",
            fontWeight: 400,
            lineHeight: 1.7,
            maxWidth: 640,
          }}
        >
          Your hub for the Hedgehog Suite. Every application you're signed up
          for lives here, and the suite grows as we grow with you. New tools
          will appear automatically as they become available for your
          organization.
        </Typography>
      </Box>

      {/* Your Applications */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <IconApps size={14} color="#A8A29E" stroke={1.5} />
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "#A8A29E",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Your Applications
          </Typography>
        </Box>

        {/* Extra Editor card */}
        <Box
          onClick={() => navigate("/route-assistant")}
          sx={{
            mt: 2,
            p: 3,
            border: "1px solid #E7E5E4",
            borderRadius: "14px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#D6D3D1",
              backgroundColor: "#FAFAF9",
              "& .arrow-icon": {
                transform: "translateX(4px)",
              },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  backgroundColor: "#1C1917",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconProgressCheck size={20} color="#FFFFFF" stroke={1.5} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1C1917",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Extra Editor
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#78716C",
                    fontWeight: 400,
                    mt: 0.25,
                  }}
                >
                  AI-powered document review and compliance analysis
                </Typography>
              </Box>
            </Box>
            <IconArrowRight
              className="arrow-icon"
              size={18}
              color="#A8A29E"
              stroke={1.5}
              style={{ transition: "transform 0.2s ease" }}
            />
          </Box>
        </Box>
      </Box>

      {/* Getting Started with Extra Editor */}
      <Box>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: "#A8A29E",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            mb: 2.5,
          }}
        >
          Getting Started with Extra Editor
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {steps.map((step) => (
            <Box
              key={step.number}
              sx={{
                display: "flex",
                gap: 2.5,
                alignItems: "flex-start",
              }}
            >
              <Box
                sx={{
                  minWidth: 32,
                  height: 32,
                  borderRadius: "8px",
                  backgroundColor: "#F5F5F4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1C1917",
                  }}
                >
                  {step.number}
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1C1917",
                    letterSpacing: "-0.01em",
                    mb: 0.5,
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#78716C",
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Button
          variant="contained"
          onClick={() => navigate("/route-assistant")}
          disableElevation
          sx={{
            mt: 4,
            px: 3,
            py: 1.2,
            borderRadius: "10px",
            backgroundColor: "#1C1917",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 600,
            textTransform: "none",
            letterSpacing: "-0.01em",
            "&:hover": {
              backgroundColor: "#292524",
            },
          }}
        >
          Open Extra Editor
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardContent;
