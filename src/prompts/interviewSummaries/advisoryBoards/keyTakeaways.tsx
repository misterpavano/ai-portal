export const keyTakeawaysAdboardPrompt = (
  objectivesSummary: string,
  topicsList: string
) =>
  `Generate Key Takeaways from an Advisory Board Meeting with ${objectivesSummary}. When developing the summary, use an informative and clinical writing style, maintaining a professional and authoritative, yet conversational tone. Structure takeaways as bullet points, each presenting distinct information. Focus ONLY on these topics: ${topicsList}`;

export const keyTakeawaysAdboardRequirements = `
- Word Count: Each [content] should contain a minimum of 15 words, with a recommended maximum of 75 words. However, feel free to exceed this limit if necessary to convey the full message effectively.
- Verification: Carefully check word count for each [content] to ensure that the word count parameters have been met.
- Content: Clear yet comprehensive, adhering to word count range.
- Scope: Each [content] must cover the entire topic within the word count.
- Voice: Use active voice only.
- Mandatory Content Structure: Always include the <ul>[content]</ul> structure for each section. This structure is critical and must be present for every topic, regardless of whether a topic title is provided, even if no topics are provided, we should generate the output in bullets.
- Synthesize Collective Insights: Summarize overarching themes, insights, and trends that represent the advisory board’s shared perspective.
- Only summarize the responses of those who were identified as part of the advisory  board.
- DO NOT INCLUDE ANY SOURCE REFERENCES: Do not include any source indicators, footnotes, or references like "[4: 17+source]" or any similar format. Present all information as if it's coming directly from the summarized content without citing specific sources or page numbers.
- Ensure each [content] bullet covers a wider range of information within the word count, providing depth to the insights.
- Emphasize the significance of the insights, including context and implications for decision-making, to ensure a thorough understanding.
- Generate as many bullets as necessary: Ensure that collective feedback from multiple advisory board members is the primary focus, minimizing the attention given to singular or outlier opinions.
- Depth of Findings: Ensure each bullet captures key trends and collective takeaways from the advisory board, with contextual details where relevant. Avoid phrasing that attributes insights to individual advisors.
- Provide bullet points as much as you can for a specific topic
- Strict Exclusion of Client Content: Exclude any statements, questions, presentations, or information provided by individuals identified as clients. Do not reference, summarize, or include any content attributed to these client participants. Focus exclusively on responses, insights, and recommendations from advisors or interviewees, disregarding any contributions from the client.
- Paraphrase to capture nuanced, representative insights from the advisory board that illustrate broader trends or themes. Include only perspectives that add value to the collective feedback.
- Summarize Broad Themes, Not Individual Comments: Avoid structuring key takeaways as “advisor said this” or “advisor commented on that.” Instead, present each bullet as a summary of collective themes or trends that emerged during the discussion, with an emphasis on practical and strategic relevance.
- DO NOT START THE SENTENCE WITH "The advisory boards" or "The advisors" or "The boards"

FORMAT REQUIREMENTS:
- Each bullet point must contain exactly ONE key insight or decision
- Focus on specific decisions and their rationales rather than general observations
- Maximum of 2-3 sentences per bullet point
- Highlight Group Decisions First: Begin each bullet with a clear, actionable insight or finding that reflects the board’s overall consensus. Emphasize group decisions or widely shared insights, avoiding individual viewpoints unless they directly support the larger trend.
- Each bullet should focus on one key insight or decision, providing context to enhance clarity and practical application. Avoid general or surface-level statements; ensure each point captures actionable insights specific to the topic.

CONTENT REQUIREMENTS:
- Include quantitative data whenever available
- Specify treatment preferences with clear reasoning
- Emphasize practical clinical implications over theoretical possibilities
- When discussing treatment choices, always include the reasoning behind the treatment choice and the patient type/population affected, when possible.
- Deliver In-Depth, Section-Specific Insights: Focus each bullet on collective insights that add depth to the section’s topic, emphasizing practical and clinical implications. Avoid generalizations and ensure each takeaway is based on the broader discussion rather than individual opinions.

STRUCTURE  REQUIREMENTS:
- Emphasize Collective Insights: Each bullet must be self-contained and independently valuable: Present takeaways as unified insights that capture the board’s collective perspective. Use individual comments sparingly and only when they reinforce a larger, shared trend or recommendation.
- Present information in present tense and active voice
- When mentioning a preference or decision, include the specific context or patient population it applies to
- When summarizing similar or related topics, ensure clear distinctions. Avoid blending details from separate sections or topics, and focus on distinct insights that pertain directly to the specified area.

CLINICAL VALUE REQUIREMENTS:
- Each bullet must contain exactly one key insight or decision related to scientific/medical/clinical information (eg, clinical trial results, clinical trial design, patient types/populations, treatment/management decisions and rationale) or commercial and marketing information (eg, product differentiation, marketing or promotional materials, educational needs, content and messaging)
- Include specific treatment sequences when discussed
- Specify patient populations for recommendations
- Include numerical metrics, efficacy data metrics (eg, response rates, improvement rates, survival data, event rates), safety data (eg, adverse event/reactions incidence and/or rates), or other quantifiable insights whenever possible
- For each bullet, specify how the insight could influence strategic planning or decision-making within the discussed context. If no direct alignment is mentioned, provide clinically relevant context that supports broader strategic applications.

STRICTLY AVOID:
- General statements without specific insights
- Multiple thoughts or topics in a single bullet point
- Academic credentials after names
- Future possibilities without current applications
- Verbose descriptions that dilute the main point
- Combining multiple doctors' opinions in one bullet
- Avoid Attributions to Individuals: Do not phrase takeaways as quotes or individual comments (e.g., “The advisory boards…”). All insights should reflect the overall advisory board’s shared perspective.
  `;
