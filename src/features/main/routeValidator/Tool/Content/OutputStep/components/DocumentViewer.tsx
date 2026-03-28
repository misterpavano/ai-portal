import React, { memo, useMemo, useState, useEffect, useRef } from "react";
import { Box, Typography, Button, IconButton, Skeleton } from "@mui/material";
import { IconZoomIn, IconZoomOut } from "@tabler/icons-react";
import { DocumentViewerProps, isImageDocumentType } from "../types";
import { COLORS } from "../constants";
import TextHighlighter from "./TextHighlighter";

/** Document-style skeleton shown only while Word content is loading (not for PDF) */
const DOCUMENT_SKELETON_WIDTH = 816;
const WordDocumentSkeleton = () => (
  <Box
    sx={{
      padding: "24px 40px",
      maxWidth: "100%",
      width: DOCUMENT_SKELETON_WIDTH,
      margin: "0 auto",
    }}
  >
    {[98, 100, 52, 88, 72, 100, 65, 95, 48, 78, 100, 55].map((width, i) => (
      <Skeleton
        key={i}
        variant="rounded"
        height={18}
        sx={{ maxWidth: `${width}%`, mb: 1.5 }}
        animation="wave"
      />
    ))}
    <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
      <Skeleton variant="rounded" width={850} height={36} animation="wave" />
      <Skeleton variant="rounded" width={850} height={36} animation="wave" />
    </Box>
  </Box>
);

/**
 * Main document viewing area
 * Displays either canvas (for screenshots) or text (for word documents)
 */
