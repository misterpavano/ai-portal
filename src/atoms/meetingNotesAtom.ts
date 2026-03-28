import { atom } from "jotai";
import { MeetingNotesFlow, MeetingNotesStep } from "../types/meetingNotesTypes";
import { initialMeetingNotesValues } from "../config/meetingNotesValues";

export const meetingNotesStepAtom = atom<MeetingNotesStep>({
  currentStep: 0,
  isFinished: false,
});

export const meetingNotesFormAtom = atom<MeetingNotesFlow>(
  initialMeetingNotesValues
);
