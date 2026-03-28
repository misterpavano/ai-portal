import React, { useEffect, useState } from "react";
import { Box, FormControl, MenuItem } from "@mui/material";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { useAtom } from "jotai";
import { meetingNotesFormAtom } from "../../../../../atoms/meetingNotesAtom";
import { MeetingSummariesFormValues } from "../../../../../types/meetingNotesTypes";
import TextInput from "../../../../../components/layouts/TextInput";
import Select from "../../../../../components/layouts/Select";

export type MeetingSummariesFormProps = {
  handleSubmit: (formValues: MeetingSummariesFormValues) => void;
};

const MeetingSummariesForm: React.FC<MeetingSummariesFormProps> = ({
  handleSubmit,
}) => {
  const [meetingNotesFormValues] = useAtom(meetingNotesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    meetingNotesFormValues.meetingSummaries
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
            <FormControl sx={{ width: "100%" }}>
              <Select
                styles={{ width: "100%" }}
                topText="Structure Type"
                name="structureType"
                value={values.structureType}
                onSelect={handleChange}
              >
                {["Group by project", "Group by individuals"].map((output) => (
                  <MenuItem
                    key={output}
                    value={output}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "white",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "inherit",
                      },
                      "&:hover": { backgroundColor: "white" },
                    }}
                  >
                    {output}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextInput
              topText="Additional Notes"
              placeholder="Additional notes..."
              error={!!errors.additionalNotes}
              name="additionalNotes"
              inputStyles={{ width: 480 }}
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

export default MeetingSummariesForm;
