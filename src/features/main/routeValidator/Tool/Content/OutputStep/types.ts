import { TValidationIssue } from "../../../../../../types/response/routeValidator";

/**
 * Review status for issues
 */
export type ReviewStatus = "not_reviewed" | "approved" | "rejected";

/**
 * Issue type used throughout the OutputStep components
 */
export type Issue = {
  id: string;
  type: string;
  severity: number;
  body: {
    issue: string;
    reasoning: string;
    recommendation: string;
  };
  position: { x: number; y: number };
  wordRange?: { start: number; end: number };
  locationText?: string; // The original text from AI's location.text - used for grouping related issues
  reviewStatus?: ReviewStatus; // Review status: not_reviewed (default), approved, or rejected
  page?: number; // Page number (1-based) - used for image-based issues to match with image index
};

/**
 * Image data type for screenshot validation
 */
export type ImageData = {
  id: string;
  url: string;
  name: string;
  issues: Issue[];
};

/**
 * Document type options
 */
export type DocumentType = "word" | "screenshots" | "route";

/**
 * Check if the document type is image-based (pages rendered as images)
 */
export const isImageDocumentType = (dt: DocumentType): boolean =>
  dt === "screenshots" || dt === "route";

/**
 * Range key for grouping issues by text position
 */
export type RangeKey = string; // Format: "start-end"

/**
 * Grouped issues by range
 */
export type IssuesByRange = Map<RangeKey, Issue[]>;

/**
 * Dot position for connector drawing
 */
export type DotPosition = {
  x: number;
  y: number;
};

/**
 * Dots map for all issues
 */
export type DotsMap = Record<string, DotPosition>;

/**
 * Image draw dimensions for canvas
 */
export type ImageDrawDimensions = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * Props for IssueCard component
 */
export interface IssueCardProps {
  issue: Issue;
  isActive: boolean;
  onClick: () => void;
  getSeverityColor: (severity: number) => string;
  onReviewStatusChange: (issueId: string, status: ReviewStatus) => void;
  isExpanded: boolean;
  onExpandChange: (issueId: string, expanded: boolean) => void;
  currentPage?: number;
}

/**
 * Props for IssuesSidebar component
 */
export interface IssuesSidebarProps {
  issues: Issue[];
  activeIssueIds: Set<string>;
  isValidating: boolean;
  hasValidationResults: boolean;
  onIssueClick: (issueId: string) => void;
  onGoBackToValidation: () => void;
  getSeverityColor: (severity: number) => string;
  panelRef: React.RefObject<HTMLDivElement>;
  onReviewStatusChange: (issueId: string, status: ReviewStatus) => void;
  taskProgress?: TaskProgress[];
  expandedIssueId: string | null;
  onExpandChange: (issueId: string, expanded: boolean) => void;
  currentPage?: number;
  /** Clear the current issue selection (remove connector/highlight) */
  onClearSelection?: () => void;
  /** Retry a single failed validation task */
  onRetryTask?: (task: string) => void;
}

/**
 * Props for DocumentViewer component
 */
export interface DocumentViewerProps {
  documentType: DocumentType;
  wordText: string;
  wordHtml?: string; // HTML content with formatting preserved
  wordIssues: Issue[];
  activeIssueIds: Set<string>;
  images: ImageData[];
  selectedImageIndex: number;
  isValidating: boolean;
  hasValidationResults: boolean;
  highlightedSpanRefs: React.MutableRefObject<Map<string, HTMLSpanElement>>;
  stageRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onTextClick: (issueIds: string[]) => void;
  onCanvasClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onGoBackToValidation: () => void;
  onClearSelection?: () => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

/**
 * Props for ImageThumbnails component
 */
export interface ImageThumbnailsProps {
  images: ImageData[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Props for LoadingOverlay component
 */
export interface LoadingOverlayProps {
  isVisible: boolean;
}

/**
 * Props for TextHighlighter component
 */
export interface TextHighlighterProps {
  text: string;
  html?: string; // HTML content with formatting preserved
  issues: Issue[];
  activeIssueIds: Set<string>;
  highlightedSpanRefs: React.MutableRefObject<Map<string, HTMLSpanElement>>;
  onTextClick: (issueIds: string[]) => void;
  onClearSelection?: () => void;
}

/**
 * Validation issue to Issue converter function type
 */
export type ConvertValidationIssueToIssue = (
  validationIssue: TValidationIssue,
  index: number
) => Issue;

/**
 * Task status for progress tracking
 */
export type TaskStatus = 'pending' | 'loading' | 'completed' | 'error';

/**
 * Task progress tracking
 */
export interface TaskProgress {
  task: string;
  status: TaskStatus;
  startedAt?: number; // Timestamp when loading started
  result?: {
    task: string;
    issues: any[];
    summary?: string;
    error?: string;
  };
  error?: string;
}

/**
 * Task display names mapping
 */
export const TASK_DISPLAY_NAMES: Record<string, string> = {
  spell_check: 'Spell check',
  grammar_consistency: 'Grammar consistency',
  wcag_compliance: 'WCAG compliance',
  seo_checks: 'SEO checks',
  ama_compliance: 'AMA compliance',
  organization_editorial_guideline: 'AMA Guidelines',
  client_brand_guideline: 'Client brand guideline',
};
