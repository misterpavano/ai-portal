import { atom } from "jotai";
import { AIPersonasFlow, AIPersonasStep } from "../types/aiPersonas";
import { initialAIPersonasValues } from "../config/aiPersonasValues";

export const aiPersonasStepAtom = atom<AIPersonasStep>({
  currentStep: 0,
  isFinished: false,
});

export const aiPersonasFormAtom = atom<AIPersonasFlow>(initialAIPersonasValues);
