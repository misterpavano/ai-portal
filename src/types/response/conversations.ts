// Conversation and Folder Response Types

export interface IFolder {
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface IConversation {
    id: string;
    userId: string;
    title: string;
    folderId: string | null;
    isTemporary: boolean;
    aiModel: string | null;
    threadId: string | null;
    lastActivityAt: string;
    createdAt: string;
    updatedAt: string;
    folder?: IFolder;
    files?: IConversationFile[];
    lastPurgeLog?: {
        id: string;
        createdAt: string;
        fileCount: number;
    };
    searchMatch?: {
        matchType: "title" | "keyword";
        matchedText: string;
        keyword?: string;
    };
}

export interface IConversationFile {
    id: string;
    conversationId: string;
    messageId: string | null;
    openaiFileId: string | null;
    filename: string;
    mimeType: string;
    fileSize: number;
    localPath: string | null;
    uploadedToOpenAI: boolean;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface IMessage {
    id: string;
    conversationId: string;
    role: "user" | "assistant" | "system";
    content: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export type TFetchFoldersResponse = IFolder[];

export type TFetchConversationsResponse = IConversation[];

export type TFetchConversationResponse = IConversation;

export type TCreateFolderResponse = IFolder;

export type TUpdateFolderResponse = IFolder;

export type TDeleteFolderResponse = {
    success: boolean;
    message?: string;
};

export type TPurgeConversationResponse = {
    message: string;
    fileCount: number;
    conversationId: string;
    purgeLogId: string;
    purgeLog?: {
        id: string;
        createdAt: string;
        fileCount: number;
    };
};

export type TCreateConversationResponse = IConversation;

export type TUpdateConversationResponse = IConversation;

export type TDeleteConversationResponse = {
    success: boolean;
    message?: string;
};

export type TFetchMessagesResponse = IMessage[];

export type TCreateMessageResponse = IMessage;

export type TDeleteMessageResponse = {
    success: boolean;
    message?: string;
};

export type TCleanupTemporaryResponse = {
    message: string;
    jobId: number;
};

export type TGenerateConversationTitleResponse = IConversation;

