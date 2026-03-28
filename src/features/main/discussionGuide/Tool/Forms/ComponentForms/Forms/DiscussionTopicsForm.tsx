import { useEffect, useState } from "react";
import { Form, Formik } from "formik";
import { DiscussionTopicsFormValues } from "../../../../../../../types/discussionGuidesTypes";
import { useAtom } from "jotai";
import { discussionGuideFlowAtom } from "../../../../../../../atoms/discussionGuideAtom";
import { discussionTopicsSchema } from "../../../../../../../schemas/discussionGuideSchema";
import DiscussionTopicsTable from "../Tables/DiscussionTopicsTable";

export type DiscussionTopicsFormProps = {
  handleSubmit: () => void;
  isLoading: boolean;
};

const DiscussionTopicsForm = ({
  handleSubmit,
  isLoading,
}: DiscussionTopicsFormProps) => {
  const [discussionGuideFlow, setDiscussionGuideFlowValues] = useAtom(
    discussionGuideFlowAtom
  );

  const [initialFormValues, setFormInitialValues] = useState(
    discussionGuideFlow.discussionTopicsForm
  );

  useEffect(() => {
    if (
      initialFormValues.topics ||
      initialFormValues.duration ||
      initialFormValues.lead ||
      initialFormValues.numberOfQuestionsPerTopic ||
      initialFormValues.sections
    ) {
      setFormInitialValues(initialFormValues);
    }
  }, [initialFormValues]);

  // const handleAddSection = (
  //   values: DiscussionTopicsFormValues,
  //   resetForm: () => void
  // ) => {
  //   setDiscussionGuideFlowValues((prevValues) => ({
  //     ...prevValues,
  //     discussionTopicsForm: {
  //       ...prevValues.discussionTopicsForm,
  //       sections: [...prevValues.discussionTopicsForm.sections!, values],
  //     },
  //   }));
  //   resetForm();
  // };

  const handleAddSection = (newSection: DiscussionTopicsFormValues) => {
    setDiscussionGuideFlowValues((prevValues) => ({
      ...prevValues,
      discussionTopicsForm: {
        ...prevValues.discussionTopicsForm,
        sections: [...prevValues.discussionTopicsForm.sections!, newSection],
      },
    }));
  };

  const updateSection = (index: number, field: string, value: string) => {
    setDiscussionGuideFlowValues((prevValues) => ({
      ...prevValues,
      discussionTopicsForm: {
        ...prevValues.discussionTopicsForm,
        sections: prevValues.discussionTopicsForm.sections.map((section, i) =>
          i === index ? { ...section, [field]: value } : section
        ),
      },
    }));
  };

  const moveSection = (dragIndex: number, hoverIndex: number) => {
    const updatedSections = Array.from(
      discussionGuideFlow.discussionTopicsForm.sections
    );
    const [removed] = updatedSections.splice(dragIndex, 1);
    updatedSections.splice(hoverIndex, 0, removed);
    setDiscussionGuideFlowValues((prevValues) => ({
      ...prevValues,
      discussionTopicsForm: {
        ...prevValues.discussionTopicsForm,
        sections: updatedSections,
      },
    }));
  };

  return (
    <Formik
      key={JSON.stringify(initialFormValues)}
      initialValues={initialFormValues}
      validationSchema={discussionTopicsSchema}
      onSubmit={handleSubmit}
    >
      {() => (
        <Form>
          <DiscussionTopicsTable
            moveSection={moveSection}
            updateSection={updateSection}
            sections={discussionGuideFlow.discussionTopicsForm.sections ?? []}
            deleteSection={(index) => {
              setDiscussionGuideFlowValues((prevValues) => ({
                ...prevValues,
                discussionTopicsForm: {
                  ...prevValues.discussionTopicsForm,
                  sections: prevValues.discussionTopicsForm.sections?.filter(
                    (_, i) => i !== index
                  ),
                },
              }));
            }}
            onAddSection={handleAddSection}
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default DiscussionTopicsForm;
