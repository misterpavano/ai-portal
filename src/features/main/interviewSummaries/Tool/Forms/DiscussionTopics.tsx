import React, { useEffect, useState } from "react";
import { Form, Formik } from "formik";
import { DiscussionTopicsFormValues } from "../../../../../types/interviewSummaries";
import { discussionTopicsSchema } from "../../../../../schemas/interviewSummariesSchema";
import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";
import { useAtom } from "jotai";
import InterviewDiscussionTopicsTable from "../Tables/InterviewDiscussionTopicsTable";

export type DiscussionTopicsProps = {
  isLoading: boolean;
};

const DiscussionTopicsForm: React.FC<DiscussionTopicsProps> = ({ isLoading }) => {
  const [interviewSummariesFormValues, setInterviewSummariesFormValues] =
    useAtom(interviewSummariesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    interviewSummariesFormValues.discussionTopics
  );

  useEffect(() => {
    if (initialFormValues.topics || initialFormValues.maxWordCountPerTopic) {
      setFormInitialValues(initialFormValues);
    } else {
      setFormInitialValues(initialFormValues);
    }
  }, [initialFormValues]);

  const handleAddSection = (newSection: DiscussionTopicsFormValues) => {
    setInterviewSummariesFormValues((prevValues) => ({
      ...prevValues,
      discussionTopics: {
        ...prevValues.discussionTopics,
        sections: [...prevValues.discussionTopics.sections!, newSection],
      },
    }));
  };

  const updateSection = (index: number, field: string, value: string) => {
    setInterviewSummariesFormValues((prevValues) => ({
      ...prevValues,
      discussionTopics: {
        ...prevValues.discussionTopics,
        sections: prevValues.discussionTopics.sections.map((section, i) =>
          i === index ? { ...section, [field]: value } : section
        ),
      },
    }));
  };

  const moveSection = (dragIndex: number, hoverIndex: number) => {
    const updatedSections = Array.from(
      interviewSummariesFormValues.discussionTopics.sections
    );
    const [removed] = updatedSections.splice(dragIndex, 1);
    updatedSections.splice(hoverIndex, 0, removed);
    setInterviewSummariesFormValues((prevValues) => ({
      ...prevValues,
      discussionTopics: {
        ...prevValues.discussionTopics,
        sections: updatedSections,
      },
    }));
  };

  return (
    <Formik
      key={JSON.stringify(initialFormValues)}
      validationSchema={discussionTopicsSchema}
      initialValues={initialFormValues}
      onSubmit={() => { }}
    >
      {() => (
        <Form>
          <InterviewDiscussionTopicsTable
            moveSection={moveSection}
            updateSection={updateSection}
            sections={
              interviewSummariesFormValues.discussionTopics.sections ?? []
            }
            deleteSection={(index) => {
              setInterviewSummariesFormValues((prevValues) => ({
                ...prevValues,
                discussionTopics: {
                  ...prevValues.discussionTopics,
                  sections: prevValues.discussionTopics.sections?.filter(
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
