import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import TextInput from "../../../../../components/layouts/TextInput";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { TableOfContentFormValues } from "../../../../../types/interviewSummaries";
import TextArea from "../../../../../components/layouts/TextArea";
import { tableOfContenthSchema } from "../../../../../schemas/interviewSummariesSchema";
import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";
import { useAtom } from "jotai";

export type TableOfContentsProps = {
  initialValues: TableOfContentFormValues;
  handleSubmit: (formValues: TableOfContentFormValues) => void;
};

const TableOfContentsForm: React.FC<TableOfContentsProps> = ({
  initialValues,
  handleSubmit,
}) => {
  const [interviewSummariesFormValues] = useAtom(interviewSummariesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    interviewSummariesFormValues.tableOfContents
  );

  useEffect(() => {
    if (
      initialFormValues?.sectionTitle ||
      initialFormValues?.slideNumber ||
      initialFormValues?.additionalNotes
    ) {
      setFormInitialValues(initialFormValues);
    } else {
      setFormInitialValues(initialValues);
    }
  }, [initialValues, initialFormValues]);

  return (
    <Formik
      validationSchema={tableOfContenthSchema}
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
              name="sectionTitle"
              topText="Section Title"
              inputStyles={{ width: 400 }}
              value={values.sectionTitle!}
              error={!!errors.sectionTitle}
              onChange={handleChange}
              type="string"
            />
            <TextInput
              name="slideNumber"
              topText="Slide Number"
              inputStyles={{ width: 400 }}
              value={values.slideNumber!}
              error={!!errors.slideNumber}
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

export default TableOfContentsForm;
