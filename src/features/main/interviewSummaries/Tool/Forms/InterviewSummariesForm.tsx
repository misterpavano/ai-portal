import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import TextInput from "../../../../../components/layouts/TextInput";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { InterviewSummariesFormValues } from "../../../../../types/interviewSummaries";
import { interviewSummariesSchema } from "../../../../../schemas/interviewSummariesSchema";
import { useAtom } from "jotai";
import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";

export type InterviewSummariesFormProps = {
  initialValues: InterviewSummariesFormValues;
  handleSubmit: (formValues: InterviewSummariesFormValues) => void;
};

const InterviewSummariesForm: React.FC<InterviewSummariesFormProps> = ({
  initialValues,
  handleSubmit,
}) => {
  const [interviewSummariesFormValues] = useAtom(interviewSummariesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    interviewSummariesFormValues.interviewSummary
  );

  useEffect(() => {
    if (
      initialFormValues?.date ||
      initialFormValues?.time ||
      initialFormValues?.attendeeList ||
      initialFormValues?.conference ||
      initialFormValues?.includeComponent
    ) {
      setFormInitialValues(initialFormValues);
    } else {
      setFormInitialValues(initialValues);
    }
  }, [initialValues, initialFormValues]);

  return (
    <Formik
      validationSchema={interviewSummariesSchema}
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
              name="date"
              topText="Date"
              inputStyles={{ width: 400 }}
              value={values.date!}
              error={!!errors.date}
              onChange={handleChange}
              type="string"
            />
            <TextInput
              name="time"
              topText="Time"
              inputStyles={{ width: 400 }}
              value={values.time!}
              error={!!errors.time}
              onChange={handleChange}
              type="string"
            />
            <TextInput
              name="conference"
              topText="Conference"
              inputStyles={{ width: 400 }}
              value={values.conference!}
              error={!!errors.conference}
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

            <Box>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Include component in each page
                </FormLabel>
                <RadioGroup
                  name="includeComponent"
                  value={values.includeComponent}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Box>
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

export default InterviewSummariesForm;
