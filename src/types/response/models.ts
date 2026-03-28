import { TAiModel } from "../local/models";

export type TModelSyncResponse = {
  synced: number;
  updated: number;
  total: number;
};

export type TGetModelsResponse = {
  success: boolean;
  message?: string;
  data: TAiModel[];
  error?: string;
};

export type TGetAvailableModelsResponse = {
  success: boolean;
  message?: string;
  data: TAiModel[];
  error?: string;
};

export type TGetModelByIdResponse = {
  success: boolean;
  message?: string;
  data: TAiModel;
  error?: string;
};

export type TUpdateModelResponse = {
  success: boolean;
  message?: string;
  data: TAiModel;
  error?: string;
};

export type TUpdateModelStatusResponse = {
  success: boolean;
  message?: string;
  data: TAiModel;
  error?: string;
};

export type TDeleteModelResponse = {
  success: boolean;
  message?: string;
  data: void;
  error?: string;
};

export type TSyncOpenAiModelsResponse = {
  success: boolean;
  message?: string;
  data: TModelSyncResponse;
  error?: string;
};
