import {
  ActionItemsNextStepFormValues,
  MeetingNotesFlow,
  MeetingOverviewFormValues,
  MeetingSummariesFormValues,
  MeetingSummariesKeyTakeawaysFormValues,
} from "../types/meetingNotesTypes";

export const initialValuesMeetingSummaries: MeetingSummariesFormValues = {
  structureType: "Group by project",
  additionalNotes: "",
};

export const initialValuesMeetingOverview: MeetingOverviewFormValues = {
  additionalNotes: "",
};

export const initialValuesMeetingSummariesKeyTakeaways: MeetingSummariesKeyTakeawaysFormValues =
  {
    additionalNotes: "",
  };

export const initialValuesActionItemsNextStep: ActionItemsNextStepFormValues = {
  additionalNotes: "",
  highlightedOutput: [],
  selectedHighlightedOutput: [],
};

export const initialMeetingNotesValues: MeetingNotesFlow = {
  type: { name: "", id: "" },
  objectives: "",
  structureType: "Group by project",
  file: {
    fileId: "",
    fileName: "",
  },
  discussionTopics: {
    topics: "",
    sections: [],
  },
  meetingProjects: {
    projects: "",
    sections: [],
  },
  meetingIndividuals: {
    projects: "",
    assignedIndividuals: [],
    sections: [],
  },
  generatedGeneralMeetingNotes: {
    generatedMeetingSummariesKeyTakeaways: [],
  },
  generatedMeetingNotes: {
    generatedActionsItemsNextStep: [],
    generatedMeetingOverviews: [],
    generatedMeetingSummaries: [],
  },
  meetingSummaries: initialValuesMeetingSummaries,
  meetingOverview: initialValuesMeetingOverview,
  actionItemsNextStep: initialValuesActionItemsNextStep,
  meetingSummariesKeyTakeaways: initialValuesMeetingSummariesKeyTakeaways,
};
