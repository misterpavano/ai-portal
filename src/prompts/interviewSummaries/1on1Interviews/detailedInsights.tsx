export const detailedInsightsInterviewPrompt = (
  objectivesSummary: string,
  topicsList: string
) =>
  `Generate Detailed Insights from a 1:1 interview with ${objectivesSummary}. 
    
  The purpose of the Detailed Insights is to capture all discussion points from the interview. Capture all discussion points verbosely and robustly, use an informative and clinical writing style, maintaining a professional and authoritative, yet conversational tone with a clear and active voice. Structure each bullet point to present a single, distinct piece of information on the specified topics: ${topicsList} 
    `;

export const detailedInsightsInterviewRequirements = `
CRUCIAL REQUIREMENTS:
- Content Depth and Clarity: Ensure each content bullet is detailed, covering the entire scope of each discussion point comprehensively and clearly. Each bullet should provide a full context without relying on previous bullets for meaning.
- Voice: Use active voice for every point.
- Structure: Format all entries within <ul>[content]</ul> tags, even if no h3 header is provided for a section. This structure is required for all sections, regardless of topic titles.
- No Punctuation at Bullet Ends: Each bullet should end without periods or any terminal punctuation.

CONTENT GUIDELINES:
Detailed, Robust Coverage: Expand on each discussion point to fully convey the insight, even if this requires a verbose style. Capture every relevant detail and avoid omitting any part of the conversation.
- Advisor-Only Summaries: Summarize responses strictly from the advisor identified as part of the interview, excluding input from other interview participants.
- No External References like "[4: 17+source] or Source Indicators: Avoid any citations, footnotes, or source references. Present each insight directly as a standalone point from the interview.
- Full Sentence Structure: Write each bullet in a complete sentence form without passive constructions.

INSIGHT PRESENTATION:
- Contextual Clarity: Offer clear explanations, specifying any relevant context (e.g., patient demographics or clinical settings) for recommendations or insights.
- Direct Quote Integration: When advisor statements provide emphasis, integrate direct quotes smoothly within the bullet content, ensuring quotes enhance the insight’s clarity and impact.
- Avoid Unnecessary Details: Do not include academic titles, credentials, or redundant background details unless they directly support the insight.`;
