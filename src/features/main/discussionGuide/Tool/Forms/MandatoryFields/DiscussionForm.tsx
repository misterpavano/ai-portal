import { Box, MenuItem, Tooltip } from "@mui/material";
import { Form, Formik } from "formik";
import TextArea from "../../../../../../components/layouts/TextArea";
import { discussionSchema } from "../../../../../../schemas/discussionGuideSchema";
import {
  DiscussionFormValues,
  DiscussionGuideFlow,
  TDriveFile,
} from "../../../../../../types/discussionGuidesTypes";
import FileUploader, {
  DropzoneState,
  FileUploadProps,
} from "../../../../../../components/layouts/FileUploader";
import { useEffect, useState } from "react";
import Select from "../../../../../../components/layouts/Select";

export type DiscussionFormProps = {
  initialValues: DiscussionFormValues;
  questions: TDriveFile[];
  structures: TDriveFile[];
  setDiscussionFormValues: React.Dispatch<
    React.SetStateAction<DiscussionGuideFlow>
  >;
};

const DiscussionForm = ({
  initialValues,
  questions,
  structures,
  setDiscussionFormValues,
}: DiscussionFormProps) => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [dropzoneState, setDropzoneState] = useState<DropzoneState>("default");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFormikChange = (
    e: React.ChangeEvent<any>,
    type: "questionsId" | "structureId" | "discussionObjectives",
    handleChange: (e: React.ChangeEvent<any>) => void
  ) => {
    handleChange(e);
    setDiscussionFormValues((prev) => ({
      ...prev,
      [type]: e.target.value,
    }));
  };

  const simulateProgress = (callback: () => void) => {
    return new Promise<void>((resolve) => {
      setDropzoneState("loading");
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          const newProgress = prevProgress + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            callback();
            setDropzoneState("uploaded");
            resolve();
            return 100;
          }
          return newProgress;
        });
      }, 200);
    });
  };

  const handleFileUploaded = (fileContents: string[]) => {
    simulateProgress(() => {
      const combinedContent = fileContents.join("\n\n");
      setDiscussionFormValues((prev) => ({
        ...prev,
        discussionObjectives: combinedContent,
      }));
      setFileUploaded(true);
    }).catch((error) => {
      console.error("Error processing file:", error);
      setDropzoneState("error");
    });
  };

  const truncateText = (text: string, maxLength = 40) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const clearFileUpload = () => {
    setDiscussionFormValues((prev) => ({
      ...prev,
      discussionObjectives: "",
    }));
    setFileUploaded(false);
    setDropzoneState("default");
    setUploadProgress(0);
  };

  const fileUploadProps: FileUploadProps = {
    onFileUploaded: handleFileUploaded,
    setFileUploaded: setFileUploaded,
    clearFileUpload: clearFileUpload,
    dropzoneState: dropzoneState,
    uploadProgress: uploadProgress,
    text: "Upload Document",
    description:
      "Upload any document that can help AI better understand the objectives and details of the discussion guide. This is optional.",
  };

  useEffect(() => {
    if (initialValues.discussionObjectives === "") {
      setFileUploaded(false);
    }
  }, [initialValues.discussionObjectives]);

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={discussionSchema}
      onSubmit={() => {}}
    >
      {({ values, handleChange }) => (
        <Form>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <TextArea
              styles={{ width: "95%", minHeight: "300px", marginBottom: 12 }}
              topText="Prompt*"
              placeholder="Enter the prompt here..."
              value={fileUploaded ? "" : values.discussionObjectives!}
              onChange={(e) =>
                handleFormikChange(e, "discussionObjectives", handleChange)
              }
              name="discussionObjectives"
              disabled={fileUploaded}
            />
            <Select
              name="questionsId"
              value={values.questionsId}
              onSelect={(e: any) =>
                handleFormikChange(e, "questionsId", handleChange)
              }
              styles={{ width: "95%", marginBottom: 2 }}
              topText="Questions Guide*"
            >
              {questions.map((question) => (
                <MenuItem key={question.id} value={question.id}>
                  {truncateText(question.name)}
                </MenuItem>
              ))}
            </Select>
            <Select
              name="structureId"
              value={values.structureId}
              onSelect={(e: any) =>
                handleFormikChange(e, "structureId", handleChange)
              }
              styles={{ width: "95%", marginBottom: 3 }}
              topText="Structure Guide*"
            >
              {structures.map((structure) => (
                <MenuItem key={structure.id} value={structure.id}>
                  {truncateText(structure.name)}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <FileUploader {...fileUploadProps} />
        </Form>
      )}
    </Formik>
  );
};

export default DiscussionForm;
