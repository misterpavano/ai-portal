import { meetingNextStepsPrompt } from "../prompts/meetingNotes/meetingNextSteps";
import { meetingOverviewPrompt } from "../prompts/meetingNotes/meetingOverview";
import {
  meetingSummaryByIndividual,
  meetingSummaryByProject,
} from "../prompts/meetingNotes/meetingSummary";
import { structureIndividual } from "../prompts/meetingNotes/structureIndividual";
import { structureProject } from "../prompts/meetingNotes/structureProject";
import {
  ActionItemsNextStepFormValues,
  GenerateActionItemsNextStepByIndividualPromptParams,
  GenerateActionItemsNextStepPromptParams,
  GenerateMeetingOverivewPromptParams,
  GenerateMeetingSummariesIndividualsPromptParams,
  GenerateMeetingSummariesKeyTakeawaysPromptParams,
  GenerateMeetingSummariesPromptParams,
  MeetingNotesFlow,
  MeetingOverviewFormValues,
  MeetingSummariesFormValues,
} from "../types/meetingNotesTypes";

export const generateMeetingSummariesPrompt = ({
  values,
}: GenerateMeetingSummariesPromptParams): string => {
  const {
    objectives,
    additionalNotes,
    meetingProjects,
    meetingSummaries,
    file,
  } = values;

  const generateSectionContent = (
    meetingSummaries: MeetingSummariesFormValues,
    meetingProjects: {
      projects: string;
      additionalNote?: string;
      sections: {
        projects: string;
      }[];
    }
  ): string => {
    const additionalNoteContent = meetingSummaries.additionalNotes ?? "";

    const projectContent = meetingProjects.sections
      .map(
        (sec) => `
          <h3>${sec.projects}</h3>
          <ul>[content]</ul>
          <br/>`
      )
      .join("");

    return `${additionalNoteContent} ${projectContent}`;
  };

  const additionalNoteRequirement = additionalNotes
    ? `- **Special Instructions**: Consider this additional note: "${additionalNotes}".`
    : "";

  const projectsList = meetingProjects.sections
    .map((sec) => sec.projects)
    .join(", ");

  const prompt = meetingSummaryByProject;
  const topics = `Focus ONLY on these projects: ${projectsList}`;
  const structure = structureProject;

  const promptTemplate = `
    ${prompt} ${topics} ${structure} 

    FORMAT RESPONSE IN PLAIN JSON WITHOUT MARKUPS:
    {
      "meetingSummaries": "${generateSectionContent(
        meetingSummaries,
        meetingProjects
      ).replace(/\n\s+/g, " ")}"
    }

    ${additionalNoteRequirement}

    CRUICAL REQUIREMENTS:
    Provide only HTML content, no additional text or line breaks.
    Provide bullet points as much as you can for task descriptions.
    In each bullet make sure to summarize any keypoints.
    Use only <li> lists for bullet points; do not use any bold text. Present all bulletpoints as plain <li> elements without any <b> or <strong> tags.
    Reword and summarize the content to focus on clear, concise key points, avoiding repetition of raw notes.
    Highlight actionable steps, status updates, and follow-up tasks, ensuring the summaries are action-oriented and easy to follow.
    Use status indicators: Label tasks as STATUS: [COMPLETED], [IN PROGRESS], or [ON HOLD] as appropriate.
    In each bullet, note any significant decisions or outcomes that will impact their future work.
    Include relevant dates in each bullet only if they are explicitly mentioned in the content and directly tied to the action or outcome. Format these dates as DATE MM/DD. If no relevant dates are provided in the content for a bullet point, omit dates entirely. Do not create or assume dates that are not explicitly stated.
    When grouping by project, use the actual project names as h3 headings, not individual names.
    Each project should be its own section with tasks listed underneath.
    IMPORTANT: If a name followed by "Projects" (e.g., "Caroline Projects", "CHRISTINA PROJECTS") appears, do not include this as an h3 heading. These are not actual projects and should be ignored when creating h3 headings.
    DO NOT INCLUDE ANY SOURCE REFERENCES: Do not include any source indicators, footnotes, or references like "[4: 17+source]" or any similar format. Present all information as if it's coming directly from the summarized content without citing specific sources or page numbers.

    CONTENT: ${
      objectives
        ? `${objectives}`
        : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${file.fileName}(FILE ID: ${file.fileId})`
    }
    `;

  return promptTemplate.trim();
};

export const generateMeetingSummariesIndividualPrompt = ({
  values,
}: GenerateMeetingSummariesIndividualsPromptParams): string => {
  const {
    objectives,
    additionalNotes,
    meetingIndividuals,
    meetingSummaries,
    file,
  } = values;

  const generateSectionContent = (
    meetingSummaries: MeetingSummariesFormValues,
    meetingIndividuals: {
      projects: string;
      assignedIndividuals?: string[];
      sections: {
        projects: string;
        assignedIndividuals?: string[];
      }[];
    }
  ): string => {
    const additionalNoteContent = meetingSummaries.additionalNotes ?? "";

    const projectContent = meetingIndividuals.sections
      .map((sec) => {
        const individualContent =
          sec.assignedIndividuals && sec.assignedIndividuals.length > 0
            ? sec.assignedIndividuals
                .map(
                  (individual) => `
                    <h4>${individual}</h4>
                    <ul>[content]</ul> (CONTENT BASED ON ${individual})
                  `
                )
                .join("")
            : "";

        return `
          <h3>${sec.projects}</h3>
          ${individualContent}
          <br/>
        `;
      })
      .join("");

    return `${additionalNoteContent} ${projectContent}`;
  };

  const additionalNoteRequirement = additionalNotes
    ? `- **Special Instructions**: Consider this additional note: "${additionalNotes}".`
    : "";

  const projectsList = meetingIndividuals.sections
    .map((sec) => sec.projects)
    .join(", ");

  const prompt = meetingSummaryByIndividual;
  const topics = `Focus ONLY on these projects: ${projectsList}`;
  const structure = structureIndividual;

  const promptTemplate = `
    ${prompt} ${topics} ${structure} 

    FORMAT RESPONSE IN PLAIN JSON WITHOUT MARKUPS:
    {
      "meetingSummaries": "${generateSectionContent(
        meetingSummaries,
        meetingIndividuals
      ).replace(/\n\s+/g, " ")}"
    }

    ${additionalNoteRequirement}

    CRUICAL REQUIREMENTS:
    Provide only HTML content, no additional text or line breaks.
    Provide bullet points as much as you can for task descriptions.
    In each bullet make sure to summarize any keypoints.
    Use only <li> lists for bullet points; do not use any bold text. Present all bulletpoints as plain <li> elements without any <b> or <strong> tags.
    Reword and summarize the content to focus on clear, concise key points, avoiding repetition of raw notes.
    Highlight actionable steps, status updates, and follow-up tasks, ensuring the summaries are action-oriented and easy to follow.
    Use status indicators: Label tasks as STATUS: [COMPLETED], [IN PROGRESS], or [ON HOLD] as appropriate.
    In each bullet, note any significant decisions or outcomes that will impact their future work.
    Include relevant dates in each bullet only if they are explicitly mentioned in the content and directly tied to the action or outcome. Format these dates as DATE MM/DD. If no relevant dates are provided in the content for a bullet point, omit dates entirely. Do not create or assume dates that are not explicitly stated.
    When grouping by project, use the actual project names as h3 headings, not individual names.
    Each project should be its own section with tasks listed underneath.
    IMPORTANT: If a name followed by "Projects" (e.g., "Caroline Projects", "CHRISTINA PROJECTS") appears, do not include this as an h3 heading. These are not actual projects and should be ignored when creating h3 headings.
    DO NOT INCLUDE ANY SOURCE REFERENCES: Do not include any source indicators, footnotes, or references like "[4: 17+source]" or any similar format. Present all information as if it's coming directly from the summarized content without citing specific sources or page numbers.

    CONTENT: ${
      objectives
        ? `${objectives}`
        : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${file.fileName}(FILE ID: ${file.fileId})`
    }
    `;

  return promptTemplate.trim();
};

