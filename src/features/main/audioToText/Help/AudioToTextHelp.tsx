import { Box, Typography } from "@mui/material";
import {
  IconMicrophone,
  IconClock,
  IconUserScan,
  IconFileMusic,
  IconDownload,
  IconWand,
} from "@tabler/icons-react";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Box sx={{ mb: 4 }}>
    <Typography
      sx={{
        fontSize: 16,
        fontWeight: 700,
        color: "#1C1917",
        mb: 1.5,
        letterSpacing: "-0.01em",
      }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

const IconRow = ({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof IconMicrophone;
  title: string;
  description: string;
}) => (
  <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "8px",
        bgcolor: "#F5F5F4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        mt: "2px",
      }}
    >
      <Icon size={16} color="#78716C" strokeWidth={1.5} />
    </Box>
    <Box>
      <Typography
        sx={{ fontSize: 13, fontWeight: 600, color: "#1C1917", lineHeight: 1.4 }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#78716C", lineHeight: 1.5 }}>
        {description}
      </Typography>
    </Box>
  </Box>
);

const StepBlock = ({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) => (
  <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: "8px",
        bgcolor: "#1C1917",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
        mt: "2px",
      }}
    >
      {number}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 700,
          color: "#1C1917",
          mb: 0.75,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#78716C", lineHeight: 1.6 }}>
        {children}
      </Typography>
    </Box>
  </Box>
);

const AudioToTextHelp = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 720 }}>
      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 800,
          color: "#1C1917",
          mb: 0.5,
          letterSpacing: "-0.02em",
        }}
      >
        Audio to Text
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#78716C", mb: 4, lineHeight: 1.5 }}>
        Upload audio or video files and get a structured transcript with
        optional timestamps, speaker identification, and AI-generated summaries.
      </Typography>

      <Section title="How It Works">
        <StepBlock number={1} title="Upload Your Audio File">
          Drag and drop or browse for an audio or video file. Select any
          additional options you want included in the transcript.
        </StepBlock>
        <StepBlock number={2} title="Confirm & Transcribe">
          Review your file and selected options on the confirmation screen, then
          start the transcription. Processing time depends on file length.
        </StepBlock>
        <StepBlock number={3} title="Review & Download">
          Preview the full transcript with any options applied. Edit speaker
          names if needed, then download as a Word document.
        </StepBlock>
      </Section>

      <Section title="Supported File Types">
        <IconRow
          icon={IconFileMusic}
          title="Audio Files"
          description="MP3, WAV, M4A, AAC, OGG, FLAC, and other standard audio formats."
        />
        <IconRow
          icon={IconFileMusic}
          title="Video Files"
          description="MP4, MOV, MPEG, and WebM. The audio track is extracted automatically."
        />
      </Section>

      <Section title="Transcription Options">
        <IconRow
          icon={IconMicrophone}
          title="Audio Summary"
          description="Generates a concise AI summary of the audio content. Useful for meeting recordings, interviews, and lectures. The summary captures main topics, key points, and conclusions."
        />
        <IconRow
          icon={IconClock}
          title="Timestamps"
          description="Adds time markers throughout the transcript so you can locate specific moments in the original recording. Timestamps appear at natural breaks in speech."
        />
        <IconRow
          icon={IconUserScan}
          title="Speaker Identification (Beta)"
          description="Detects and labels different speakers in the audio. After transcription, you can rename speakers (e.g., change 'Speaker 1' to 'Dr. Smith') in the preview before downloading."
        />
      </Section>

      <Section title="Output">
        <IconRow
          icon={IconDownload}
          title="Download as Word"
          description="Exports the full transcript as a formatted Microsoft Word document, including any timestamps, speaker labels, and summary you selected."
        />
        <IconRow
          icon={IconWand}
          title="Editable Preview"
          description="The preview screen lets you edit speaker names and review the transcript before downloading. Your edits are included in the exported document."
        />
      </Section>

      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: "10px",
          bgcolor: "#FAFAF9",
          border: "1px solid #E7E5E4",
        }}
      >
        <Typography sx={{ fontSize: 12, color: "#A8A29E", lineHeight: 1.5 }}>
          <strong>Tip:</strong> For best speaker identification results, use
          recordings where speakers take turns clearly. Overlapping speech may
          reduce accuracy. Recordings under 90 minutes process most reliably.
        </Typography>
      </Box>
    </Box>
  );
};

export default AudioToTextHelp;
