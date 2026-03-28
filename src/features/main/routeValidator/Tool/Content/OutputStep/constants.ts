/**
 * Canvas rendering constants
 */
export const DPR = window.devicePixelRatio || 1;
export const DOT_SIZE = 10; // Smaller dots for better precision and less visual clutter
export const DOT_RADIUS = DOT_SIZE / 2;

/**
 * Issue type to severity mapping
 */
export const TYPE_TO_SEVERITY: Record<string, number> = {
  spelling: 5,
  grammar: 4,
  consistency: 4,
  wcag: 5,
  accessibility: 5,
  seo: 4,
  editorial: 4,
  brand: 5,
};

/**
 * Issue type to color mapping for highlights
 */
export const ISSUE_TYPE_COLORS: Record<string, string> = {
  spelling: "#FFEB3B", // Yellow
  grammar: "#FF9800", // Orange
  consistency: "#FF9800", // Orange (same as grammar)
  wcag: "#9C27B0", // Purple
  accessibility: "#9C27B0", // Purple (same as wcag)
  seo: "#2196F3", // Blue
  editorial: "#00BCD4", // Cyan
  brand: "#F44336", // Red
};

/**
 * Default highlight color for all issues (consistent UX)
 */
export const DEFAULT_HIGHLIGHT_COLOR = "#FFEB3B";

/**
 * UI Colors
 */
export const COLORS = {
  background: {
    panel: "#F5F5F4", // stone-100
    issueCard: "#FFFFFF", // white, clean card
    issueCardHeader: "#FAFAF9", // stone-50, subtle header
    canvas: "#FFFFFF", // White background for images
    document: "#FFFFFF",
  },
  text: {
    primary: "#1C1917", // charcoal-900
    secondary: "#57534E", // charcoal-600
    muted: "#A8A29E", // charcoal-400
    label: "#A8A29E", // charcoal-400
  },
  border: {
    active: "rgba(255,255,255,0.36)",
    inactive: "rgba(255,255,255,0.1)",
    hover: "rgba(255,255,255,0.22)",
  },
  error: "#DC5E5E", // rejected
  active: {
    shadow: "rgba(232,109,90,0.12)", // coral ring
    border: "rgba(232,109,90,0.25)", // coral-based border
  },
};

/**
 * Connector SVG gradient configuration
 */
export const CONNECTOR_GRADIENT = {
  startColor: "#A8A29E", // charcoal-400
  startOpacity: "0.4",
  endOpacity: "0.08",
};

/**
 * Animation and timing constants
 */
export const TIMING = {
  connectorRetryDelay: 50,
  connectorMaxRetries: 20,
  connectorFallbackDelay: 100,
  resizeDebounce: 100,
  scrollDebounce: 0,
};
