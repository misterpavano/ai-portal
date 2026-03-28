import { useState } from "react";
import { Box, Popover, Typography } from "@mui/material";
import { IconXboxXFilled } from "@tabler/icons-react";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import TextArea from "../../../../../components/layouts/TextArea";

interface RegenerateModalProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  onRegenerate: (note?: string) => void;
  note: string;
  onNoteChange: (newNote: string) => void;
}

const RegenerateDiscussionTopicsModal: React.FC<RegenerateModalProps> = ({
  open,
  onClose,
  anchorEl,
  onRegenerate,
  note,
  onNoteChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRegenerateClick = () => {
    setIsLoading(true);
    onRegenerate(note);
    setIsLoading(false);
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
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0px 0px 14px 0px rgba(0, 0, 0, 0.25)",
          border: "1px solid #D6D3D1",
        },
      }}
    >
      <Box
        sx={{
          marginTop: 1,
          pb: 2,
          pr: "20px",
          pl: "20px",
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
          topText="Provide additional notes and direction"
          styles={{ width: 220, borderRadius: "5px" }}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Enter additional note here..."
        />
        <Box mt={2} display="flex" justifyContent="flex-start">
          <DefaultButton
            style={{
              borderRadius: "5px",
              height: "auto",
              padding: "5px 10px",
              lineHeight: "1em !important",
            }}
            textStyle={{ fontSize: "12px" }}
            title={isLoading ? "Regenerating..." : "Regenerate"}
            type="primary"
            onClick={handleRegenerateClick}
            disabled={isLoading}
          />
        </Box>
      </Box>
    </Popover>
  );
};

export default RegenerateDiscussionTopicsModal;
