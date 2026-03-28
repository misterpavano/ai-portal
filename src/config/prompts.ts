import { ChatCompletionMessageParam } from "openai/resources";
import { actionItemsInterviewRequirements } from "../prompts/interviewSummaries/1on1Interviews/actionItems";
import {
  detailedInsightsInterviewPrompt,
  detailedInsightsInterviewRequirements,
} from "../prompts/interviewSummaries/1on1Interviews/detailedInsights";
import { keyRecommendationInterviewRequirements } from "../prompts/interviewSummaries/1on1Interviews/keyRecommendations";
import {
  keyTakeawaysInterviewPrompt,
  keyTakeawaysInterviewRequirements,
} from "../prompts/interviewSummaries/1on1Interviews/keyTakeaways";
import { actionItemsAdboardRequirements } from "../prompts/interviewSummaries/advisoryBoards/actionItems";
import {
  detailedInsightsAdboardPrompt,
  detailedInsightsAdboardRequirements,
} from "../prompts/interviewSummaries/advisoryBoards/detailedInsights";
import { keyRecommendationsAdboardRequirements } from "../prompts/interviewSummaries/advisoryBoards/keyRecommendations";
import {
  keyTakeawaysAdboardPrompt,
  keyTakeawaysAdboardRequirements,
} from "../prompts/interviewSummaries/advisoryBoards/keyTakeaways";
import {
  GenerateKeyTakeawaysPromptParams,
  GenerateDetailedInsightsPromptParams,
  GenerateActionItemsPromptParams,
  KeyTakeawaysFormValues,
  DetailedInsightsFormValues,
  ActionItemsFormValues,
  KeyRecommendationFormValues,
  GenerateKeyRecommendationsPromptParams,
  InterviewSummariesFlow,
  File,
  GenerateKeyTakeawayTopicPromptParams,
  GenerateDetailedInsightsTopicPromptParams,
} from "../types/interviewSummaries";

export const discussionCombinedPrompt = (
  discussionObjective: string,
  audienceDiscussionObjectives: string,
  respondentTypeObjectives: string,
  caveatsDiscussionObjectives: string,
  communicationStyleObjectives: string,
  lengthDiscussionObjectives: string,
  paceAndFlowDiscussionObjectives: string,
  phrasingDiscussionObjectives: string,
  toneDiscussionObjectives: string,
  type: string
) => {
  let additionalObjectives = "";

  if (communicationStyleObjectives) {
    additionalObjectives += `${caveatsDiscussionObjectives}\n`;
  }
  if (audienceDiscussionObjectives) {
    additionalObjectives += `${audienceDiscussionObjectives}\n`;
  }
  if (respondentTypeObjectives) {
    additionalObjectives += `${respondentTypeObjectives}\n`;
  }
  if (caveatsDiscussionObjectives) {
    additionalObjectives += `${caveatsDiscussionObjectives}\n`;
  }
  if (lengthDiscussionObjectives) {
    additionalObjectives += `${lengthDiscussionObjectives}\n`;
  }

  if (paceAndFlowDiscussionObjectives) {
    additionalObjectives += `${paceAndFlowDiscussionObjectives}\n`;
  }

  if (phrasingDiscussionObjectives) {
    additionalObjectives += `${phrasingDiscussionObjectives}\n`;
  }

  if (toneDiscussionObjectives) {
    additionalObjectives += `${toneDiscussionObjectives}\n`;
  }

  let typeSpecificText = "";
  if (type === "Communication Testing") {
    typeSpecificText = `
Assesses how effectively different concepts or messages resonate with the target audience (physicians or patients).
Helps identify the most impactful messaging by evaluating clarity, persuasiveness, and emotional appeal.
Guides the refinement of marketing materials to ensure alignment with audience needs and preferences.
  `;
  } else if (type === "TPP Testing") {
    typeSpecificText = `
Evaluates how well a new product’s proposed features and benefits meet the needs and expectations of target audiences.
Assists in refining the product’s development to better align with market demands and competitive landscapes.
Ensures that the final product resonates with both healthcare professionals and patients, driving adoption and success.
  `;
  } else if (type === "Patient Journey") {
    typeSpecificText = `
    Map the complete experience of a patient from the onset of symptoms to diagnosis, treatment, and beyond. Identify key touchpoints and challenges patients face throughout their healthcare journey. Provide insights that help healthcare providers and pharmaceutical companies improve patient support and engagement. Research will uncover nuances by market, treatment setting, physician type, and patient characteristics. The goal is to identify leverage points to effectively target and improve patient outcomes.
    `;
  } else if (type === "Payer Guides") {
    typeSpecificText = `
    Evaluates how well a new product’s proposed features and benefits meet the needs and expectations of payor representatives. Assists in refining the product’s development to better align with reimbursement criteria, cost-effectiveness, and value assessments that drive payor decisions. Ensures that the final product resonates with payors, facilitating favorable coverage and reimbursement, which is crucial for market success.
    `;
  } else if (type === "Market Assessment") {
    typeSpecificText = `
    Analyzes the overall market landscape to identify key trends, opportunities, and competitive dynamics within a specific industry or therapeutic area.
    Evaluates the size and potential of the market by examining factors such as market demand, growth drivers, barriers to entry, and regulatory environment.
    Provides strategic insights that inform go-to-market strategies, product positioning, and business development efforts, ensuring that companies can make informed decisions about market entry or expansion.
    `;
  }

  return `Create a JSON array that adheres to the following structure. The JSON should include an introduction form, a discussion flow, and discussion topics based on the discussion objectives provided here. 

${discussionObjective}

${additionalObjectives}

${typeSpecificText}

Use the patterns of concise, clear, and context-specific content, maintaining a neutral and professional tone. Ensure the sections are tailored to the context of the topic.

The structure should look like this:

{
  "introductionForm": {
    "audience": "",
    "purpose": ""
  },
  "discussionFlow": {
      "sections": [
        {
          "sectionTitle": "",
          "time": ""
        }
      ]
    },
  "discussionTopics": {
    "sections": [
      {
        "topics": "",
        "duration": "",
        "lead": "",
        "numberOfQuestionsPerTopic": ""
      }
    ]
  }
}

Ensure that the topics are relevant, concise, and clear, typically ranging from 10 to 20 words. Maintain a neutral and professional tone, using clear and specific language to ensure respondents understand the information being discussed. Tailor the topics to specific contexts using placeholders and focus on the specific aspects of the topic, ensuring relevance and clarity.

Only populate the values in this array if you have enough information from the discussion objective. If information cannot be found for any of the values within the discussion objective, then leave the value blank. The default number of topics to generate is 5 unless the user specifies a different value. The default number of questions per topic is 5 unless the user specifies a different value.`;
};

