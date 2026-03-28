import { apiSlice } from "./apiSlice";
import {
    TCreateFolderRequest,
    TUpdateFolderRequest,
    TCreateConversationRequest,
    TUpdateConversationRequest,
    TCreateMessageRequest,
    TFetchConversationsQuery,
    TGenerateConversationTitleRequest,
} from "../../types/request/conversations";
import {
    TFetchFoldersResponse,
    TFetchConversationsResponse,
    TFetchConversationResponse,
    TCreateFolderResponse,
    TUpdateFolderResponse,
    TDeleteFolderResponse,
    TPurgeConversationResponse,
    TCreateConversationResponse,
    TUpdateConversationResponse,
    TDeleteConversationResponse,
    TFetchMessagesResponse,
    TCreateMessageResponse,
    TDeleteMessageResponse,
    TCleanupTemporaryResponse,
    TGenerateConversationTitleResponse,
} from "../../types/response/conversations";

export const conversationsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // FOLDER ENDPOINTS
        fetchFolders: builder.query<TFetchFoldersResponse, void>({
            query: () => "/api/folders",
            providesTags: ["Folders"],
        }),

        createFolder: builder.mutation<TCreateFolderResponse, TCreateFolderRequest>({
            query: ({ name }) => ({
                url: "/api/folders",
                method: "POST",
                body: { name },
            }),
            invalidatesTags: ["Folders"],
        }),

        updateFolder: builder.mutation<
            TUpdateFolderResponse,
            { id: string; data: TUpdateFolderRequest }
        >({
            query: ({ id, data }) => ({
                url: `/api/folders/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Folders"],
        }),

        deleteFolder: builder.mutation<TDeleteFolderResponse, string>({
            query: (id) => ({
                url: `/api/folders/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Folders"],
        }),

        purgeConversation: builder.mutation<TPurgeConversationResponse, string>({
            query: (conversationId) => ({
                url: `/api/conversations/${conversationId}/purge`,
                method: "POST",
            }),
            invalidatesTags: ["Conversations"],
        }),

        // CONVERSATION ENDPOINTS
        fetchConversations: builder.query<
            TFetchConversationsResponse,
            TFetchConversationsQuery | undefined
        >({
            query: (params) => {
                let url = "/api/conversations";
                if (params) {
                    const searchParams = new URLSearchParams();
                    if (params.folderId) searchParams.append("folderId", params.folderId);
                    if (params.includeTemporary)
                        searchParams.append("includeTemporary", "true");
                    if (params.search) searchParams.append("search", params.search);
                    if (searchParams.toString()) url += `?${searchParams.toString()}`;
                }
                return url;
            },
            providesTags: ["Conversations"],
        }),

        fetchConversation: builder.query<TFetchConversationResponse, string>({
            query: (id) => `/api/conversations/${id}`,
            providesTags: ["Conversations"],
        }),

        createConversation: builder.mutation<
            TCreateConversationResponse,
            TCreateConversationRequest
        >({
            query: (data) => ({
                url: "/api/conversations",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Conversations"],
        }),

        updateConversation: builder.mutation<
            TUpdateConversationResponse,
            { id: string; data: TUpdateConversationRequest }
        >({
            query: ({ id, data }) => ({
                url: `/api/conversations/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Conversations"],
        }),

        deleteConversation: builder.mutation<TDeleteConversationResponse, string>({
            query: (id) => ({
                url: `/api/conversations/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Conversations"],
        }),

        // MESSAGE ENDPOINTS
        fetchMessages: builder.query<TFetchMessagesResponse, string>({
            query: (conversationId) =>
                `/api/conversations/${conversationId}/messages`,
            providesTags: ["Messages"],
        }),

        createMessage: builder.mutation<
            TCreateMessageResponse,
            { conversationId: string; data: TCreateMessageRequest }
        >({
            query: ({ conversationId, data }) => ({
                url: `/api/conversations/${conversationId}/messages`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Messages"],
        }),

        deleteMessage: builder.mutation<
            TDeleteMessageResponse,
            { conversationId: string; messageId: string }
        >({
            query: ({ conversationId, messageId }) => ({
                url: `/api/conversations/${conversationId}/messages/${messageId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Messages"],
        }),

        generateConversationTitle: builder.mutation<
            TGenerateConversationTitleResponse,
            TGenerateConversationTitleRequest
        >({
            query: ({ conversationId, previewText }) => ({
                url: `/api/conversations/${conversationId}/generate-title`,
                method: "POST",
                body: { previewText },
            }),
            invalidatesTags: ["Conversations"],
        }),

        // CLEANUP ENDPOINTS
        cleanupTemporaryConversations: builder.mutation<
            TCleanupTemporaryResponse,
            void
        >({
            query: () => ({
                url: "/api/conversations/cleanup/temporary",
                method: "POST",
            }),
            invalidatesTags: ["Conversations"],
        }),
    }),
});

export const {
    useFetchFoldersQuery,
    useCreateFolderMutation,
    useUpdateFolderMutation,
    useDeleteFolderMutation,
    usePurgeConversationMutation,
    useFetchConversationsQuery,
    useFetchConversationQuery,
    useCreateConversationMutation,
    useUpdateConversationMutation,
    useDeleteConversationMutation,
    useFetchMessagesQuery,
    useCreateMessageMutation,
    useDeleteMessageMutation,
    useCleanupTemporaryConversationsMutation,
    useLazyFetchConversationsQuery,
    useLazyFetchConversationQuery,
    useLazyFetchMessagesQuery,
    useGenerateConversationTitleMutation,
} = conversationsApi;

