import { Box } from "@mui/material";
import AuditProjectBriefHeader from "./AuditProjectBriefHeader";
import AuditProjectBriefContent from "./AuditProjectBriefContent";

type TProjectType = {
  assistantId: string;
  sheetUrl: string;
  label: string;
};

// Define props for AuditProjectBriefContent
interface AuditProjectBriefContentProps {
  assistantId: string;
  handleSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  projectTypes: TProjectType[];
}

const AuditProjectBrief = ({
  assistantId,
  handleSelect,
  projectTypes,
}: AuditProjectBriefContentProps) => {
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "80vh",
      }}
    >
      <AuditProjectBriefHeader
        clientName="Audit Project Brief"
        assistantId={assistantId}
        handleSelect={handleSelect}
        projectTypes={projectTypes}
      />
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <AuditProjectBriefContent
          assistantId={assistantId}
          handleSelect={handleSelect}
          projectTypes={projectTypes}
        />
      </Box>
    </Box>
  );
};

export default AuditProjectBrief;
