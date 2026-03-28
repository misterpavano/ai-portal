import { apiSlice } from "./apiSlice";
import { ChatCompletion } from "openai/resources";
import {
  TChatCompletionRequest,
  TCreateAssistantRequest,
  TAddFileToVectorStoreRequest,
  TDeleteFileFromVectorStoreRequest,
  TCreateVectorStoreRequest,
  TUpdateAssistantInstructionsRequest,
  TUpdateAssistantRequest,
  TAskQuestionBasedOnFileRequest,
} from "../../types/request/openai";
import {
  TCreateThreadResponse,
  TUploadFileResponse,
  TAddFileToVectorStoreResponse,
  TDeleteVectorStoreResponse,
  TFetchVectorStoresResponse,
  TFetchAssistantsResponse,
  TDeleteAssistantResponse,
  TUpdateAssistantInstructionsResponse,
  TDeleteFileFromVectorStoreResponse,
  TCreateVectorStoreResponse,
  TDeleteFileFromStorageResponse,
  TGetFilesFromVectorStoreResponse,
  AskQuestionResponse,
  TTranscribeAudioResponse,
  TTranscriptionStatusResponse,
  TEnqueueTranscriptionResponse,
  TThreadRunStatusResponse,
  TThreadMessagesResponse,
} from "../../types/response/openai";

