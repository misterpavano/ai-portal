export type InterviewSummariesFlow = {
  type: { name: string; id: string };
  objectives: string;
  file: File;
  objectivesSummary: string;
  summaryType: string[];
  aiTool: string;
  additionalNotes?: string;
  generateTopicsChecked: boolean;
  inputMode?: "notes" | "upload";
  introductionInputs?: IntroductionInputsFormValues;
  interviewSummary?: InterviewSummariesFormValues;
  discussionTopics: DiscussionTopicsFormValues;
  keyTakeawayTopic: KeyTakeawayTopicFormValues;
  detailedInsightTopic: DetailedInsightTopicFormValues;
  actionItems: ActionItemsFormValues;
  keyTakeaways: KeyTakeawaysFormValues;
  tableOfContents?: TableOfContentFormValues;
  meetingObjectives?: MeetingObjectivesFormValues;
  keyRecommendation: KeyRecommendationFormValues;
  detailedInsights: DetailedInsightsFormValues;
  meetingAdvisors?: MeetingAdvisorsFormValues;
  advisorPerceptions?: AdvisorPerceptionsFormValues;
  toplineFeedback?: ToplineFeedbackFormValues;
  attendeeList?: AttendeeListFormValues;
  meetingAgenda?: MeetingAgendaFormValues;
  houseRules?: HouseRulesFormValues;
  generatedInterviewSummaries: GeneratedInterviewSummaries;
  generatedKeyTakeawayTopic: GeneratedKeyTakeawayTopic;
  generatedDetailedInsightTopic: GeneratedDetailedInsightTopic;
  generatedToplineInterviewSummaries: GeneratedToplineInterviewSummaries;
};

export type File = {
  fileId: string;
  fileName: string;
};

export type GeneratedInterviewSummaries = {
  generatedActions: string[];
  generatedDetailedInsights: string[];
  generatedKeyTakeaways: string[];
  generatedKeyRecommendations: string[];
  generatedTopics: string[];
};

export type GeneratedKeyTakeawayTopic = {
  generatedTopic: string[];
};

export type GeneratedDetailedInsightTopic = {
  generatedTopic: string[];
};

export type GeneratedToplineInterviewSummaries = {
  generatedToplineActions: string[];
  generatedToplineKeyTakeaways: string[];
  generatedToplineKeyRecommendations: string[];
  generatedToplineTopics: string[];
};

export type InterviewSummariesStep = {
  currentStep: number;
  isFinished?: boolean;
};

export type InterviewDiscussionFormValues = {
  objectives?: string;
  objectivesSummary?: string;
  summaryType?: string[];
  aiTool?: string;
  generateTopicsChecked?: boolean;
  inputMode?: "notes" | "upload";
};

export type IntroductionInputsFormValues = {
  discussionObjectives?: string;
  date?: string;
  duration?: string;
  attendeeList?: string;
  conference?: string;
  topics?: string;
  survey?: string;
  includeHeader?: string;
};

export type InterviewSummariesFormValues = {
  date?: string;
  time?: string;
  conference?: string;
  attendeeList?: string;
  includeComponent?: string;
};

export type DiscussionTopicsFormValues = {
  topics: string;
  maxWordCountPerTopic?: string;
  additionalNote?: string;
  sections: DiscussionTopicsFormValues[];
};

export type KeyTakeawayTopicFormValues = {
  topic: string;
  maxWordCountPerTopic?: string;
  additionalNote?: string;
  sections: KeyTakeawayTopicFormValues[];
};

export type DetailedInsightTopicFormValues = {
  topic: string;
  maxWordCountPerTopic?: string;
  additionalNote?: string;
  sections: DetailedInsightTopicFormValues[];
};

export type MeetingObjectivesFormValues = {
  structureNotes?: string;
};

export type KeyRecommendationFormValues = {
  structureNotes?: string;
  additionalNotes?: string;
};

export type DetailedInsightsFormValues = {
  structureNotes?: string;
  additionalNotes?: string;
};

export type ActionItemsFormValues = {
  structureNotes?: string;
  additionalNotes?: string;
};

export type KeyTakeawaysFormValues = {
  structureNotes?: string;
  additionalNotes?: string;
};

export type TableOfContentFormValues = {
  sectionTitle?: string;
  slideNumber?: string;
  additionalNotes?: string;
};

export type MeetingAdvisorsFormValues = {
  topic?: string;
  advisors?: string;
  additionalNotes?: string;
};

export type AdvisorPerceptionsFormValues = {
  advisorsPhoto?: string;
  comment?: string;
  additionalNotes?: string;
};

export type ToplineFeedbackFormValues = {
  topics?: string;
  additionalNotes?: string;
  keyTakeaways?: string;
};

export type AttendeeListFormValues = {
  name?: string;
  position?: string;
  institution?: string;
  list: AttendeeListFormValues[];
};

export type MeetingAgendaFormValues = {
  leaderPerSection?: string;
  startTime?: string;
  endTime?: string;
  additionalNotes?: string;
};

export type HouseRulesFormValues = {
  rules?: string;
  legalDisclaimer?: string;
  confidentiality?: string;
  additionalNotes?: string;
};

export type GenerateKeyTakeawaysPromptParams = {
  values: KeyTakeawaysInterviewSummaries;
};

export type GenerateKeyTakeawayTopicPromptParams = {
  values: KeyTakeawayTopicInterviewSummaries;
};

export type GenerateDetailedInsightsPromptParams = {
  values: DetailedInsightsInterviewSummaries;
};

