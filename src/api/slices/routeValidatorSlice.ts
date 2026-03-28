import { apiSlice } from "./apiSlice";
import {
  TUploadDocumentResponse,
  TValidateDocumentResponse,
  TValidateSingleTaskResponse,
} from "../../types/response/routeValidator";
import {
  TUploadDocumentRequest,
  TValidateDocumentRequest,
  TValidateSingleTaskRequest,
} from "../../types/request/routeValidator";

// Job status response type
interface TValidationJobResponse {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  message?: string;
  error?: string;
  // When completed, includes full validation response
  fileId?: string;
  fileName?: string;
  tasks?: string[];
  results?: TValidateDocumentResponse['results'];
  documentText?: string;
  documentHtml?: string;
  metadata?: TValidateDocumentResponse['metadata'];
}

export const routeValidatorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadDocument: builder.mutation<
      TUploadDocumentResponse,
      TUploadDocumentRequest
    >({
      query: (formData) => ({
        url: "/api/ai/route-validator/upload",
        method: "POST",
        body: formData,
      }),
    }),
    // Start validation - returns jobId for polling
    startValidation: builder.mutation<
      TValidationJobResponse,
      TValidateDocumentRequest
    >({
      query: (body) => ({
        url: "/api/ai/route-validator/validate",
        method: "POST",
        body,
      }),
    }),
    // Poll for validation status
    getValidationStatus: builder.query<
      TValidationJobResponse,
      { jobId: string }
    >({
      query: ({ jobId }) => ({
        url: `/api/ai/route-validator/validate/status/${jobId}`,
        method: "GET",
      }),
    }),
    // Legacy synchronous endpoint (fallback when Redis unavailable)
    validateDocument: builder.mutation<
      TValidateDocumentResponse,
      TValidateDocumentRequest
    >({
      query: (body) => ({
        url: "/api/ai/route-validator/validate",
        method: "POST",
        body,
      }),
    }),
    deleteFile: builder.mutation<
      { message: string },
      { fileId: string }
    >({
      query: ({ fileId }) => ({
        url: `/api/ai/route-validator/files/${fileId}`,
        method: "DELETE",
      }),
    }),
    // Validate single task - returns jobId for polling (uses queue)
    validateSingleTask: builder.mutation<
      TValidationJobResponse,
      TValidateSingleTaskRequest
    >({
      query: (body) => ({
        url: "/api/ai/route-validator/validate/task",
        method: "POST",
        body,
      }),
    }),
    // Poll for single task validation status
    getSingleTaskStatus: builder.query<
      (TValidateSingleTaskResponse & { status: 'completed' }) | { status: 'processing' | 'failed'; jobId: string; error?: string },
      { jobId: string }
    >({
      query: ({ jobId }) => ({
        url: `/api/ai/route-validator/validate/task/status/${jobId}`,
        method: "GET",
      }),
    }),
    // Get available brand guidelines
    getBrandGuidelines: builder.query<
      { guidelines: Array<{ name: string; fileName: string; displayName: string }> },
      void
    >({
      query: () => ({
        url: "/api/ai/route-validator/brand-guidelines",
        method: "GET",
      }),
    }),
    // Get document HTML by fileId (fallback when status response omits it, e.g. staging)
    getDocumentHtml: builder.query<
      { documentHtml: string },
      { fileId: string }
    >({
      query: ({ fileId }) => ({
        url: `/api/ai/route-validator/document-html/${fileId}`,
        method: "GET",
      }),
    }),
    // Process document once and cache (call before validate/task so all tasks hit cache – faster)
    processDocument: builder.mutation<
      { ok: boolean; cached?: boolean; documentText?: string; documentHtml?: string | null },
      { fileId: string }
    >({
      query: ({ fileId }) => ({
        url: "/api/ai/route-validator/document/process",
        method: "POST",
        body: { fileId },
      }),
    }),
  }),
});

export const {
  useUploadDocumentMutation,
  useStartValidationMutation,
  useGetValidationStatusQuery,
  useLazyGetValidationStatusQuery,
  useValidateDocumentMutation,
  useDeleteFileMutation,
  useValidateSingleTaskMutation,
  useLazyGetSingleTaskStatusQuery,
  useGetBrandGuidelinesQuery,
  useLazyGetDocumentHtmlQuery,
  useProcessDocumentMutation,
} = routeValidatorApi;

