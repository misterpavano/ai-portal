import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { ActionItemsFormValues } from "../../../../../types/interviewSummaries";
import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";
import { useAtom } from "jotai";
import TextArea from "../../../../../components/layouts/TextArea";

export type ActionItmesProps = {
  initialValues: ActionItemsFormValues;
  handleSubmit: (formValues: ActionItemsFormValues) => void;
};

const ActionItemsForm: React.FC<ActionItmesProps> = ({
  initialValues,
  handleSubmit,
}) => {
  const [interviewSummariesFormValues] = useAtom(interviewSummariesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    interviewSummariesFormValues.actionItems
  );

  useEffect(() => {
    if (initialFormValues.structureNotes) {
      setFormInitialValues(initialFormValues);
    } else {
      setFormInitialValues(initialValues);
    }
  }, [initialValues, initialFormValues]);

  return (
    <Formik
      initialValues={initialFormValues}
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

export default ActionItemsForm;
