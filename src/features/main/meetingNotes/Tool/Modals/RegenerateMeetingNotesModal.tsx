import { useState } from "react";
import { Box, Popover, Typography } from "@mui/material";
import { IconXboxXFilled } from "@tabler/icons-react";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import TextArea from "../../../../../components/layouts/TextArea";
import { MeetingNotesSectionKey } from "../../../../../types/meetingNotesTypes";

interface RegenerateModalProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  sectionKey: MeetingNotesSectionKey | null;
  onRegenerate: (note: string) => void;
}

const RegenerateMeetingNotesModal: React.FC<RegenerateModalProps> = ({
  open,
  onClose,
  anchorEl,
  sectionKey,
  onRegenerate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<Record<MeetingNotesSectionKey, string>>(
    {} as Record<MeetingNotesSectionKey, string>
  );

  const handleRegenerate = () => {
    if (!sectionKey) return;

    setIsLoading(true);
    onRegenerate(notes[sectionKey] || "");
    setIsLoading(false);
    onClose();
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!sectionKey) return;

    setNotes((prevNotes) => ({
      ...prevNotes,
      [sectionKey]: e.target.value,
    }));
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            boxShadow: "none",
            border: "1px solid #D6D3D1",
          },
        },
      }}
    >
      <Box
        sx={{
          marginTop: 1,
          pb: 2,
          pr: 2,
          pl: 2,
          pt: 4,
          backgroundColor: "white",
          borderRadius: 2,
          maxWidth: 500,
          position: "relative",
        }}
      >
        <Box sx={{ marginBottom: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              position: "absolute",
              top: 5,
              left: 8,
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Regenerate Content
          </Typography>

          <IconXboxXFilled
            onClick={onClose}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 30,
              height: 18,
              borderRadius: "50%",
              cursor: "pointer",
            }}
            size={15}
          />
        </Box>
        <TextArea
          name="additionalNote"
          topText="Provide additional notes or direction to regenerate the content within this section."
          styles={{ width: "90%" }}
          value={sectionKey ? notes[sectionKey] || "" : ""}
          onChange={handleNoteChange}
          placeholder="Enter additional note here..."
          isLongText
        />
        <Box mt={2} display="flex" justifyContent="flex-start">
          <DefaultButton
            style={{
              borderRadius: "15px",
              height: 40,
            }}
            textStyle={{ fontSize: "12px" }}
            title={isLoading ? "Regenerating..." : "Regenerate"}
            type="primary"
            onClick={handleRegenerate}
            disabled={isLoading}
          />
        </Box>
      </Box>
    </Popover>
  );
};

export default RegenerateMeetingNotesModal;
