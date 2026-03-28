export type TAssignToolRequest = {
  modelId: number;
};

export type TUpdateToolRequest = {
  name?: string;
  description?: string | null;
  modelId?: number | null;
  systemPrompt?: string | null;
};

export type TToggleToolModelAvailabilityRequest = {
  isAvailable: boolean;
};
