import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { HouseRulesFormValues } from "../../../../../types/interviewSummaries";
import TextArea from "../../../../../components/layouts/TextArea";
import { houseRulesSchema } from "../../../../../schemas/interviewSummariesSchema";
import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";
import { useAtom } from "jotai";

export type HouseRulesProps = {
  initialValues: HouseRulesFormValues;
  handleSubmit: (formValues: HouseRulesFormValues) => void;
};

const HouseRulesForm: React.FC<HouseRulesProps> = ({
  initialValues,
  handleSubmit,
}) => {
  const [interviewSummariesFormValues] = useAtom(interviewSummariesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    interviewSummariesFormValues.houseRules
  );

  useEffect(() => {
    if (
      initialFormValues?.rules ||
      initialFormValues?.legalDisclaimer ||
      initialFormValues?.confidentiality ||
      initialFormValues?.additionalNotes
    ) {
      setFormInitialValues(initialFormValues);
    } else {
      setFormInitialValues(initialValues);
    }
  }, [initialValues, initialFormValues]);

  return (
    <Formik
      validationSchema={houseRulesSchema}
      initialValues={initialValues}
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
            <TextArea
              topText="Rules"
              placeholder="Rules"
              error={!!errors.rules}
              name="rules"
              styles={{ width: 370 }}
              value={values.rules!}
              onChange={handleChange}
              showCharacterCount
              maxLength={200}
            />
            <TextArea
              topText="Legal Disclaimer"
              placeholder="Legal Disclaimer"
              error={!!errors.legalDisclaimer}
              name="legalDisclaimer"
              styles={{ width: 370 }}
              value={values.legalDisclaimer!}
              onChange={handleChange}
              showCharacterCount
              maxLength={200}
            />
            <TextArea
              topText="Confidentiality"
              placeholder="Confidentiality"
              error={!!errors.confidentiality}
              name="confidentiality"
              styles={{ width: 370 }}
              value={values.confidentiality!}
              onChange={handleChange}
              showCharacterCount
              maxLength={200}
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

export default HouseRulesForm;