export const marketResearchDisclosurePrompt = (
  discussionObjectives: string
) => `
Generate a market research disclosure text with the following requirements:

1. Extract the client type from the discussion objectives (e.g., "pharmaceutical company", "medical device manufacturer", "medical equipment supplier", etc.)
2. Use this exact template, only replacing [CLIENT_TYPE] that you get from the text here: [${discussionObjectives}] with the extracted client type:
"This market research is being sponsored by [CLIENT_TYPE], but I work for an independent market research company, so please feel free to give me your honest opinions; there are no right or wrong answers. Although you will be asked to discuss your individual experiences, your identity will remain confidential, and all findings will be reported in aggregate.
Please remember this session will be recorded for research purposes only. While your name and other personal data will not be revealed, both the broader Magnolia Innovation research team and the company sponsoring the study may be listening into this discussion.
Does everyone agree to participate under these conditions? [Proceed with discussion, if all confirm]"

If no client type is found in the discussion objectives, use "a company" as the default.

Return only the formatted text with no additional commentary or explanations.`;

export const createTopicOrganizationPrompt = (
  topics: string[],
  sectionTitles: string[]
): ChatCompletionMessageParam[] => {
  return [
    {
      role: "system",
      content: `You are a topic organization assistant. Your task is to analyze topics and identify which ones are related to specific section titles. 
      IMPORTANT: 
      - DO NOT create new topics or modify existing ones
      - ONLY organize existing topics under relevant section titles if they are clearly related
      - If a topic doesn't clearly relate to any section, leave it unassigned
      - Return the results in a consistent JSON format`,
      name: "system",
    },
    {
      role: "user",
      content: `Please analyze these topics and section titles:
      Topics: ${JSON.stringify(topics)}
      Section Titles: ${JSON.stringify(sectionTitles)}
      
      Group related topics under their relevant section titles. 
      Return the results in this format:
      {
        "organizedSections": [
          {
            "sectionTitle": "string",
            "childrenTopics": ["topic1", "topic2"]
          }
        ],
        "unassignedTopics": ["topic3", "topic4"]
      }`,
      name: "user",
    },
  ];
};

