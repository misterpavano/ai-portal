export type TIssueLocation = {
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

export type TValidationIssue = {
  id: number;
  type: string;
  severity?: number; // 1-10, where 10 is most critical
  issue: string;
  location: TIssueLocation;
  reasoning: string;
  recommendation: string;
};

export type TTaskResult = {
  task: string;
  issues: TValidationIssue[];
  summary: string;
  error?: string;
};

export type TUploadDocumentResponse = {
  fileId: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  pageCount?: number;
};

export type TValidateDocumentResponse = {
  fileId: string;
  fileName: string;
  tasks: string[];
  results: TTaskResult[];
  documentText?: string; // Full document text for preview
  documentHtml?: string; // Full document HTML with formatting preserved
  metadata: {
    totalIssues: number;
    pagesProcessed: number;
    imagesProcessed: number;
  };
};

export type TValidateSingleTaskResponse = {
  fileId: string;
  fileName: string;
  task: string;
  result: TTaskResult;
  documentText?: string;
  documentHtml?: string; // Full document HTML with formatting preserved
  metadata: {
    totalIssues: number;
    pagesProcessed: number;
    imagesProcessed: number;
  };
};

