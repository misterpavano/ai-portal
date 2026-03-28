import { useCallback, useRef, useEffect } from "react";
import { DPR, DOT_RADIUS } from "../constants";
import { getSeverityColor } from "../utils";
import { Issue, DotsMap, DocumentType, isImageDocumentType } from "../types";
import { devLog, devWarn } from "../../../../../../../utils/devLog";

interface UseCanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  stageRef: React.RefObject<HTMLDivElement>;
  documentType: DocumentType;
  currentIssues: Issue[];
  activeIssueIds: Set<string>;
  images: any[];
  selectedImageIndex: number;
  computeDots: () => DotsMap;
  placeConnectorsForActiveIssues: () => void;
}

export const useCanvasDrawing = ({
  canvasRef,
  stageRef,
  documentType,
  currentIssues,
  activeIssueIds,
  images,
  selectedImageIndex,
  computeDots,
  placeConnectorsForActiveIssues,
}: UseCanvasDrawingProps) => {
  const imgDrawRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const cachedImageRef = useRef<HTMLImageElement | null>(null);
  const cachedImageUrlRef = useRef<string | null>(null);
  // Cache dimensions per URL so when switching images (e.g. 4x4 vs 4x10) canvas size is correct before image loads
  const dimensionsCacheRef = useRef<Map<string, { w: number; h: number }>>(new Map());
  // Stable ref for `redraw` so the ResizeObserver/fitCanvas effect doesn't re-run
  // when activeIssueIds changes (which would cause a full canvas blink).
  const redrawRef = useRef<() => void>(() => {});

  // Expose imgDrawRef so computeDots can use actual image dimensions
  // Store it on canvas element for easy access
  useEffect(() => {
    if (canvasRef.current) {
      (canvasRef.current as any).imgDrawRef = imgDrawRef;
    }
  }, [canvasRef]);

  const drawDots = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const dots = computeDots();

      currentIssues.forEach((issue) => {
        const dot = dots[issue.id];
        if (!dot) {
          devWarn(`[drawDots] No dot found for issue ${issue.id}`);
          return;
        }

        // Map-pin / pointer marker: circle head + triangular point at the bottom.
        // dot.x, dot.y is the pin's *tip* (where it points on the image).
        const severityColor = getSeverityColor(issue.severity);
        const r = DOT_RADIUS + 2; // Head radius (slightly larger for pin shape)
        const tipLength = r * 1.1; // Length of the pointed tail
        const cx = dot.x; // Centre-x of the circle head
        const cy = dot.y - tipLength - r; // Centre-y (shifted up so tip lands on dot.y)

        ctx.save();

        // Glow for active issue
        if (activeIssueIds.has(issue.id)) {
          ctx.shadowColor = "rgba(90,170,255,0.8)";
          ctx.shadowBlur = 22;
        }

        // Draw the pin shape as a single path: circle + triangle tip
        ctx.beginPath();
        // Arc for the round head (goes from bottom-left to bottom-right, the long way round)
        const angle = Math.asin(Math.min(1, (r * 0.55) / r)); // half-width of triangle base
        ctx.arc(cx, cy, r, Math.PI / 2 + angle, Math.PI / 2 - angle, false);
        // Line down to the tip point
        ctx.lineTo(cx, dot.y);
        ctx.closePath();

        ctx.fillStyle = severityColor;
        ctx.fill();

        // White border for contrast
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.stroke();

        // Small white inner circle for the pin "hole" effect
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fill();

        ctx.restore();
      });
    },
    [computeDots, currentIssues, activeIssueIds]
  );

  // Redraw only dots without reloading image (for activeIssueIds changes)
  const redrawDotsOnly = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isImageDocumentType(documentType)) return;

    const ctx = canvas.getContext("2d");
    if (!ctx || !cachedImageRef.current) return;

    const W = canvas.width / DPR;
    const dots = computeDots();

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Clear only the dots area by redrawing the image portion under each dot
    // This is more efficient than clearing the entire canvas
    currentIssues.forEach((issue) => {
      const dot = dots[issue.id];
      if (!dot) return;

      // Clear area must cover the full pin shape (circle head + triangular tip)
      // Pin tip is at dot.y; head centre is at dot.y - tipLength - r
      const r = DOT_RADIUS + 2;
      const tipLength = r * 1.1;
      const pinHeight = tipLength + r * 2; // from tip to top of head
      const margin = 6; // extra for shadow / stroke
      const halfW = r + margin;
      const topY = dot.y - pinHeight - margin;
      const clearW = halfW * 2;
      const clearH = pinHeight + margin * 2;

      const img = cachedImageRef.current!;
      const scale = W / (img.naturalWidth || 1);

      const sx = Math.max(0, (dot.x - halfW) / scale);
      const sy = Math.max(0, topY / scale);
      const sw = Math.min(img.naturalWidth - sx, clearW / scale);
      const sh = Math.min(img.naturalHeight - sy, clearH / scale);
      const dx = Math.max(0, dot.x - halfW);
      const dy = Math.max(0, topY);

      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, clearW, clearH);
    });

    // Now redraw all dots on top
    drawDots(ctx);
  }, [documentType, drawDots, canvasRef, computeDots, currentIssues]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width / DPR;
    const H = canvas.height / DPR;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    if (isImageDocumentType(documentType) && images[selectedImageIndex]) {
      const imageUrl = images[selectedImageIndex].url;
      const imageName = images[selectedImageIndex].name;

      // When image URL changes, clear imgDrawRef so computeDots doesn't use stale dimensions (wrong x,y)
      if (cachedImageUrlRef.current !== imageUrl) {
        imgDrawRef.current = { x: 0, y: 0, w: 0, h: 0 };
      }

      // Validate URL exists and is not empty
      if (!imageUrl || imageUrl.trim() === '') {
        devWarn(`[useCanvasDrawing] Empty image URL for index ${selectedImageIndex}`);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#000000";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("No image available", W / 2, H / 2);
        return;
      }

      // Use cached image if available and URL hasn't changed
      if (cachedImageRef.current && cachedImageUrlRef.current === imageUrl && cachedImageRef.current.complete) {
        const img = cachedImageRef.current;
        const scale = W / (img.naturalWidth || 1);
        const drawW = W;
        const drawH = (img.naturalHeight || 1) * scale;
        imgDrawRef.current = { x: 0, y: 0, w: drawW, h: drawH };

        dimensionsCacheRef.current.set(imageUrl, { w: img.naturalWidth || 0, h: img.naturalHeight || 0 });
        canvas.style.height = drawH + "px";
        canvas.width = Math.floor(drawW * DPR);
        canvas.height = Math.floor(drawH * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, drawW, drawH);
        ctx.drawImage(img, 0, 0, drawW, drawH);
        drawDots(ctx);
        return;
      }


      // Clear canvas with white background first
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // Set imgDrawRef from cache if available so computeDots gets correct x,y before image loads
      const cachedDims = dimensionsCacheRef.current.get(imageUrl);
      if (cachedDims && cachedDims.w > 0 && cachedDims.h > 0) {
        const scale = W / cachedDims.w;
        const drawW = W;
        const drawH = cachedDims.h * scale;
        imgDrawRef.current = { x: 0, y: 0, w: drawW, h: drawH };
        canvas.style.height = drawH + "px";
        canvas.width = Math.floor(drawW * DPR);
        canvas.height = Math.floor(drawH * DPR);
      }

      const img = new Image();

      // Remove crossOrigin for blob URLs (not needed and can cause CORS issues)
      if (!imageUrl.startsWith('blob:')) {
        img.crossOrigin = "anonymous";
      }

      // Store the URL we're loading to prevent race conditions
      const loadingUrl = imageUrl;
      img.src = loadingUrl;

      img.onload = () => {
        // Verify this is still the image we want (prevent race conditions)
        if (images[selectedImageIndex]?.url !== loadingUrl) {
          return;
        }

        // Cache the loaded image
        cachedImageRef.current = img;
        cachedImageUrlRef.current = loadingUrl;
        dimensionsCacheRef.current.set(loadingUrl, { w: img.naturalWidth || 0, h: img.naturalHeight || 0 });

        const scale = W / (img.naturalWidth || 1);
        const drawW = W;
        const drawH = (img.naturalHeight || 1) * scale;
        imgDrawRef.current = { x: 0, y: 0, w: drawW, h: drawH };

        // Resize canvas to match image so selector + comments stay correct for mixed aspect ratios (e.g. 4x4 vs 4x10)
        canvas.style.height = drawH + "px";
        canvas.width = Math.floor(drawW * DPR);
        canvas.height = Math.floor(drawH * DPR);
        const ctx2 = canvas.getContext("2d");
        if (ctx2) {
          ctx2.setTransform(DPR, 0, 0, DPR, 0, 0);
          ctx2.fillStyle = "#ffffff";
          ctx2.fillRect(0, 0, drawW, drawH);
          ctx2.drawImage(img, 0, 0, drawW, drawH);
          drawDots(ctx2);
        }
      };

      img.onerror = (error) => {
        devWarn(`[useCanvasDrawing] Failed to load image: ${loadingUrl}`);
        // Only show error if this is still the current image
        if (images[selectedImageIndex]?.url === loadingUrl) {
          // Draw error message on canvas
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = "#000000";
          ctx.font = "16px Arial";
          ctx.textAlign = "center";
          ctx.fillText("Failed to load image", W / 2, H / 2);
        }
      };
    } else if (documentType === "word") {
      imgDrawRef.current = { x: 0, y: 0, w: W, h: H };
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      drawDots(ctx);
    }
  }, [images, selectedImageIndex, documentType, drawDots, canvasRef]);

  // Keep redrawRef in sync so fitCanvas always calls the latest version
  redrawRef.current = redraw;

  useEffect(() => {
    const fitCanvas = () => {
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (!canvas || !stage) return;

      // Use canvas parent width when available (respects maxWidth containers),
      // fall back to stage width
      const parentRect = canvas.parentElement?.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const cssW = parentRect ? parentRect.width : stageRect.width;
      let cssH = stageRect.height;

      // Use cached image dimensions when available so canvas has correct size for mixed aspect ratios (e.g. 4x4 vs 4x10)
      if (isImageDocumentType(documentType) && images[selectedImageIndex]) {
        const currentUrl = images[selectedImageIndex].url;
        let scale = cssW;
        let naturalW = 0, naturalH = 0;
        const cached = cachedImageRef.current && cachedImageUrlRef.current === currentUrl ? cachedImageRef.current : null;
        if (cached && cached.naturalWidth && cached.naturalHeight) {
          naturalW = cached.naturalWidth;
          naturalH = cached.naturalHeight;
        } else {
          const dims = dimensionsCacheRef.current.get(currentUrl);
          if (dims) {
            naturalW = dims.w;
            naturalH = dims.h;
          }
        }
        if (naturalW && naturalH) {
          scale = cssW / naturalW;
          cssH = naturalH * scale;
        }
      }

      canvas.style.height = cssH + "px";
      canvas.width = Math.floor(cssW * DPR);
      canvas.height = Math.floor(cssH * DPR);

      // Call via ref so this effect doesn't depend on `redraw` (which changes
      // when activeIssueIds changes, causing a full blink on every click).
      redrawRef.current();
      requestAnimationFrame(() => placeConnectorsForActiveIssues());
    };

    fitCanvas();

    // Defer fitCanvas via rAF to avoid "ResizeObserver loop completed with
    // undelivered notifications". Single rAF keeps zoom redraw one frame late.
    let rafId = 0;
    const deferredFitCanvas = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(fitCanvas);
    };

    const resizeObserver = new ResizeObserver(deferredFitCanvas);
    if (stageRef.current) {
      resizeObserver.observe(stageRef.current);
    }
    if (canvasRef.current?.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
    // NOTE: `redraw` is intentionally NOT in deps — we use `redrawRef` to avoid
    // re-running this effect (and causing a full canvas blink) when only
    // activeIssueIds changes. Image/page/docType changes still trigger re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, selectedImageIndex, documentType, placeConnectorsForActiveIssues, stageRef, canvasRef]);

  useEffect(() => {
    // For screenshots, only redraw dots (not the entire image) when activeIssueIds changes
    // This prevents image flickering/blinking
    if (isImageDocumentType(documentType)) {
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          redrawDotsOnly();
          setTimeout(() => placeConnectorsForActiveIssues(), 50);
        });
      });
      return () => cancelAnimationFrame(rafId);
    } else {
      // For word documents, full redraw is fine
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          redraw();
          setTimeout(() => placeConnectorsForActiveIssues(), 50);
        });
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [activeIssueIds, documentType, redrawDotsOnly, redraw, placeConnectorsForActiveIssues]);

  return { redraw, imgDrawRef };
};

