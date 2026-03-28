export type TUpdateModelStatusRequest = {
  id: number;
  status: "show" | "hide";
};

export type TUpdateModelRequest = Partial<{
  modelId: string;
  name: string;
  description: string;
  provider: string;
  status: "show" | "hide";
  maxTokens?: number;
  inputCostPer1k?: number;
  strengths?: string[];
  useCases?: string[];
  outputCostPer1k?: number;
}>;

export type TDeleteModelRequest = {
  id: number;
};

export type TGetModelByIdRequest = {
  id: number;
};
