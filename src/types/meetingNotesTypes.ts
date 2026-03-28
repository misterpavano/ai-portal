export type MeetingNotesFlow = {
  type: { name: string; id: string };
  objectives: string;
  structureType: string;
  file: File;
  meetingOverview: MeetingOverviewFormValues;
  meetingSummaries: MeetingSummariesFormValues;
  discussionTopics: DiscussionTopicsFormValues;
  meetingProjects: ProjectsFormValues;
  meetingIndividuals: IndividualsFormValues;
  actionItemsNextStep: ActionItemsNextStepFormValues;
  meetingSummariesKeyTakeaways: MeetingSummariesKeyTakeawaysFormValues;
  generatedGeneralMeetingNotes: GeneratedGeneralMeetingNotes;
  generatedMeetingNotes: GeneratedMeetingNotes;
};

export type File = {
  fileId: string;
  fileName: string;
};

export type GeneratedGeneralMeetingNotes = {
  generatedMeetingSummariesKeyTakeaways: string[];
};

export type GeneratedMeetingNotes = {
  generatedMeetingOverviews: string[];
  generatedMeetingSummaries: string[];
  generatedActionsItemsNextStep: string[];
};

export type MeetingSummariesKeyTakeawaysMeetingNotes = {
  type: { name: string; id: string };
  file: File;
  objectives: string;
  additionalNotes?: string;
  discussionTopics: DiscussionTopicsFormValues;
  meetingSummariesKeyTakeaways: MeetingSummariesKeyTakeawaysFormValues;
  generatedGeneralMeetingNotes: GeneratedGeneralMeetingNotes;
};

export type DiscussionTopicsFormValues = {
  topics: string;
  sections: DiscussionTopicsFormValues[];
};

export type ProjectsFormValues = {
  projects: string;
  sections: ProjectsFormValues[];
};

export type IndividualsFormValues = {
  projects: string;
  assignedIndividuals: string[];
  sections: ProjectsFormValues[];
};

export type MeetingOverviewMeetingNotes = {
  type: { name: string; id: string };
  file: File;
  objectives: string;
  structureType: string;
  additionalNotes?: string;
  meetingProjects: ProjectsFormValues;
  meetingOverview: MeetingOverviewFormValues;
  generatedMeetingNotes: GeneratedMeetingNotes;
};

export type MeetingSummariesMeetingNotes = {
  type: { name: string; id: string };
  file: File;
  objectives: string;
  structureType: string;
  additionalNotes?: string;
  meetingProjects: ProjectsFormValues;
  meetingSummaries: MeetingOverviewFormValues;
  generatedMeetingNotes: GeneratedMeetingNotes;
};

export type MeetingSummariesIndividualMeetingNotes = {
  type: { name: string; id: string };
  file: File;
  objectives: string;
  structureType: string;
  additionalNotes?: string;
  meetingIndividuals: IndividualsFormValues;
  meetingSummaries: MeetingOverviewFormValues;
  generatedMeetingNotes: GeneratedMeetingNotes;
};

export type ActionItemsNextStepMeetingNotes = {
  type: { name: string; id: string };
  file: File;
  objectives: string;
  structureType: string;
  additionalNotes?: string;
  meetingProjects: ProjectsFormValues;
  selectedHighlightedOutput: string[];
  actionItemsNextStep: ActionItemsNextStepFormValues;
  generatedMeetingNotes: GeneratedMeetingNotes;
};

export type ActionItemsNextStepByProjectMeetingNotes = {
  type: { name: string; id: string };
  file: File;
  objectives: string;
  structureType: string;
  additionalNotes?: string;
  meetingIndividuals: IndividualsFormValues;
  selectedHighlightedOutput: string[];
  actionItemsNextStep: ActionItemsNextStepFormValues;
  generatedMeetingNotes: GeneratedMeetingNotes;
};

export interface GenerateMeetingOverivewPromptParams {
  values: MeetingOverviewMeetingNotes;
}

export interface GenerateMeetingSummariesPromptParams {
  values: MeetingSummariesMeetingNotes;
}

export interface GenerateMeetingSummariesIndividualsPromptParams {
  values: MeetingSummariesIndividualMeetingNotes;
}

export interface GenerateMeetingSummariesKeyTakeawaysPromptParams {
  values: MeetingSummariesKeyTakeawaysMeetingNotes;
}

export interface GenerateActionItemsNextStepByIndividualPromptParams {
  values: ActionItemsNextStepByProjectMeetingNotes;
}

export interface GenerateActionItemsNextStepPromptParams {
  values: ActionItemsNextStepMeetingNotes;
}

export type MeetingNotesStep = {
  currentStep: number;
  isFinished?: boolean;
};

export type MeetingOverviewFormValues = {
  additionalNotes: string;
};

export type MeetingSummariesFormValues = {
  structureType?: string;
  additionalNotes: string;
};

export type MeetingSummariesKeyTakeawaysFormValues = {
  additionalNotes: string;
};

export type ActionItemsNextStepFormValues = {
  additionalNotes: string;
  highlightedOutput: string[];
  selectedHighlightedOutput: string[];
};

export type MeetingNotesFormValues = {
  objectives?: string;
  structureType?: string;
  file: File;
  type: { name: string; id: string };
};

export type GeneralMeetingNotesSectionKey =
  "generatedMeetingSummariesKeyTakeaways";

export type MeetingNotesSectionKey =
  | "generatedMeetingOverviews"
  | "generatedMeetingSummaries"
  | "generatedActionsItemsNextStep";

export type MeetingNotesType =
  | "Project Meeting Notes"
  | "General Meeting Notes";
