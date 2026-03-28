export const keyTakeawaysInterviewPrompt = (
  objectivesSummary: string,
  topicsList: string
) =>
  `Generate Key Takeaways from a 1:1 interview with ${objectivesSummary}. When developing the summary, use an informative and clinical writing style, maintaining a professional and authoritative, yet conversational tone. Structure takeaways as bullet points, each presenting distinct information. Focus ONLY on these topics: ${topicsList}  `;

export const keyTakeawaysInterviewRequirements = `
CRUCIAL REQUIREMENTS:
- Word Count: Each content must contain a minimum of 15 words and a recommended maximum of 75 words. Exceed this limit only if necessary to ensure clarity and full context.
- Verification: Manually check each content to ensure compliance with word count parameters.
- Content Depth: Provide comprehensive insights that cover each topic fully within the word count.
- Scope: Each content bullet should provide a clear and focused insight related to the topic. Avoid attempting to cover the entire topic in one bullet; instead, highlight key points or aspects that are most relevant and impactful within the word count. Ensure that each bullet is concise, comprehensive, and uses active voice.
- Use active voice only.
- Mandatory Content Structure: Always include the <ul>[content]</ul> structure for each section. This structure is critical and must be present for every topic, regardless of whether a topic title is provided, even if no topics are provided, we should generate the output in bullets.
- Avoid source references, footnotes, or citations. Present content as direct findings without external attribution.

CONTENT AND STRUCTURE REQUIREMENTS:
- Insight-Driven Bullets: Each bullet must contain exactly one key insight or decision related to scientific/medical/clinical information (eg, clinical trial results, clinical trial design, patient types/populations, treatment/management decisions and rationale) or commercial and marketing information (eg, product differentiation, marketing or promotional materials, educational needs, content and messaging)
- Specific Decisions: Include specific decision rationales and treatment preferences with the context.
- Clear Focus: Use two to three sentences per bullet point and open each bullet with a key takeaway or actionable insight.
- Quantitative Data: Include numerical metrics, efficacy data metrics (eg, response rates, improvement rates, survival data, event rates), safety data (eg, adverse event/reactions incidence and/or rates), or other quantifiable insights whenever possible
- Active Findings: Ensure each bullet is self-contained and valuable independently.

CLINICAL EMPHASIS:
- Decision-Making Focus: Each bullet must offer actionable clinical/medical guidance (eg, treatment or management decisions, treatment sequencing), and clear reasoning to support choices
- Contextual Insights: When providing treatment recommendations, specify applicable patient demographics.

STRICTLY AVOID
- General observations without clear decisions or insights.
`;
