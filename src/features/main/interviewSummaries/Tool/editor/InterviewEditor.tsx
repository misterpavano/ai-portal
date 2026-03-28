import { useRef } from "react";
import { Box, FormLabel, Skeleton, Typography } from "@mui/material";
import ReactQuill from "react-quill";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  GeneratedInterviewSummaries,
  SectionKey,
} from "../../../../../types/interviewSummaries";
import { toolbarConfig } from "../../../../../utils/toolbarConfig";

interface InterviewEditorProps {
  label: string;
  valueKey: keyof GeneratedInterviewSummaries;
  value: string;
  isLoadingSection: boolean;
  sectionLoading: SectionKey | null;
  onOpenModal: (
    section: SectionKey,
    event: React.MouseEvent<HTMLElement>,
  ) => void;
  onOpenTopicModal: (
    section: SectionKey,
    event: React.MouseEvent<HTMLElement>,
  ) => void;
  onChange: (val: string) => void;
  editorRefs: React.MutableRefObject<{ [key: string]: ReactQuill | null }>;
  editorDivRefs: React.MutableRefObject<{
    [key: string]: HTMLDivElement | null;
  }>;
}

export const InterviewEditor = ({
  label,
  valueKey,
  value,
  isLoadingSection,
  sectionLoading,
  onOpenModal,
  onOpenTopicModal,
  onChange,
  editorRefs,
  editorDivRefs,
}: InterviewEditorProps) => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <FormLabel sx={{ pb: 1 }} component="legend">
          {label}
        </FormLabel>
        <Box sx={{ display: "flex", gap: 2 }}>
          {valueKey === "generatedKeyTakeaways" ? (
            <Typography
              sx={{
                fontSize: "14px",
                textDecoration: isLoadingSection ? "none" : "underline",
                cursor: isLoadingSection ? "not-allowed" : "pointer",
                color: isLoadingSection ? "gray" : "primary.600",
              }}
              onClick={(event) => {
                if (!isLoadingSection) {
                  onOpenTopicModal(valueKey, event);
                }
              }}
            >
              Add a new topic
            </Typography>
          ) : (
            <></>
          )}
          {valueKey === "generatedDetailedInsights" ? (
            <Typography
              sx={{
                fontSize: "14px",
                textDecoration: isLoadingSection ? "none" : "underline",
                cursor: isLoadingSection ? "not-allowed" : "pointer",
                color: isLoadingSection ? "gray" : "primary.600",
              }}
              onClick={(event) => {
                if (!isLoadingSection) {
                  onOpenTopicModal(valueKey, event);
                }
              }}
            >
              Add a new topic
            </Typography>
          ) : (
            <></>
          )}
          <Typography
            sx={{
              fontSize: "14px",
              textDecoration: isLoadingSection ? "none" : "underline",
              cursor: isLoadingSection ? "not-allowed" : "pointer",
              color: isLoadingSection ? "gray" : "primary.600",
            }}
            onClick={(event) => {
              if (!isLoadingSection) {
                onOpenModal(valueKey, event);
              }
            }}
          >
            Regenerate
          </Typography>
        </Box>
      </Box>
      {valueKey !== "generatedActions" && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            backgroundColor: "#FDF8ED",
            width: "52%",
            p: 0.8,
            mb: 1,
            borderRadius: "10px",
          }}
        >
          <IconInfoCircle size={15} />
          <Typography sx={{ fontSize: "14px" }}>
            Please select the specific bullet point you'd like to use for quote
            generation.
          </Typography>
        </Box>
      )}
      {isLoadingSection ? (
        <Box sx={{ marginBottom: 4 }}>
          <Skeleton variant="text" width="100%" height={30} />
          <Skeleton variant="text" width="100%" height={80} />
          <Skeleton variant="text" width="100%" height={80} />
          <Skeleton variant="text" width="100%" height={80} />
        </Box>
      ) : (
        <div ref={(el) => (editorDivRefs.current[valueKey] = el)}>
          <ReactQuill
            ref={(el) => (editorRefs.current[valueKey] = el)}
            value={value}
            onChange={onChange}
            modules={toolbarConfig()}
            style={{
              width: "100%",
              marginBottom: "30px",
              borderRadius: "8px",
              minHeight: "40px",
            }}
          />
        </div>
      )}
    </>
  );
};
