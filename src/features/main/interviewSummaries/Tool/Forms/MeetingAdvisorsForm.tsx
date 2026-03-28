import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import TextInput from "../../../../../components/layouts/TextInput";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { MeetingAdvisorsFormValues } from "../../../../../types/interviewSummaries";
import TextArea from "../../../../../components/layouts/TextArea";
import { meetingAdvisorsSchema } from "../../../../../schemas/interviewSummariesSchema";
import { useAtom } from "jotai";
import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";

export type MeetingAdvisorsProps = {
  initialValues: MeetingAdvisorsFormValues;
  handleSubmit: (formValues: MeetingAdvisorsFormValues) => void;
};

const MeetingAdvisorsForm: React.FC<MeetingAdvisorsProps> = ({
  initialValues,
  handleSubmit,
}) => {
  const [interviewSummariesFormValues] = useAtom(interviewSummariesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    interviewSummariesFormValues.meetingAdvisors
  );

  useEffect(() => {
    if (
      initialFormValues?.topic ||
      initialFormValues?.advisors ||
      initialFormValues?.additionalNotes
    ) {
      setFormInitialValues(initialFormValues);
    } else {
      setFormInitialValues(initialValues);
    }
  }, [initialValues, initialFormValues]);

  return (
    <Formik
      validationSchema={meetingAdvisorsSchema}
      initialValues={initialValues}
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
              name="topic"
              topText="Topic"
              inputStyles={{ width: 400 }}
              value={values.topic!}
              error={!!errors.topic}
              onChange={handleChange}
              type="string"
            />
            <TextInput
              name="advisors"
              topText="Advisors per Session"
              inputStyles={{ width: 400 }}
              value={values.advisors!}
              error={!!errors.advisors}
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

export default MeetingAdvisorsForm;