export const openAiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    chatCompletionOpenAi: builder.mutation<
      ChatCompletion,
      TChatCompletionRequest
    >({
      query: ({
        messages,
        temperature,
        model,
        toolName,
        toolModels,
        web_search,
        search_provider,
        search_max_results,
      }) => {
        const selectedModel =
          toolName && toolModels?.[toolName]
            ? toolModels[toolName]
            : model || "gpt-3.5-turbo-1106";
        return {
          url: "/api/ai/openai/chat/completions",
          method: "POST",
          body: {
            messages,
            temperature,
            model: selectedModel,
            web_search,
            search_provider,
            search_max_results,
          },
        };
      },
    }),
    createAssistant: builder.mutation<
      TUpdateAssistantInstructionsResponse,
      TCreateAssistantRequest
    >({
      query: ({ name, instructions, vectorStoreId, model }) => {
        const body: any = {
          name,
          tools: [{ type: "file_search" }],
          instructions,
          model,
        };

        // Only include tool_resources and vectorStoreId if vectorStoreId is provided
        if (vectorStoreId) {
          body.vectorStoreId = vectorStoreId;
          body.tool_resources = {
            file_search: { vector_store_ids: [vectorStoreId] },
          };
        }

        return {
          url: "/api/ai/openai/assistants",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Tools"],
    }),
    createThread: builder.mutation<TCreateThreadResponse, void>({
      query: () => ({ url: "/api/ai/openai/threads", method: "POST" }),
    }),
    getFilesFromVectorStore: builder.query<
      TGetFilesFromVectorStoreResponse,
      string
    >({
      query: (vectorId) => {
        if (!vectorId || vectorId.trim() === "") {
          throw new Error("Vector store ID is required");
        }
        return `/api/ai/openai/vector_stores/${vectorId}/files`;
      },
    }),
    addFileToVectorStore: builder.mutation<
      TAddFileToVectorStoreResponse,
      TAddFileToVectorStoreRequest
    >({
      query: ({ vectorId, file_id }) => {
        if (!vectorId || vectorId.trim() === "") {
          throw new Error("Vector store ID is required");
        }
        if (!file_id || file_id.trim() === "") {
          throw new Error("File ID is required");
        }
        return {
          url: `/api/ai/openai/vector_stores/${vectorId}/files`,
          method: "POST",
          body: { file_id },
        };
      },
      invalidatesTags: ["OpenAI"],
    }),
    uploadFile: builder.mutation<TUploadFileResponse, FormData>({
      query: (file) => ({
        url: "/api/ai/openai/files",
        method: "POST",
        body: file,
      }),
    }),
    deleteVectorStore: builder.mutation<TDeleteVectorStoreResponse, string>({
      query: (vectorStoreId) => ({
        url: `/api/ai/openai/vector_stores/${vectorStoreId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OpenAI"],
    }),
    fetchVectorStores: builder.query<TFetchVectorStoresResponse, void>({
      query: () => "/api/ai/openai/vector_stores",
      providesTags: ["OpenAI"],
    }),
    fetchAssistants: builder.query<TFetchAssistantsResponse, void>({
      query: () => "/api/ai/openai/assistants",
      providesTags: ["OpenAI"],
    }),
    deleteAssistant: builder.mutation<TDeleteAssistantResponse, string>({
      query: (assistantId) => ({
        url: `/api/ai/openai/assistants/${assistantId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OpenAI"],
    }),
    updateAssistantInstructions: builder.mutation<
      TUpdateAssistantInstructionsResponse,
      TUpdateAssistantInstructionsRequest
    >({
      query: ({ assistantId, instructions }) => ({
        url: `/api/ai/openai/assistants/${assistantId}/instructions`,
        method: "POST",
        body: { instructions },
      }),
      invalidatesTags: ["OpenAI"],
    }),
    updateAssistant: builder.mutation<
      TUpdateAssistantInstructionsResponse,
      TUpdateAssistantRequest
    >({
      query: ({ assistantId, model, instructions, name, vectorStoreId }) => {
        const body: any = {};
        if (model !== undefined) body.model = model;
        if (instructions !== undefined) body.instructions = instructions;
        if (name !== undefined) body.name = name;
        if (vectorStoreId !== undefined) {
          body.tool_resources = {
            file_search: { vector_store_ids: [vectorStoreId] },
          };
        }
        return {
          url: `/api/ai/openai/assistants/${assistantId}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["OpenAI", "Tools"],
    }),
    deleteFileFromVectorStore: builder.mutation<
      TDeleteFileFromVectorStoreResponse,
      TDeleteFileFromVectorStoreRequest
    >({
      query: ({ vectorStoreId, file_id }) => ({
        url: `/api/ai/openai/vector_stores/${vectorStoreId}/files/${file_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OpenAI"],
    }),
    createVectorStore: builder.mutation<
      TCreateVectorStoreResponse,
      TCreateVectorStoreRequest
    >({
      query: ({ name }) => ({
        url: "/api/ai/openai/vector_stores",
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["OpenAI"],
    }),

    deleteFileFromStorage: builder.mutation<
      TDeleteFileFromStorageResponse,
      string
    >({
      query: (file_id) => ({
        url: `/api/ai/openai/files/${file_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OpenAI"],
    }),
    askQuestionBasedOnFile: builder.mutation<
      AskQuestionResponse,
      TAskQuestionBasedOnFileRequest
    >({
      query: ({
        threadId,
        assistantId,
        message,
        assistantPrompt,
        web_search,
        search_provider,
        search_query,
        search_max_results,
      }) => {
        const body: Record<string, any> = {
          threadId,
          assistantId,
          message,
          assistantPrompt,
        };
        if (web_search) {
          body.web_search = true;
          if (search_provider) body.search_provider = search_provider;
          if (search_query) body.search_query = search_query;
          if (search_max_results) body.search_max_results = search_max_results;
        }
        return {
          url: `/api/ai/openai/thread/message`,
          method: "POST",
          body,
        };
      },
    }),
    transcribeAudio: builder.mutation<TEnqueueTranscriptionResponse, FormData>({
      query: (formData) => ({
        url: "/api/ai/openai/transcribe",
        method: "POST",
        body: formData,
      }),
    }),
    getTranscriptionStatus: builder.query<TTranscriptionStatusResponse, string>(
      {
        query: (jobId) => `/api/ai/openai/transcribe/${jobId}`,
      }
    ),
    getThreadRunStatus: builder.query<
      TThreadRunStatusResponse,
      { threadId: string; runId: string }
    >({
      query: ({ threadId, runId }) =>
        `/api/ai/openai/threads/${threadId}/runs/${runId}`,
    }),
    getThreadMessages: builder.query<TThreadMessagesResponse, string>({
      query: (threadId) => `/api/ai/openai/threads/${threadId}/messages`,
    }),
  }),
});

export const {
  useChatCompletionOpenAiMutation,
  useCreateAssistantMutation,
  useCreateThreadMutation,
  useGetFilesFromVectorStoreQuery,
  useAddFileToVectorStoreMutation,
  useUploadFileMutation,
  useDeleteVectorStoreMutation,
  useCreateVectorStoreMutation,
  useFetchVectorStoresQuery,
  useFetchAssistantsQuery,
  useDeleteAssistantMutation,
  useUpdateAssistantInstructionsMutation,
  useUpdateAssistantMutation,
  useDeleteFileFromVectorStoreMutation,
  useDeleteFileFromStorageMutation,
  useLazyGetFilesFromVectorStoreQuery,
  useAskQuestionBasedOnFileMutation,
  useTranscribeAudioMutation,
  useLazyGetTranscriptionStatusQuery,
  useLazyGetThreadRunStatusQuery,
  useLazyGetThreadMessagesQuery,
} = openAiApi;
