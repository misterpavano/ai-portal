import * as Yup from "yup";

export const validationSchema = Yup.object().shape({
  drugName: Yup.string().required("Required"),
  numberOfQuestions: Yup.string().required("Required"),
  patientFamiliarity: Yup.string().required("Required"),
  focusAreas: Yup.array().min(1, "At least one focus area must be selected"),
  tone: Yup.string().required("Required"),
});

const generalRequiredText = "The field is required!";

export const introductionSchema = Yup.object().shape({
  maxCharacterCount: Yup.number().required(generalRequiredText),
  audience: Yup.string().required(generalRequiredText),
  purpose: Yup.string().required(generalRequiredText),
});

export const marketResearchSchema = Yup.object().shape({
  marketResearchDisclousers: Yup.string().required(generalRequiredText),
});

export const discussionFlowSchema = Yup.object().shape({
  section: Yup.number().required(generalRequiredText),
  sectionTitle: Yup.string().required(generalRequiredText),
  time: Yup.number().required(generalRequiredText),
});

export const discussionSchema = Yup.object().shape({
  discussionObjectives: Yup.string().required(generalRequiredText),
  physicians: Yup.string().required(generalRequiredText),
});

export const discussionTopicsSchema = Yup.object().shape({
  topics: Yup.number().required(generalRequiredText),
  time: Yup.string().required(generalRequiredText),
});
