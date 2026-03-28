import { TValidateDocumentResponse } from "./response/routeValidator";
import { AnnotationSummary } from "../features/main/routeValidator/Tool/Content/OutputStep/wordDocUtils/extractCommentsFromDocx";

export type RouteValidatorFile = {
  fileId: string;
  fileName: string;
  fileObject?: File; // Store the actual File object for ZIP/Word extraction
};

export type RouteValidatorAIIssue = {
  task: "spell_check" | "grammar_consistency" | "wcag_compliance" | "seo_checks" | "org_editorial_guideline";
  pageIndex: number;
  issueId: string;
  shortLabel: string;
  description: string;
  originalText: string | null;
  suggestedFix: string | null;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  coordinateSystem: "normalized_0_1" | "pixels";
};

export type RouteValidatorFlow = {
  documentType: string;
  file: RouteValidatorFile;
  tasks: string[];
  selectedClient: string;
  clientBrand?: string; // For API compatibility
  organizationGuideline?: string; // Selected organization guideline (e.g., 'default')
  brandGuideline?: string; // Selected brand guideline (e.g., 'hoxitol')
  additionalNotes: string;
  annotatedFile: File | null;
  useAdditionalNotes: boolean;
  useAnnotatedFile: boolean;
  annotationData?: AnnotationSummary; // Extracted annotations from the annotated file
  extractedImages: { id: string; url: string; name: string }[];
  extractedText: string;
  geminiModel?: string; // Selected Gemini model for validation (e.g. gemini-3-pro-image-preview)
  aiReviewResults?: RouteValidatorAIIssue[]; // Store AI review results
  threadId?: string; // Store thread ID for the review
  validationResults?: TValidateDocumentResponse; // Store validation results from Gemini
};

export type RouteValidatorStep = {
  currentStep: number;
  isFinished?: boolean;
};

