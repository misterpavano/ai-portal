import React, { useEffect, useState } from "react";
import { Form, Formik } from "formik";
import { DiscussionFlowFormValues } from "../../../../../../../types/discussionGuidesTypes";
import { useAtom } from "jotai";
import { discussionGuideFlowAtom } from "../../../../../../../atoms/discussionGuideAtom";
import { discussionFlowSchema } from "../../../../../../../schemas/discussionGuideSchema";
import DiscussionFlowTable from "../Tables/DiscussionFlowTable";

export type DiscussionFlowFormProps = {
  handleSubmit: (formValues: DiscussionFlowFormValues) => void;
  isLoading: boolean;
};

const DiscussionFlowForm: React.FC<DiscussionFlowFormProps> = ({
  handleSubmit,
  isLoading,
}) => {
  const [discussionGuideFlow, setDiscussionGuideFlowValues] = useAtom(
    discussionGuideFlowAtom
  );

  const [initialFormValues, setFormInitialValues] = useState(
    discussionGuideFlow.discussionFlowForm
  );

  useEffect(() => {
    if (
      initialFormValues.section ||
      initialFormValues.sectionTitle ||
      initialFormValues.time ||
      initialFormValues.sections
    ) {
      setFormInitialValues(initialFormValues);
    }
  }, [initialFormValues]);

  const handleAddSection = (newSection: DiscussionFlowFormValues) => {
    setDiscussionGuideFlowValues((prevValues) => ({
      ...prevValues,
      discussionFlowForm: {
        ...prevValues.discussionFlowForm,
        sections: [...prevValues.discussionFlowForm.sections!, newSection],
      },
    }));
  };

  const handleRemoveSection = (index: number) => {
    setDiscussionGuideFlowValues((prevValues) => ({
      ...prevValues,
      discussionFlowForm: {
        ...prevValues.discussionFlowForm,
        sections: prevValues.discussionFlowForm.sections!.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  return (
    <Formik
      key={JSON.stringify(initialFormValues)}
      initialValues={initialFormValues}
      validationSchema={discussionFlowSchema}
      onSubmit={handleSubmit}
    >
      {() => (
        <Form>
          <DiscussionFlowTable
            sections={discussionGuideFlow.discussionFlowForm.sections ?? []}
            onAddSection={handleAddSection}
            onRemoveSection={handleRemoveSection}
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default DiscussionFlowForm;
