export const detailedInsightsAdboardPrompt = (
  objectivesSummary: string,
  topicsList: string
) =>
  `Generate Detailed Insights from an Advisory Board Meeting with ${objectivesSummary}. When developing the summary, use an informative and clinical writing style, maintaining a professional and authoritative, yet conversational tone. Structure insights as bullet points, each presenting distinct information. Focus ONLY on these topics: ${topicsList} unless additional notes specify otherwise.
  
  The purpose of the Detailed Insights is to capture all discussion points from the interview. Be verbose, robust and use full sentence structure in an active voice. Do not limit yourself to any specific number of bullets per topic. Create as many bullets as necessary to capture all notes from the interview. Structure each sentence following the standard sentence structure of the English language. 
  `;

export const detailedInsightsAdboardRequirements = `
  CRUCIAL REQUIREMENTS:
  - Generate detailed interview summaries in full sentences, clearly referencing the interviewee, and ensuring each point is fully explained and complete. Use a professional tone and provide context where necessary.
  - Word Count per [content]: Each [content] must contain *1950 WORDS**. It is critical that each [content] entry meets this exact word count. Do not exceed or fall short of this limit.
  - Verification: Carefully check and ensure the word count for each [content] before finalizing. This step is mandatory and crucial.
  - Total Word Count: The total word count for all [content] combined must equal the sum of *1950 WORDS** for each [content].
  - Ensure that the [content] is elaborate, verbose and comprehensive, strictly adhering to the specified word count of *1950 WORDS** per [content].
  - Each [content] must be detailed enough to cover the entire scope of the respective topic within the specified word count.
  - Write the content using an active voice. DO NOT write the content passively.
  - Generate summaries based solely on the provided notes, without incorporating information from external sources or pre-existing training data.
  - Mandatory Content Structure: Always include the <ul>[content]</ul> structure for each section, even if there is no corresponding <h3> header. This structure is critical and must be present for every topic, regardless of whether a topic title is provided, even if no topics are provided, we should generate the output in bullets.
  - DO NOT INCLUDE ANY SOURCE REFERENCES: Do not include any source indicators, footnotes, or references like "[4: 17+source]" or any similar format. Present all information as if it's coming directly from the summarized content without citing specific sources or page numbers.
  - Do not include periods (.) at the end of bullet points in the [content] section. Each bullet point should end without any punctuation.
  - Strict Exclusion of Client Content: Exclude any statements, questions, presentations, or information provided by individuals identified as clients. Do not reference, summarize, or include any content attributed to these client participants. Focus exclusively on responses, insights, and recommendations from advisors or interviewees, disregarding any contributions from the client.
  - Do not omit any details from the conversation. Provide comprehensive summaries of every part of the interview. Write in complete sentences. Over-explain and be verbose with your responses if you have to.

  FILETRING REQUIREMENTS: 
  - Strict Exclusion of Client Content: Exclude any statements, questions, presentations, or information provided by individuals identified as clients. Do not reference, summarize, or include any content attributed to these client participants. Focus exclusively on responses, insights, and recommendations from advisors or interviewees
  - Client Interaction Filtering: Do not document client questions, reactions, or meeting facilitation activities. Even if clients make important points or guide discussion, these should not appear in the summary
  - Meeting Process Neutrality: Avoid mentioning specific details about how the meeting was conducted, who moderated it, or any client-led activities
  - Generic Disease State References: Use general terms for disease states and therapeutic areas rather than specific conditions unless explicitly required
  - Participant Anonymity: Unless specifically instructed otherwise, refer to participants by their role (e.g., "an oncologist noted" or "a specialist suggested") rather than by name
  - Conclusion Formatting: Do not include summary statements about meeting wrap-up or client closing remarks. End each section with the last relevant insight from advisory board members
  - Context Preservation: While excluding client content, maintain the natural flow of advisor responses and insights without referring to what prompted them
  - Meeting Structure Neutrality: Avoid references to meeting logistics, breaks, or session organization that might indicate client involvement
  - Remove Client Company References: Exclude mentions of the client company name, products, or specific initiatives unless these are part of advisor responses
  - Focus on Expert Content: Emphasize advisor expertise, experiences, and recommendations without referencing their interactions with client representatives

  GUIDELINES: 
  - Present information as standalone insights that do not require client context to understand
  - Maintain professional tone while ensuring content reads naturally without obvious omissions
  - Preserve all relevant scientific and clinical insights while removing client-specific framing
  - Structure content to flow logically without depending on client questions or prompts
  - Ensure completeness of expert opinions while maintaining strict separation from client content
  `;
