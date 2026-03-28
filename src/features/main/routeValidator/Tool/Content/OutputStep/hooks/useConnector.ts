import { useCallback, useRef, useEffect } from "react";
import { DotsMap, DocumentType, isImageDocumentType } from "../types";
import { DOT_RADIUS, CONNECTOR_GRADIENT } from "../constants";

interface UseConnectorProps {
  connectorSvgRef: React.RefObject<SVGSVGElement>;
  stageRef: React.RefObject<HTMLDivElement>;
  panelRef: React.RefObject<HTMLDivElement>;
  appContainerRef: React.RefObject<HTMLDivElement>;
  documentType: DocumentType;
  computeDots: () => DotsMap;
  activeIssueIds: Set<string>;
}

interface UseConnectorResult {
  placeConnector: (issueId: string | null) => void;
  placeConnectorsForActiveIssues: () => void;
}

/**
 * Hook to manage connector SVG drawing between issues and text/dots
 */
export const useConnector = ({
  connectorSvgRef,
  stageRef,
  panelRef,
  appContainerRef,
  documentType,
  computeDots,
  activeIssueIds,
}: UseConnectorProps): UseConnectorResult => {
  const rafConnRef = useRef<number | null>(null);

  /**
   * Place connector SVG between a dot/text and its issue card
   */
  const placeConnector = useCallback(
    (issueId: string | null) => {
      if (
        !issueId ||
        !connectorSvgRef.current ||
        !stageRef.current ||
        !panelRef.current ||
        !appContainerRef.current
      ) {
        if (connectorSvgRef.current) {
          connectorSvgRef.current.innerHTML = "";
        }
        return;
      }

      const dots = computeDots();
      const dot = dots[issueId];

      if (!dot) {
        if (connectorSvgRef.current) {
          connectorSvgRef.current.innerHTML = "";
        }
        return;
      }

      const stageRect = stageRef.current.getBoundingClientRect();
      const appRect = appContainerRef.current.getBoundingClientRect();

      const cardEl = panelRef.current.querySelector(
        `[data-id="${issueId}"]`
      ) as HTMLElement;
      if (!cardEl) {
        if (connectorSvgRef.current) {
          connectorSvgRef.current.innerHTML = "";
        }
        return;
      }

      const cardRect = cardEl.getBoundingClientRect();

      // Compute card coordinates relative to app container
      const cardLeftX = cardRect.left - appRect.left;
      const cardTopLeft = { x: cardLeftX, y: cardRect.top - appRect.top };
      const cardBottomLeft = { x: cardLeftX, y: cardRect.bottom - appRect.top };

      // Compute dot anchor points relative to app.
      // For zoomed images the canvas is wider than the stageRef viewport and may be
      // partially scrolled out of view. getBoundingClientRect gives the on-screen
      // position, so canvasRect.left + dot.x still yields the correct screen position
      // even when zoomed/scrolled.
      let dotScreenX: number;
      let dotScreenY: number;

      if (isImageDocumentType(documentType)) {
        const canvasEl = appContainerRef.current.querySelector("canvas") as HTMLCanvasElement | null;
        if (!canvasEl) {
          if (connectorSvgRef.current) {
            connectorSvgRef.current.innerHTML = "";
          }
          return;
        }
        const canvasRect = canvasEl.getBoundingClientRect();
        const screenX = canvasRect.left + dot.x;
        const screenY = canvasRect.top + dot.y;
        dotScreenX = screenX - appRect.left;
        dotScreenY = screenY - appRect.top;

        // If the dot is outside the visible stageRef viewport, skip drawing the
        // connector (it would look broken). The scroll-to-dot function will bring
        // the pin into view before the connector is placed.
        if (stageRef.current) {
          const stageVpRect = stageRef.current.getBoundingClientRect();
          const dotScreenAbsX = screenX;
          const dotScreenAbsY = screenY;
          if (
            dotScreenAbsX < stageVpRect.left - 20 ||
            dotScreenAbsX > stageVpRect.right + 20 ||
            dotScreenAbsY < stageVpRect.top - 20 ||
            dotScreenAbsY > stageVpRect.bottom + 20
          ) {
            if (connectorSvgRef.current) connectorSvgRef.current.innerHTML = "";
            return;
          }
        }
      } else {
        // For Word documents, dots are in stage scroll-content coordinates
        const scrollTop = stageRef.current.scrollTop ?? 0;
        dotScreenX = stageRect.left - appRect.left + dot.x;
        dotScreenY = stageRect.top - appRect.top + (dot.y - scrollTop);
      }

      const dotTopMid = { x: dotScreenX, y: dotScreenY - DOT_RADIUS };
      const dotBottomMid = { x: dotScreenX, y: dotScreenY + DOT_RADIUS };

      // Build polygon path
      const path = `M ${cardTopLeft.x},${cardTopLeft.y}
                    L ${cardBottomLeft.x},${cardBottomLeft.y}
                    L ${dotBottomMid.x},${dotBottomMid.y}
                    L ${dotTopMid.x},${dotTopMid.y}
                    Z`;

      const svg = connectorSvgRef.current;

      // Set SVG viewBox and dimensions
      svg.setAttribute("viewBox", `0 0 ${appRect.width} ${appRect.height}`);
      svg.setAttribute("width", appRect.width.toString());
      svg.setAttribute("height", appRect.height.toString());
      svg.innerHTML = "";

      // Create gradient
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
      grad.setAttribute("id", `fade-${issueId}`);
      grad.setAttribute("gradientUnits", "userSpaceOnUse");

      const cardMidY = (cardTopLeft.y + cardBottomLeft.y) / 2;
      grad.setAttribute("x1", cardTopLeft.x.toString());
      grad.setAttribute("y1", cardMidY.toString());
      grad.setAttribute("x2", dotScreenX.toString());
      grad.setAttribute("y2", dotScreenY.toString());

      const s1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      s1.setAttribute("offset", "0%");
      s1.setAttribute("stop-color", CONNECTOR_GRADIENT.startColor);
      s1.setAttribute("stop-opacity", CONNECTOR_GRADIENT.startOpacity);

      const s2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      s2.setAttribute("offset", "100%");
      s2.setAttribute("stop-color", CONNECTOR_GRADIENT.startColor);
      s2.setAttribute("stop-opacity", CONNECTOR_GRADIENT.endOpacity);

      grad.appendChild(s1);
      grad.appendChild(s2);
      defs.appendChild(grad);

      // Create shadow filter
      const flt = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      flt.setAttribute("id", `shadow-${issueId}`);
      flt.innerHTML = `<feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="black" flood-opacity="0.35"/>`;
      defs.appendChild(flt);

      // Create path
      const poly = document.createElementNS("http://www.w3.org/2000/svg", "path");
      poly.setAttribute("d", path);
      poly.setAttribute("fill", `url(#fade-${issueId})`);
      poly.setAttribute("stroke", "rgba(255,255,255,0.18)");
      poly.setAttribute("stroke-width", "1.5");
      poly.setAttribute("stroke-linejoin", "round");
      poly.setAttribute("stroke-linecap", "round");
      poly.setAttribute("filter", `url(#shadow-${issueId})`);

      svg.appendChild(defs);
      svg.appendChild(poly);
    },
    [connectorSvgRef, stageRef, panelRef, appContainerRef, computeDots]
  );

  /**
   * Place connectors for all active issues
   * Also shows connector for expanded cards (when "More" is clicked)
   * Expanded cards take priority over active cards
   */
  const placeConnectorsForActiveIssues = useCallback(() => {
    // First, check for expanded cards (they take priority)
    if (panelRef.current) {
      const expandedCard = panelRef.current.querySelector(
        '[data-expanded="true"]'
      ) as HTMLElement;

      if (expandedCard) {
        const expandedIssueId = expandedCard.getAttribute('data-id');
        if (expandedIssueId) {
          placeConnector(expandedIssueId);
          return;
        }
      }
    }

    // If no expanded cards, check for active issues
    if (activeIssueIds.size > 0) {
      // For now, place connector for the first active issue
      // In a more advanced implementation, could draw multiple connectors
      const firstIssueId = Array.from(activeIssueIds)[0];
      placeConnector(firstIssueId);
      return;
    }

    // No active or expanded cards, clear connector
    if (connectorSvgRef.current) {
      connectorSvgRef.current.innerHTML = "";
    }
  }, [activeIssueIds, placeConnector, connectorSvgRef, panelRef]);

  // Handle scroll events with RAF throttling
  useEffect(() => {
    const handleScroll = () => {
      if (rafConnRef.current) return;

      rafConnRef.current = requestAnimationFrame(() => {
        rafConnRef.current = null;
        placeConnectorsForActiveIssues();
      });
    };

    const stage = stageRef.current;
    const panel = panelRef.current;

    if (stage) {
      stage.addEventListener("scroll", handleScroll, { passive: true });
    }
    if (panel) {
      panel.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (stage) stage.removeEventListener("scroll", handleScroll);
      if (panel) panel.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
      if (rafConnRef.current) {
        cancelAnimationFrame(rafConnRef.current);
        rafConnRef.current = null;
      }
    };
  }, [stageRef, panelRef, placeConnectorsForActiveIssues]);

  return {
    placeConnector,
    placeConnectorsForActiveIssues,
  };
};

export default useConnector;
