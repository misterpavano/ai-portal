export type DiscussionGuidesTypeForm = {
  drugName?: string;
  numberOfQuestions?: string;
  patientFamiliarity?: string;
  focusAreas?: string[];
  tone?: string;
  questions?: [];
  aiType?: string;
  indicators?: string[];
  exercise?: string;
  allergies?: string[];
};

export type DiscussionFlowFormValues = {
  section?: string;
  sectionTitle?: string;
  time?: string;
  sections: DiscussionFlowFormValues[];
  childrenTopics?: string[];
};

export type IntroductionFormValues = {
  maxCharacterCount: string;
  audience: string;
  purpose: string;
  additionalNote?: string;
};

export type MarketResearchFormValues = {
  marketResearchDisclousers?: string;
  direction?: string;
};

export type ReviewFormValues = {
  introductionBackground?: string;
  marketResearchDisclousers: string;
};

export type TDriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
};

export type DiscussionFormValues = {
  discussionObjectives?: string;
  questionsId?: string;
  structureId?: string;
  audienceDiscussionObjectives?: string;
  respondentTypeObjectives?: string;
  caveatsDiscussionObjectives?: string;
  communicationStyleDiscussionObjectives: string;
  lengthDiscussionObjectives?: string;

  paceAndFlowDiscussionObjectives?: string;
  phrasingDiscussionObjectives?: string;
  toneDiscussionObjectives?: string;
};

export type DiscussionGuideStep = {
  currentStep: number;
  isFinished?: boolean;
};

export type DiscussionGuideAiGenerated = {
  introductionGenerated?: string;
  introductionForm?: IntroductionFormValues;
};

export type DiscussionTopicsFormValues = {
  topics: string;
  duration?: string;
  lead?: string;
  numberOfQuestionsPerTopic: string;
  generatedAiQuestions: DiscussionQuestions[];
  sections: DiscussionTopicsFormValues[];
  additionalNote?: string;
  parentSectionTitle?: string;
};

export type DiscussionQuestions = {
  question: string;
  followUpQuestions: string[];
};

export type DiscussionGuideFlow = {
  type: { name: string; id: string };
  discussionObjectives: string;
  questionsId: string;
  structureId: string;
  audienceDiscussionObjectives: string;
  respondentTypeObjectives: string;
  caveatsDiscussionObjectives: string;
  communicationStyleDiscussionObjectives: string;

  lengthDiscussionObjectives: string;
  paceAndFlowDiscussionObjectives: string;
  phrasingDiscussionObjectives: string;
  toneDiscussionObjectives: string;

  introductionForm: IntroductionFormValues;
  marketResearchForm: MarketResearchFormValues;
  discussionFlowForm: DiscussionFlowFormValues;
  discussionTopicsForm: DiscussionTopicsFormValues;
  discussionGuideGeneratedAi: DiscussionGuideAiGenerated;
};

export interface OrganizedSection {
  sectionTitle: string;
  childrenTopics: string[];
}

export interface OrganizedContent {
  organizedSections: OrganizedSection[];
  unassignedTopics: string[];
}

export interface IntroductionFormResponse {
  audience: string;
  purpose: string;
}

export interface DiscussionTopicsResponse {
  sections: Array<{
    topics: string;
    duration: string;
    lead: string;
    numberOfQuestionsPerTopic: string;
  }>;
}

export interface DiscussionFlowResponse {
  sections: Array<{
    section: string;
    sectionTitle: string;
    time: string;
  }>;
}

export interface CombinedResponse {
  introductionForm: IntroductionFormResponse;
  discussionFlow: DiscussionFlowResponse;
  discussionTopics: DiscussionTopicsResponse;
}

export type GuideType =
  | "Focus Group"
  | "Patient Journey"
  | "Communication Testing"
  | "Payer Guides"
  | "Market Assessment"
  | "TPP Testing";
