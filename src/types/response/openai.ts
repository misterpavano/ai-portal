import { Assistant, FileItem, VectorStore } from "../local/openai";

export type TCreateThreadResponse = {
  id: string;
};

export interface TUploadFileResponse extends FileItem { }

export type TAddFileToVectorStoreResponse = {
  success: boolean;
};

export type TDeleteVectorStoreResponse = {
  success: boolean;
};

export interface TFetchVectorStoresResponse extends Array<VectorStore> { }

export interface TFetchAssistantsResponse extends Array<Assistant> { }

export type TDeleteAssistantResponse = {
  success: boolean;
};

export interface TUpdateAssistantInstructionsResponse extends Assistant { }

export type TDeleteFileFromVectorStoreResponse = {
  success: boolean;
};

export interface TCreateVectorStoreResponse extends VectorStore { }

export type TDeleteFileFromStorageResponse = {
  success: boolean;
};

export interface TGetFilesFromVectorStoreResponse extends Array<FileItem> { }

export type AskQuestionResponse = {
  thread_id: string;
  run_id: string;
  status: string;
  content: string;
};

export type TTranscribeAudioResponse = {
  transcript: string;
};

export type TranscriptSegment = {
  timestamp: string;
  timestampSeconds: number;
  speaker: string;
  text: string;
};

export type TranscriptData = {
  segments: TranscriptSegment[];
  fullText: string;
};

export type TEnqueueTranscriptionResponse = {
  jobId: string;
  status: string;
  message: string;
};

export type TTranscriptionStatusResponse = {
  jobId: string;
  state: "waiting" | "active" | "completed" | "failed";
  transcript: string | TranscriptData | null;
};

export type TThreadRunStatusResponse = {
  id: string;
  object: string;
  created_at: number;
  assistant_id: string;
  thread_id: string;
  status: "queued" | "in_progress" | "requires_action" | "cancelling" | "cancelled" | "failed" | "completed" | "expired";
  started_at: number | null;
  expires_at: number | null;
  cancelled_at: number | null;
  failed_at: number | null;
  completed_at: number | null;
  last_error: any;
  model: string;
  instructions: string;
  tools: any[];
  metadata: Record<string, any>;
};

export type TThreadMessage = {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  role: "user" | "assistant";
  content: Array<{
    type: string;
    text?: {
      value: string;
      annotations: any[];
    };
  }>;
  assistant_id: string | null;
  run_id: string | null;
  metadata: Record<string, any>;
};

export type TThreadMessagesResponse = {
  object: string;
  data: TThreadMessage[];
  first_id: string | null;
  last_id: string | null;
  has_more: boolean;
};
