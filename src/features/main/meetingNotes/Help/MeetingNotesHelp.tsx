import {
  IconNotes,
  IconListCheck,
  IconDownload,
  IconWand,
} from "@tabler/icons-react";
import { HelpPage, Section, Step, Feature, Tip } from "../../../../components/help/HelpLayout";

const MeetingNotesHelp = () => (
  <HelpPage
    title="Meeting Notes"
    description="Transform raw meeting recordings or notes into structured, actionable documents. Select a meeting type, paste your content, and let AI organize it."
  >
    <Section title="How It Works">
      <Step number={1} title="Select Meeting Type">
        Choose the type of meeting (project sync, 1-on-1, standup, etc.) so the
        AI tailors the output structure accordingly.
      </Step>
      <Step number={2} title="Provide Your Notes">
        Paste meeting notes, upload a transcript, or enter key points. The more
        detail you provide, the richer the output.
      </Step>
      <Step number={3} title="Build Structure">
        Drag and drop components to define what goes in the final document:
        summary, action items, decisions, follow-ups.
      </Step>
      <Step number={4} title="Generate & Download">
        Review the AI-generated document, make edits if needed, then export as
        Word.
      </Step>
    </Section>

    <Section title="Features">
      <Feature
        icon={IconNotes}
        title="Structured Output"
        description="Automatically organizes content into sections like summary, key decisions, action items, and next steps."
      />
      <Feature
        icon={IconListCheck}
        title="Drag-and-Drop Components"
        description="Choose and arrange the sections you want. Skip what you don't need."
      />
      <Feature
        icon={IconWand}
        title="Regenerate"
        description="Get a fresh version of the document with the same inputs if the first pass doesn't land."
      />
      <Feature
        icon={IconDownload}
        title="Export as Word"
        description="Download the finished document as a formatted .docx file."
      />
    </Section>

    <Tip>
      Raw transcripts work well, but adding a few bullet points about what
      mattered most helps the AI prioritize the right topics in the output.
    </Tip>
  </HelpPage>
);

export default MeetingNotesHelp;
