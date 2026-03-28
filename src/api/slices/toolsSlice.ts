import { apiSlice } from "./apiSlice";
import {
  TGetToolsResponse,
  TAssignToolResponse,
  TGetToolAvailableModelsResponse,
  TToggleToolModelAvailabilityResponse,
  TGetToolAvailableModelsStatusResponse,
} from "../../types/response/tools";
import {
  TAssignToolRequest,
  TUpdateToolRequest,
  TToggleToolModelAvailabilityRequest,
} from "../../types/request/tools";
import { TAiTool } from "../../types/local/tools";

export const toolsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTools: builder.query<TGetToolsResponse, void>({
      query: (): { url: string } => ({
        url: "/api/tools",
      }),
      providesTags: ["Tools"],
    }),

    assignTool: builder.mutation<
      TAssignToolResponse,
      { toolName: string; body: TAssignToolRequest }
    >({
      query: ({
        toolName,
        body,
      }): { url: string; method: string; body: TAssignToolRequest } => ({
        url: `/api/tools/${toolName}/assign`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Tools"],
    }),

    updateTool: builder.mutation<TAiTool, { id: number; body: TUpdateToolRequest }>(
      {
        query: ({ id, body }) => ({
          url: `/api/tools/${id}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: ["Tools"],
      }
    ),

    getToolAvailableModels: builder.query<
      TGetToolAvailableModelsResponse,
      string
    >({
      query: (toolName): { url: string } => ({
        url: `/api/tools/${toolName}/available-models`,
      }),
      providesTags: ["Tools"],
    }),

    getToolAvailableModelsStatus: builder.query<
      TGetToolAvailableModelsStatusResponse,
      string
    >({
      query: (toolName): { url: string } => ({
        url: `/api/tools/${toolName}/available-models-status`,
      }),
      providesTags: ["Tools"],
    }),

    toggleToolModelAvailability: builder.mutation<
      TToggleToolModelAvailabilityResponse,
      {
        toolName: string;
        modelId: number;
        body: TToggleToolModelAvailabilityRequest;
      }
    >({
      query: ({
        toolName,
        modelId,
        body,
      }): {
        url: string;
        method: string;
        body: TToggleToolModelAvailabilityRequest;
      } => ({
        url: `/api/tools/${toolName}/available-models/${modelId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Tools"],
    }),
  }),
});

export const {
  useGetToolsQuery,
  useAssignToolMutation,
  useUpdateToolMutation,
  useGetToolAvailableModelsQuery,
  useGetToolAvailableModelsStatusQuery,
  useToggleToolModelAvailabilityMutation,
} = toolsApi;
