import {
  IconMicrophone,
  IconClock,
  IconUserScan,
  IconFileMusic,
  IconDownload,
  IconWand,
} from "@tabler/icons-react";
import { HelpPage, Section, Step, Feature, Tip } from "../../../../components/help/HelpLayout";

const AudioToTextHelp = () => (
  <HelpPage
    title="Audio to Text"
    description="Upload audio or video files and get a structured transcript with optional timestamps, speaker identification, and AI-generated summaries."
  >
    <Section title="How It Works">
      <Step number={1} title="Upload Your Audio File">
        Drag and drop or browse for an audio or video file. Select any
        additional options you want included in the transcript.
      </Step>
      <Step number={2} title="Confirm & Transcribe">
        Review your file and selected options on the confirmation screen, then
        start the transcription. Processing time depends on file length.
      </Step>
      <Step number={3} title="Review & Download">
        Preview the full transcript with any options applied. Edit speaker names
        if needed, then download as a Word document.
      </Step>
    </Section>

    <Section title="Supported File Types">
      <Feature
        icon={IconFileMusic}
        title="Audio Files"
        description="MP3, WAV, M4A, AAC, OGG, FLAC, and other standard audio formats."
      />
      <Feature
        icon={IconFileMusic}
        title="Video Files"
        description="MP4, MOV, MPEG, and WebM. The audio track is extracted automatically."
      />
    </Section>

    <Section title="Transcription Options">
      <Feature
        icon={IconMicrophone}
        title="Audio Summary"
        description="Generates a concise AI summary of the audio content. Useful for meeting recordings, interviews, and lectures. The summary captures main topics, key points, and conclusions."
      />
      <Feature
        icon={IconClock}
        title="Timestamps"
        description="Adds time markers throughout the transcript so you can locate specific moments in the original recording. Timestamps appear at natural breaks in speech."
      />
      <Feature
        icon={IconUserScan}
        title="Speaker Identification (Beta)"
        description="Detects and labels different speakers in the audio. After transcription, you can rename speakers (e.g., change 'Speaker 1' to 'Dr. Smith') in the preview before downloading."
      />
    </Section>

    <Section title="Output">
      <Feature
        icon={IconDownload}
        title="Download as Word"
        description="Exports the full transcript as a formatted Microsoft Word document, including any timestamps, speaker labels, and summary you selected."
      />
      <Feature
        icon={IconWand}
        title="Editable Preview"
        description="The preview screen lets you edit speaker names and review the transcript before downloading. Your edits are included in the exported document."
      />
    </Section>

    <Tip>
      For best speaker identification results, use recordings where speakers
      take turns clearly. Overlapping speech may reduce accuracy. Recordings
      under 90 minutes process most reliably.
    </Tip>
  </HelpPage>
);

export default AudioToTextHelp;
