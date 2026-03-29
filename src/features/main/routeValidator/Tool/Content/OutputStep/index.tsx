import { Box, Button, Tooltip, Typography } from "@mui/material";
import { saveAs } from "file-saver";
import { useAtom } from "jotai";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  routeValidatorFormAtom,
  routeValidatorStepAtom,
} from "../../../../../../atoms/routeValidatorAtom";
import { devWarn } from "../../../../../../utils/devLog";

// Types
import {
  DocumentType,
  DotsMap,
  Issue,
  ReviewStatus,
  isImageDocumentType,
} from "./types";

// Constants
import { DOT_RADIUS, DPR } from "./constants";

// Utils
import { generatePdfDocumentWithComments } from "./pdfUtils/pdfDocumentGenerator";
import { canHighlightIssue, getSeverityColor } from "./utils";
import { generateWordDocumentWithComments } from "./wordDocUtils/wordDocumentGenerator";

// Hooks
import {
  useCanvasDrawing,
  useConnector,
  useImageHandling,
  useIssueProcessing,
  useIssueSelection,
  useValidation,
} from "./hooks";

// Components
import { useLazyGetDocumentHtmlQuery } from "../../../../../../api/slices/routeValidatorSlice";
import { DocumentViewer, ImageThumbnails, IssuesSidebar } from "./components";

/**
 * OutputStep - Main component for displaying validation results
 */
