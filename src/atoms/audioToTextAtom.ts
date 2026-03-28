import { atom } from "jotai";
import { audioToTextValues } from "../config/audioToTextValues";
import { AudioToTextFlow, AudioToTextStep } from "../types/audioToText";

export const audioToTextStepAtom = atom<AudioToTextStep>({
  currentStep: 0,
  isFinished: false,
});

export const audioToTextFormAtom = atom<AudioToTextFlow>(audioToTextValues);
