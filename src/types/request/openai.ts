import { ChatCompletionMessageParam } from "openai/resources";

export type TChatCompletionRequest = {
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  model?: string;
  toolName?: string;
  toolModels?: Record<string, string>;
  web_search?: boolean;
  search_provider?: string;
  search_max_results?: number;
};

export type TCreateAssistantRequest = {
  name: string;
  instructions: string;
  vectorStoreId: string;
  model?: string;
};

export type TAddFileToVectorStoreRequest = {
  vectorId: string;
  file_id: string;
};

export type TDeleteFileFromVectorStoreRequest = {
  vectorStoreId: string;
  file_id: string;
};

export type TCreateVectorStoreRequest = {
  name: string;
};

export type TUpdateAssistantInstructionsRequest = {
  assistantId: string;
  instructions: string;
};

export type TUpdateAssistantRequest = {
  assistantId: string;
  model?: string;
  instructions?: string;
  name?: string;
  vectorStoreId?: string;
};

export type TAskQuestionBasedOnFileRequest = {
  threadId: string;
  assistantId: string;
  message: string;
  assistantPrompt?: string;
  web_search?: boolean;
  search_provider?: string;
  search_query?: string;
  search_max_results?: number;
  model?: string;
};