export const generateMeetingOverviewPrompt = ({
  values,
}: GenerateMeetingOverivewPromptParams): string => {
  const {
    objectives,
    additionalNotes,
    meetingOverview,
    file,
    meetingProjects,
  } = values;

  const generateSectionContent = (
    meetingOverview: MeetingOverviewFormValues,
    meetingProjects: {
      projects: string;
      additionalNote?: string;
      sections: {
        projects: string;
      }[];
    }
  ): string => {
    const additionalNoteContent = meetingOverview.additionalNotes ?? "";

    const projectContent = meetingProjects.sections
      .map(
        (sec) => `
          <h3>${sec.projects}</h3>
          <ul>[Overview]<ul>`
      )
      .join("");

    return `${additionalNoteContent} ${projectContent}`;
  };

  const additionalNoteRequirement = additionalNotes
    ? `- **Special Instructions**: Consider this additional note: "${additionalNotes}".`
    : "";

  const projectsList = meetingProjects.sections
    .map((sec) => sec.projects)
    .join(", ");

  const prompt = meetingOverviewPrompt;
  const topics = `Focus ONLY on these projects: ${projectsList}`;

  const promptTemplate = `${prompt} ${topics}

  
    FORMAT RESPONSE IN PLAIN JSON WITHOUT MARKUPS:
    {
      "meetingOverview": "${generateSectionContent(
        meetingOverview,
        meetingProjects
      ).replace(/\n\s+/g, " ")}"
    }
    
    ${additionalNoteRequirement}
  
    CRUICAL REQUIREMENTS:
    Provide only HTML content, no additional text or line breaks.
    When grouping by project, use the actual project names as h3 headings, not individual names.
    Use only <li> lists for bullet points; do not use any bold text. Present all bulletpoints as plain <li> elements without any <b> or <strong> tags.
    Only use one <li> for each project as an detailed overview, do not exceed the limit of one bullet per project
    IMPORTANT: If a name followed by "Projects" (e.g., "Caroline Projects", "CHRISTINA PROJECTS") appears, do not include this as an h3 heading. These are not actual projects and should be ignored when creating h3 headings.
    DO NOT INCLUDE ANY SOURCE REFERENCES: Do not include any source indicators, footnotes, or references like "[4: 17+source]" or any similar format. Present all information as if it's coming directly from the summarized content without citing specific sources or page numbers.
  
    CONTENT: ${
      objectives
        ? `${objectives}`
        : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${file.fileName}(FILE ID: ${file.fileId})`
    }
    `;

  return promptTemplate.trim();
};

export const generateActionItemsNextStepPrompt = ({
  values,
}: GenerateActionItemsNextStepPromptParams): string => {
  const {
    objectives,
    meetingProjects,
    additionalNotes,
    actionItemsNextStep,
    file,
  } = values;

  const generateSectionContent = (
    actionItemsNextStep: ActionItemsNextStepFormValues,
    meetingProjects: {
      projects: string;
      additionalNote?: string;
      sections: {
        projects: string;
      }[];
    }
  ): string => {
    const additionalNoteContent = actionItemsNextStep.additionalNotes ?? "";

    const projectContent = meetingProjects.sections
      .map(
        (sec) => `
          <h3>${sec.projects}</h3>
          <ul>[content]</ul>
          <br/>`
      )
      .join("");

    return `${additionalNoteContent} ${projectContent}`;
  };

  const additionalNoteRequirement = additionalNotes
    ? `- **Special Instructions**: Consider this additional note: "${additionalNotes}".`
    : "";

  const projectsList = meetingProjects.sections
    .map((sec) => sec.projects)
    .join(", ");

  const prompt = meetingNextStepsPrompt;
  const topics = `Focus ONLY on these projects: ${projectsList}`;
  const structure = structureProject;

  const promptTemplate = `
  ${prompt} ${topics} ${structure} 

    FORMAT RESPONSE IN PLAIN JSON WITHOUT MARKUPS:
    {
      "actionItemsNextStep": "${generateSectionContent(
        actionItemsNextStep,
        meetingProjects
      ).replace(/\n\s+/g, " ")}"
    }

    ${additionalNoteRequirement}

    CRUICAL REQUIREMENTS:
    Provide only HTML content, no additional text or line breaks.
    Provide bullet points as much as you can for a specific action item.
    Use only <li> lists for bullet points; do not use any bold text. Present all bulletpoints as plain <li> elements without any <b> or <strong> tags.
    Reword and summarize the content to focus on clear, concise key points, avoiding repetition of raw notes.
    When grouping by project, use the actual project names as h3 headings, not individual names.
    Each project should be its own section with tasks listed underneath.
    IMPORTANT: If a name followed by "Projects" (e.g., "Caroline Projects", "CHRISTINA PROJECTS") appears, do not include this as an h3 heading. These are not actual projects and should be ignored when creating h3 headings.
    DO NOT INCLUDE ANY SOURCE REFERENCES: Do not include any source indicators, footnotes, or references like "[4: 17+source]" or any similar format. Present all information as if it's coming directly from the summarized content without citing specific sources or page numbers.

    CONTENT: ${
      objectives
        ? `${objectives}`
        : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${file.fileName}(FILE ID: ${file.fileId})`
    }
  `;

  return promptTemplate.trim();
};