export const generateKeyTakeawaysPrompt = ({
  values,
}: GenerateKeyTakeawaysPromptParams): string => {
  const {
    objectives,
    objectivesSummary,
    discussionTopics,
    keyTakeaways,
    additionalNotes,
    type,
    file,
  } = values;

  const generateSectionContent = (
    keyTakeaways: KeyTakeawaysFormValues,
    discussionTopics: {
      topics: string;
      maxWordCountPerTopic?: string;
      additionalNote?: string;
      sections: {
        topics: string;
        numberOfQuestionsPerTopic?: number;
        generatedAiQuestions?: string[];
      }[];
    }
  ): string => {
    const additionalNoteContent = keyTakeaways.additionalNotes ?? "";

    const topicsContent = discussionTopics.sections
      .map(
        (sec) => `
        <h3>${sec.topics}</h3>
        <ul>[content]</ul>`
      )
      .join("");

    return `${additionalNoteContent}${topicsContent}`;
  };

  const structureNoteRequirement = keyTakeaways.structureNotes
    ? `- **Special Instructions**: Consider the following structureNotes while crafting summaries: "${keyTakeaways.structureNotes}".`
    : "";

  const additionalNoteRequirement = additionalNotes
    ? `- **Special Instructions**: Ensure content is informed by this additional note: "${additionalNotes}".`
    : "";

  const topicsList = discussionTopics.sections
    .map((sec) => sec.topics)
    .join(", ");

  const prompt =
    type.name === "Advisory Boards"
      ? keyTakeawaysAdboardPrompt(objectivesSummary, topicsList)
      : keyTakeawaysInterviewPrompt(objectivesSummary, topicsList);

  const requirements =
    type.name === "Advisory Boards"
      ? keyTakeawaysAdboardRequirements
      : keyTakeawaysInterviewRequirements;

  const promptTemplate = `
   ${prompt} 

  FORMAT RESPONSE IN PLAIN JSON WITHOUT MARKUPS:
  {
    "keyTakeaways": "${generateSectionContent(
      keyTakeaways,
      discussionTopics
    ).replace(/\n\s+/g, " ")}"
  }

  ${requirements}
  ${structureNoteRequirement}
  ${additionalNoteRequirement}

  NOTE: Provide only HTML content, no additional text or line breaks.

  CONTENT: ${
    objectives
      ? `${objectivesSummary} and ${objectives}`
      : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${file.fileName}(FILE ID: ${file.fileId})`
  }`;

  return promptTemplate.trim();
};

export const generateDetailedInsightsPrompt = ({
  values,
}: GenerateDetailedInsightsPromptParams): string => {
  const {
    objectives,
    objectivesSummary,
    detailedInsights,
    type,
    discussionTopics,
    additionalNotes,
    file,
  } = values;

  const generateSectionContent = (
    detailedInsights: DetailedInsightsFormValues,
    discussionTopics: {
      topics: string;
      maxWordCountPerTopic?: string;
      additionalNote?: string;
      sections: {
        topics: string;
        numberOfQuestionsPerTopic?: number;
        generatedAiQuestions?: string[];
      }[];
    }
  ): string => {
    const additionalNoteContent = detailedInsights.additionalNotes ?? "";

    const topicsContent = discussionTopics.sections
      .map(
        (sec) => `
        <h3>${sec.topics}</h3>
        <ul>[content]</ul>
        `
      )
      .join("");

    return `${additionalNoteContent}${topicsContent}`;
  };

  const structureNoteRequirement = detailedInsights.structureNotes
    ? `- **Special Instructions**: Consider the following structureNotes: "${detailedInsights.structureNotes}".`
    : "";

  const additionalNoteRequirement = additionalNotes
    ? `- **Special Instructions**: Consider this additional note: "${additionalNotes}".`
    : "";

  const topicsList = discussionTopics.sections
    .map((sec) => sec.topics)
    .join(", ");

  const prompt =
    type.name === "Advisory Boards"
      ? detailedInsightsAdboardPrompt(objectivesSummary, topicsList)
      : detailedInsightsInterviewPrompt(objectivesSummary, topicsList);

  const requirements =
    type.name === "Advisory Boards"
      ? detailedInsightsAdboardRequirements
      : detailedInsightsInterviewRequirements;

  const promptTemplate = `
  ${prompt}

  FORMAT RESPONSE IN PLAIN JSON WITHOUT MARKUPS:
  {
    "detailedInsights": "${generateSectionContent(
      detailedInsights,
      discussionTopics
    ).replace(/\n\s+/g, " ")}"
  }

  ${requirements}
  ${structureNoteRequirement}
  ${additionalNoteRequirement}

  NOTE: Provide only HTML content, no additional text or line breaks.

  CONTENT: ${
    objectives
      ? `${objectivesSummary} and ${objectives}`
      : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${file.fileName}(FILE ID: ${file.fileId})`
  }
  `;

  return promptTemplate.trim();
};

