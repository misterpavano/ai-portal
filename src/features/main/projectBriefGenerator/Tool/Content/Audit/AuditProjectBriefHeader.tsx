import { Box, Typography, CardHeader, MenuItem, Button } from "@mui/material";
import { IconNotes, IconArrowLeft } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { initialProjectBrieftValues } from "../../../../../../config/projectBriefValues";
import {
  projectBriefFormAtom,
  projectBriefStepAtom,
} from "../../../../../../atoms/projectBriefAtom";
import Select from "../../../../../../components/layouts/Select";
import useOpenAI from "../../../../../../hooks/useOpenAI";

const vectorStoreId = "vs_4LtsWA1cx5rcylL65oA94qUg";

interface AuditProjectBriefHeaderProps {
  clientName: string;
  assistantId: string;
  handleSelect: (e: any) => void;
  projectTypes: { assistantId: string; label: string }[];
}

const AuditProjectBriefHeader = ({
  clientName,
  assistantId,
  handleSelect,
  projectTypes,
}: AuditProjectBriefHeaderProps) => {
  const { deleteFileFromVectorStore, deleteFileFromStorage } = useOpenAI();
  const [projectBriefValues, setProjectBriefFormValues] =
    useAtom(projectBriefFormAtom);
  const [step, setCurrentStep] = useAtom(projectBriefStepAtom);
  const validAssistantIds = [
    projectBriefValues.type.name === "Audit"
      ? "asst_6RD1YoSkD8T2JyyvMKT5bujl"
      : "asst_hZtU9GHDKwwhdMLvkiv4yntK",
  ];

  const removeFiles = () => {
    deleteFileFromVectorStore(vectorStoreId, projectBriefValues.file.fileId);
    deleteFileFromStorage(projectBriefValues.file.fileId);
  };

  const handleReturnToFirstStep = () => {
    if (projectBriefValues.type.name === "Audit" && step.currentStep === 2) {
      removeFiles();
    }

    setCurrentStep({ currentStep: 0, isFinished: false });
    setProjectBriefFormValues(initialProjectBrieftValues);
  };

  return (
    <CardHeader
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        backgroundColor: "white",
        color: "white",
        height: "90px",
        borderRadius: 0,
      }}
      title={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            gap: 1,
            position: "relative",
          }}
        >
          <IconArrowLeft
            cursor="pointer"
            onClick={handleReturnToFirstStep}
            color="black"
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#E86D5A",
              borderRadius: "40%",
              padding: "5px",
            }}
          >
            <IconNotes size={18} color="white" />
          </Box>
          <Box
            sx={{
              display: "flex",
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                style={{ fontWeight: 600, fontSize: "18px", color: "black" }}
              >
                {clientName}
              </Typography>
            </Box>
            <Box>
              {validAssistantIds.includes(assistantId) && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexDirection: "row",
                    gap: 1,
                  }}
                >
                  <Typography style={{ fontSize: "14px", color: "#515151" }}>
                    Project type:
                  </Typography>
                  <Select
                    styles={{
                      width: "135px",
                      height: "40px",
                      fontSize: "14px",
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
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      }
    />
  );
};

export default AuditProjectBriefHeader;