export const generateActionItemsNextStepByIndividualPrompt = ({
  values,
}: GenerateActionItemsNextStepByIndividualPromptParams): string => {
  const {
    objectives,
    additionalNotes,
    meetingIndividuals,
    actionItemsNextStep,
    file,
  } = values;

  const generateSectionContent = (
    actionItemsNextStep: ActionItemsNextStepFormValues,
    meetingIndividuals: {
      projects: string;
      assignedIndividuals?: string[];
      sections: {
        projects: string;
        assignedIndividuals?: string[];
      }[];
    }
  ): string => {
    const additionalNoteContent = actionItemsNextStep.additionalNotes ?? "";

    const projectContent = meetingIndividuals.sections
      .map((sec) => {
        const individualContent =
          sec.assignedIndividuals && sec.assignedIndividuals.length > 0
            ? sec.assignedIndividuals
                .map(
                  (individual) => `
                    <h4>${individual}</h4>
                    <ul>[content]</ul> (CONTENT BASED ON ${individual})
                  `
                )
                .join("")
            : "";

        return `
          <h3>${sec.projects}</h3>
          ${individualContent}
          <br/>
        `;
      })
      .join("");

    return `${additionalNoteContent} ${projectContent}`;
  };

  const additionalNoteRequirement = additionalNotes
    ? `- **Special Instructions**: Consider this additional note: "${additionalNotes}".`
    : "";

  const projectsList = meetingIndividuals.sections
    .map((sec) => sec.projects)
    .join(", ");

  const prompt = meetingNextStepsPrompt;
  const topics = `Focus ONLY on these projects: ${projectsList}`;
  const structure = structureIndividual;

  const promptTemplate = `
  ${prompt} ${topics} ${structure} 


    FORMAT RESPONSE IN PLAIN JSON WITHOUT MARKUPS:
    {
      "actionItemsNextStep": "${generateSectionContent(
        actionItemsNextStep,
        meetingIndividuals
      ).replace(/\n\s+/g, " ")}"
    }

    ${additionalNoteRequirement}

    CRUICAL REQUIREMENTS:
    Provide only HTML content, no additional text or line breaks.
    Provide bullet points as much as you can for a specific action item.
    Use only <li> lists for bullet points; do not use any bold text. Present all bulletpoints as plain <li> elements without any <b> or <strong> tags.
    Reword and summarize the content to focus on clear, concise key points, avoiding repetition of raw notes.
    When grouping by project, use the actual project names as h3 headings, not individual names.
    Each project should be its own section with tasks listed underneath.
    IMPORTANT: If a name followed by "Projects" (e.g., "Caroline Projects", "CHRISTINA PROJECTS") appears, do not include this as an h3 heading. These are not actual projects and should be ignored when creating h3 headings.
    DO NOT INCLUDE ANY SOURCE REFERENCES: Do not include any source indicators, footnotes, or references like "[4: 17+source]" or any similar format. Present all information as if it's coming directly from the summarized content without citing specific sources or page numbers.

    CONTENT: ${
      objectives
        ? `${objectives}`
        : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${file.fileName}(FILE ID: ${file.fileId})`
    }
  `;

  return promptTemplate.trim();
};

export const generateMeetingSummariesKeyTakeawaysPrompt = ({
  values,
}: GenerateMeetingSummariesKeyTakeawaysPromptParams): string => {
  const {
    objectives,
    additionalNotes,
    discussionTopics,
    meetingSummariesKeyTakeaways,
    file,
  } = values;

  const generateSectionContent = (
    keyTakeaways: MeetingOverviewFormValues,
    discussionTopics: {
      topics: string;
      maxWordCountPerTopic?: string;
      additionalNote?: string;
      sections: {
        topics: string;
        generatedAiQuestions?: string[];
      }[];
    }
  ): string => {
    const additionalNoteContent = keyTakeaways.additionalNotes ?? "";

    const topicsContent = discussionTopics.sections
      .map(
        (sec) => `
        <h3>${sec.topics}</h3>
        <ul>[content]</ul>
        <br/>`
      )
      .join("");

    return `${additionalNoteContent}${topicsContent}`;
  };

  const additionalNoteRequirement = additionalNotes
    ? `- **Special Instructions**: Consider this additional note: "${additionalNotes}".`
    : "";

  const topicsList = discussionTopics.sections
    .map((sec) => sec.topics)
    .join(", ");

  const prompt = `Generate Key Takeaways from the meeting notes. When developing the summary, use an informative and clinical writing style, maintaining a professional and authoritative, yet conversational tone. Structure takeaways as bullet points, each presenting distinct information. Focus ONLY on these topics: ${topicsList}`;

  const requirements = `CRUCIAL REQUIREMENTS:
  - Word Count: Each content must contain a minimum of 15 words and a recommended maximum of 75 words. Exceed this limit only if necessary to ensure clarity and full context.
  - Verification: Manually check each content to ensure compliance with word count parameters.
  - Content Depth: Provide comprehensive insights that cover each topic fully within the word count.
  - Scope: Each content bullet must encompass the entire topic in clear, active voice.
  - Use active voice only.
  - Mandatory Content Structure: Always include the <ul>[content]</ul> structure for each section. This structure is critical and must be present for every topic, regardless of whether a topic title is provided, even if no topics are provided, we should generate the output in bullets.
  - Avoid source references, footnotes, or citations. Present content as direct findings without external attribution.`;

  const promptTemplate = `${prompt}

  
    FORMAT RESPONSE IN PLAIN JSON WITHOUT MARKUPS:
    {
      "meetingSummariesKeyTakeaways": "${generateSectionContent(
        meetingSummariesKeyTakeaways,
        discussionTopics
      ).replace(/\n\s+/g, " ")}"
    }
    
    ${requirements}
    ${additionalNoteRequirement}
  
    NOTE: Provide only HTML content, no additional text or line breaks.
  
    CONTENT: ${
      objectives
        ? `${objectives}`
        : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${file.fileName}(FILE ID: ${file.fileId})`
    }
    `;

  return promptTemplate.trim();
};

