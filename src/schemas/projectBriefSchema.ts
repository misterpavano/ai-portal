import * as Yup from "yup";

const generalRequiredText = "The field is required!";

// Project Brief Job List Schema
export const projectBriefJobListSchema = Yup.object().shape({
  jobNumber: Yup.string().required(generalRequiredText),
  jobName: Yup.string().required(generalRequiredText),
  client: Yup.string().required(generalRequiredText),
  eventLaunchDate: Yup.string().required(generalRequiredText),
  agencyServer: Yup.string().required(generalRequiredText),
  creativeServer: Yup.string().required(generalRequiredText),
  internalKickOffDate: Yup.string().required(generalRequiredText),
});

// Project Core Schema
export const projectCoreSchema = Yup.object().shape({
  brandingType: Yup.string().required(generalRequiredText),
  whatIsThis: Yup.string().required(generalRequiredText),
  whoIsItFor: Yup.string().required(generalRequiredText),
  whyDoingThis: Yup.string().required(generalRequiredText),
});

// Content Lead Schema
export const contentLeadSchema = Yup.object().shape({
  contentLead: Yup.array()
    .of(Yup.string().required(generalRequiredText))
    .required(generalRequiredText),
  secondaryContent: Yup.string().required(generalRequiredText),
  additionalNotes: Yup.string().required(generalRequiredText),
});

// Content Direction Schema
export const contentDirectionSchema = Yup.object().shape({
  keyPoints: Yup.string().required(generalRequiredText),
  keyMessages: Yup.string().required(generalRequiredText),
  callToAction: Yup.string().required(generalRequiredText),
  tone: Yup.string().required(generalRequiredText),
  artContext: Yup.string().required(generalRequiredText),
  contextualGuidance: Yup.string().required(generalRequiredText),
  mandatories: Yup.string().required(generalRequiredText),
});

// List of Clients Schema
export const listOfClientsSchema = Yup.object().shape({
  includeSpecs: Yup.string().required(generalRequiredText),
  output: Yup.string().required(generalRequiredText),
  examples: Yup.string().required(generalRequiredText),
});

// Key Milestones Schema
export const keyMilestonesSchema = Yup.object().shape({
  anticipatedRoundClientReview: Yup.string().required(generalRequiredText),
  thirdPartyReviews: Yup.string().required(generalRequiredText),
  mlrReviews: Yup.string().required(generalRequiredText),
  other: Yup.string().required(generalRequiredText),
  functionalReview: Yup.string().required(generalRequiredText),
  otherKeyMilestones: Yup.string().required(generalRequiredText),
});

// Budget and Hours Schema
export const budgetAndHoursSchema = Yup.object().shape({
  filePath: Yup.string().required(generalRequiredText),
});

// Digital Projects Schema
export const digitalProjectsSchema = Yup.object().shape({
  hasVAJob: Yup.string().required(generalRequiredText),
  hasVABudget: Yup.string().required(generalRequiredText),
});
