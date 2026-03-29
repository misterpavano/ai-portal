import { Box, Typography } from "@mui/material";
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
  icon: typeof IconAbc;
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

const RouteValidatorHelp = () => {
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
        Route Validator
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#78716C", mb: 4, lineHeight: 1.5 }}>
        AI-powered document review that checks spelling, grammar, brand
        compliance, accessibility, and more. Upload your route, select what to
        check, and get annotated results in minutes.
      </Typography>

      <Section title="How It Works">
        <StepBlock number={1} title="Upload Your Document">
          Choose a format (PDF, ZIP of screenshots, or Word) and upload the
          document you want reviewed. If you have an annotated version from a
          previous review round, upload that first so the AI has context on
          prior feedback.
        </StepBlock>
        <StepBlock number={2} title="Select Tasks & Direction">
          Pick one or more automated checks from the task list, or provide
          custom notes describing what to focus on. You can use both together
          for maximum coverage.
        </StepBlock>
        <StepBlock number={3} title="Review Output">
          The AI analyzes your document page-by-page and generates annotated
          results. Review findings inline, filter by issue type, and download
          the annotated document when ready.
        </StepBlock>
      </Section>

      <Section title="Supported Document Types">
        <IconRow
          icon={IconFileTypePdf}
          title="PDF"
          description="Standard route documents. Pages are rendered individually for annotation."
        />
        <IconRow
          icon={IconFileZip}
          title="ZIP (Screenshots)"
          description="A ZIP file containing screenshots of each page. Images are extracted and sorted automatically."
        />
        <IconRow
          icon={IconFileTypeDocx}
          title="Word (.doc / .docx)"
          description="Microsoft Word documents. Comments and tracked changes from previous rounds are preserved."
        />
      </Section>

      <Section title="Available Tasks">
        <IconRow
          icon={IconAbc}
          title="Spell Check"
          description="Flags misspelled words, including medical and scientific terminology."
        />
        <IconRow
          icon={IconTextGrammar}
          title="Grammar Consistency"
          description="Checks sentence structure, tense consistency, subject-verb agreement, and punctuation."
        />
        <IconRow
          icon={IconBook2}
          title="AMA Guidelines"
          description="Validates against American Medical Association editorial standards for medical writing."
        />
        <IconRow
          icon={IconPalette}
          title="Client Brand Guideline"
          description="Checks compliance with a selected client's brand standards including terminology, tone, and formatting rules."
        />
        <IconRow
          icon={IconAccessible}
          title="WCAG Compliance"
          description="Verifies web accessibility standards including color contrast, alt text requirements, and reading order."
        />
        <IconRow
          icon={IconSeo}
          title="SEO Checks"
          description="Analyzes search optimization factors like heading structure, keyword usage, and meta content."
        />
      </Section>

      <Section title="Direction Options">
        <IconRow
          icon={IconUpload}
          title="Annotated File from Previous Round"
          description="Upload a previously reviewed document so the AI can reference prior feedback and check if issues were addressed."
        />
        <IconRow
          icon={IconNotes}
          title="Additional Notes"
          description="Free-form instructions for the AI. Use this to focus on specific sections, call out known issues, or request custom checks not covered by the task list."
        />
      </Section>

      <Section title="Output">
        <IconRow
          icon={IconDownload}
          title="Annotated Results"
          description="Review findings page-by-page with issue type, location, reasoning, and recommendation for each annotation. Download as Word or PDF when ready."
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
          <strong>Tip:</strong> For best results, combine automated tasks with
          specific direction notes. The AI performs better when it knows what
          you care about most.
        </Typography>
      </Box>
    </Box>
  );
};

export default RouteValidatorHelp;
