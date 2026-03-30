import {
  IconPresentation,
  IconWand,
  IconDownload,
} from "@tabler/icons-react";
import { HelpPage, Section, Step, Feature, Tip } from "../../../../components/help/HelpLayout";

const PowerpointSlideGeneratorHelp = () => (
  <HelpPage
    title="PPTx Slide Generator"
    description="Create PowerPoint slides from a content description. Describe what you need, and the AI generates formatted slides ready for download and editing."
  >
    <Section title="How It Works">
      <Step number={1} title="Describe Your Content">
        Enter a description of what you want on the slides. Be specific about
        the information, data points, or messaging you need.
      </Step>
      <Step number={2} title="AI Processing">
        The AI curates and organizes your content into a presentation-ready
        format, structuring it across slides with appropriate headings and
        layout.
      </Step>
      <Step number={3} title="Download">
        The completed .pptx file is generated and available for download. Open
        it in PowerPoint or compatible software to review and refine.
      </Step>
    </Section>

    <Section title="Features">
      <Feature
        icon={IconPresentation}
        title="Template Integration"
        description="Content is placed into a branded PowerPoint template with consistent formatting and layout."
      />
      <Feature
        icon={IconWand}
        title="AI-Structured Content"
        description="The AI breaks your description into logical slide sections with headings, bullet points, and supporting text."
      />
      <Feature
        icon={IconDownload}
        title="Direct Download"
        description="Get a ready-to-use .pptx file. Edit further in PowerPoint, Google Slides, or Keynote."
      />
    </Section>

    <Tip>
      Structure your input like an outline for best results. "Slide 1: Company
      overview. Slide 2: Q3 revenue highlights. Slide 3: Product roadmap"
      gives the AI clear direction.
    </Tip>
  </HelpPage>
);

export default PowerpointSlideGeneratorHelp;