export const meetingNotesDiscussionPrompt = (values: MeetingNotesFlow) => {
  const basePrompt = `Create a JSON array that adheres to the following structure. The JSON should include discussion topics based on the provided content. Use patterns of concise, clear, and context-specific content, maintaining a neutral and professional tone. Ensure the sections are tailored to the context of the topic.

The structure should ALWAYS look like this, never change it, and don't add any additional text in response, only the JSON object:

{
  "discussionTopics": {
    "sections": [
      {
        "topics": "",
      },
      {
        "topics": "",
      },
      {
        "topics": "",
      }...
    ]
  }
}

Ensure that each topic entry contains only one distinct topic. Avoid combining multiple ideas within a single topic. Each topic should be relevant, concise, and clear, typically ranging up to 8 words. Maintain a neutral and professional tone, using clear and specific language to ensure respondents understand the information being discussed. Tailor the topics to specific contexts using placeholders and focus on the specific aspects of the topic, ensuring relevance and clarity.

Please generate as many unique topics as you see fit for this interview. Prioritize 4. These topics should represent categories of the entire conversation.

CONTENT: ${
    values.objectives
      ? values.objectives
      : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${values.file.fileName}(FILE ID: ${values.file.fileId})`
  }`;

  return basePrompt;
};

export const meetingNotesProjectPrompt = (values: MeetingNotesFlow) => {
  const basePrompt = `Create a JSON array that adheres to the following structure. The JSON should include meeting notes projects based on the provided content. Use patterns of concise, clear, and context-specific content, maintaining a neutral and professional tone. Ensure the sections are tailored to the context of the project.

