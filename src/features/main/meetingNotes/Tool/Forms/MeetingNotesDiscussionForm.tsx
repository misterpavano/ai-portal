import {
  Box,
  Checkbox,
  FormControl,
  FormHelperText,
  LinearProgress,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import TextArea from "../../../../../components/layouts/TextArea";
import { discussionSchema } from "../../../../../schemas/discussionGuideSchema";
import { DropzoneState } from "../../../../../components/layouts/FileUploader";

import {
  MeetingNotesFlow,
  MeetingNotesFormValues,
} from "../../../../../types/meetingNotesTypes";
import {
  IconChevronDown,
  IconFile,
  IconTrashFilled,
} from "@tabler/icons-react";
import useOpenAI from "../../../../../hooks/useOpenAI";
import Select from "../../../../../components/layouts/Select";

export type MeetingNotesProps = {
  initialValues: MeetingNotesFormValues;
  setMeetingNotesFormValues: React.Dispatch<
    React.SetStateAction<MeetingNotesFlow>
  >;
};

const meetingNotesVectorId = "vs_pwDTCHE3iyyboFzFs30gCFa2";

const MeetingNotesDiscussionForm = ({
  initialValues,
  setMeetingNotesFormValues,
}: MeetingNotesProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [dropzoneState, setDropzoneState] = useState<DropzoneState>("default");
  const [uploadProgress, setUploadProgress] = useState(0);
  const { uploadFile, addFileToVectorStore } = useOpenAI();

  const handleStructureChange = (
    e: SelectChangeEvent<string>,
    handleChange: (e: ChangeEvent<any>) => void
  ) => {
    const {
      target: { value },
    } = e;
    setMeetingNotesFormValues((prev) => ({
      ...prev,
      structureType: value,
    }));
    handleChange(e as unknown as ChangeEvent<any>);
  };

  const handleObjectiveChange = (
    e: React.ChangeEvent<any>,
    handleChange: (e: React.ChangeEvent<any>) => void
  ) => {
    handleChange(e);
    setMeetingNotesFormValues((prev) => ({
      ...prev,
      objectives: e.target.value,
    }));
  };

  const handleUpload = async (selectedFile: File) => {
    if (selectedFile) {
      setFile(selectedFile);
      setDropzoneState("loading");
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            return 90;
          }
          return Math.min(prev + 10, 90);
        });
      }, 300);

      try {
        const response = await uploadFile({
          file: selectedFile,
          purpose: "assistants",
        });

        await addFileToVectorStore(meetingNotesVectorId, response.id);

        setMeetingNotesFormValues((prevValues) => ({
          ...prevValues,
          file: {
            fileId: response.id,
            fileName: response.filename,
          },
        }));

        setUploadProgress(100);
        setFileUploaded(true);
        setDropzoneState("uploaded");
      } catch (error) {
        console.error(error);
        setDropzoneState("error");
      } finally {
        clearInterval(progressInterval);
        setUploadProgress(100);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      setFile(null);
      await handleUpload(droppedFile);
    }
  };

  const clearFileUpload = () => {
    setFile(null);
    setMeetingNotesFormValues((prev) => ({
      ...prev,
      objectives: "",
      file: {
        fileId: "",
        fileName: "",
      },
    }));
    setFileUploaded(false);
    setDropzoneState("default");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(null);
      await handleUpload(selectedFile);
    }
  };

  useEffect(() => {
    if (initialValues.objectives === "") {
      setFileUploaded(false);
    }
  }, [initialValues.objectives]);

  const renderContent = () => {
    switch (dropzoneState) {
      case "default":
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconFile color="#475467" size={20} />
            <Typography sx={{ color: "#475467", fontSize: "14px" }}>
              Drop items here or{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", textDecoration: "underline" }}
                onClick={() => fileInputRef.current?.click()}
              >
                Browse files
              </Box>
            </Typography>
          </Box>
        );
      case "loading":
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "40%",
            }}
          >
            <IconFile color="#475467" size={20} />
            <LinearProgress
              sx={{ width: "100%" }}
              color="info"
              variant="determinate"
              value={uploadProgress}
            />
          </Box>
        );
      case "uploaded":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconFile color="#475467" size={16} />
                <Tooltip placement="right-start" title={file?.name} arrow>
                  <Typography sx={{ color: "#E86D5A", fontSize: "14px" }}>
                    {file?.name?.length! > 25
                      ? file?.name.substring(0, 25) + "..."
                      : file?.name}
                  </Typography>
                </Tooltip>
              </Box>
              <Box>
                <IconTrashFilled
                  onClick={(event) => {
                    event.stopPropagation();
                    clearFileUpload();
                  }}
                  style={{ cursor: "pointer" }}
                  size={16}
                  color="#DC5E5E"
                />
              </Box>
            </Box>
          </Box>
        );
      case "error":
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "80%",
              }}
            >
              <IconFile color="#DC5E5E" size={32} />
              <Typography sx={{ color: "#DC5E5E", fontSize: "12px" }}>
                An error occurred while uploading. Please try again.
              </Typography>
            </Box>
            <Typography
              onClick={(event) => {
                event.stopPropagation();
                setDropzoneState("default");
              }}
              sx={{
                color: "#DC5E5E",
                fontSize: "12px",
                fontWeight: "bold",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Try Again
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={discussionSchema}
      onSubmit={() => {}}
    >
      {({ values, errors, handleChange }) => (
        <Form>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              width: "100%",
            }}
          >
            {initialValues.type.name === "Project Meeting Notes" && (
              <FormControl sx={{ width: "100%" }}>
                <Select
                  name="structureType"
                  topText=" Structure type*"
                  styles={{ width: "95%" }}
                  value={values.structureType}
                  onSelect={(e) =>
                    handleStructureChange(
                      e as SelectChangeEvent<string>,
                      handleChange
                    )
                  }
                >
                  {["Group by project", "Group by individuals"].map(
                    (structure) => (
                      <MenuItem key={structure} value={structure}>
                        {structure}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            )}
            <TextArea
              maxLength={3000}
              styles={{
                width: "95%",
                minHeight: "300px",
                marginBottom:
                  !fileUploaded &&
                  values.objectives &&
                  values.objectives.length === 3000
                    ? ""
                    : "20px",
              }}
              topText="Meeting Notes Objectives*"
              placeholder="Type Meeting Notes Objectives..."
              value={fileUploaded ? "" : values.objectives!}
              onChange={(e) => handleObjectiveChange(e, handleChange)}
              error={!!errors.objectives}
              name="objectives"
              disabled={fileUploaded}
            />
            {!fileUploaded &&
              values.objectives &&
              values.objectives.length === 3000 && (
                <p
                  style={{
                    color: "red",
                    marginBottom: 20,
                    fontSize: "12px",
                    marginTop: "-20px",
                  }}
                >
                  Character count exceeded the limit. Please upload a .docx file
                  for better results, as large text might be significantly less
                  accurate when being processed by AI.
                </p>
              )}
          </Box>
          <Box>
            <FormHelperText sx={{ color: "#515151", pb: 0.5 }}>
              Upload your meeting notes or transcripts below
            </FormHelperText>
            <Box sx={{ pb: 0.5 }}>
              <Typography sx={{ fontSize: "11px", color: "#767373" }}>
                You can either drag and drop the files into the section below or
                browse to attach them.
              </Typography>
            </Box>
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              sx={{
                border: "1px dashed",
                borderRadius: 2,
                padding: 2,
                display: "flex",
                minHeight: "10px",
                width: "95%",
                cursor: "pointer",
                flexDirection: "column",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                multiple
                accept=".txt, .doc, .docx"
                style={{ display: "none" }}
                type="file"
                onChange={handleFileChange}
              />
              {renderContent()}
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default MeetingNotesDiscussionForm;
