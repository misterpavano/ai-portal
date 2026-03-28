import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import TextInput from "../../../../../../../components/layouts/TextInput";
import DefaultButton from "../../../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { IntroductionFormValues } from "../../../../../../../types/discussionGuidesTypes";
import { introductionSchema } from "../../../../../../../schemas/discussionGuideSchema";
import { discussionGuideFlowAtom } from "../../../../../../../atoms/discussionGuideAtom";
import { useAtom } from "jotai";
import TextArea from "../../../../../../../components/layouts/TextArea";

export type IntroductionFormProps = {
  handleSubmit: (formValues: IntroductionFormValues) => void;
};

const IntroductionForm = ({ handleSubmit }: IntroductionFormProps) => {
  const [discussionGuideFlow] = useAtom(discussionGuideFlowAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    discussionGuideFlow.introductionForm
  );

  useEffect(() => {
    if (
      initialFormValues.maxCharacterCount ||
      initialFormValues.audience ||
      initialFormValues.purpose
    ) {
      setFormInitialValues(initialFormValues);
    }
  }, [initialFormValues]);

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={introductionSchema}
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
              name="maxCharacterCount"
              topText="Max Word Count*"
              inputStyles={{ width: 480 }}
              value={values.maxCharacterCount!}
              error={!!errors.maxCharacterCount}
              onChange={handleChange}
              type="number"
            />
            <TextInput
              name="audience"
              topText="Audience*"
              inputStyles={{ width: 480 }}
              value={values.audience}
              error={!!errors.audience}
              onChange={handleChange}
            />
            <TextArea
              name="purpose"
              topText="Purpose*"
              styles={{ width: 480 }}
              value={values.purpose!}
              error={!!errors.purpose}
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

export default IntroductionForm;