The structure should ALWAYS look like this, never change it, and don't add any additional text in response, only the JSON object:

{
  "meetingProjects": {
    "sections": [
      {
        "projects": "",
      },
      {
        "projects": "",
      },
      {
        "projects": "",
      }...
    ]
  }
}

Ensure that each project entry contains only one distinct project. Avoid combining multiple ideas within a single project. Each project should be relevant, concise, and clear, typically ranging up to 8 words. Maintain a neutral and professional tone, using clear and specific language to ensure respondents understand the information being discussed. Tailor the projects to specific contexts using placeholders and focus on the specific aspects of the project, ensuring relevance and clarity.

Please generate as many unique projects as you see fit for this interview. Prioritize 4. These projects should represent categories of the entire conversation. DO NOT INCLUDE ANY SOURCE REFERENCES: Do not include any source indicators, footnotes, or references like "[4: 17+source]" or any similar format. Present all information as if it's coming directly from the summarized content without citing specific sources or page numbers.

CONTENT: ${
    values.objectives
      ? values.objectives
      : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${values.file.fileName}(FILE ID: ${values.file.fileId})`
  }`;

  return basePrompt;
};

export const meetingNotesIndividualPrompt = (values: MeetingNotesFlow) => {
  const basePrompt = `Create a JSON array that adheres to the following structure. The JSON should include meeting notes projects based on the provided content. Use patterns of concise, clear, and context-specific content, maintaining a neutral and professional tone. Ensure the sections are tailored to the context of the project.

The structure should ALWAYS look like this, never change it, and don't add any additional text in response, only the JSON object:

{
  "meetingIndividuals": {
    "sections": [
      {
        "projects": "",
        "assignedIndividuals": []
      },
      {
        "projects": "",
        "assignedIndividuals": []
      },
      {
        "projects": "",
        "assignedIndividuals": []
      }...
    ]
  }
}

Each projects entry should represent one distinct project. Avoiding combining multiple ideas within a single project. Each project should be relevant, concise, and clear, typically ranging up to 8 words. Maintain a neutral and professional tone, using clear and specific language to ensure respondents understand the information being discussed.

The assignedIndividuals array should only contain strings of individual names, extracted directly from the provided content. Use the exact names as they appear in the content; do not create or make up random names. For example: ["Individual 1", "Individual 2"...].

Ensure the assignedIndividuals entries are contextually relevant to the specific project they are assigned to. Each project assignedIndividuals should be unique and must not include individuals from other projects. Avoid cross-referencing or including unrelated names in the wrong context.

CONTENT: ${
    values.objectives
      ? values.objectives
      : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${values.file.fileName}(FILE ID: ${values.file.fileId})`
  }

Please generate as many unique projects as you see fit for this interview. Prioritize 4. These projects should represent categories of the entire conversation. DO NOT INCLUDE ANY SOURCE REFERENCES: Do not include any source indicators, footnotes, or references like "[4: 17+source]" or any similar format. Present all information as if it's coming directly from the summarized content without citing specific sources or page numbers.`;

  return basePrompt;
};
