import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
  InterviewSummariesFlow,
  InterviewSummariesStep,
} from "../types/interviewSummaries";
import { initialInterviewSummariesValues } from "../config/interviewSummariesValues";

export const interviesSummariesStepAtom = atom<InterviewSummariesStep>({
  currentStep: 0,
  isFinished: false,
});

export const interviewSummariesFormAtom = atom<InterviewSummariesFlow>(
  initialInterviewSummariesValues
);

export const interviewSummariesInitializationAtom = atom<boolean>(false);

// Atoms for assistantId and vectorStoreId that sync with localStorage
export const assistantIdMeetingSummaryAtom = atom<string>(
  typeof window !== "undefined"
    ? localStorage.getItem("assistantIdMeetingSummary") || ""
    : ""
);

export const vectorStoreIdMeetingSummaryAtom = atom<string>(
  typeof window !== "undefined"
    ? localStorage.getItem("vectorStoreIdMeetingSummary") || ""
    : ""
);

// Type for storing error with associated model
export type ModelErrorState = {
  error: string | null;
  model: string | null;
};

// Atom to track model incompatibility error
// Using atomWithStorage to persist the error across page reloads
// Stores both the error message and the model it's associated with
export const modelIncompatibilityErrorAtom = atomWithStorage<ModelErrorState>(
  "modelIncompatibilityErrorMeetingSummaries",
  { error: null, model: null }
);