export const generateActionItemsPrompt = ({
  values,
}: GenerateActionItemsPromptParams): string => {
  const {
    objectives,
    objectivesSummary,
    actionItems,
    discussionTopics,
    type,
    additionalNotes,
    file,
  } = values;

  const generateSectionContent = (
    actionItems: ActionItemsFormValues,
    discussionTopics: {
      topics: string;
      maxWordCountPerTopic?: string;
      additionalNote?: string;
      sections: {
        topics: string;
        numberOfQuestionsPerTopic?: number;
        generatedAiQuestions?: string[];
      }[];
    }
  ): string => {
    const additionalNoteContent = actionItems.additionalNotes ?? "";

    const topicsContent = discussionTopics.sections
      .map(() => "<ul>[content]</ul>")
      .join("");

    return `${additionalNoteContent}${topicsContent}`;
  };

  const structureNoteRequirement = actionItems.structureNotes
    ? `- **Special Instructions**: Consider the following structureNotes: "${actionItems.structureNotes}".`
    : "";

  const additionalNoteRequirement = additionalNotes
    ? `- **Special Instructions**: Consider this additional note: "${additionalNotes}".`
    : "";

  const requirements =
    type.name === "Advisory Boards"
      ? actionItemsAdboardRequirements
      : actionItemsInterviewRequirements;

  const promptTemplate = `
  Analyze and generate action items from the provided interview notes. Action items are specific follow-ups or next steps assigned to members or teams on the client side. Each action item should clearly define who is responsible and what needs to be done.
  Example Format: “Arrange a meeting between the advisor and medical director to review data on X”, “Send a meeting invite to team members”. 
  Before generating action items, verify that responsibilities are assigned only to client team members as specified in the meeting notes provided by the user. Do not include action items for any advisory board members or healthcare professionals, and ignore any action suggestions or implied tasks originating from advisory board members.

  FORMAT RESPONSE IN PLAIN JSON WITHOUT MARKUPS:
  {
    "actionItems": "${generateSectionContent(
      actionItems,
      discussionTopics
    ).replace(/\n\s+/g, " ")}"
  }

  ${requirements}
  ${structureNoteRequirement}
  ${additionalNoteRequirement}

  NOTE: Provide only HTML content, no additional text or line breaks.

  CONTENT: ${
    objectives
      ? `${objectivesSummary} and ${objectives}`
      : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${file.fileName}(FILE ID: ${file.fileId})`
  }
  `;

  return promptTemplate.trim();
};

export const generateKeyRecommendationsPrompt = ({
  values,
}: GenerateKeyRecommendationsPromptParams): string => {
  const {
    objectives,
    objectivesSummary,
    keyRecommendations,
    type,
    discussionTopics,
    additionalNotes,
    file,
  } = values;

  const generateSectionContent = (
    keyRecommendations: KeyRecommendationFormValues,
    discussionTopics: {
      topics: string;
      maxWordCountPerTopic?: string;
      additionalNote?: string;
      sections: {
        topics: string;
        numberOfQuestionsPerTopic?: number;
        generatedAiQuestions?: string[];
      }[];
    }
  ): string => {
    const additionalNoteContent = keyRecommendations.additionalNotes ?? "";

    const topicsContent = discussionTopics.sections
      .map(() => "<ul>[content]</ul>")
      .join("");

    return `${additionalNoteContent}${topicsContent}`;
  };

  const structureNoteRequirement = keyRecommendations.structureNotes
    ? `- **Special Instructions**: Consider the following structureNotes: "${keyRecommendations.structureNotes}".`
    : "";

  const additionalNoteRequirement = additionalNotes
    ? `- **Special Instructions**: Consider this additional note: "${additionalNotes}".`
    : "";

  const topPrompt =
    type.name === "Advisory Boards"
      ? `Analyze the provided interview notes and generate/identify any Key Recommendations. Key Recommendations are defined as suggestions or advice that the advisor provides to our clients or that we would recommend based on the content of the conversation. For example, if the healthcare professional explicitly recommends "conduct more safety/tolerability studies on drug X," this would be a direct recommendation. If the healthcare professional indicates a lack of data, such as saying "I haven't seen enough data to fully understand the safety/tolerability of drug X," then the recommendation might be, "Client should conduct more safety studies and/or better communicate their safety data based on the healthcare professional's statements." If no Key Recommendations can be identified, state, "No Key Recommendations can be determined`
      : `Analyze the interview notes and extract or generate Key Recommendations based on the advisor’s input. Recommendations should reflect direct advice from interviewee or implied suggestions based on gaps, concerns, or needs indicated in the conversation.`;

  const requirements =
    type.name === "Advisory Boards"
      ? keyRecommendationsAdboardRequirements
      : keyRecommendationInterviewRequirements;

  const promptTemplate = `
  ${topPrompt}

  FORMAT RESPONSE IN PLAIN JSON WITHOUT MARKUPS:
  {
    "keyRecommendations": "${generateSectionContent(
      keyRecommendations,
      discussionTopics
    ).replace(/\n\s+/g, " ")}"
  }

  ${requirements}
  ${structureNoteRequirement}
  ${additionalNoteRequirement}

  NOTE: Provide only HTML content, no additional text or line breaks.

  CONTENT: ${
    objectives
      ? `${objectivesSummary} and ${objectives}`
      : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${file.fileName}(FILE ID: ${file.fileId})`
  }
