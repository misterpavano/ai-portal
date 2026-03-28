export type TUploadDocumentRequest = FormData;

export type TValidateDocumentRequest = {
  fileId: string;
  tasks: string[];
  direction?: string;
  clientBrand?: string;
  organizationGuideline?: string; // Selected organization guideline (e.g., 'default')
  brandGuideline?: string; // Selected brand guideline (e.g., 'hoxitol')
};

export type TValidateSingleTaskRequest = {
  fileId: string;
  task: string; // Single task key
  direction?: string;
  clientBrand?: string;
  organizationGuideline?: string;
  brandGuideline?: string;
  model?: string; // Gemini model override (e.g. gemini-3-pro-image-preview)
};

export type TDownloadDocumentRequest = {
  fileId: string;
  documentText: string;
  validationResults: Array<{
    task: string;
    issues: Array<{
      id: number;
      type: string;
      issue: string;
      location: {
        type: 'text' | 'image';
        page: number;
        line?: number;
        text?: string;
        coordinates?: {
          x: number;
          y: number;
          width: number;
          height: number;
        };
        imageUrl?: string;
      };
      reasoning: string;
      recommendation: string;
    }>;
    summary: string;
    error?: string;
  }>;
  fileName?: string;
};

