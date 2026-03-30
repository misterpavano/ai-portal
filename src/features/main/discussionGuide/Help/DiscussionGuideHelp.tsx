import {
  IconMessages,
  IconLayoutList,
  IconDownload,
  IconWand,
  IconUpload,
} from "@tabler/icons-react";
import { HelpPage, Section, Step, Feature, Tip } from "../../../../components/help/HelpLayout";

const DiscussionGuideHelp = () => (
  <HelpPage
    title="Discussion Guide"
    description="Generate tailored discussion guides for focus groups, patient journeys, communication testing, and more. Define objectives, build a structure, and let AI draft the questions."
  >
    <Section title="How It Works">
      <Step number={1} title="Select Document Type">
        Choose the type of discussion guide you need: Focus Group, Patient
        Journey, Communication Testing, or others. Each type adapts the
        question style and structure.
      </Step>
      <Step number={2} title="Provide Direction">
        Enter your discussion objectives, including audience, caveats, tone, and
        length preferences. Optionally upload meeting notes or a transcript for
        additional context.
      </Step>
      <Step number={3} title="Build the Structure">
        Drag and drop guide components (Discussion Flow, Background &
        Introduction, Market Research Disclosures, Discussion Topics) and
        arrange them in your preferred order.
      </Step>
      <Step number={4} title="Review & Export">
        Review the AI-generated guide, make any adjustments, then download as a
        Word document.
      </Step>
    </Section>

    <Section title="Features">
      <Feature
        icon={IconMessages}
        title="Multiple Guide Types"
        description="Focus Groups, Patient Journeys, Communication Testing, and more. Each type produces questions optimized for that format."
      />
      <Feature
        icon={IconLayoutList}
        title="Drag-and-Drop Structure"
        description="Arrange guide sections in any order. Add or remove components to match your needs."
      />
      <Feature
        icon={IconUpload}
        title="File Upload"
        description="Upload meeting notes or transcripts to give the AI more context for generating relevant questions."
      />
      <Feature
        icon={IconWand}
        title="Regenerate"
        description="Generate a new set of questions with the same parameters for different phrasing or perspectives."
      />
      <Feature
        icon={IconDownload}
        title="Export as Word"
        description="Download the complete discussion guide as a formatted Word document."
      />
    </Section>

    <Tip>
      Be specific about your audience and objectives. "Oncologists evaluating
      a new treatment pathway" produces much better questions than "doctors
      discussing a drug."
    </Tip>
  </HelpPage>
);

export default DiscussionGuideHelp;