const OutputStep: React.FC = () => {
  const [routeValidatorFormValues, setRouteValidatorFormValues] = useAtom(
    routeValidatorFormAtom,
  );
  const [, setCurrentStep] = useAtom(routeValidatorStepAtom);
  const [getDocumentHtml] = useLazyGetDocumentHtmlQuery();

  // Local state
  const [wordText, setWordText] = useState<string>("");
  const [wordHtml, setWordHtml] = useState<string | undefined>(undefined);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [reviewStatusMap, setReviewStatusMap] = useState<
    Map<string, ReviewStatus>
  >(new Map());
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  // Refs
  const highlightedSpanRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const connectorSvgRef = useRef<SVGSVGElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);
  /** Issue ID waiting for a page switch to complete before being selected */
  const pendingIssueRef = useRef<string | null>(null);

  // Get validation results and document info
  const validationResults = routeValidatorFormValues.validationResults;
  const documentText =
    validationResults?.documentText ||
    routeValidatorFormValues.extractedText ||
    "";
  const documentHtml = validationResults?.documentHtml;
  const documentType = routeValidatorFormValues.documentType as DocumentType;
  const fileName = routeValidatorFormValues.file?.fileName || "document";

  // Validation hook
  const { taskProgress, isValidating, retryTask } = useValidation();

  // Process validation issues
  const { issues: allValidationIssues } = useIssueProcessing(
    validationResults,
    documentText,
    documentType,
  );

  // Image handling hook
  const { images, selectedImageIndex, setSelectedImageIndex } =
    useImageHandling(
      documentType,
      validationResults,
      allValidationIssues,
      reviewStatusMap,
    );

  // ALL issues across every page — used for the sidebar so the user
  // can see & click any issue regardless of which page is selected.
  const allIssues = useMemo(() => {
    if (!isImageDocumentType(documentType)) return []; // word uses currentIssues below
    return images.flatMap((img) =>
      (img.issues || []).map((issue) => ({
        ...issue,
        reviewStatus:
          reviewStatusMap.get(issue.id) || issue.reviewStatus || "not_reviewed",
      })),
    );
  }, [documentType, images, reviewStatusMap]);

  // Issues for the CURRENT page only — used for canvas dots / drawing
  const currentIssues = useMemo(() => {
    let baseIssues: Issue[];
    if (isImageDocumentType(documentType)) {
      const imageIssues = images[selectedImageIndex]?.issues || [];
      baseIssues = imageIssues;
    } else {
      // For Word documents: Show ALL issues but log which ones can't be highlighted
      baseIssues = allValidationIssues.map((issue) => {
        // Check if issue can be highlighted
        let canHighlight = true;
        if (!issue.wordRange) {
          devWarn(
            `[currentIssues] Issue ${issue.id} has no wordRange - won't be highlighted`,
          );
          canHighlight = false;
        } else {
          const { start, end } = issue.wordRange;
          if (
            start < 0 ||
            end <= start ||
            start >= documentText.length ||
            end > documentText.length
          ) {
            devWarn(
              `[currentIssues] Issue ${issue.id} has invalid wordRange bounds [${start}-${end}]`,
            );
            canHighlight = false;
          } else {
            const rangeText = documentText.substring(start, end);
            if (!rangeText || rangeText.trim().length === 0) {
              devWarn(
                `[currentIssues] Issue ${issue.id} has empty text at range [${start}-${end}]`,
              );
              canHighlight = false;
            } else if (!canHighlightIssue(issue, documentText, documentHtml)) {
              devWarn(
                `[currentIssues] Issue ${issue.id} cannot be highlighted in document`,
              );
              canHighlight = false;
            }
          }
        }
        // Return issue with canHighlight flag (for future use if needed)
        return { ...issue, _canHighlight: canHighlight };
      });
    }

    return baseIssues.map((issue) => ({
      ...issue,
      reviewStatus:
        reviewStatusMap.get(issue.id) || issue.reviewStatus || "not_reviewed",
    }));
  }, [
    documentType,
    images,
    selectedImageIndex,
    allValidationIssues,
    reviewStatusMap,
    documentText,
    documentHtml,
  ]);

  // Issue selection management
  const {
    activeIssueIds,
    handleIssueClick,
    handleTextClick,
    setActiveIssueIds,
    clearSelection,
  } = useIssueSelection(currentIssues);

  // Handle review status changes
  const handleReviewStatusChange = useCallback(
    (issueId: string, status: ReviewStatus) => {
      setReviewStatusMap((prev) => {
        const newMap = new Map(prev);
        if (status === "not_reviewed") {
          newMap.delete(issueId);
        } else {
          newMap.set(issueId, status);
        }
        return newMap;
      });
    },
    [],
  );

  // Cache for computed dots to avoid recalculating on every render
  const dotsCacheRef = useRef<{ cacheKey: string; dots: DotsMap } | null>(null);

  // Memoize issue IDs for cache key (avoid recalculating on every call)
  // Use a stable key based on issue count and IDs - only recalculate when issues actually change
  const issueIdsKey = useMemo(() => {
    if (currentIssues.length === 0) return "0";
    // Use first and last IDs + count for quick comparison (most changes affect these)
    const firstId = currentIssues[0]?.id || "";
    const lastId = currentIssues[currentIssues.length - 1]?.id || "";
    return `${currentIssues.length}-${firstId}-${lastId}`;
  }, [currentIssues]);

  // Compute dot positions for connector drawing (memoized with cache)
  // CRITICAL: Cache key must include canvas/img draw size so dots match PDF export (same position.x/y * dimensions)
  const computeDots = useCallback((): DotsMap => {
    const scrollTop = stageRef.current?.scrollTop || 0;
    const canvas = canvasRef.current;
    const imgDrawRef = canvas ? (canvas as any).imgDrawRef?.current : null;
    const drawW = imgDrawRef?.w ?? 0;
    const drawH = imgDrawRef?.h ?? 0;
    const cacheKey = `${documentType}-${selectedImageIndex}-${issueIdsKey}-${scrollTop}-${canvas?.width ?? 0}-${canvas?.height ?? 0}-${drawW}-${drawH}`;

    if (dotsCacheRef.current?.cacheKey === cacheKey) {
      return dotsCacheRef.current.dots;
    }

    const dots: DotsMap = {};

    if (isImageDocumentType(documentType)) {
      if (!canvas) {
        dotsCacheRef.current = { cacheKey, dots };
        return dots;
      }

      const canvasCSSWidth = canvas.width / DPR;
      let imgDrawW = 0;
      let imgDrawH = 0;

      // CRITICAL for full-height images: only use actual image dimensions so dots and PDF export match.
      // Never use canvas (viewport) height before the image has set imgDrawRef—that would place dots too low.
      if (imgDrawRef && imgDrawRef.w > 0 && imgDrawRef.h > 0) {
        imgDrawW = imgDrawRef.w;
        imgDrawH = imgDrawRef.h;
      } else if (images[selectedImageIndex]) {
        const img = new Image();
        img.src = images[selectedImageIndex].url;
        if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
          const scale = canvasCSSWidth / img.naturalWidth;
          imgDrawW = canvasCSSWidth;
          imgDrawH = img.naturalHeight * scale;
        }
      }

      // Only compute dots when we have full image dimensions (avoids wrong positions on tall images)
      if (imgDrawW > 0 && imgDrawH > 0) {
        // Same formula as PDF export: position.x/y are 0-100; dot = (x/100 * width, y/100 * height)
        currentIssues.forEach((issue) => {
          const normalizedX = issue.position.x / 100;
          const normalizedY = issue.position.y / 100;
          dots[issue.id] = {
            x: normalizedX * imgDrawW + (imgDrawRef?.x || 0),
            y: normalizedY * imgDrawH + (imgDrawRef?.y || 0),
          };
        });
      }
    } else if (documentType === "word") {
      if (!stageRef.current) {
        dotsCacheRef.current = { cacheKey, dots };
        return dots;
      }

      const stageRect = stageRef.current.getBoundingClientRect();
      const scrollTop = stageRef.current.scrollTop;

      currentIssues.forEach((issue) => {
        const spanElement = highlightedSpanRefs.current.get(issue.id);
        if (spanElement) {
          const spanRect = spanElement.getBoundingClientRect();
          dots[issue.id] = {
            x: spanRect.left - stageRect.left + spanRect.width / 2,
            y: spanRect.top - stageRect.top + spanRect.height / 2 + scrollTop,
          };
        }
      });
    }

    dotsCacheRef.current = { cacheKey, dots };
    return dots;
  }, [
    currentIssues,
    documentType,
    images,
    selectedImageIndex,
    canvasRef,
    stageRef,
    issueIdsKey,
  ]);

  // Connector management
  const { placeConnector, placeConnectorsForActiveIssues } = useConnector({
    connectorSvgRef,
    stageRef,
    panelRef,
    appContainerRef,
    documentType,
    computeDots,
    activeIssueIds,
  });

  // Canvas drawing hook
  useCanvasDrawing({
    canvasRef,
    stageRef,
    documentType,
    currentIssues,
    activeIssueIds,
    images,
    selectedImageIndex,
    computeDots,
    placeConnectorsForActiveIssues,
  });

  // Set document text and HTML from validation results
  useEffect(() => {
    setWordText(documentText || "");
    setWordHtml(documentHtml);
  }, [documentText, documentHtml]);

  // Fallback: fetch documentHtml from dedicated endpoint when missing (e.g. staging where status response may omit it)
  const fileId = routeValidatorFormValues.file?.fileId;
  useEffect(() => {
    if (
      documentType !== "word" ||
      !fileId ||
      !validationResults ||
      (documentHtml != null && documentHtml.length > 0)
    ) {
      return;
    }
    let cancelled = false;
    getDocumentHtml({ fileId })
      .unwrap()
      .then((res) => {
        if (!cancelled && res?.documentHtml) {
          setRouteValidatorFormValues((prev: any) => ({
            ...prev,
            validationResults: prev.validationResults
              ? { ...prev.validationResults, documentHtml: res.documentHtml }
              : prev.validationResults,
          }));
          setWordHtml(res.documentHtml);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [
    documentType,
    fileId,
    validationResults,
    documentHtml,
    getDocumentHtml,
    setRouteValidatorFormValues,
  ]);

  // Scroll helpers — handles both vertical and horizontal scrolling (needed for zoom)
  const scrollDotIntoView = useCallback(
    (issueId: string) => {
      const dots = computeDots();
      const dot = dots[issueId];
      if (!dot || !stageRef.current) return;

      const container = stageRef.current;
      const canvas = canvasRef.current;

      // Compute dot position in the container's scroll coordinate system.
      // dot.x/y are in canvas CSS-pixel space; we offset by the canvas's
      // position within the scrollable container.
      let dotAbsX = dot.x;
      let dotAbsY = dot.y;
      if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        dotAbsX =
          canvasRect.left - containerRect.left + container.scrollLeft + dot.x;
        dotAbsY =
          canvasRect.top - containerRect.top + container.scrollTop + dot.y;
      }

      const margin = 48;

      // Vertical
      const viewTop = container.scrollTop + margin;
      const viewBottom = container.scrollTop + container.clientHeight - margin;
      const needsVertical = dotAbsY < viewTop || dotAbsY > viewBottom;

      // Horizontal (only relevant when zoomed and canvas is wider than viewport)
      const viewLeft = container.scrollLeft + margin;
      const viewRight = container.scrollLeft + container.clientWidth - margin;
      const needsHorizontal = dotAbsX < viewLeft || dotAbsX > viewRight;

      if (!needsVertical && !needsHorizontal) return;

      const maxScrollV = Math.max(
        0,
        container.scrollHeight - container.clientHeight,
      );
      const maxScrollH = Math.max(
        0,
        container.scrollWidth - container.clientWidth,
      );

      const targetTop = needsVertical
        ? Math.max(
            0,
            Math.min(dotAbsY - container.clientHeight / 2, maxScrollV),
          )
        : container.scrollTop;

      const targetLeft = needsHorizontal
        ? Math.max(0, Math.min(dotAbsX - container.clientWidth / 2, maxScrollH))
        : container.scrollLeft;

      container.scrollTo({
        top: targetTop,
        left: targetLeft,
        behavior: "smooth",
      });
    },
    [computeDots],
  );

  /**
   * Scroll the document viewer to bring the selected issue into view
   * Works for both word documents (using highlighted spans) and screenshots (using dots)
   */
  const scrollIssueIntoView = useCallback(
    (issueId: string, delay = 0) => {
      const scrollToIssue = () => {
        if (!stageRef.current) return;

        if (documentType === "word") {
          // For word documents, scroll to the highlighted span element
          const spanElement = highlightedSpanRefs.current.get(issueId);
          if (spanElement && spanElement.offsetParent !== null) {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const container = stageRef.current;
                if (!container) return;

                // Get the element's position relative to the container
                const containerRect = container.getBoundingClientRect();
                const spanRect = spanElement.getBoundingClientRect();

                // Calculate element position relative to container's scroll position
                const elementTopRelativeToContainer =
                  spanRect.top - containerRect.top + container.scrollTop;
                const elementHeight = spanRect.height;
                const viewportHeight = container.clientHeight;

                // Center the element in the viewport - ALWAYS center when called
                const elementCenterY =
                  elementTopRelativeToContainer + elementHeight / 2;
                const viewportCenterY = viewportHeight / 2;

                // Calculate target scroll: position element center at viewport center
                let targetScroll = elementCenterY - viewportCenterY;

                // Get max scroll boundaries
                const maxScroll = Math.max(
                  0,
                  container.scrollHeight - viewportHeight,
                );
                const elementBottomRelativeToContainer =
                  elementTopRelativeToContainer + elementHeight;
                const bottomMargin = 80;

                // Check if centering would cut off the bottom of the element
                // The bottom of the element relative to viewport after scrolling
                const elementBottomAfterScroll =
                  elementBottomRelativeToContainer - targetScroll;

                // If bottom would be cut off (below viewport with margin), adjust
                if (elementBottomAfterScroll > viewportHeight - bottomMargin) {
                  // Calculate minimum scroll needed to show bottom with margin
                  const minScrollForBottom =
                    elementBottomRelativeToContainer -
                    viewportHeight +
                    bottomMargin;
                  // Use the minimum needed, but don't go beyond maxScroll
                  targetScroll = Math.min(minScrollForBottom, maxScroll);
                }

                // Ensure we don't scroll past the top
                if (targetScroll < 0) {
                  targetScroll = 0;
                }

                // Ensure we don't scroll past the maximum scroll position
                targetScroll = Math.min(targetScroll, maxScroll);

                // Always scroll to center
                container.scrollTo({ top: targetScroll, behavior: "smooth" });
              });
            });
          } else {
            // If span not found yet, retry after a short delay
            let retryCount = 0;
            const maxRetries = 10;
            const retryScroll = () => {
              const spanElement = highlightedSpanRefs.current.get(issueId);
              if (spanElement && spanElement.offsetParent !== null) {
                scrollToIssue();
              } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(retryScroll, 50);
              }
            };
            setTimeout(retryScroll, 50);
          }
        } else {
          // For screenshots, use the existing dot scroll function
          scrollDotIntoView(issueId);
        }
      };

      if (delay > 0) {
        setTimeout(scrollToIssue, delay);
      } else {
        scrollToIssue();
      }
    },
    [documentType, scrollDotIntoView],
  );

  const scrollIssueIntoTop = useCallback(
    (issueId: string, delay = 0, center = false) => {
      const scrollToCard = () => {
        const cardEl = panelRef.current?.querySelector(
          `[data-id="${issueId}"]`,
        ) as HTMLElement;
        if (!cardEl || !panelRef.current) return;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const container = panelRef.current;
            if (!container) return;

            // Get the card's position relative to the container
            const cardRect = cardEl.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Calculate the card's position relative to container's scroll position
            const cardTopRelativeToContainer =
              cardRect.top - containerRect.top + container.scrollTop;
            const cardHeight = cardRect.height;
            const viewportHeight = container.clientHeight;
            const topMargin = 60;
            const bottomMargin = 100; // Margin to show expanded content
            const maxScroll = Math.max(
              0,
              container.scrollHeight - viewportHeight,
            );

            let targetScroll: number;

            // Big-height cards: taller than viewport minus margins — show TOP so user sees start of comment
            const isTallCard =
              cardHeight > viewportHeight - topMargin - bottomMargin;
            if (isTallCard) {
              targetScroll = cardTopRelativeToContainer - topMargin;
              targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
            } else if (center) {
              // Center the card in the viewport - ALWAYS center when requested (regular cards)
              const cardCenterY = cardTopRelativeToContainer + cardHeight / 2;
              const viewportCenterY = viewportHeight / 2;
              targetScroll = cardCenterY - viewportCenterY;
              const cardBottomRelativeToContainer =
                cardTopRelativeToContainer + cardHeight;
              const cardBottomAfterScroll =
                cardBottomRelativeToContainer - targetScroll;

              if (cardBottomAfterScroll > viewportHeight - bottomMargin) {
                const minScrollForBottom =
                  cardBottomRelativeToContainer - viewportHeight + bottomMargin;
                targetScroll = Math.min(minScrollForBottom, maxScroll);
              }
              if (targetScroll < 0) targetScroll = 0;
              targetScroll = Math.min(targetScroll, maxScroll);
            } else {
              // Position card with comfortable margin from top (not touching the top)
              const isCardVisible =
                cardRect.top >= containerRect.top + topMargin &&
                cardRect.bottom <= containerRect.bottom - bottomMargin;

              // If card is already well-positioned, don't scroll
              if (isCardVisible) {
                return;
              }

              // Position card with comfortable margin from top (not touching the top)
              // But also ensure bottom has enough space for expanded content
              targetScroll = cardTopRelativeToContainer - topMargin;

              // Check if scrolling to this position would cut off the bottom
              const cardBottomRelativeToContainer =
                cardTopRelativeToContainer + cardHeight;
              const requiredBottomSpace =
                cardBottomRelativeToContainer - (targetScroll + viewportHeight);

              // If bottom would be cut off, adjust scroll to show bottom with margin
              if (requiredBottomSpace < bottomMargin) {
                targetScroll =
                  cardBottomRelativeToContainer - viewportHeight + bottomMargin;
              }
            }

            // Ensure we don't scroll past boundaries
            targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

            container.scrollTo({ top: targetScroll, behavior: "smooth" });
          });
        });
      };

      if (delay > 0) {
        setTimeout(scrollToCard, delay);
      } else {
        scrollToCard();
      }
    },
    [],
  );

  // Handle canvas click (for image-based documents: ZIP screenshots + route/PDF pages)
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !stageRef.current || !isImageDocumentType(documentType))
        return;

      const rect = canvas.getBoundingClientRect();
      // Click position relative to canvas in CSS pixels
      // Dots from computeDots are also in CSS pixels relative to canvas
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const dots = computeDots();
      let best: string | null = null;
      let bestDistSq = Infinity;
      const clickTolerance = DOT_RADIUS + 10;
      const clickToleranceSq = clickTolerance * clickTolerance; // Pre-calculate squared tolerance

      // Optimized: iterate over dots map directly (faster than currentIssues.forEach)
      for (const [issueId, dot] of Object.entries(dots)) {
        const dx = dot.x - cx;
        const dy = dot.y - cy;
        const distSq = dx * dx + dy * dy; // Use squared distance (avoid Math.hypot)
        // Only consider dots within tolerance and keep track of closest
        if (distSq <= clickToleranceSq && distSq < bestDistSq) {
          bestDistSq = distSq;
          best = issueId;
        }
      }

      if (best) {
        const selectedId = best;
        setActiveIssueIds(new Set([selectedId]));
        setExpandedIssueId(null);

        requestAnimationFrame(() => {
          scrollIssueIntoTop(selectedId, 0, false);
          placeConnector(selectedId);
        });
      } else {
        // Clicked outside any dot — clear selection
        setActiveIssueIds(new Set());
        setExpandedIssueId(null);
        if (connectorSvgRef.current) {
          connectorSvgRef.current.innerHTML = "";
        }
      }
    },
    [
      computeDots,
      currentIssues,
      setActiveIssueIds,
      scrollIssueIntoTop,
      placeConnector,
      documentType,
      connectorSvgRef,
    ],
  );

  // Handle expand/collapse of issue cards
  const handleExpandChange = useCallback(
    (issueId: string, expanded: boolean) => {
      setExpandedIssueId(expanded ? issueId : null);

      if (expanded) {
        setActiveIssueIds(new Set([issueId]));
        // Use requestAnimationFrame to ensure DOM updates happen after state update
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Center both comment and text
            scrollIssueIntoTop(issueId, 0, true); // Center the comment
            scrollIssueIntoView(issueId); // Center the text
            if (documentType === "word") {
              let retryCount = 0;
              const maxRetries = 20;
              const checkAndPlace = () => {
                const spanElement = highlightedSpanRefs.current.get(issueId);
                if (spanElement && spanElement.offsetParent !== null) {
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => placeConnector(issueId));
                  });
                } else if (retryCount < maxRetries) {
                  retryCount++;
                  setTimeout(checkAndPlace, 50);
                }
              };
              checkAndPlace();
            } else {
              placeConnector(issueId);
            }
          });
        });
      } else {
        setActiveIssueIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(issueId);
          return newSet;
        });
      }
    },
    [
      setActiveIssueIds,
      scrollIssueIntoView,
      scrollIssueIntoTop,
      placeConnector,
      documentType,
    ],
  );

  // Enhanced issue click handler — computes final state in one pass, applies once.
  const handleIssueCardClick = useCallback(
    (issueId: string) => {
      // ── Cross-page navigation (screenshots only) ──
      if (isImageDocumentType(documentType) && images.length > 0) {
        const issue = images
          .flatMap((img) => img.issues)
          .find((i) => i.id === issueId);
        if (issue?.page != null) {
          const targetPageIndex = Math.max(
            0,
            Math.min(images.length - 1, issue.page - 1),
          );
          if (targetPageIndex !== selectedImageIndex) {
            pendingIssueRef.current = issueId;
            setSelectedImageIndex(targetPageIndex);
            return;
          }
        }
      }

      // ── Validate Word issues ──
      if (documentType === "word") {
        const issue = currentIssues.find((i) => i.id === issueId);
        if (!issue?.wordRange) return;
        const { start, end } = issue.wordRange;
        if (
          start < 0 ||
          end <= start ||
          start >= documentText.length ||
          end > documentText.length
        )
          return;
      }

      // ── Compute the desired final state in one pass (no intermediate renders) ──
      const isSoleActive =
        activeIssueIds.has(issueId) && activeIssueIds.size === 1;
      const willDeselect = isSoleActive;

      // Determine final active set and expanded state
      const nextActiveIds = willDeselect
        ? new Set<string>()
        : new Set([issueId]);
      // Collapse any expanded card when switching issues; keep collapsed when deselecting
      const nextExpanded = null;

      // Apply all state in a single synchronous batch (React 18 auto-batches)
      setActiveIssueIds(nextActiveIds);
      setExpandedIssueId(nextExpanded);

      if (willDeselect) {
        // Clear connector when deselecting
        if (connectorSvgRef.current) connectorSvgRef.current.innerHTML = "";
        return;
      }

      // ── Scroll & connect after the DOM paints the new active state ──
      requestAnimationFrame(() => {
        if (isImageDocumentType(documentType)) {
          scrollIssueIntoTop(issueId, 0, true);
          scrollDotIntoView(issueId);
          // Re-place connector after smooth scroll settles so the line
          // connects to the pin's on-screen position (important when zoomed).
          placeConnector(issueId);
          setTimeout(() => placeConnector(issueId), 350);
        } else {
          // Word: scroll to highlighted text first, then card, then connector
          const tryScrollWord = (attempt = 0) => {
            const spanEl = highlightedSpanRefs.current.get(issueId);
            if (spanEl && spanEl.offsetParent !== null) {
              scrollIssueIntoView(issueId);
              requestAnimationFrame(() => {
                scrollIssueIntoTop(issueId, 0, true);
                placeConnector(issueId);
              });
            } else if (attempt < 20) {
              setTimeout(() => tryScrollWord(attempt + 1), 50);
            }
          };
          tryScrollWord();
        }
      });
    },
    [
      activeIssueIds,
      currentIssues,
      documentText,
      documentType,
      images,
      selectedImageIndex,
      setSelectedImageIndex,
      setActiveIssueIds,
      scrollIssueIntoView,
      scrollIssueIntoTop,
      scrollDotIntoView,
      placeConnector,
      connectorSvgRef,
      highlightedSpanRefs,
    ],
  );

  // After a page switch completes, select the pending issue (avoids stale-closure problem)
  // Uses polling to wait for the canvas to be fully drawn before selecting.
  useEffect(() => {
    const pendingId = pendingIssueRef.current;
    if (!pendingId || !isImageDocumentType(documentType)) return;
    pendingIssueRef.current = null;

    // 1) Immediately clear any previous selection & connector
    clearSelection();
    if (connectorSvgRef.current) connectorSvgRef.current.innerHTML = "";
    setExpandedIssueId(null);

    // 2) Poll until the canvas has drawn the new page (imgDrawRef has dimensions)
    let attempts = 0;
    const MAX_ATTEMPTS = 30; // 30 × 50ms = 1.5s max wait
    const poll = () => {
      attempts++;
      const canvas = canvasRef.current;
      const imgDraw = canvas ? (canvas as any).imgDrawRef?.current : null;
      const isReady = imgDraw && imgDraw.w > 0 && imgDraw.h > 0;

      if (!isReady && attempts < MAX_ATTEMPTS) {
        timerId = window.setTimeout(poll, 50);
        return;
      }

      // 3) Wait for the page fade-in transition to finish, then select
      selectTimerId = window.setTimeout(() => {
        handleIssueClick(pendingId);
        setExpandedIssueId(null);

        requestAnimationFrame(() => {
          scrollIssueIntoTop(pendingId, 0, true);
          scrollDotIntoView(pendingId);
          placeConnector(pendingId);
        });
      }, 120); // 120ms after canvas ready (fade-in is ~180ms so we don't wait full length)
    };

    let selectTimerId = 0;
    let timerId = window.setTimeout(poll, 40);

    return () => {
      clearTimeout(timerId);
      clearTimeout(selectTimerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImageIndex]);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    clearSelection();
    setExpandedIssueId(null);
    if (connectorSvgRef.current) {
      connectorSvgRef.current.innerHTML = "";
    }
  }, [clearSelection]);

  // Handle manual page change (via thumbnails) — clears current selection
  const handlePageSelect = useCallback(
    (index: number) => {
      if (index === selectedImageIndex) return;
      clearSelection();
      setExpandedIssueId(null);
      if (connectorSvgRef.current) {
        connectorSvgRef.current.innerHTML = "";
      }
      setSelectedImageIndex(index);
    },
    [selectedImageIndex, clearSelection, setSelectedImageIndex],
  );

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  }, []);

  // Handle text click with connector placement
  const handleTextClickWithConnector = useCallback(
    (issueIds: string[]) => {
      if (issueIds.length === 0) return;

      // CRITICAL: For Word documents, validate all issues have wordRange before processing
      if (documentType === "word") {
        const validIssueIds = issueIds.filter((issueId) => {
          const issue = currentIssues.find((i) => i.id === issueId);
          if (!issue || !issue.wordRange) return false;
          const { start, end } = issue.wordRange;
          return (
            start >= 0 &&
            end > start &&
            start < documentText.length &&
            end <= documentText.length
          );
        });
        if (validIssueIds.length === 0) return;
        issueIds = validIssueIds;
      }

      const allAlreadyActive = issueIds.every((id) => activeIssueIds.has(id));
      const willDeselect =
        allAlreadyActive && activeIssueIds.size === issueIds.length;

      handleTextClick(issueIds);

      if (willDeselect) {
        if (connectorSvgRef.current) {
          connectorSvgRef.current.innerHTML = "";
        }
      } else {
        const firstIssueId = issueIds[0];
        // When clicking text, center both the comment and the text
        // Wait for the card to be fully rendered and expanded before scrolling
        setTimeout(() => {
          // Retry mechanism to ensure card is ready
          let retryCount = 0;
          const maxRetries = 8;
          const tryScroll = () => {
            const cardEl = panelRef.current?.querySelector(
              `[data-id="${firstIssueId}"]`,
            ) as HTMLElement;
            const spanElement = highlightedSpanRefs.current.get(firstIssueId);

            if (
              cardEl &&
              cardEl.offsetParent !== null &&
              spanElement &&
              spanElement.offsetParent !== null
            ) {
              // Both elements are ready, center both comment and text
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  scrollIssueIntoTop(firstIssueId, 0, true); // Center the comment
                  scrollIssueIntoView(firstIssueId); // Center the text
                });
              });
            } else if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(tryScroll, 100);
            } else {
              // Fallback: try scrolling anyway
              scrollIssueIntoTop(firstIssueId, 0, true);
              scrollIssueIntoView(firstIssueId);
            }
          };
          tryScroll();
        }, 200);
        setTimeout(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => placeConnector(firstIssueId));
          });
        }, 50);
      }
    },
    [
      handleTextClick,
      scrollIssueIntoView,
      scrollIssueIntoTop,
      placeConnector,
      activeIssueIds,
      documentType,
      currentIssues,
      documentText,
    ],
  );

  // Navigation
  const handleGoBackToValidation = useCallback(() => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: 1, // Go back to Tasks & Direction step
    }));
  }, [setCurrentStep]);

  // Update connector when word issues change
  useEffect(() => {
    if (
      documentType === "word" &&
      activeIssueIds.size > 0 &&
      currentIssues.length > 0
    ) {
      requestAnimationFrame(() => {
        setTimeout(() => placeConnectorsForActiveIssues(), 0);
      });
    }
  }, [
    currentIssues,
    activeIssueIds,
    documentType,
    placeConnectorsForActiveIssues,
  ]);

  // Re-place connector after zoom changes (canvas resizes asynchronously)
  useEffect(() => {
    if (!isImageDocumentType(documentType) || activeIssueIds.size === 0) return;
    const timerId = window.setTimeout(() => {
      placeConnectorsForActiveIssues();
    }, 200);
    return () => clearTimeout(timerId);
  }, [zoom, documentType, activeIssueIds, placeConnectorsForActiveIssues]);

  // Update connector when cards are expanded/collapsed
  useEffect(() => {
    if (documentType === "word" && panelRef.current) {
      const observer = new MutationObserver(() => {
        requestAnimationFrame(() => placeConnectorsForActiveIssues());
      });

      observer.observe(panelRef.current, {
        attributes: true,
        attributeFilter: ["data-expanded"],
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, [documentType, placeConnectorsForActiveIssues]);

  // Handle download Word document with comments
  const handleDownloadWordDocument = useCallback(async () => {
    if (documentType !== "word") {
      alert("Word document download is only available for Word documents.");
      return;
    }

    if (!documentText?.trim()) {
      alert("No document text available. Please run validation first.");
      return;
    }

    if (!currentIssues.length) {
      alert("No issues available to include in the document.");
      return;
    }

    try {
      setIsGeneratingDoc(true);
      const approvedIssues = currentIssues.filter(
        (issue) => issue.reviewStatus === "approved",
      );

      if (!approvedIssues.length) {
        alert(
          "No approved issues to include in the document. Please approve some issues first.",
        );
        return;
      }

      const originalFile = routeValidatorFormValues.file?.fileObject as
        | File
        | Blob
        | undefined;
      const blob = await generateWordDocumentWithComments(
        documentText,
        approvedIssues,
        fileName,
        originalFile,
      );

      const baseFileName = fileName.replace(/\.[^/.]+$/, "");
      const downloadFileName = `${baseFileName}_with_comments.docx`;
      saveAs(blob, downloadFileName);
    } catch (error) {
      alert(
        `Failed to generate Word document: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsGeneratingDoc(false);
    }
  }, [
    documentType,
    documentText,
    currentIssues,
    fileName,
    routeValidatorFormValues.file?.fileObject,
  ]);

  // Get ALL issues from ALL images for screenshots mode, or all validation issues for word mode
  // This is needed to check if ALL comments across ALL pages are approved
  const allIssuesAcrossAllPages = useMemo(() => {
    if (isImageDocumentType(documentType)) {
      // Collect all issues from all images
      // CRITICAL: images already have review status from useImageHandling which uses reviewStatusMap
      // But we need to ensure we're using the latest reviewStatusMap directly
      const allImageIssues: Issue[] = [];
      images.forEach((image) => {
        image.issues.forEach((issue) => {
          // Get review status directly from map (most up-to-date)
          // Check both the image-specific ID (issue.id) and the original ID
          const imageIssueId = issue.id; // e.g., "issue-seo-1-img-1"
          // Extract original ID by removing "-img-X" suffix if present
          const originalId = imageIssueId.replace(/-img-\d+$/, "");

          // Get the latest review status from map (this is the source of truth)
          const latestReviewStatus =
            reviewStatusMap.get(imageIssueId) ||
            reviewStatusMap.get(originalId) ||
            issue.reviewStatus ||
            "not_reviewed";

          const issueWithStatus = {
            ...issue,
            reviewStatus: latestReviewStatus, // Use latest from map
          };
          allImageIssues.push(issueWithStatus);
        });
      });

      return allImageIssues;
    } else {
      // For word documents, use allValidationIssues with review status merged
      return allValidationIssues.map((issue) => ({
        ...issue,
        reviewStatus:
          reviewStatusMap.get(issue.id) || issue.reviewStatus || "not_reviewed",
      }));
    }
  }, [documentType, images, allValidationIssues, reviewStatusMap]);

  // Check if at least ONE issue is approved (required for download button to be enabled)
  // Button should be enabled when at least ONE comment across ANY page is approved
  const hasApprovedIssues = useMemo(() => {
    return allIssuesAcrossAllPages.some(
      (issue) => issue.reviewStatus === "approved",
    );
  }, [allIssuesAcrossAllPages]);

  // Handle download PDF document with comments
  const handleDownloadPdfDocument = useCallback(async () => {
    if (!isImageDocumentType(documentType)) {
      alert(
        "PDF document download with comments is only available for image-based documents.",
      );
      return;
    }

    if (!images || images.length === 0) {
      alert("No images available. Please run validation first.");
      return;
    }

    if (!allIssuesAcrossAllPages.length) {
      alert("No issues available to include in the document.");
      return;
    }

    try {
      setIsGeneratingPdf(true);

      // CRITICAL: Collect ALL approved issues from ALL images
      // This allows approving comments from any image (e.g., approve image 5 comment while viewing image 1)
      const approvedIssues = allIssuesAcrossAllPages.filter(
        (issue) => issue.reviewStatus === "approved",
      );

      if (!approvedIssues.length) {
        alert(
          "No approved issues to include in the document. Please approve some issues first.",
        );
        return;
      }

      const blob = await generatePdfDocumentWithComments(
        images,
        approvedIssues,
        fileName,
      );

      const baseFileName = fileName.replace(/\.[^/.]+$/, "");
      const downloadFileName = `${baseFileName}_with_comments.pdf`;
      saveAs(blob, downloadFileName);
    } catch (error) {
      alert(
        `Failed to generate PDF document: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [documentType, images, allIssuesAcrossAllPages, fileName]);

  const isDownloadDisabled =
    documentType === "word"
      ? isGeneratingDoc || !documentText || !hasApprovedIssues
      : isGeneratingPdf || !images || images.length === 0 || !hasApprovedIssues;
  const isDownloading = documentType === "word" ? isGeneratingDoc : isGeneratingPdf;
  const handleDownload =
    documentType === "word"
      ? handleDownloadWordDocument
      : handleDownloadPdfDocument;
  const showDownload =
    (documentType === "word" || isImageDocumentType(documentType)) &&
    !!validationResults;

  return (
    <Box
      sx={{
        px: 2.5,
        pt: 2,
        pb: 2,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          bgcolor: "#1C1917",
          px: 2.5,
          py: 1.25,
          borderRadius: "10px",
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "7px",
              bgcolor: "rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: 12, color: "#A8A29E", fontWeight: 600 }}>
              {isImageDocumentType(documentType)
                ? "PDF"
                : documentType === "word"
                  ? "DOC"
                  : "ZIP"}
            </Typography>
          </Box>
          <Typography
            sx={{
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 400,
            }}
          >
            {fileName}
          </Typography>
        </Box>
        {showDownload && (
          <Button
            onClick={handleDownload}
            disabled={isDownloadDisabled}
            sx={{
              px: 2.5,
              py: 0.75,
              borderRadius: "8px",
              fontSize: 12,
              textTransform: "none",
              fontWeight: 600,
              letterSpacing: "0.01em",
              bgcolor: isDownloadDisabled
                ? "rgba(255,255,255,0.08)"
                : "#E86D5A",
              color: isDownloadDisabled
                ? "rgba(255,255,255,0.3)"
                : "#FFFFFF",
              "&:hover": {
                bgcolor: isDownloadDisabled
                  ? "rgba(255,255,255,0.08)"
                  : "#D4553F",
              },
              transition: "all 0.15s ease",
            }}
          >
            {isDownloading ? "Generating..." : "Download"}
          </Button>
        )}
      </Box>

      {/* Main content area */}
      <Box
        ref={appContainerRef}
        sx={{
          display: "flex",
          flex: 1,
          gap: 2,
          minHeight: 0,
          minWidth: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isImageDocumentType(documentType) && (
          <ImageThumbnails
            images={images}
            selectedIndex={selectedImageIndex}
            onSelect={handlePageSelect}
          />
        )}

        <svg
          ref={connectorSvgRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <DocumentViewer
          documentType={documentType}
          wordText={wordText}
          wordHtml={wordHtml}
          wordIssues={currentIssues}
          activeIssueIds={activeIssueIds}
          images={images}
          selectedImageIndex={selectedImageIndex}
          isValidating={isValidating}
          hasValidationResults={!!validationResults}
          highlightedSpanRefs={highlightedSpanRefs}
          stageRef={stageRef}
          canvasRef={canvasRef}
          onTextClick={handleTextClickWithConnector}
          onCanvasClick={handleCanvasClick}
          onGoBackToValidation={handleGoBackToValidation}
          onClearSelection={handleClearSelection}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />

        <IssuesSidebar
          issues={isImageDocumentType(documentType) ? allIssues : currentIssues}
          activeIssueIds={activeIssueIds}
          isValidating={isValidating}
          hasValidationResults={!!validationResults}
          onIssueClick={handleIssueCardClick}
          onGoBackToValidation={handleGoBackToValidation}
          getSeverityColor={getSeverityColor}
          panelRef={panelRef}
          onReviewStatusChange={handleReviewStatusChange}
          taskProgress={Array.from(taskProgress.values())}
          expandedIssueId={expandedIssueId}
          onExpandChange={handleExpandChange}
          currentPage={selectedImageIndex + 1}
          onClearSelection={handleClearSelection}
          onRetryTask={retryTask}
        />
      </Box>
    </Box>
  );
};

export default OutputStep;
