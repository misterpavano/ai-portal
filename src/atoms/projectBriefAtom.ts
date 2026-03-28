import { atom } from "jotai";
import { ProjectBriefFlow, ProjectBriefStep } from "../types/projectBriefTypes";
import { initialProjectBrieftValues } from "../config/projectBriefValues";

export const projectBriefStepAtom = atom<ProjectBriefStep>({
  currentStep: 0,
  isFinished: false,
});

export const projectBriefFormAtom = atom<ProjectBriefFlow>(
  initialProjectBrieftValues
);