`;

  return promptTemplate.trim();
};

export const interviewDiscussionPrompt = (values: InterviewSummariesFlow) => {
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

export const keyTakeawayTopicPrompt = (values: InterviewSummariesFlow) => {
  const basePrompt = `Create a JSON array that adheres to the following structure. The JSON should include discussion topics based on the provided content. Use patterns of concise, clear, and context-specific content, maintaining a neutral and professional tone. Ensure the sections are tailored to the context of the topic.

The structure should ALWAYS look like this, never change it, and don't add any additional text in response, only the JSON object:

{
  "keyTakeawayTopic": {
    "sections": [
      {
        "topic": "",
      }
    ]
  }
}

Ensure that the topic entry contain only one distinct topic. Avoid combining multiple ideas within a single topic. The topic should be relevant, concise, and clear, typically ranging up to 8 words. Maintain a neutral and professional tone, using clear and specific language to ensure respondents understand the information being discussed. Tailor the topic to specific contexts using placeholders and focus on the specific aspects of the topic, ensuring relevance and clarity.

Please generate only one topic for this interview. Prioritize 1. This topic should represent categories of the entire conversation. 
IT IS CRUCIAL THAT YOU DON'T GENERATE ANY OF THESE EXISTING TOPICS: ${values.generatedInterviewSummaries.generatedTopics.join(
    ","
  )}

CONTENT: ${
    values.objectives
      ? values.objectives
      : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${values.file.fileName}(FILE ID: ${values.file.fileId})`
  }`;

  return basePrompt;
};

