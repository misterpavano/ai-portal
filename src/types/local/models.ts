export type TAiModel = {
  id: number;
  modelId: string;
  name: string;
  description: string;
  provider: string;
  status: "show" | "hide";
  maxTokens?: number;
  inputCostPer1k?: number | string;
  outputCostPer1k?: number | string;
  strengths?: string[];
  useCases?: string[];
  createdAt: string;
  updatedAt: string;
};
