import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { MeetingAgendaFormValues } from "../../../../../types/interviewSummaries";
import TextArea from "../../../../../components/layouts/TextArea";
import TextInput from "../../../../../components/layouts/TextInput";
import { meetingAgendaSchema } from "../../../../../schemas/interviewSummariesSchema";
import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";
import { useAtom } from "jotai";

export type HouseRulesProps = {
  initialValues: MeetingAgendaFormValues;
  handleSubmit: (formValues: MeetingAgendaFormValues) => void;
};

const MeetingAgendaForm: React.FC<HouseRulesProps> = ({
  initialValues,
  handleSubmit,
}) => {
  const [interviewSummariesFormValues] = useAtom(interviewSummariesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    interviewSummariesFormValues.meetingAgenda
  );

  useEffect(() => {
    if (
      initialFormValues?.leaderPerSection ||
      initialFormValues?.startTime ||
      initialFormValues?.endTime ||
      initialFormValues?.additionalNotes
    ) {
      setFormInitialValues(initialFormValues);
    } else {
      setFormInitialValues(initialValues);
    }
  }, [initialValues, initialFormValues]);

  return (
    <Formik
      validationSchema={meetingAgendaSchema}
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
              topText="Leader per section"
              placeholder="Leader per section"
              error={!!errors.leaderPerSection}
              name="leaderPerSection"
              inputStyles={{ width: 400 }}
              value={values.leaderPerSection!}
              onChange={handleChange}
            />
            <Box sx={{ display: "flex", gap: 5 }}>
              <TextInput
                topText="Start Time"
                placeholder="-"
                error={!!errors.startTime}
                inputStyles={{ width: 180 }}
                name="startTime"
                value={values.startTime!}
                onChange={handleChange}
              />
              <TextInput
                topText="End Time"
                placeholder="-"
                error={!!errors.endTime}
                name="endTime"
                inputStyles={{ width: 180 }}
                value={values.endTime!}
                onChange={handleChange}
                type="string"
              />
            </Box>
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

export default MeetingAgendaForm;