export const detailedInsightTopicPrompt = (values: InterviewSummariesFlow) => {
  const basePrompt = `Create a JSON array that adheres to the following structure. The JSON should include discussion topics based on the provided content. Use patterns of concise, clear, and context-specific content, maintaining a neutral and professional tone. Ensure the sections are tailored to the context of the topic.

The structure should ALWAYS look like this, never change it, and don't add any additional text in response, only the JSON object:

{
  "detailedInsightTopic": {
    "sections": [
      {
        "topic": "",
      }
    ]
  }
}

Ensure that the topic entry contain only one distinct topic. Avoid combining multiple ideas within a single topic. The topic should be relevant, concise, and clear, typically ranging up to 8 words. Maintain a neutral and professional tone, using clear and specific language to ensure respondents understand the information being discussed. Tailor the topic to specific contexts using placeholders and focus on the specific aspects of the topic, ensuring relevance and clarity.

Please generate only one topic for this interview. Prioritize 1. This topic should represent categories of the entire conversation. 
IT IS CRUCIAL THAT YOU DON'T GENERATE ANY OF THESE EXISTING TOPICS: ${values.generatedInterviewSummaries.generatedTopics.join(
    ","
  )}

CONTENT: ${
    values.objectives
      ? values.objectives
      : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${values.file.fileName}(FILE ID: ${values.file.fileId})`
  }`;

  return basePrompt;
};

export const generateOneKeyTakeawayPrompt = ({
  values,
}: GenerateKeyTakeawayTopicPromptParams): string => {
  const {
    objectives,
    objectivesSummary,
    keyTakeawayTopic,
    keyTakeaways,
    additionalNotes,
    type,
    file,
  } = values;

  const generateSectionContent = (
    keyTakeaways: KeyTakeawaysFormValues,
    keyTakeawayTopic: {
      topic: string;
      maxWordCountPerTopic?: string;
      additionalNote?: string;
      sections: {
        topic: string;
        numberOfQuestionsPerTopic?: number;
        generatedAiQuestions?: string[];
      }[];
    }
  ): string => {
    const additionalNoteContent = keyTakeaways.additionalNotes ?? "";

    const topicsContent = keyTakeawayTopic.sections
      .map(
        (sec) => `
        <h3>${sec.topic}</h3>
        <ul>[content]</ul>
        <br/>`
      )
      .join("");

    return `${additionalNoteContent}${topicsContent}`;
  };

  const structureNoteRequirement = keyTakeaways.structureNotes
    ? `- **Special Instructions**: Consider the following structureNotes while crafting summaries: "${keyTakeaways.structureNotes}".`
    : "";

  const additionalNoteRequirement = additionalNotes
    ? `- **Special Instructions**: Ensure content is informed by this additional note: "${additionalNotes}".`
    : "";

  const topicsList = keyTakeawayTopic.sections
    .map((sec) => sec.topic)
    .join(", ");

  const prompt =
    type.name === "Advisory Boards"
      ? keyTakeawaysAdboardPrompt(objectivesSummary, topicsList)
      : keyTakeawaysInterviewPrompt(objectivesSummary, topicsList);

  const requirements =
    type.name === "Advisory Boards"
      ? keyTakeawaysAdboardRequirements
      : keyTakeawaysInterviewRequirements;

  const promptTemplate = `
   ${prompt} 

  FORMAT RESPONSE IN PLAIN JSON WITHOUT MARKUPS:
  {
    "keyTakeaways": "${generateSectionContent(
      keyTakeaways,
      keyTakeawayTopic
    ).replace(/\n\s+/g, " ")}"
  }

  ${requirements}
  ${structureNoteRequirement}
  ${additionalNoteRequirement}

  NOTE: Provide only HTML content, no additional text or line breaks.

  CONTENT: ${
    objectives
      ? `${objectivesSummary} and ${objectives}`
      : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${file.fileName}(FILE ID: ${file.fileId})`
  }`;

  return promptTemplate.trim();
};

