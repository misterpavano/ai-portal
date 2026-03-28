import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import TextInput from "../../../../../components/layouts/TextInput";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { IntroductionInputsFormValues } from "../../../../../types/interviewSummaries";
import { introductionInputsSchema } from "../../../../../schemas/interviewSummariesSchema";
import { useAtom } from "jotai";
import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";

export type IntroductionFormProps = {
  initialValues: IntroductionInputsFormValues;
  handleSubmit: (formValues: IntroductionInputsFormValues) => void;
};

const IntroductionInputsForm: React.FC<IntroductionFormProps> = ({
  initialValues,
  handleSubmit,
}) => {
  const [interviewSummariesFormValues] = useAtom(interviewSummariesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    interviewSummariesFormValues.introductionInputs
  );

  useEffect(() => {
    if (
      initialFormValues?.discussionObjectives ||
      initialFormValues?.date ||
      initialFormValues?.duration ||
      initialFormValues?.attendeeList ||
      initialFormValues?.conference ||
      initialFormValues?.topics ||
      initialFormValues?.includeHeader ||
      initialFormValues?.survey
    ) {
      setFormInitialValues(initialFormValues);
    } else {
      setFormInitialValues(initialValues);
    }
  }, [initialValues, initialFormValues]);

  return (
    <Formik
      validationSchema={introductionInputsSchema}
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
              name="discussionObjectives"
              topText="Discussion objectives / Agenda*"
              inputStyles={{ width: 400 }}
              value={values.discussionObjectives!}
              error={!!errors.discussionObjectives}
              onChange={handleChange}
              type="string"
            />
            <TextInput
              name="date"
              topText="Date / Time"
              inputStyles={{ width: 400 }}
              value={values.date!}
              error={!!errors.date}
              onChange={handleChange}
              type="string"
            />
            <TextInput
              name="duration"
              topText="Duration"
              inputStyles={{ width: 400 }}
              value={values.duration!}
              error={!!errors.duration}
              onChange={handleChange}
              type="string"
            />
            <TextInput
              name="attendeeList"
              topText="Atendee List"
              inputStyles={{ width: 400 }}
              value={values.attendeeList!}
              error={!!errors.attendeeList}
              onChange={handleChange}
              type="string"
            />
            <TextInput
              name="conference"
              topText="Conference/Location"
              inputStyles={{ width: 400 }}
              value={values.conference!}
              error={!!errors.conference}
              onChange={handleChange}
              type="string"
            />
            <TextInput
              name="topics"
              topText="Topics"
              inputStyles={{ width: 400 }}
              value={values.topics!}
              error={!!errors.topics}
              onChange={handleChange}
              type="string"
            />
            <Box>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Include Date / Time, Duration, Location
                </FormLabel>
                <RadioGroup
                  name="surveyResponse"
                  value={values.includeHeader}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value={values.includeHeader}
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Box>
            <TextInput
              name="survey"
              topText="Survey"
              inputStyles={{ width: 400 }}
              value={values.survey!}
              error={!!errors.survey}
              onChange={handleChange}
              type="string"
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

export default IntroductionInputsForm;
