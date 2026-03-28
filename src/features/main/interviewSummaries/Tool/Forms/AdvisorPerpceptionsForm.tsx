import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import TextInput from "../../../../../components/layouts/TextInput";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { AdvisorPerceptionsFormValues } from "../../../../../types/interviewSummaries";
import TextArea from "../../../../../components/layouts/TextArea";
import { advisorPerceptionsSchema } from "../../../../../schemas/interviewSummariesSchema";
import { useAtom } from "jotai";
import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";

export type AdvisorPerceptionsProps = {
  initialValues: AdvisorPerceptionsFormValues;
  handleSubmit: (formValues: AdvisorPerceptionsFormValues) => void;
};

const AdvisorPerceptionsForm: React.FC<AdvisorPerceptionsProps> = ({
  initialValues,
  handleSubmit,
}) => {
  const [interviewSummariesFormValues] = useAtom(interviewSummariesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    interviewSummariesFormValues.advisorPerceptions
  );

  useEffect(() => {
    if (
      initialFormValues?.advisorsPhoto ||
      initialFormValues?.comment ||
      initialFormValues?.additionalNotes
    ) {
      setFormInitialValues(initialFormValues);
    } else {
      setFormInitialValues(initialValues);
    }
  }, [initialValues, initialFormValues]);

  return (
    <Formik
      validationSchema={advisorPerceptionsSchema}
      initialValues={initialFormValues!}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, errors, handleChange }) => (
        <Form>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              flexDirection: "column",
              justifyContent: "flex-start",
              gap: 4,
            }}
          >
            <TextInput
              name="advisorsPhoto"
              topText="Advisors Photo"
              inputStyles={{ width: 400 }}
              value={values.advisorsPhoto!}
              error={!!errors.advisorsPhoto}
              onChange={handleChange}
              type="string"
            />
            <TextInput
              name="comment"
              topText="Comment"
              inputStyles={{ width: 400 }}
              value={values.comment!}
              error={!!errors.comment}
              onChange={handleChange}
              type="string"
            />
            <TextArea
              topText=""
              placeholder="Additional Notes"
              error={!!errors.additionalNotes}
              name="additionalNotes"
              styles={{ width: 370 }}
              value={values.additionalNotes!}
              onChange={handleChange}
              showCharacterCount
              maxLength={200}
            />
            <DefaultButton
              style={{
                alignSelf: "flex-end",
                width: 100,
                borderRadius: "15px",
                height: 45,
                marginTop: 3,
                marginBottom: 3,
              }}
              submit
              type="primary"
              title="Save"
            />
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default AdvisorPerceptionsForm;
