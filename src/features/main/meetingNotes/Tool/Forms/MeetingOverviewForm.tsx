import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { useAtom } from "jotai";
import { meetingNotesFormAtom } from "../../../../../atoms/meetingNotesAtom";
import { MeetingOverviewFormValues } from "../../../../../types/meetingNotesTypes";
import TextInput from "../../../../../components/layouts/TextInput";

export type MeetingOverviewFormProps = {
  handleSubmit: (formValues: MeetingOverviewFormValues) => void;
};

const MeetingOverviewForm: React.FC<MeetingOverviewFormProps> = ({
  handleSubmit,
}) => {
  const [meetingNotesFormValues] = useAtom(meetingNotesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    meetingNotesFormValues.meetingOverview
  );

  useEffect(() => {
    if (initialFormValues?.additionalNotes) {
      setFormInitialValues(initialFormValues);
    } else {
      setFormInitialValues(initialFormValues);
    }
  }, [initialFormValues]);

  return (
    <Formik
      initialValues={initialFormValues}
      onSubmit={handleSubmit}
      enableReinitialize
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
              topText="Additional Notes"
              placeholder="Additional notes..."
              error={!!errors.additionalNotes}
              name="additionalNotes"
              inputStyles={{ width: 500 }}
              value={values.additionalNotes!}
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

export default MeetingOverviewForm;
