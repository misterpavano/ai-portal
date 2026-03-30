import {
  IconPencil,
  IconWand,
  IconDownload,
  IconCopy,
} from "@tabler/icons-react";
import { HelpPage, Section, Step, Feature, Tip } from "../../../../components/help/HelpLayout";

const BlogGeneratorHelp = () => (
  <HelpPage
    title="Blog Generator"
    description="Create polished blog posts from a topic or outline. The AI drafts content matching your tone and audience, ready to refine and publish."
  >
    <Section title="How It Works">
      <Step number={1} title="Describe Your Topic">
        Enter a topic, key points, or a rough outline. The more context you
        provide, the more targeted the output.
      </Step>
      <Step number={2} title="Generate Draft">
        The AI produces a structured blog post with an introduction, body
        sections, and conclusion. Generation takes a few seconds.
      </Step>
      <Step number={3} title="Review & Export">
        Read through the draft, make any edits, then copy or download the
        finished post.
      </Step>
    </Section>

    <Section title="Features">
      <Feature
        icon={IconPencil}
        title="Topic-Driven Generation"
        description="Provide a topic or brief and the AI builds a complete post around it, including headings and structure."
      />
      <Feature
        icon={IconWand}
        title="Regenerate"
        description="Not happy with the first draft? Regenerate for a fresh take using the same inputs."
      />
      <Feature
        icon={IconCopy}
        title="Copy to Clipboard"
        description="One click to copy the full post for pasting into your CMS or editor."
      />
      <Feature
        icon={IconDownload}
        title="Download as Word"
        description="Export the post as a formatted Word document for sharing or archiving."
      />
    </Section>

    <Tip>
      Include your target audience and desired tone in the topic description
      for more relevant output. "Technical deep-dive for developers" gives
      very different results than "casual explainer for beginners."
    </Tip>
  </HelpPage>
);

export default BlogGeneratorHelp;
