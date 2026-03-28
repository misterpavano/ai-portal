import {
  DiscussionFormValues,
  IntroductionFormValues,
  MarketResearchFormValues,
  DiscussionFlowFormValues,
  DiscussionGuideFlow,
} from "../types/discussionGuidesTypes";

export const initialValuesIntroductionForm: IntroductionFormValues = {
  maxCharacterCount: "100",
  audience: "",
  purpose: "",
  additionalNote: "",
};

export const initialValuesDiscussionFlow: DiscussionFlowFormValues = {
  section: undefined,
  sectionTitle: "",
  time: undefined,
  sections: [],
  childrenTopics: [],
};

export const initialValuesMarketResearchForm: MarketResearchFormValues = {
  marketResearchDisclousers: "",
  direction: "",
};

export const initialValuesDiscussionForm: DiscussionFormValues = {
  discussionObjectives: "",
  audienceDiscussionObjectives: "",
  caveatsDiscussionObjectives: "",
  communicationStyleDiscussionObjectives: "",
  lengthDiscussionObjectives: "",
};

export const initalDiscussionGuideFlowValues: DiscussionGuideFlow = {
  type: { name: "", id: "" },
  discussionObjectives: "",
  questionsId: "",
  structureId: "",
  audienceDiscussionObjectives: "",
  respondentTypeObjectives: "",
  communicationStyleDiscussionObjectives: "",
  caveatsDiscussionObjectives: "",
  lengthDiscussionObjectives: "",
  paceAndFlowDiscussionObjectives: "",
  phrasingDiscussionObjectives: "",
  toneDiscussionObjectives: "",
  introductionForm: {
    maxCharacterCount: "100",
    audience: "",
    purpose: "",
    additionalNote: "",
  },
  marketResearchForm: {
    marketResearchDisclousers: "",
    direction: "",
  },
  discussionFlowForm: {
    section: "",
    sectionTitle: "",
    time: "",
    sections: [],
    childrenTopics: [],
  },
  discussionTopicsForm: {
    topics: "",
    duration: "",
    lead: "",
    numberOfQuestionsPerTopic: "",
    generatedAiQuestions: [
      {
        question: "",
        followUpQuestions: [],
      },
    ],
    sections: [],
    additionalNote: "",
    parentSectionTitle: "",
  },
  discussionGuideGeneratedAi: {
    introductionGenerated: "",
  },
};
