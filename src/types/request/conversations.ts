// Conversation and Folder Request Types

export interface TCreateFolderRequest {
    name: string;
}

export interface TUpdateFolderRequest {
    name: string;
}

export interface TCreateConversationRequest {
    title?: string;
    isTemporary?: boolean;
    aiModel?: string;
    folderId?: string | null;
    threadId?: string;
}

export interface TUpdateConversationRequest {
    title?: string;
    aiModel?: string;
    folderId?: string | null;
    isTemporary?: boolean;
}

export interface TCreateMessageRequest {
    role: "user" | "assistant" | "system";
    content: string;
    metadata?: Record<string, any>;
}

export interface TGenerateConversationTitleRequest {
    conversationId: string;
    previewText?: string;
}

export interface TFetchConversationsQuery {
    folderId?: string;
    includeTemporary?: boolean;
    search?: string;
}

