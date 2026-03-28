import * as Yup from "yup";

const generalRequiredText = "The field is required!";

export const introductionInputsSchema = Yup.object().shape({
  discussionObjectives: Yup.string().required(generalRequiredText),
  date: Yup.string().required(generalRequiredText),
  attendeeList: Yup.string().required(generalRequiredText),
  includeHeader: Yup.string().required(generalRequiredText),
  conference: Yup.string().required(generalRequiredText),
  topics: Yup.string().required(generalRequiredText),
  survey: Yup.string().required(generalRequiredText),
});

export const interviewSummariesSchema = Yup.object().shape({
  date: Yup.string().required(generalRequiredText),
  time: Yup.string().required(generalRequiredText),
  conference: Yup.string().required(generalRequiredText),
  attendeeList: Yup.string().required(generalRequiredText),
  includeComponent: Yup.string().required(generalRequiredText),
});

export const actionItemsSchema = Yup.object().shape({
  maxWordCount: Yup.number().required(generalRequiredText),
  chooseFormat: Yup.string().required(generalRequiredText),
});

export const keyTakeawaysSchema = Yup.object().shape({
  maxWordCount: Yup.number().required(generalRequiredText),
  chooseFormat: Yup.string().required(generalRequiredText),
});

export const meetingObjectivesSchema = Yup.object().shape({
  maxWordCount: Yup.number().required(generalRequiredText),
  chooseFormat: Yup.string().required(generalRequiredText),
});

export const detailedInsightsSchema = Yup.object().shape({
  maxWordCount: Yup.number().required(generalRequiredText),
  chooseFormat: Yup.string().required(generalRequiredText),
});

export const keyRecommendationSchema = Yup.object().shape({
  maxWordCount: Yup.number().required(generalRequiredText),
  chooseFormat: Yup.string().required(generalRequiredText),
});

export const discussionTopicsSchema = Yup.object().shape({
  maxWordCount: Yup.number().required(generalRequiredText),
  chooseFormat: Yup.string().required(generalRequiredText),
});

export const tableOfContenthSchema = Yup.object().shape({
  sectionTitle: Yup.string().required(generalRequiredText),
  slideNumber: Yup.string().required(generalRequiredText),
  additionalNotes: Yup.string().required(generalRequiredText),
});

export const meetingAdvisorsSchema = Yup.object().shape({
  topic: Yup.string().required(generalRequiredText),
  advisors: Yup.string().required(generalRequiredText),
  additionalNotes: Yup.number().required(generalRequiredText),
});

export const advisorPerceptionsSchema = Yup.object().shape({
  advisorsPhoto: Yup.string().required(generalRequiredText),
  comment: Yup.string().required(generalRequiredText),
  additionalNotes: Yup.string().required(generalRequiredText),
});

export const toplineFeedbackSchema = Yup.object().shape({
  topics: Yup.string().required(generalRequiredText),
  keyTakeaways: Yup.string().required(generalRequiredText),
  additionalNotes: Yup.string().required(generalRequiredText),
});

export const attendeeListSchema = Yup.object().shape({
  name: Yup.string().required(generalRequiredText),
  position: Yup.string().required(generalRequiredText),
  institution: Yup.string().required(generalRequiredText),
});

export const meetingAgendaSchema = Yup.object().shape({
  leaderPerSection: Yup.string().required(generalRequiredText),
  startTime: Yup.string().required(generalRequiredText),
  endTime: Yup.string().required(generalRequiredText),
  additionalNotes: Yup.string().required(generalRequiredText),
});

export const houseRulesSchema = Yup.object().shape({
  rules: Yup.string().required(generalRequiredText),
  legalDisclaimer: Yup.string().required(generalRequiredText),
  confidentiality: Yup.string().required(generalRequiredText),
  additionalNotes: Yup.string().required(generalRequiredText),
});

export const interviewDiscussionSchema = Yup.object().shape({
  objectives: Yup.string().required(generalRequiredText),
});
