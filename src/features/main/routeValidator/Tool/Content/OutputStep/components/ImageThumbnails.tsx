import React, { memo } from "react";
import { Box, Typography } from "@mui/material";
import { DescriptionOutlined as DescriptionOutlinedIcon } from "@mui/icons-material";
import { ImageThumbnailsProps } from "../types";
import { COLORS } from "../constants";

/**
 * Left sidebar showing image thumbnails for screenshot validation
 */
export const ImageThumbnails: React.FC<ImageThumbnailsProps> = memo(
  ({ images, selectedIndex, onSelect }) => {
    if (images.length === 0) return null;

    return (
      <Box
        sx={{
          width: "5%",
          height: "fit-content",
          alignSelf: "flex-start",
          backgroundColor: "#FFFFFF",
          border: "1px solid",
          borderColor: "neutral.400",
          borderRadius: "8px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            backgroundColor: "neutral.200",
            borderBottom: (theme: any) => `1px dashed ${theme.palette.neutral[400]}`,
            display: "flex",
            height: "43px",
            alignItems: "center",
            justifyContent: "center",
            py: 1,
          }}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 18, color: "#44403C" }} />
        </Box>
        <Box
          sx={{ overflowY: "auto", display: "flex", flexDirection: "column" }}
        >
          {images.map((img, index) => {
            const isSelected = selectedIndex === index;
            const hasIssues = img.issues.length > 0;

            return (
              <Box
                key={img.id}
                onClick={() => onSelect(index)}
                sx={{
                  backgroundColor: isSelected ? "#FEF2F0" : "#FFFFFF",
                  cursor: "pointer",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "60px",
                  borderBottom: (theme: any) =>
                    index === images.length - 1
                      ? "none"
                      : `1px dashed ${theme.palette.neutral[400]}`,
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                    backgroundColor: isSelected ? "#FEF2F0" : "#FAFAF9",
                  },
                }}
              >
                {/* Red left border = page has issues (not current page) */}
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "10px",
                    backgroundColor: hasIssues ? COLORS.error : "neutral.300",
                  }}
                />

                {/* Page number: current = black, other = black 50% opacity */}
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: isSelected ? "text.primary" : "rgba(0, 0, 0, 0.5)",
                    paddingLeft: "5px",
                  }}
                >
                  {index + 1}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
  (prev, next) => {
    return (
      prev.images.length === next.images.length &&
      prev.images.every(
        (img, i) =>
          img.id === next.images[i]?.id &&
          img.issues.length === next.images[i]?.issues.length,
      ) &&
      prev.selectedIndex === next.selectedIndex
    );
  },
);

ImageThumbnails.displayName = "ImageThumbnails";

export default ImageThumbnails;
