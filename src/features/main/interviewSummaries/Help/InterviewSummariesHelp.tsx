import {
  IconFileText,
  IconLayoutList,
  IconDownload,
  IconWand,
  IconMessage,
} from "@tabler/icons-react";
import { HelpPage, Section, Step, Feature, Tip } from "../../../../components/help/HelpLayout";

const InterviewSummariesHelp = () => (
  <HelpPage
    title="Meeting Summaries"
    description="Generate structured summaries from interviews, advisory boards, and TLE discussions. Upload a transcript, choose your components, and get an organized output ready to share."
  >
    <Section title="How It Works">
      <Step number={1} title="Select Interview Type">
        Choose from 1-on-1 Interview, Advisory Board, or TLE Interview. Each
        type adapts the summary structure to that format.
      </Step>
      <Step number={2} title="Add Meeting Notes">
        Paste your meeting notes or upload a transcript. Optionally enable
        AI-generated discussion topics for automatic categorization.
      </Step>
      <Step number={3} title="Choose Components">
        Select which sections to include: Key Takeaways, Key Recommendations,
        Action Items, and Detailed Insights. Add or modify discussion topics.
      </Step>
      <Step number={4} title="Review & Export">
        Review the generated summary, make edits, then download as a Word
        document.
      </Step>
    </Section>

    <Section title="Components">
      <Feature
        icon={IconMessage}
        title="Key Takeaways"
        description="The most important points distilled from the discussion, organized by topic."
      />
      <Feature
        icon={IconLayoutList}
        title="Key Recommendations"
        description="Actionable recommendations derived from the interview content."
      />
      <Feature
        icon={IconFileText}
        title="Action Items & Detailed Insights"
        description="Specific next steps plus deeper analysis of the topics discussed."
      />
      <Feature
        icon={IconWand}
        title="Regenerate"
        description="Generate a new summary with the same inputs for a different perspective."
      />
      <Feature
        icon={IconDownload}
        title="Export as Word"
        description="Download the formatted summary document for distribution."
      />
    </Section>

    <Tip>
      Enable AI-generated discussion topics if you have a long transcript. The
      AI will identify themes automatically, saving you from manually
      categorizing everything.
    </Tip>
  </HelpPage>
);

export default InterviewSummariesHelp;
