export type ProjectBriefFlow = {
  file: File;
  type: { name: string; id: string };
  objectives: string;
  projectBriefJobList: ProjectBriefJobListValues;
  projectCore: ProjectCoreValues;
  contentLead: ContentLeadValues;
  contentDirection: ContentDirectionValues;
  listOfClients: ListOfClientsValues;
  keyMilestones: KeyMilestonesValues;
  budgetAndHours: BudgetAndHoursValues;
  digitalProjects: DigitalProjectsValues;
  generatedProjectBrief: GeneratedProjectBrief;
};

export interface AuditQuestion {
  question: string;
  answered: boolean;
  answer: string | null;
}

export interface AuditResponse {
  auditQuestions: AuditQuestion[];
}

export type GeneratedProjectBrief = {
  generatedAudit: AuditResponse;
};

export type File = {
  fileId: string;
  fileName: string;
};

export type ProjectBriefStep = {
  currentStep: number;
  isFinished?: boolean;
};

export type ProjectBriefFormValues = {
  objectives?: string;
};

export type ProjectBriefJobListValues = {
  jobNumber: string;
  jobName: string;
  client: string;
  eventLaunchDate: string;
  agencyServer: string;
  creativeServer: string;
  internalKickOffDate: string;
};

export type ProjectCoreValues = {
  brandingType: string;
  whatIsThis: string;
  whoIsItFor: string;
  whyDoingThis: string;
};

export type ContentLeadValues = {
  contentLead: string[];
  secondaryContent: string;
  additionalNotes: string;
};

export type ContentDirectionValues = {
  keyPoints: string;
  keyMessages: string;
  callToAction: string;
  tone: string;
  artContext: string;
  contextualGuidance: string;
  mandatories: string;
  sections?: ContentDirectionValues[];
};

export type ListOfClientsValues = {
  includeSpecs: string;
  output: string;
  examples: string;
};

export type KeyMilestonesValues = {
  anticipatedRoundClientReview: string;
  thirdPartyReviews: string;
  mlrReviews: string;
  other: string;
  functionalReview: string;
  otherKeyMilestones: string;
  sections?: KeyMilestonesValues[];
};

export type BudgetAndHoursValues = {
  filePath: string;
};

export type DigitalProjectsValues = {
  hasVAJob: string;
  hasVABudget: string;
};

export type ProjectBriefType =
  | "Standard Project Brief"
  | "Portal Build / Brand Add Template"
  | "Speaker Bureau Portal Updates Template";