export const generateOneDetailedInsightsPrompt = ({
  values,
}: GenerateDetailedInsightsTopicPromptParams): string => {
  const {
    objectives,
    objectivesSummary,
    detailedInsights,
    type,
    detailedInsightTopic,
    additionalNotes,
    file,
  } = values;

  const generateSectionContent = (
    detailedInsights: DetailedInsightsFormValues,
    detailedInsightTopic: {
      topic: string;
      maxWordCountPerTopic?: string;
      additionalNote?: string;
      sections: {
        topic: string;
        numberOfQuestionsPerTopic?: number;
        generatedAiQuestions?: string[];
      }[];
    }
  ): string => {
    const additionalNoteContent = detailedInsights.additionalNotes ?? "";

    const topicsContent = detailedInsightTopic.sections
      .map(
        (sec) => `
        <h3>${sec.topic}</h3>
        <ul>[content]</ul>
        <br/> `
      )
      .join("");

    return `${additionalNoteContent}${topicsContent}`;
  };

  const structureNoteRequirement = detailedInsights.structureNotes
    ? `- **Special Instructions**: Consider the following structureNotes: "${detailedInsights.structureNotes}".`
    : "";

  const additionalNoteRequirement = additionalNotes
    ? `- **Special Instructions**: Consider this additional note: "${additionalNotes}".`
    : "";

  const topicsList = detailedInsightTopic.sections
    .map((sec) => sec.topic)
    .join(", ");

  const prompt =
    type.name === "Advisory Boards"
      ? detailedInsightsAdboardPrompt(objectivesSummary, topicsList)
      : detailedInsightsInterviewPrompt(objectivesSummary, topicsList);

  const requirements =
    type.name === "Advisory Boards"
      ? detailedInsightsAdboardRequirements
      : detailedInsightsInterviewRequirements;

  const promptTemplate = `
  ${prompt}

  FORMAT RESPONSE IN PLAIN JSON WITHOUT MARKUPS:
  {
    "detailedInsights": "${generateSectionContent(
      detailedInsights,
      detailedInsightTopic
    ).replace(/\n\s+/g, " ")}"
  }

  ${requirements}
  ${structureNoteRequirement}
  ${additionalNoteRequirement}

  NOTE: Provide only HTML content, no additional text or line breaks.

  CONTENT: ${
    objectives
      ? `${objectivesSummary} and ${objectives}`
      : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${file.fileName}(FILE ID: ${file.fileId})`
  }
  `;

  return promptTemplate.trim();
};

export const discussionGuidePromptValidator = `Verify that the text provided has the following content: 
Audience (Group for whom the content is specifically designed and targeted), 
Objective (The primary goal or intended outcome of the discussion), 
Caveats (Specific conditions or limitations that affect the discussion’s scope or content), 
Phrasing (Choice of words and style used in the questions and dialogue), 
Length (The total duration or word count allocated for the discussion), 
Tone (The overall feeling or attitude conveyed through the language used), 
Tense (The grammatical time setting indicating when the events are happening). 
Generate a JSON object consisting of the requirement name and a value of TRUE or FALSE next to each requirement based on whether the user provided that information.

Format the output always in the following JSON format:
{
    "Audience": boolean(true/false),
    "Objective": boolean(true/false),
    "Caveats": boolean(true/false),
    "Phrasing": boolean(true/false),
    "Length": boolean(true/false),
    "Tone": boolean(true/false),
    "Tense": boolean(true/false),
}

{discussionObjectives}
`;

export const discussionGuideQuestionsPrompt = (prompt: string) => `
Generate a fully original discussion guide based on the provided prompt below.  
The content should strictly follow the provided prompt, focusing entirely on the topic or instructions described within it. Do not refer to or base the content on any inspiration document, existing questions, or pre-existing materials. Treat the prompt as the sole source of inspiration and guidance for generation.

[${prompt}]

For the generated content, organize it by section and include the following details for each section:  

**Purpose**: Describe the purpose of the section.  
**Question Types**: Break down the questions into categories (e.g., open-ended, probing, follow-up, yes/no) and explain how each type contributes to gathering specific insights.  
**Tone**: Explain the tone of the questions and its impact on physician comfort and openness.  
**Length**: Indicate the time allocated for this section e.g., "7 minutes".  
**Example Questions**: Clearly list a set of example questions that illustrate the structure and flow of the section. Ensure this heading is always included before listing the questions.  

- **For each section**: Include the purpose, question types, tone, length, and example questions.
- **Use headings (e.g., <h2>) only for section titles** without including time or minutes in the heading. Do not show "X min" in the heading.
- **Include the time e.g., "7 minutes" as part of the Length section**.  
- **Use bold text (<strong>) for purpose, question types, tone, and length**, and wrap each of these with (<p>) tags.  
- **Use list tags (<ul>, <li>)** to format the questions in bullet points.  
- **Ensure that all sections are wrapped in proper HTML tags** for consistency and readability.  
- **Insert blank lines between sections** in the HTML output for clarity and readability.

Return only the HTML content. Do not include any notes, explanations, or comments about formatting.
`;

export const disccusionGuideSectionsPrompt =
  "Analyze this document solely for its structural elements, without focusing on specific content. Break down the document into its main sections and subsections, providing a description of each section’s purpose and how it contributes to the document’s overall flow. Identify the types of questions used within each section (e.g., open-ended, probing, follow-up, yes/no) and describe the tone throughout (e.g., formal, neutral, encouraging), considering how the tone impacts the intended audience’s comfort and engagement. Comment on the length of each section and note whether it is brief or detailed, along with any time allocations that indicate the level of depth expected. Highlight any transitions between sections or shifts in tone, explaining how these elements help maintain a cohesive, logical progression. If the document is tailored to a particular audience or objective, describe how the structure supports this purpose. Focus on how the document is organized to direct the reader and the flow of information.";