export type GenerateDetailedInsightsTopicPromptParams = {
  values: DetailedInsightsTopicInterviewSummaries;
};

export type GenerateActionItemsPromptParams = {
  values: ActionItemsInsightsInterviewSummaries;
};

export type GenerateKeyRecommendationsPromptParams = {
  values: KeyRecommendationsInterviewSummaries;
};

export type GenerateToplineKeyTakeawaysPromptParams = {
  values: ToplineKeyTakeawaysInterviewSummaries;
};

export type GenerateToplineActionItemsPromptParams = {
  values: ToplineActionItemsInterviewSummaries;
};

export type GenerateToplineKeyRecommendationsPromptParams = {
  values: ToplineKeyRecommendationsInterviewSummaries;
};

export type KeyTakeawaysInterviewSummaries = {
  file: File;
  type: { name: string; id: string };
  objectives: string;
  objectivesSummary: string;
  summaryType: string[];
  generateTopicsChecked: boolean;
  discussionTopics: DiscussionTopicsFormValues;
  keyTakeaways: KeyTakeawaysFormValues;
  additionalNotes?: string;
};

export type KeyTakeawayTopicInterviewSummaries = {
  file: File;
  type: { name: string; id: string };
  objectives: string;
  objectivesSummary: string;
  summaryType: string[];
  generateTopicsChecked: boolean;
  keyTakeawayTopic: KeyTakeawayTopicFormValues;
  keyTakeaways: KeyTakeawaysFormValues;
  additionalNotes?: string;
};

export type DetailedInsightsTopicInterviewSummaries = {
  file: File;
  type: { name: string; id: string };
  objectives: string;
  objectivesSummary: string;
  summaryType: string[];
  generateTopicsChecked: boolean;
  detailedInsightTopic: DetailedInsightTopicFormValues;
  detailedInsights: DetailedInsightsFormValues;
  additionalNotes?: string;
};

export type DetailedInsightsInterviewSummaries = {
  file: File;
  type: { name: string; id: string };
  objectives: string;
  objectivesSummary: string;
  summaryType: string[];
  generateTopicsChecked: boolean;
  discussionTopics: DiscussionTopicsFormValues;
  detailedInsights: DetailedInsightsFormValues;
  additionalNotes?: string;
  generatedInterviewSummaries: GeneratedInterviewSummaries;
};

export type ToplineKeyTakeawaysInterviewSummaries = {
  type: { name: string; id: string };
  objectives: string;
  objectivesSummary: string;
  summaryType: string[];
  generateTopicsChecked: boolean;
  discussionTopics: DiscussionTopicsFormValues;
  keyTakeaways: KeyTakeawaysFormValues;
  additionalNotes?: string;
  generatedToplineInterviewSummaries: GeneratedToplineInterviewSummaries;
};

export type ActionItemsInsightsInterviewSummaries = {
  file: File;
  type: { name: string; id: string };
  objectives: string;
  objectivesSummary: string;
  summaryType: string[];
  generateTopicsChecked: boolean;
  discussionTopics: DiscussionTopicsFormValues;
  actionItems: DetailedInsightsFormValues;
  additionalNotes?: string;
  generatedInterviewSummaries: GeneratedInterviewSummaries;
};

export type ToplineActionItemsInterviewSummaries = {
  type: { name: string; id: string };
  objectives: string;
  objectivesSummary: string;
  summaryType: string[];
  generateTopicsChecked: boolean;
  discussionTopics: DiscussionTopicsFormValues;
  actionItems: DetailedInsightsFormValues;
  additionalNotes?: string;
  generatedToplineInterviewSummaries: GeneratedToplineInterviewSummaries;
};

export type KeyRecommendationsInterviewSummaries = {
  file: File;
  type: { name: string; id: string };
  objectives: string;
  objectivesSummary: string;
  summaryType: string[];
  generateTopicsChecked: boolean;
  discussionTopics: DiscussionTopicsFormValues;
  keyRecommendations: KeyRecommendationFormValues;
  additionalNotes?: string;
  generatedInterviewSummaries: GeneratedInterviewSummaries;
};

export type ToplineKeyRecommendationsInterviewSummaries = {
  type: { name: string; id: string };
  objectives: string;
  objectivesSummary: string;
  summaryType: string[];
  generateTopicsChecked: boolean;
  discussionTopics: DiscussionTopicsFormValues;
  keyRecommendations: KeyRecommendationFormValues;
  additionalNotes?: string;
  generatedToplineInterviewSummaries: GeneratedToplineInterviewSummaries;
};

export type Prompt = {
  keyTakeaways: string;
  actionItems: string;
  keyRecommendations: string;
  detailedInsights: string;
};

export type InterviewGuideType = "Advisory Boards" | "1on1/TLE interviews";
// | "Transcript Based Summary";

export type Responses = {
  discussionTopicsResponse?: string;
  keyTakeawaysResponse?: string;
  actionItemsResponse?: string;
  keyRecommendationsResponse?: string;
  detailedInsightsResponse?: string;
};

export type SectionKey =
  | "generatedTopics"
  | "generatedKeyTakeawayTopic"
  | "generatedDetailedInsightTopic"
  | "generatedKeyTakeaways"
  | "generatedActions"
  | "generatedKeyRecommendations"
  | "generatedDetailedInsights";

export type ToplineSectionKey =
  | "generatedToplineTopics"
  | "generatedToplineKeyTakeaways"
  | "generatedToplineActions"
  | "generatedToplineKeyRecommendations"
  | "generatedToplineDetailedInsights";
