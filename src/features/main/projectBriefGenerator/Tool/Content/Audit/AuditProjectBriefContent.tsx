import {
  Box,
  FormHelperText,
  LinearProgress,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import Select from "../../../../../../components/layouts/Select";
import { projectBriefFormAtom } from "../../../../../../atoms/projectBriefAtom";
import { useAtom } from "jotai";
import { IconFile, IconInfoCircle, IconTrashFilled } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { DropzoneState } from "../../../../../../components/layouts/FileUploader";
import useOpenAI from "../../../../../../hooks/useOpenAI";

type AuditProjectBriefContentProps = {
  assistantId: string;
  handleSelect: (e: any) => void;
  projectTypes: { assistantId: string; label: string }[];
};

const vectorStoreId = "vs_rNTKYXzFkKE0iDPtWD25j72U";

const AuditProjectBriefContent = ({
  assistantId,
  handleSelect,
  projectTypes,
}: AuditProjectBriefContentProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dropzoneState, setDropzoneState] = useState<DropzoneState>("default");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [, setFileUploaded] = useState(false);
  const { uploadFile, addFileToVectorStore } = useOpenAI();
  const [projectBriefFromValues, setProjectBriefFormValues] =
    useAtom(projectBriefFormAtom);

  const clearFileUpload = () => {
    setFile(null);
    setProjectBriefFormValues((prev) => ({
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

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
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

        await addFileToVectorStore(vectorStoreId, response.id);

        setProjectBriefFormValues((prevValues) => ({
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      setFile(null);
      await handleUpload(droppedFile);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(null);
      await handleUpload(selectedFile);
    }
  };

  useEffect(() => {
    if (projectBriefFromValues.objectives === "") {
      setFileUploaded(false);
    }
  }, [projectBriefFromValues.objectives]);

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
    <>
      <Box
        sx={{
          height: "72vh",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            border: "2px solid #FAFAF9",
            borderRadius: "20px",
            margin: "5px 20px 0 20px",
            padding: "20px 15px 20px 15px",
            justifyContent: "flex-start",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              backgroundColor: "#FEF2F0",
              width: "50%",
              p: 0.8,
              mb: 1,
              borderRadius: "10px",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ mt: 0.5 }}>
              <IconInfoCircle size={15} />
            </Box>
            <Typography sx={{ fontSize: "14px", flex: 1 }}>
              The audit tool is designed to evaluate the uploaded brief against
              the list of questions specific to the selected project type. For
              clarification, this list of questions is dependent on the
              spreadsheet managed by your team, which is updated to reflect
              current best practices identified. The tool&#39;s output is
              directly influenced by the questions inputted into this
              spreadsheet.
            </Typography>
          </Box>

          <Select
            topText="Select project type"
            styles={{
              width: "430px",
              height: "40px",
              fontSize: "14px",
              marginBottom: 2,
            }}
            onSelect={handleSelect}
            value={assistantId}
          >
            {projectTypes.map((projectType) => (
              <MenuItem
                key={projectType.assistantId}
                value={projectType.assistantId}
              >
                {projectType.label}
              </MenuItem>
            ))}
          </Select>
          <Box>
            <FormHelperText sx={{ color: "#515151", pb: 0.5 }}>
              Upload your document
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
                width: "570px",
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
        </Box>
      </Box>
    </>
  );
};

export default AuditProjectBriefContent;
