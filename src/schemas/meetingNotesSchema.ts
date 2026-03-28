import * as Yup from "yup";

const generalRequiredText = "The field is required!";

export const meetingOverviewSchema = Yup.object().shape({
  additionalNotes: Yup.string().required(generalRequiredText),
});
export const meetingSummariesSchema = Yup.object().shape({
  additionalNotes: Yup.string().required(generalRequiredText),
});
export const actionItemsNextStepSchema = Yup.object().shape({
  additionalNotes: Yup.string().required(generalRequiredText),
});
