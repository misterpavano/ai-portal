import Box from "@mui/material/Box";
import { Form, Formik } from "formik";
import TextArea from "../../../../../components/layouts/TextArea";
import {
  DiscussionFormValues,
  DiscussionGuideFlow,
} from "../../../../../types/discussionGuidesTypes";

export type DiscussionPromptsProps = {
  initialValues: DiscussionFormValues;
  setDiscussionFormValues: React.Dispatch<
    React.SetStateAction<DiscussionGuideFlow>
  >;
};

const DiscussionObjectivesPrompts = ({
  initialValues,
  setDiscussionFormValues,
}: DiscussionPromptsProps) => {
  const handleAudienceChange = (
    e: React.ChangeEvent<any>,
    handleChange: (e: React.ChangeEvent<any>) => void
  ) => {
    handleChange(e);
    setDiscussionFormValues((prev) => ({
      ...prev,
      audienceDiscussionObjectives: e.target.value,
    }));
  };

  const handleRespondentTypeChange = (
    e: React.ChangeEvent<any>,
    handleChange: (e: React.ChangeEvent<any>) => void
  ) => {
    handleChange(e);
    setDiscussionFormValues((prev) => ({
      ...prev,
      respondentTypeObjectives: e.target.value,
    }));
  };

  const handleCaveatsChange = (
    e: React.ChangeEvent<any>,
    handleChange: (e: React.ChangeEvent<any>) => void
  ) => {
    handleChange(e);
    setDiscussionFormValues((prev) => ({
      ...prev,
      caveatsDiscussionObjectives: e.target.value,
    }));
  };

  const handleLengthChange = (
    e: React.ChangeEvent<any>,
    handleChange: (e: React.ChangeEvent<any>) => void
  ) => {
    handleChange(e);
    setDiscussionFormValues((prev) => ({
      ...prev,
      lengthDiscussionObjectives: e.target.value,
    }));
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={() => {}}
    >
      {({ values, handleChange }) => (
        <Form>
          <Box sx={{ width: "510px" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                width: "800px",
              }}
            >
              <TextArea
                name="tone"
                topText="Tone"
                description="This text area contains attributes that you can modify. Feel free to edit the content as needed."
                styles={{
                  width: "100%",
                  height: "100px",
                  marginBottom: 2,
                  pointerEvents: "auto",
                  opacity: 1,
                }}
                value={values.toneDiscussionObjectives!}
                onChange={(e) => handleAudienceChange(e, handleChange)}
              />
              <TextArea
                name="phrasing"
                topText="Phrasing"
                description="This text area contains attributes that you can modify. Feel free to edit the content as needed."
                styles={{
                  width: "100%",
                  height: "100px",
                  marginBottom: 2,
                  pointerEvents: "auto",
                  opacity: 1,
                }}
                value={values.phrasingDiscussionObjectives!}
                onChange={(e) => handleRespondentTypeChange(e, handleChange)}
              />
              <TextArea
                name="paceAndFlow"
                topText="Pace & flow"
                description="This text area contains attributes that you can modify. Feel free to edit the content as needed."
                styles={{
                  width: "100%",
                  height: "100px",
                  marginBottom: 2,
                  pointerEvents: "auto",
                  opacity: 1,
                }}
                value={values.paceAndFlowDiscussionObjectives!}
                onChange={(e) => handleCaveatsChange(e, handleChange)}
              />
              <TextArea
                name="length"
                topText="Length"
                description="This text area contains attributes that you can modify. Feel free to edit the content as needed."
                styles={{
                  width: "100%",
                  height: "100px",
                  marginBottom: 2,
                  pointerEvents: "auto",
                  opacity: 1,
                }}
                value={values.lengthDiscussionObjectives!}
                onChange={(e) => handleLengthChange(e, handleChange)}
              />
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default DiscussionObjectivesPrompts;
