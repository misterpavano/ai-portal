import {
  TGetModelsResponse,
  TGetAvailableModelsResponse,
  TGetModelByIdResponse,
  TUpdateModelResponse,
  TUpdateModelStatusResponse,
  TDeleteModelResponse,
  TSyncOpenAiModelsResponse,
} from "../../types/response/models";
import {
  TUpdateModelRequest,
  TUpdateModelStatusRequest,
  TDeleteModelRequest,
  TGetModelByIdRequest,
} from "../../types/request/models";

import { apiSlice } from "./apiSlice";

export const modelsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getModels: builder.query<TGetModelsResponse, { status?: "show" | "hide" }>({
      query: (params = {}) => ({
        url: "/api/models",
        params,
      }),
      providesTags: ["Models"],
    }),

    getAvailableModels: builder.query<TGetAvailableModelsResponse, void>({
      query: () => ({ url: "/api/models/available" }),
      providesTags: ["Models"],
    }),

    syncOpenAiModels: builder.mutation<TSyncOpenAiModelsResponse, void>({
      query: () => ({ url: "/api/models/sync/openai", method: "POST" }),
      invalidatesTags: ["Models"],
    }),

    updateModelStatus: builder.mutation<
      TUpdateModelStatusResponse,
      TUpdateModelStatusRequest
    >({
      query: ({ id, status }) => ({
        url: `/api/models/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Models"],
    }),

    updateModel: builder.mutation<
      TUpdateModelResponse,
      { id: number; body: TUpdateModelRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/models/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Models"],
    }),

    deleteModel: builder.mutation<TDeleteModelResponse, TDeleteModelRequest>({
      query: ({ id }) => ({
        url: `/api/models/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Models"],
    }),

    getModelById: builder.query<TGetModelByIdResponse, TGetModelByIdRequest>({
      query: ({ id }) => ({ url: `/api/models/${id}` }),
      providesTags: ["Models"],
    }),
  }),
});

export const {
  useGetModelsQuery,
  useGetAvailableModelsQuery,
  useSyncOpenAiModelsMutation,
  useUpdateModelStatusMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
  useGetModelByIdQuery,
} = modelsApi;
