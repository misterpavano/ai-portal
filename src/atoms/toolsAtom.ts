import { atomWithStorage } from "jotai/utils";
import { TAiModel } from "../types/local/models";

export type ToolModelsMap = Record<string, string>;
export type ToolVisibleModelsMap = Record<string, TAiModel[]>;

export const aiToolModelsAtom = atomWithStorage<ToolModelsMap>(
  "aiToolModels",
  {}
);

export const aiToolVisibleModelsAtom = atomWithStorage<ToolVisibleModelsMap>(
  "aiToolVisibleModels",
  {}
);
