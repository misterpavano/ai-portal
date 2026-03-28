import {
  ActionItemsFormValues,
  AdvisorPerceptionsFormValues,
  AttendeeListFormValues,
  DetailedInsightTopicFormValues,
  DetailedInsightsFormValues,
  DiscussionTopicsFormValues,
  HouseRulesFormValues,
  InterviewDiscussionFormValues,
  InterviewSummariesFormValues,
  IntroductionInputsFormValues,
  KeyRecommendationFormValues,
  KeyTakeawayTopicFormValues,
  KeyTakeawaysFormValues,
  MeetingAdvisorsFormValues,
  MeetingAgendaFormValues,
  MeetingObjectivesFormValues,
  TableOfContentFormValues,
  ToplineFeedbackFormValues,
} from "../types/interviewSummaries";

export const initialValuesIntroductionInputsForm: IntroductionInputsFormValues =
  {
    discussionObjectives: "",
    date: "",
    duration: "",
    attendeeList: "",
    conference: "",
    topics: "",
    survey: "",
    includeHeader: "yes",
  };

export const initialValuesInterviewSummariesForm: InterviewSummariesFormValues =
  {
    date: "",
    time: "",
    conference: "",
    attendeeList: "",
    includeComponent: "",
  };

export const initialValuesDiscussionTopicsForm: DiscussionTopicsFormValues = {
  topics: "",
  maxWordCountPerTopic: "8",
  additionalNote: "",
  sections: [],
};

export const initialValuesKeyTakeawaysTopicsForm: KeyTakeawayTopicFormValues = {
  topic: "",
  maxWordCountPerTopic: "8",
  additionalNote: "",
  sections: [],
};

export const initialValuesDetailedInsightTopicsForm: DetailedInsightTopicFormValues =
  {
    topic: "",
    maxWordCountPerTopic: "8",
    additionalNote: "",
    sections: [],
  };

export const initialValuesMeetingObjectivesForm: MeetingObjectivesFormValues = {
  structureNotes: "",
};

export const initialValuesKeyRecommendationForm: KeyRecommendationFormValues = {
  structureNotes: "",
};

export const initialValuesDetailedInsightsForm: DetailedInsightsFormValues = {
  structureNotes: "",
};

export const initialValuesActionItemsForm: ActionItemsFormValues = {
  structureNotes: "",
};

export const initialValuesKeyTakeawaysForm: KeyTakeawaysFormValues = {
  structureNotes: "",
};

export const initialValuesTableOfContentForm: TableOfContentFormValues = {
  sectionTitle: "",
  slideNumber: "",
  additionalNotes: "",
};

export const initialValuesMeetingAdvisorsForm: MeetingAdvisorsFormValues = {
  topic: "",
  advisors: "",
  additionalNotes: "",
};

export const initialValuesAdvisorPerceptionsForm: AdvisorPerceptionsFormValues =
  {
    advisorsPhoto: "",
    comment: "",
    additionalNotes: "",
  };

export const initialValuesToplineFeedbackForm: ToplineFeedbackFormValues = {
  topics: "",
  keyTakeaways: "",
  additionalNotes: "",
};

export const initialValuesAttendeeListForm: AttendeeListFormValues = {
  name: "",
  position: "",
  institution: "",
  list: [],
};

export const initialValuesMeetingAgendaForm: MeetingAgendaFormValues = {
  leaderPerSection: "",
  startTime: "",
  endTime: "",
  additionalNotes: "",
};

export const initialValuesHouseRulesForm: HouseRulesFormValues = {
  rules: "",
  legalDisclaimer: "",
  confidentiality: "",
  additionalNotes: "",
};

export const initialValuesInterviewDiscussionForm: InterviewDiscussionFormValues =
  {
    summaryType: [],
    objectives: "",
    objectivesSummary: "",
    aiTool: "Open AI",
    generateTopicsChecked: false,
  };

export const initialInterviewSummariesValues = {
  type: { name: "", id: "" },
  summaryType: [],
  objectives: "",
  objectivesSummary: "",
  aiTool: "Open AI",
  file: {
    fileId: "",
    fileName: "",
  },
  generateTopicsChecked: false,
  discussionTopics: {
    topics: "",
    maxWordCountPerTopic: "8",
    additionalNote: "",
    sections: [],
  },
  keyTakeawayTopic: {
    topic: "",
    maxWordCountPerTopic: "8",
    additionalNote: "",
    sections: [],
  },
  detailedInsightTopic: {
    topic: "",
    maxWordCountPerTopic: "8",
    additionalNote: "",
    sections: [],
  },
  actionItems: {
    structureNotes: "",
  },
  keyRecommendation: {
    structureNotes: "",
  },
  keyTakeaways: {
    structureNotes: "",
  },
  meetingObjectives: {
    structureNotes: "",
  },
  detailedInsights: {
    structureNotes: "",
  },
  generatedKeyTakeawayTopic: {
    generatedTopic: [],
  },
  generatedDetailedInsightTopic: {
    generatedTopic: [],
  },
  generatedInterviewSummaries: {
    generatedActions: [],
    generatedKeyTakeaways: [],
    generatedTopics: [],
    generatedMeetingObjectives: [],
    generatedDetailedInsights: [],
    generatedKeyRecommendations: [],
  },
  generatedToplineInterviewSummaries: {
    generatedToplineActions: [],
    generatedToplineKeyTakeaways: [],
    generatedToplineKeyRecommendations: [],
    generatedToplineTopics: [],
  },
};
