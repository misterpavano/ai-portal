import {
  IconStethoscope,
  IconMoodSmile,
  IconTarget,
  IconDownload,
  IconWand,
  IconAdjustments,
} from "@tabler/icons-react";
import { HelpPage, Section, Step, Feature, Tip } from "../../../../components/help/HelpLayout";

const DoctorDiscussionGuideHelp = () => (
  <HelpPage
    title="Doctor Discussion Guide"
    description="Generate personalized questions to discuss medications with your healthcare provider. Tailor the questions to your familiarity level, focus areas, and preferred tone."
  >
    <Section title="How It Works">
      <Step number={1} title="Enter the Medication">
        Type the name of the drug you want to discuss. The AI uses this to
        generate clinically relevant questions.
      </Step>
      <Step number={2} title="Set Your Parameters">
        Choose the number of questions, your familiarity level (None, Somewhat,
        Advanced), focus areas, and preferred tone.
      </Step>
      <Step number={3} title="Generate & Review">
        The AI produces a tailored question set. Review, regenerate for
        alternatives, or download as a Word document.
      </Step>
    </Section>

    <Section title="Focus Areas">
      <Feature
        icon={IconStethoscope}
        title="General & Mechanism of Action"
        description="Foundational questions about the drug and how it works at a biological level."
      />
      <Feature
        icon={IconTarget}
        title="Side Effects & Dosage"
        description="Questions about adverse reactions, severity, proper dosage, and timing."
      />
      <Feature
        icon={IconAdjustments}
        title="Interactions & Clinical Efficacy"
        description="How the drug interacts with other medications, food, or conditions, plus success rates from clinical trials."
      />
    </Section>

    <Section title="Tone Options">
      <Feature
        icon={IconMoodSmile}
        title="Curious / Warm / Wary / Assured / Formal"
        description="Select a tone that matches how you want to come across. Curious for exploring, Wary for concerns, Formal for technical detail."
      />
      <Feature
        icon={IconWand}
        title="Regenerate"
        description="Get a fresh set of questions with the same parameters for different phrasing."
      />
      <Feature
        icon={IconDownload}
        title="Export as Word"
        description="Download your questions as a formatted document to bring to your appointment."
      />
    </Section>

    <Tip>
      Setting your familiarity to "Advanced" skips the basics and generates
      deeper clinical questions. Use "None" if you're learning about the
      medication for the first time.
    </Tip>
  </HelpPage>
);

export default DoctorDiscussionGuideHelp;
