import React, { memo } from "react";
import { Box, Typography } from "@mui/material";
import {
  Close as CloseIcon,
  ThumbUp as ThumbUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Spellcheck as SpellcheckIcon,
  MenuBook as MenuBookIcon,
  AccessibilityNew as AccessibilityNewIcon,
  Search as SearchIcon,
  Gavel as GavelIcon,
  Business as BusinessIcon,
  InfoOutlined as InfoOutlinedIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
} from "@mui/icons-material";
import { IssueCardProps, ReviewStatus, TASK_DISPLAY_NAMES } from "../types";
import { COLORS } from "../constants";

/**
 * Individual issue card component displaying issue details
 */
export const IssueCard: React.FC<IssueCardProps> = memo(
  ({
    issue,
    isActive,
    onClick,
    getSeverityColor,
    onReviewStatusChange,
    isExpanded,
    onExpandChange,
    currentPage,
  }) => {
    const reviewStatus: ReviewStatus = issue.reviewStatus || "not_reviewed";
    const isApproved = reviewStatus === "approved";
    const isRejected = reviewStatus === "rejected";

    const getIssueTypeIcon = (issueTypeLabel: string) => {
      const normalized = issueTypeLabel.toLowerCase();

      if (normalized.includes("spell")) {
        return <SpellcheckIcon sx={{ fontSize: 14, color: "#44403C" }} />;
      }
      if (normalized.includes("grammar")) {
        return <MenuBookIcon sx={{ fontSize: 14, color: "#44403C" }} />;
      }
      if (normalized.includes("wcag") || normalized.includes("accessibility")) {
        return <AccessibilityNewIcon sx={{ fontSize: 14, color: "#44403C" }} />;
      }
      if (normalized.includes("seo")) {
        return <SearchIcon sx={{ fontSize: 14, color: "#44403C" }} />;
      }
      if (
        normalized.includes("ama") ||
        normalized.includes("editorial") ||
        normalized.includes("compliance")
      ) {
        return <GavelIcon sx={{ fontSize: 14, color: "#44403C" }} />;
      }
      if (normalized.includes("brand") || normalized.includes("client")) {
        return <BusinessIcon sx={{ fontSize: 14, color: "#44403C" }} />;
      }
      return <InfoOutlinedIcon sx={{ fontSize: 14, color: "#44403C" }} />;
    };

    const issueTypeLabel =
      TASK_DISPLAY_NAMES[issue.type] || (issue.type || "").replace(/_/g, " ");
    const pageToShow = currentPage ?? issue.page ?? 1;

    const handleMoreClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering the card click
      onExpandChange(issue.id, !isExpanded);
    };

    const handleReject = (e: React.MouseEvent) => {
      e.stopPropagation();
      onReviewStatusChange(issue.id, isRejected ? "not_reviewed" : "rejected");
    };

    const handleApprove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onReviewStatusChange(issue.id, isApproved ? "not_reviewed" : "approved");
    };

    return (
      <Box
        data-id={issue.id}
        data-expanded={isExpanded ? "true" : "false"}
        onClick={onClick}
        sx={{
          backgroundColor: isActive ? COLORS.background.issueCard : "white",
          border: "1px solid",
          borderColor: "#E7E5E4",
          borderRadius: "10px",
          cursor: "pointer",
          position: "relative",
          zIndex: isExpanded ? 2 : 1,
          boxShadow: isExpanded
            ? "0 4px 12px rgba(28,25,23,0.08), 0 2px 4px rgba(28,25,23,0.04)"
            : isActive
              ? "0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)"
              : "none",
          transition: "box-shadow 0.15s ease, border-color 0.15s ease",
          willChange: isExpanded ? "transform, box-shadow" : "auto",
          transform: "translateZ(0)", // Force hardware acceleration
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            marginBottom: 1,
            bgcolor: isActive ? "#FEF2F0" : "#FAFAF9",
            px: 1.5,
            py: 0.75,
            borderRadius: "9px 9px 0 0",
            borderBottom: "1px solid #E7E5E4",
          }}
        >
          {/* Issue number badge */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={{
                minWidth: 16,
                height: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getIssueTypeIcon(issueTypeLabel)}
            </Box>

            {/* Issue type */}
            <Typography
              sx={{
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontSize: "12px",
                fontWeight: 600,
                color: "#44403C",
              }}
            >
              {issueTypeLabel.toUpperCase()}
            </Typography>
          </Box>

          {/* Severity badge */}
          <Box
            sx={{
              marginLeft: "auto",
              width: 24,
              height: 24,
              border: "1px solid #FFFFFF",
              borderRadius: "50%",
              p: 0,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                backgroundColor: getSeverityColor(issue.severity),
                borderRadius: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {issue.severity}
            </Box>
          </Box>

          {/* Page badge */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              backgroundColor: "neutral.400",
              borderRadius: "13px",
              px: 1,
              py: 0.5,
              color: "text.primary",
              fontSize: "11px",
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 13, color: "#1C1917" }} />
            <Typography
              sx={{ fontSize: "11px", fontWeight: 400, lineHeight: 1 }}
            >
              Pg {pageToShow}
            </Typography>
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ padding: "0 12px 12px 12px" }}>
          {/* Issue description */}
          <Typography
            sx={{
              fontWeight: 700,
              marginTop: 1.25,
              marginBottom: 0.5,
              fontSize: "13px",
            }}
          >
            Issue
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              lineHeight: 1.5,
              color: COLORS.text.primary,
            }}
          >
            {issue.body.issue}
          </Typography>

          {/* Reasoning - Only shown when expanded */}
          {isExpanded && (
            <Box
              sx={{
                opacity: isExpanded ? 1 : 0,
                transition: "opacity 0.15s ease-in-out",
                willChange: "opacity",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  marginTop: 1.25,
                  marginBottom: 0.5,
                  fontSize: "13px",
                }}
              >
                Reasoning
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  lineHeight: 1.5,
                  color: COLORS.text.primary,
                }}
              >
                {issue.body.reasoning}
              </Typography>

              {/* Recommendation */}
              <Typography
                sx={{
                  fontWeight: 700,
                  marginTop: 1.25,
                  marginBottom: 0.5,
                  fontSize: "13px",
                }}
              >
                Recommendation
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  lineHeight: 1.5,
                  color: COLORS.text.primary,
                }}
              >
                {issue.body.recommendation}
              </Typography>
            </Box>
          )}

          {/* More/Less toggle */}
          <Box
            onClick={handleMoreClick}
            sx={{
              mt: 1.5,
              mb: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 0.25,
              color: "#E86D5A",
              cursor: "pointer",
              userSelect: "none",
              "&:hover": { color: "#D4553F" },
              transition: "color 0.15s ease",
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {isExpanded ? "Less" : "More"}
            </Typography>
            {isExpanded ? (
              <KeyboardArrowUpIcon sx={{ fontSize: 14 }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
            )}
          </Box>

          <Box sx={{ borderTop: "1px solid #E7E5E4" }} />

          {/* Action buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            <Box
              onClick={handleApprove}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: isApproved ? "#3D9A5C" : "transparent",
                border: "1px solid",
                borderColor: isApproved ? "#3D9A5C" : "#E7E5E4",
                borderRadius: "8px",
                px: 1.25,
                py: 0.5,
                color: isApproved ? "#FFFFFF" : "#78716C",
                cursor: "pointer",
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: isApproved ? "#3D9A5C" : "#3D9A5C",
                  color: isApproved ? "#FFFFFF" : "#3D9A5C",
                  bgcolor: isApproved ? "#3D9A5C" : "rgba(61,154,92,0.06)",
                },
              }}
            >
              <ThumbUpIcon sx={{ fontSize: 13 }} />
              <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
                Approve
              </Typography>
            </Box>

            <Box
              onClick={handleReject}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: isRejected ? "#DC5E5E" : "transparent",
                border: "1px solid",
                borderColor: isRejected ? "#DC5E5E" : "#E7E5E4",
                borderRadius: "8px",
                px: 1.25,
                py: 0.5,
                color: isRejected ? "#FFFFFF" : "#78716C",
                cursor: "pointer",
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: isRejected ? "#DC5E5E" : "#DC5E5E",
                  color: isRejected ? "#FFFFFF" : "#DC5E5E",
                  bgcolor: isRejected ? "#DC5E5E" : "rgba(220,94,94,0.06)",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 13 }} />
              <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
                Reject
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
);

IssueCard.displayName = "IssueCard";

export default IssueCard;