export const DocumentViewer: React.FC<DocumentViewerProps> = memo(
  ({
    documentType,
    wordText,
    wordHtml,
    wordIssues,
    activeIssueIds,
    images,
    selectedImageIndex,
    isValidating,
    hasValidationResults,
    highlightedSpanRefs,
    stageRef,
    canvasRef,
    onTextClick,
    onCanvasClick,
    onGoBackToValidation,
    onClearSelection,
    zoom = 1,
    onZoomIn,
    onZoomOut,
  }) => {
    // ── Smooth page transition (fade + slide on page switch) ──
    const [transitionState, setTransitionState] = useState<
      "idle" | "out" | "in"
    >("idle");
    const prevPageRef = useRef(selectedImageIndex);
    const fadeTimerRef = useRef(0);

    // ── Word: show skeleton while content loads (validation or waiting for documentText/Html)
    const showWordSkeleton =
      documentType === "word" &&
      !wordText &&
      !wordHtml &&
      (isValidating || hasValidationResults);
    const [wordLoadTimedOut, setWordLoadTimedOut] = useState(false);
    const wordTimeoutRef = useRef(0);
    useEffect(() => {
      if (documentType !== "word" || wordText || wordHtml) {
        setWordLoadTimedOut(false);
        return;
      }
      if (!hasValidationResults) return;
      wordTimeoutRef.current = window.setTimeout(
        () => setWordLoadTimedOut(true),
        4000,
      );
      return () => clearTimeout(wordTimeoutRef.current);
    }, [documentType, wordText, wordHtml, hasValidationResults]);

    useEffect(() => {
      if (!isImageDocumentType(documentType)) return;
      if (prevPageRef.current === selectedImageIndex) return;
      prevPageRef.current = selectedImageIndex;

      // Phase 1: instant jump to "out" (opacity 0, slight translate)
      setTransitionState("out");
      clearTimeout(fadeTimerRef.current);
      // Phase 2: after a paint frame, switch to "in" — the CSS transition animates it
      fadeTimerRef.current = window.setTimeout(() => {
        setTransitionState("in");
        // Phase 3: after transition completes, reset to idle (removes will-change)
        fadeTimerRef.current = window.setTimeout(() => {
          setTransitionState("idle");
        }, 180);
      }, 20);

      return () => clearTimeout(fadeTimerRef.current);
    }, [selectedImageIndex, documentType]);

    const pageTransitionSx = isImageDocumentType(documentType)
      ? {
          opacity: transitionState === "out" ? 0 : 1,
          transform:
            transitionState === "out" ? "translateY(4px)" : "translateY(0)",
          transition:
            transitionState === "in"
              ? "opacity 0.18s ease-out, transform 0.18s ease-out"
              : "none",
          willChange:
            transitionState !== "idle" ? "opacity, transform" : "auto",
        }
      : {};

    /**
     * Render content for word documents
     */
    const renderWordContent = useMemo(() => {
      if (showWordSkeleton && !wordLoadTimedOut) {
        return <WordDocumentSkeleton />;
      }
      // No text and no validation - show message
      if (!wordText && !hasValidationResults && !isValidating) {
        return (
          <Box sx={{ padding: "20px" }}>
            <Typography
              sx={{
                color: COLORS.text.secondary,
                marginBottom: 2,
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              No document text available. Please run validation first.
            </Typography>
            <Typography
              sx={{
                color: COLORS.text.muted,
                fontSize: "14px",
                marginBottom: 3,
              }}
            >
              Go back to the Tasks & Direction step and click the "Review"
              button to validate your document.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={onGoBackToValidation}
              sx={{ textTransform: "none" }}
            >
              Go to Tasks & Direction Step
            </Button>
          </Box>
        );
      }

      // Has validation but no text - only show warning for Word documents
      // For screenshots/images, it's normal to have no text (images only)
      if (
        !wordText &&
        hasValidationResults &&
        documentType === "word" &&
        wordLoadTimedOut
      ) {
        return (
          <Box sx={{ padding: "20px" }}>
            <Typography sx={{ color: COLORS.text.secondary, marginBottom: 2 }}>
              Validation completed, but no document text was returned.
            </Typography>
            <Typography sx={{ color: COLORS.text.muted, fontSize: "14px" }}>
              The document may contain only images or the text extraction may
              have failed.
            </Typography>
          </Box>
        );
      }

      // Render highlighted text (use HTML if available for better formatting)
      return (
        <TextHighlighter
          text={wordText}
          html={wordHtml}
          issues={wordIssues}
          activeIssueIds={activeIssueIds}
          highlightedSpanRefs={highlightedSpanRefs}
          onTextClick={onTextClick}
          onClearSelection={onClearSelection}
        />
      );
    }, [
      showWordSkeleton,
      wordLoadTimedOut,
      wordText,
      hasValidationResults,
      isValidating,
      documentType,
      wordHtml,
      wordIssues,
      activeIssueIds,
      highlightedSpanRefs,
      onTextClick,
      onClearSelection,
      onGoBackToValidation,
    ]);

    const zoomPercent = Math.round(zoom * 100);
    const isMaxZoom = zoom >= 2;
    const isMinZoom = zoom <= 1;

    /** Header bar for image documents — rendered OUTSIDE the scroll area */
    const renderImageHeader = useMemo(() => {
      const pageNumber = (selectedImageIndex ?? 0) + 1;
      const issueCount = wordIssues?.length ?? 0;

      return (
        <Box
          sx={{
            backgroundColor: "neutral.200",
            border: "1px solid",
            borderColor: "neutral.300",
            borderBottom: "none",
            borderRadius: "8px 8px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 1,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{ fontWeight: 700, color: "text.primary", fontSize: 15 }}
            >
              Page {pageNumber}
            </Typography>
            <Typography
              sx={{ color: "neutral.600", fontSize: 14, fontWeight: 400 }}
            >
              {issueCount === 1 ? "1 issue" : `${issueCount} issues`}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={onZoomOut}
              disabled={isMinZoom}
              sx={{
                color: isMinZoom ? "neutral.400" : "neutral.700",
                p: 0.5,
                "&:hover": { backgroundColor: "rgba(28,25,23,0.04)" },
              }}
            >
              <IconZoomOut size={20} />
            </IconButton>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: "neutral.700",
                minWidth: 40,
                textAlign: "center",
                userSelect: "none",
              }}
            >
              {zoomPercent}%
            </Typography>
            <IconButton
              size="small"
              onClick={onZoomIn}
              disabled={isMaxZoom}
              sx={{
                color: isMaxZoom ? "neutral.400" : "neutral.700",
                p: 0.5,
                "&:hover": { backgroundColor: "rgba(28,25,23,0.04)" },
              }}
            >
              <IconZoomIn size={20} />
            </IconButton>
          </Box>
        </Box>
      );
    }, [
      selectedImageIndex,
      wordIssues,
      onZoomIn,
      onZoomOut,
      isMaxZoom,
      isMinZoom,
      zoomPercent,
    ]);

    /** Canvas content — only the image, lives INSIDE the scroll area */
    const renderScreenshotContent = useMemo(() => {
      return (
        <Box
          sx={{
            width: `${zoom * 100}%`,
            minWidth: "100%",
            flexShrink: 0,
            padding: "12px 10px",
            boxSizing: "border-box",
            ...pageTransitionSx,
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: "100%",
              boxShadow: "0 4px 12px rgba(28,25,23,0.08), 0 2px 4px rgba(28,25,23,0.04)",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
            }}
          >
            <canvas
              ref={canvasRef}
              onClick={onCanvasClick}
              style={{
                display: "block",
                width: "100%",
                cursor: "pointer",
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
              }}
            />
          </Box>
        </Box>
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef, onCanvasClick, zoom, transitionState]);

    const isImage = isImageDocumentType(documentType);

    return (
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Header bar — sits ABOVE the scroll container, never scrolls */}
        {isImage && renderImageHeader}

        {/* Scrollable area — only the image zooms/scrolls */}
        <Box
          ref={stageRef}
          onClick={(e) => {
            if (isImage && e.target === e.currentTarget && onClearSelection) {
              onClearSelection();
            }
          }}
          sx={{
            flex: 1,
            minWidth: 0,
            position: "relative",
            overflow: "auto",
            backgroundColor: isImage ? "neutral.100" : "transparent",
            backgroundImage: isImage
              ? `
                repeating-linear-gradient(
                  0deg,
                  rgba(168,162,158,0.18) 0px,
                  rgba(168,162,158,0.18) 1px,
                  transparent 1px,
                  transparent 16px
                ),
                repeating-linear-gradient(
                  90deg,
                  rgba(168,162,158,0.18) 0px,
                  rgba(168,162,158,0.18) 1px,
                  transparent 1px,
                  transparent 16px
                )
              `
              : "none",
            borderRadius: isImage ? "0 0 8px 8px" : "8px",
            isolation: "isolate",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: isImage ? "flex-start" : "center",
          }}
        >
          {isImage ? (
            renderScreenshotContent
          ) : (
            <Box
              sx={{
                padding: 2,
                backgroundColor: COLORS.background.document,
                minHeight: "100%",
                position: "relative",
                maxWidth: "100%",
                overflowX: "hidden",
              }}
            >
              {renderWordContent}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
  (prev, next) => {
    // Custom comparison - only re-render if props actually changed (optimized for performance)
    if (
      prev.documentType !== next.documentType ||
      prev.wordText !== next.wordText ||
      prev.wordHtml !== next.wordHtml ||
      prev.wordIssues.length !== next.wordIssues.length ||
      prev.activeIssueIds.size !== next.activeIssueIds.size ||
      prev.isValidating !== next.isValidating ||
      prev.hasValidationResults !== next.hasValidationResults ||
      prev.selectedImageIndex !== next.selectedImageIndex ||
      prev.images.length !== next.images.length ||
      prev.zoom !== next.zoom
    ) {
      return false;
    }
    // Quick check: compare first/last issue IDs when we have issues
    if (prev.wordIssues.length > 0) {
      if (
        prev.wordIssues[0]?.id !== next.wordIssues[0]?.id ||
        prev.wordIssues[prev.wordIssues.length - 1]?.id !==
          next.wordIssues[next.wordIssues.length - 1]?.id
      ) {
        return false;
      }
    }
    // Check activeIssueIds (only if size matches)
    if (prev.activeIssueIds.size > 0) {
      const prevIds = Array.from(prev.activeIssueIds).sort();
      const nextIds = Array.from(next.activeIssueIds).sort();
      if (prevIds.some((id, i) => id !== nextIds[i])) return false;
    }
    return true;
  },
);

DocumentViewer.displayName = "DocumentViewer";

export default DocumentViewer;
