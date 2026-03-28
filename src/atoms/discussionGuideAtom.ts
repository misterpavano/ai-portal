import { atom } from "jotai";
import {
  DiscussionGuideFlow,
  DiscussionGuideStep,
} from "../types/discussionGuidesTypes";
import { initalDiscussionGuideFlowValues } from "../config/discussionGuideInitialValues";

export const discussionGuideStepAtom = atom<DiscussionGuideStep>({
  currentStep: 0,
  isFinished: false,
});

export const discussionGuideFlowAtom = atom<DiscussionGuideFlow>(
  initalDiscussionGuideFlowValues
);
