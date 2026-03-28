import React, { useEffect, useState } from "react";
import { Box, FormControl, FormLabel, MenuItem } from "@mui/material";
import TextInput from "../../../../../components/layouts/TextInput";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { ToplineFeedbackFormValues } from "../../../../../types/interviewSummaries";
import TextArea from "../../../../../components/layouts/TextArea";
import { toplineFeedbackSchema } from "../../../../../schemas/interviewSummariesSchema";
import { useAtom } from "jotai";
import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";
import Select from "../../../../../components/layouts/Select";

export type ToplineFeedbackProps = {
  initialValues: ToplineFeedbackFormValues;
  handleSubmit: (formValues: ToplineFeedbackFormValues) => void;
};

const ToplineFeedbackForm: React.FC<ToplineFeedbackProps> = ({
  initialValues,
  handleSubmit,
}) => {
  const [interviewSummariesFormValues] = useAtom(interviewSummariesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    interviewSummariesFormValues.toplineFeedback
  );

  useEffect(() => {
    if (
      initialFormValues?.topics ||
      initialFormValues?.keyTakeaways ||
      initialFormValues?.additionalNotes
    ) {
      setFormInitialValues(initialFormValues);
    } else {
      setFormInitialValues(initialValues);
    }
  }, [initialValues, initialFormValues]);
  return (
    <Formik
      validationSchema={toplineFeedbackSchema}
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
              name="topics"
              topText="Topics"
              inputStyles={{ width: 400 }}
              value={values.topics!}
              error={!!errors.topics}
              onChange={handleChange}
              type="string"
            />
            <FormControl>
              <FormLabel component="legend">Key takeaways per topic</FormLabel>
              <Select
                name="keyTakeaways"
                value={values.keyTakeaways}
                onSelect={handleChange}
                error={!!errors.keyTakeaways}
                styles={{ width: 400 }}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>
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

export default ToplineFeedbackForm;
