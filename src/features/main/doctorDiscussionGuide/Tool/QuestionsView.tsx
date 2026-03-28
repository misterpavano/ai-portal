import React from "react";
import { Box, Typography } from "@mui/material";
import { DiscussionGuidesTypeForm } from "../../../../types/discussionGuidesTypes";
import DefaultButton from "../../../../components/layouts/DefaultButton";

export interface QuestionsViewProps {
  generateWordContent: () => void;
  handleGenerateContent: (formValues: DiscussionGuidesTypeForm) => void;
  formValues: DiscussionGuidesTypeForm;
  setFormValues: any;
  setIsLoading: any;
  setIndicators: React.Dispatch<React.SetStateAction<string[]>>;
}

const QuestionsView = ({
  generateWordContent,
  handleGenerateContent,
  formValues,
  setFormValues,
  setIsLoading,
  setIndicators,
}: QuestionsViewProps) => {
  const questions = formValues?.questions;
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: 1 }}>
        Result
      </Typography>
      {questions?.map((item: { question: string }, key: number) => {
        return (
          <Typography key={key}>
            {key + 1}. {item.question}
          </Typography>
        );
      })}
      <DefaultButton
        style={{
          width: 200,
          height: 45,
          marginRight: 2,
          marginTop: 3,
        }}
        onClick={generateWordContent}
        type="primary"
        title="Generate Word"
      />
      <DefaultButton
        style={{
          width: 300,
          height: 45,
          marginRight: 2,
          marginTop: 3,
        }}
        onClick={() => handleGenerateContent({ ...formValues, questions: [] })}
        type="secondary"
        title="Regenerate Response"
      />
      <DefaultButton
        style={{
          width: 200,
          height: 45,
          marginRight: 2,
          marginTop: 3,
        }}
        onClick={() => {
          setFormValues({});
          setIsLoading(false);
          setIndicators([]);
        }}
        type="secondary"
        title="Reset"
      />
    </Box>
  );
};

export default QuestionsView;
