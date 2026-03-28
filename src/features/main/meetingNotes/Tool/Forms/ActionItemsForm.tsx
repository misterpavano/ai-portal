import React, { useEffect, useState } from "react";
import { Box, Checkbox, FormControlLabel, FormLabel } from "@mui/material";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { FieldArray, Form, Formik } from "formik";
import { useAtom } from "jotai";
import TextInput from "../../../../../components/layouts/TextInput";
import { meetingNotesFormAtom } from "../../../../../atoms/meetingNotesAtom";
import { ActionItemsNextStepFormValues } from "../../../../../types/meetingNotesTypes";

export type ActionItemsNextStepFormProps = {
  handleSubmit: (formValues: ActionItemsNextStepFormValues) => void;
};

const ActionItemsForm: React.FC<ActionItemsNextStepFormProps> = ({
  handleSubmit,
}) => {
  const [meetingNotesFormValues] = useAtom(meetingNotesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    meetingNotesFormValues.actionItemsNextStep
  );

  console.log("meetingNotesFormValues", initialFormValues.highlightedOutput);
  console.log("selected", initialFormValues.selectedHighlightedOutput);

  useEffect(() => {
    setFormInitialValues({
      additionalNotes: initialFormValues.additionalNotes,
      highlightedOutput:
        meetingNotesFormValues.actionItemsNextStep.highlightedOutput || [],
      selectedHighlightedOutput: initialFormValues.selectedHighlightedOutput,
    });
  }, [meetingNotesFormValues]);

  return (
    <Formik
      initialValues={initialFormValues}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, errors, handleChange, setFieldValue }) => (
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
              inputStyles={{ width: 480 }}
              value={values.additionalNotes!}
              onChange={handleChange}
            />

            <FormLabel component="legend">
              Select the groups or individuals below to highlight their action
              items in red.
            </FormLabel>
            <FieldArray
              name="selectedHighlightedOutput"
              render={() => (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {values.highlightedOutput.map(
                    (item: string, index: number) => (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            checked={values.selectedHighlightedOutput.includes(
                              item
                            )}
                            onChange={() => {
                              const isChecked =
                                values.selectedHighlightedOutput.includes(item);
                              const newSelectedOutput = isChecked
                                ? values.selectedHighlightedOutput.filter(
                                    (val) => val !== item
                                  )
                                : [...values.selectedHighlightedOutput, item];
                              setFieldValue(
                                "selectedHighlightedOutput",
                                newSelectedOutput
                              );
                            }}
                          />
                        }
                        label={item}
                      />
                    )
                  )}
                </Box>
              )}
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
