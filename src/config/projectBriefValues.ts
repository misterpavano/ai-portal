import {
  AuditResponse,
  ProjectBriefFormValues,
} from "../types/projectBriefTypes";

export const intialValuesProjectBriefForm: ProjectBriefFormValues = {
  objectives: "",
};

export const initialAuditResponse: AuditResponse = {
  auditQuestions: [],
};

export const initialProjectBrieftValues = {
  type: { name: "", id: "" },
  objectives: "",
  file: {
    fileId: "",
    fileName: "",
  },
  generatedProjectBrief: {
    generatedAudit: initialAuditResponse,
  },
  projectBriefJobList: {
    jobNumber: "",
    jobName: "",
    client: "",
    eventLaunchDate: "",
    agencyServer: "",
    creativeServer: "",
    internalKickOffDate: "",
  },
  projectCore: {
    brandingType: "Branded",
    whatIsThis: "",
    whoIsItFor: "",
    whyDoingThis: "",
  },
  contentLead: {
    contentLead: [],
    secondaryContent: "",
    additionalNotes: "",
  },
  contentDirection: {
    keyPoints: "",
    keyMessages: "",
    callToAction: "",
    tone: "",
    artContext: "",
    contextualGuidance: "",
    mandatories: "",
  },
  listOfClients: {
    includeSpecs: "Yes",
    output: "",
    examples: "",
  },
  keyMilestones: {
    anticipatedRoundClientReview: "",
    thirdPartyReviews: "",
    mlrReviews: "",
    other: "",
    functionalReview: "",
    otherKeyMilestones: "",
  },
  budgetAndHours: {
    filePath: "",
  },
  digitalProjects: {
    hasVAJob: "",
    hasVABudget: "",
  },
};
