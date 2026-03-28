import { TAiTool } from "../local/tools";
import { TAiModel } from "../local/models";

export type TGetToolsResponse = {
  success: boolean;
  data: TAiTool[];
  message?: string;
  error?: string;
};

export type TAssignToolResponse = {
  success: boolean;
  message: string;
  data?: TAiTool;
  error?: string;
};

export type TGetToolAvailableModelsResponse = {
  modelIds: number[];
  models: TAiModel[];
};

export type TToggleToolModelAvailabilityResponse = {
  message: string;
  isAvailable: boolean;
};

export type TGetToolAvailableModelsStatusResponse = {
  [modelId: number]: boolean;
};
