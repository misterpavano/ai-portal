import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { MeetingObjectivesFormValues } from "../../../../../types/interviewSummaries";
import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";
import { useAtom } from "jotai";
import TextArea from "../../../../../components/layouts/TextArea";

export type MeetingObjectiveProps = {
  initialValues: MeetingObjectivesFormValues;
  handleSubmit: (formValues: MeetingObjectivesFormValues) => void;
};

const MeetingObjectivesForm: React.FC<MeetingObjectiveProps> = ({
  initialValues,
  handleSubmit,
}) => {
  const [interviewSummariesFormValues] = useAtom(interviewSummariesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    interviewSummariesFormValues.meetingObjectives
  );

  useEffect(() => {
    if (initialFormValues?.structureNotes) {
      setFormInitialValues(initialFormValues);
    } else {
      setFormInitialValues(initialValues);
    }
  }, [initialValues, initialFormValues]);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, handleChange }) => (
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
            <TextArea
              name="structureNotes"
              topText="Additional Notes"
              description="Provide additional notes and direction for writing style, such as tone, voice and such."
              styles={{ width: 520 }}
              value={values.structureNotes!}
              onChange={handleChange}
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

export default MeetingObjectivesForm;
