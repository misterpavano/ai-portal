import { TAiModel } from "./models";

export type TAiTool = {
  id: number;
  name: string;
  modelId: number | null;
  model: TAiModel | null;
  description?: string | null;
  systemPrompt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
