import {
  IconAbc,
  IconTextGrammar,
  IconBook2,
  IconPalette,
  IconAccessible,
  IconSeo,
  IconFileTypePdf,
  IconFileZip,
  IconFileTypeDocx,
  IconUpload,
  IconNotes,
  IconDownload,
} from "@tabler/icons-react";
import { HelpPage, Section, Step, Feature, Tip } from "../../../../components/help/HelpLayout";

const RouteValidatorHelp = () => (
  <HelpPage
    title="Route Validator"
    description="AI-powered document review that checks spelling, grammar, brand compliance, accessibility, and more. Upload your route, select what to check, and get annotated results in minutes."
  >
    <Section title="How It Works">
      <Step number={1} title="Upload Your Document">
        Choose a format (PDF, ZIP of screenshots, or Word) and upload the
        document you want reviewed. If you have an annotated version from a
        previous review round, upload that first so the AI has context on prior
        feedback.
      </Step>
      <Step number={2} title="Select Tasks & Direction">
        Pick one or more automated checks from the task list, or provide custom
        notes describing what to focus on. You can use both together for maximum
        coverage.
      </Step>
      <Step number={3} title="Review Output">
        The AI analyzes your document page-by-page and generates annotated
        results. Review findings inline, filter by issue type, and download the
        annotated document when ready.
      </Step>
    </Section>

    <Section title="Supported Document Types">
      <Feature
        icon={IconFileTypePdf}
        title="PDF"
        description="Standard route documents. Pages are rendered individually for annotation."
      />
      <Feature
        icon={IconFileZip}
        title="ZIP (Screenshots)"
        description="A ZIP file containing screenshots of each page. Images are extracted and sorted automatically."
      />
      <Feature
        icon={IconFileTypeDocx}
        title="Word (.doc / .docx)"
        description="Microsoft Word documents. Comments and tracked changes from previous rounds are preserved."
      />
    </Section>

    <Section title="Available Tasks">
      <Feature
        icon={IconAbc}
        title="Spell Check"
        description="Flags misspelled words, including medical and scientific terminology."
      />
      <Feature
        icon={IconTextGrammar}
        title="Grammar Consistency"
        description="Checks sentence structure, tense consistency, subject-verb agreement, and punctuation."
      />
      <Feature
        icon={IconBook2}
        title="AMA Guidelines"
        description="Validates against American Medical Association editorial standards for medical writing."
      />
      <Feature
        icon={IconPalette}
        title="Client Brand Guideline"
        description="Checks compliance with a selected client's brand standards including terminology, tone, and formatting rules."
      />
      <Feature
        icon={IconAccessible}
        title="WCAG Compliance"
        description="Verifies web accessibility standards including color contrast, alt text requirements, and reading order."
      />
      <Feature
        icon={IconSeo}
        title="SEO Checks"
        description="Analyzes search optimization factors like heading structure, keyword usage, and meta content."
      />
    </Section>

    <Section title="Direction Options">
      <Feature
        icon={IconUpload}
        title="Annotated File from Previous Round"
        description="Upload a previously reviewed document so the AI can reference prior feedback and check if issues were addressed."
      />
      <Feature
        icon={IconNotes}
        title="Additional Notes"
        description="Free-form instructions for the AI. Use this to focus on specific sections, call out known issues, or request custom checks not covered by the task list."
      />
    </Section>

    <Section title="Output">
      <Feature
        icon={IconDownload}
        title="Annotated Results"
        description="Review findings page-by-page with issue type, location, reasoning, and recommendation for each annotation. Download as Word or PDF when ready."
      />
    </Section>

    <Tip>
      For best results, combine automated tasks with specific direction notes.
      The AI performs better when it knows what you care about most.
    </Tip>
  </HelpPage>
);

export default RouteValidatorHelp;
