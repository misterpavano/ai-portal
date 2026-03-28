import { useCallback } from "react";
import {
    useFetchFoldersQuery,
    useFetchConversationsQuery,
    useCreateConversationMutation,
    useUpdateConversationMutation,
    useDeleteConversationMutation,
    useCreateMessageMutation,
    useDeleteMessageMutation,
    useCleanupTemporaryConversationsMutation,
} from "../../../../api/slices/conversationsApiSlice";
import {
    IConversation,
    IFolder,
} from "../../../../types/response/conversations";
import {
    TCreateConversationRequest,
    TUpdateConversationRequest,
    TCreateMessageRequest,
} from "../../../../types/request/conversations";

/**
 * Custom hook for managing conversations, messages, and folders
 * Provides a unified interface for all conversation-related operations
 */
export const useConversationManager = () => {
    // Queries
    const { data: folders = [] } = useFetchFoldersQuery();
    const { data: conversations = [] } = useFetchConversationsQuery(undefined);

    // Mutations
    const [createConversation] = useCreateConversationMutation();
    const [updateConversation] = useUpdateConversationMutation();
    const [deleteConversation] = useDeleteConversationMutation();
    const [createMessage] = useCreateMessageMutation();
    const [deleteMessage] = useDeleteMessageMutation();
    const [cleanupTemporary] = useCleanupTemporaryConversationsMutation();

    // Helper functions
    const handleCreateConversation = useCallback(
        async (data: TCreateConversationRequest) => {
            try {
                const result = await createConversation(data).unwrap();
                return result;
            } catch (error) {
                console.error("Failed to create conversation:", error);
                throw error;
            }
        },
        [createConversation]
    );

    const handleUpdateConversation = useCallback(
        async (id: string, data: TUpdateConversationRequest) => {
            try {
                const result = await updateConversation({ id, data }).unwrap();
                return result;
            } catch (error) {
                console.error("Failed to update conversation:", error);
                throw error;
            }
        },
        [updateConversation]
    );

    const handleDeleteConversation = useCallback(
        async (id: string) => {
            try {
                await deleteConversation(id).unwrap();
            } catch (error) {
                console.error("Failed to delete conversation:", error);
                throw error;
            }
        },
        [deleteConversation]
    );

    const handleAddMessage = useCallback(
        async (conversationId: string, data: TCreateMessageRequest) => {
            try {
                const result = await createMessage({
                    conversationId,
                    data,
                }).unwrap();
                return result;
            } catch (error) {
                console.error("Failed to add message:", error);
                throw error;
            }
        },
        [createMessage]
    );

    const handleDeleteMessage = useCallback(
        async (conversationId: string, messageId: string) => {
            try {
                await deleteMessage({ conversationId, messageId }).unwrap();
            } catch (error) {
                console.error("Failed to delete message:", error);
                throw error;
            }
        },
        [deleteMessage]
    );

    const handleCleanupTemporary = useCallback(
        async () => {
            try {
                await cleanupTemporary().unwrap();
            } catch (error) {
                console.error("Failed to cleanup temporary conversations:", error);
                throw error;
            }
        },
        [cleanupTemporary]
    );

    // Getter functions
    const getConversationsByFolder = useCallback(
        (folderId: string | null) => {
            return conversations.filter((conv: IConversation) => {
                if (folderId === null) {
                    return conv.folderId === null && !conv.isTemporary;
                }
                return conv.folderId === folderId;
            });
        },
        [conversations]
    );

    const getTemporaryConversations = useCallback(() => {
        return conversations.filter((conv: IConversation) => conv.isTemporary);
    }, [conversations]);

    const getPermanentConversations = useCallback(() => {
        return conversations.filter((conv: IConversation) => !conv.isTemporary);
    }, [conversations]);

    const getFolderById = useCallback(
        (folderId: string) => {
            return folders.find((f: IFolder) => f.id === folderId);
        },
        [folders]
    );

    const getConversationById = useCallback(
        (conversationId: string) => {
            return conversations.find((c: IConversation) => c.id === conversationId);
        },
        [conversations]
    );

    return {
        // Data
        folders,
        conversations,

        // Mutations
        handleCreateConversation,
        handleUpdateConversation,
        handleDeleteConversation,
        handleAddMessage,
        handleDeleteMessage,
        handleCleanupTemporary,

        // Getters
        getConversationsByFolder,
        getTemporaryConversations,
        getPermanentConversations,
        getFolderById,
        getConversationById,
    };
};

