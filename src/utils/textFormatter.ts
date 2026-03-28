import { ChatCompletion } from "openai/resources";

export const formatJsonOpenAiResponse = (response: string) => {
  let sanitizedResponse = response;
  console.log("res", response);
  if (
    sanitizedResponse.startsWith("```json") &&
    sanitizedResponse.endsWith("```")
  ) {
    console.log(response, "JSON");
    sanitizedResponse = sanitizedResponse.slice(7, -3); // Remove triple backticks and json
  } else if (
    sanitizedResponse.startsWith("```") &&
    sanitizedResponse.endsWith("```")
  ) {
    console.log(response, "```");
    sanitizedResponse = sanitizedResponse.slice(3, -3); // Remove triple backticks
  }
  try {
    return JSON.parse(sanitizedResponse);
  } catch (err) {
    console.error("Invalid JSON", err);
    return "error";
  }
};

export const getAiContent = (
  response: ChatCompletion | { content: string }
): string => {
  if ("choices" in response) {
    return response.choices?.[0]?.message?.content ?? "";
  } else if ("content" in response) {
    return response.content;
  }
  return "";
};

export const formatTopicsResponse = (response: string) => {
  let sanitizedResponse = response;
  console.log("res", response);

  // Handling the removal of backticks and sanitization
  if (
    sanitizedResponse.startsWith("```json") &&
    sanitizedResponse.endsWith("```")
  ) {
    sanitizedResponse = sanitizedResponse.slice(7, -3); // Remove triple backticks and json
  } else if (
    sanitizedResponse.startsWith("```") &&
    sanitizedResponse.endsWith("```")
  ) {
    sanitizedResponse = sanitizedResponse.slice(3, -3); // Remove triple backticks
  }

  // Remove trailing commas in JSON (if any)
  sanitizedResponse = sanitizedResponse
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");

  // Attempt to parse the JSON
  try {
    return JSON.parse(sanitizedResponse);
  } catch (err) {
    console.error("Invalid JSON", err);
    return {}; // Return an empty object if JSON parsing fails
  }
};

export const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, "");
};

export function safeJSONParse(jsonString: string) {
  if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') {
    console.error("safeJSONParse: Empty or invalid input string");
    return null;
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    try {
      // Remove markdown code blocks if present
      let cleanedString = jsonString
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      // Try to extract JSON from text that might have extra content
      // Find the first { and last } to extract the JSON object
      const firstBrace = cleanedString.indexOf('{');
      const lastBrace = cleanedString.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedString = cleanedString.substring(firstBrace, lastBrace + 1);
      } else {
        // If no braces found, try to find array
        const firstBracket = cleanedString.indexOf('[');
        const lastBracket = cleanedString.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          cleanedString = cleanedString.substring(firstBracket, lastBracket + 1);
        }
      }

      // Remove any leading/trailing non-JSON content
      cleanedString = cleanedString
        .replace(/^[^{[]*/, "")
        .replace(/[^}\]]*$/, "");

      if (cleanedString.trim() === '') {
        console.error("safeJSONParse: No JSON content found after cleaning");
        return null;
      }

      return JSON.parse(cleanedString);
    } catch (innerError: any) {
      console.error("Failed to parse JSON after cleaning:", innerError);
      console.error("Original string length:", jsonString.length);
      console.error("Original string preview (first 500 chars):", jsonString.substring(0, 500));
      console.error("Original string preview (last 500 chars):", jsonString.substring(Math.max(0, jsonString.length - 500)));
      
      // Check if error is due to incomplete JSON (truncated response)
      if (innerError.message?.includes("Unexpected end of JSON input") || 
          innerError.message?.includes("end of data")) {
        console.error("JSON appears to be incomplete/truncated - this indicates an incomplete API response");
      }
      
      return null;
    }
  }
}

export function removeNewLinesAndEmptyLines(jsonString: string) {
  let cleanedString = jsonString.replace(/\\n/g, "");

  cleanedString = cleanedString
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("");

  cleanedString = cleanedString
    .replace(/\s*:\s*/g, ": ")
    .replace(/\s*,\s*/g, ", ");

  cleanedString = cleanedString.replace(/\s\s+/g, " ");

  return cleanedString;
}

export function cleanHTMLString(htmlString: string) {
  // Use a regular expression to remove ```html at the start and ``` at the end
  return htmlString.replaceAll(/^```html\s*|\s*```$/g, "");
}

export const cleanLine = (line: string) =>
  line.replace(/\s*Source:?\s*/gi, "").trim();

export const stripHtmlAndMarkdown = (content: string) => {
  // Create a temporary div to parse HTML
  const temp = document.createElement("div");
  temp.innerHTML = content;

  // Get the text content (this automatically strips all HTML tags)
  let plainText = temp.textContent || temp.innerText || "";

  // Now strip any remaining markdown syntax
  plainText = plainText
    // Remove headings (### Heading → Heading)
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold (**text** or __text__)
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    // Remove italic (*text* or _text_)
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Remove strikethrough (~~text~~)
    .replace(/~~(.*?)~~/g, "$1")
    // Remove inline code (`text`)
    .replace(/`([^`]+)`/g, "$1")
    // Remove code blocks (```language\ncode\n```)
    .replace(/```[\s\S]*?```/g, "")
    // Remove links [text](url) → text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    // Remove images ![alt](url) → alt
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, "$1")
    // Remove blockquotes (> text)
    .replace(/^\>\s?/gm, "")
    // Remove horizontal rules (--- or ***)
    .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "")
    // Remove bullet lists (* item or - item)
    .replace(/^[\*\-\+]\s+/gm, "")
    // Remove numbered lists (1. item)
    .replace(/^\d+\.\s+/gm, "")
    // Clean up extra whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return plainText;
};

/**
 * Best-effort sanitizer for JSON strings that may contain invalid escape sequences
 * produced by LLMs (e.g. \' or \xNN or \*). This attempts to transform them into
 * valid JSON escapes or remove the extra backslash while preserving content.
 * 
 * This function processes the string character by character to properly handle
 * escaped backslashes and other edge cases.
 */
function sanitizePotentiallyInvalidJsonEscapes(input: string): string {
  let result = "";
  let i = 0;
  
  // Valid JSON escape sequences: \" \\ \/ \b \f \n \r \t \uXXXX
  const validEscapes = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u']);
  
  while (i < input.length) {
    if (input[i] === '\\' && i + 1 < input.length) {
      const nextChar = input[i + 1];
      
      // Handle \uXXXX unicode escapes (4 hex digits)
      if (nextChar === 'u' && i + 5 < input.length) {
        const hexDigits = input.substring(i + 2, i + 6);
        if (/^[0-9A-Fa-f]{4}$/.test(hexDigits)) {
          result += input.substring(i, i + 6);
          i += 6;
          continue;
        }
      }
      
      // Handle \xNN hex escapes (convert to \u00NN)
      if (nextChar === 'x' && i + 3 < input.length) {
        const hexDigits = input.substring(i + 2, i + 4);
        if (/^[0-9A-Fa-f]{2}$/.test(hexDigits)) {
          result += `\\u00${hexDigits}`;
          i += 4;
          continue;
        }
      }
      
      // Handle valid escape sequences
      if (validEscapes.has(nextChar)) {
        result += input.substring(i, i + 2);
        i += 2;
        continue;
      }
      
      // Handle invalid escape sequences
      // Replace \' with ' (single quotes don't need escaping in JSON)
      if (nextChar === "'") {
        result += "'";
        i += 2;
        continue;
      }
      
      // For any other invalid escape, remove the backslash and keep the character
      // This handles cases like \s, \*, \?, etc.
      result += nextChar;
      i += 2;
      continue;
    }
    
    // Regular character, copy as-is
    result += input[i];
    i++;
  }
  
  return result;
}

/**
 * Specialized JSON parser for ReviewAuditProjectBrief
 * Simplified version that relies on proper JSON formatting from the AI
 */
export function safeJSONParseForAuditProjectBrief(jsonString: string) {
  if (!jsonString || typeof jsonString !== "string") {
    return null;
  }

  let cleanedString = jsonString.trim();

  // Remove markdown code blocks if present
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.slice(7, -3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.slice(3, -3).trim();
  }

  // Remove any leading/trailing non-JSON content
  const firstBrace = cleanedString.indexOf("{");
  const lastBrace = cleanedString.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanedString = cleanedString.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleanedString);
  } catch (error) {
    try {
      // Fallback: try to extract just the JSON object
      const cleanedString2 = cleanedString
        .replace(/^[^{]*/, "")
        .replace(/[^}]*$/, "");
      return JSON.parse(cleanedString2);
    } catch (innerError) {
      console.error("Failed to parse JSON:", innerError);
      return null;
    }
  }
}

/**
 * Parses section-based audit response JSON
 * Expected format: { "sectionName": "...", "auditQuestions": [...] }
 */
export function parseSectionAuditResponseJSON(responseContent: string) {
  if (!responseContent || typeof responseContent !== "string") {
    return null;
  }

  let cleanedString = responseContent.trim();

  // Remove markdown code blocks if present
  if (cleanedString.startsWith("```json") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.slice(7, -3).trim();
  } else if (cleanedString.startsWith("```") && cleanedString.endsWith("```")) {
    cleanedString = cleanedString.slice(3, -3).trim();
  }

  // Find JSON object boundaries
  const firstBrace = cleanedString.indexOf("{");
  const lastBrace = cleanedString.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanedString = cleanedString.substring(firstBrace, lastBrace + 1);
  }

  try {
    const sanitized = sanitizePotentiallyInvalidJsonEscapes(cleanedString);
    const parsed = JSON.parse(sanitized);
    
    // Validate structure
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      parsed.sectionName &&
      Array.isArray(parsed.auditQuestions)
    ) {
      return parsed;
    }
  } catch (error) {
    // Try fallback extraction
    try {
      const fallbackJson = cleanedString
        .replace(/^[^{]*/, "")
        .replace(/[^}]*$/, "");
      const sanitizedFallback = sanitizePotentiallyInvalidJsonEscapes(
        fallbackJson.trim()
      );
      const parsed = JSON.parse(sanitizedFallback);
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        parsed.sectionName &&
        Array.isArray(parsed.auditQuestions)
      ) {
        return parsed;
      }
    } catch (innerError) {
      console.error("Failed to parse section audit JSON:", innerError);
    }
  }

  return null;
}

/**
 * Robust JSON parser for Audit Project Brief that handles markdown code blocks
 * embedded in text and extracts JSON from mixed content responses. It also
 * sanitizes common invalid escape sequences produced by LLMs.
 * 
 * This function uses multiple strategies to extract and parse JSON, ensuring
 * maximum compatibility with AI-generated responses.
 * 
 * Supports both old format (auditQuestions array) and new format (section-based).
 */
export function parseAuditProjectBriefJSON(responseContent: string) {
  if (!responseContent || typeof responseContent !== "string") {
    return null;
  }

  let cleanedString = responseContent.trim();

  // Step 1: Try to extract JSON from markdown code blocks (even if embedded in text)
  // Match ```json ... ``` or ``` ... ``` patterns anywhere in the string
  const jsonCodeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const jsonMatch = cleanedString.match(jsonCodeBlockRegex);
  if (jsonMatch && jsonMatch[1]) {
    cleanedString = jsonMatch[1].trim();
  }

  // Step 2: Find JSON object boundaries using balanced braces
  const firstBrace = cleanedString.indexOf("{");
  const lastBrace = cleanedString.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    // Try to find balanced braces to get the complete JSON object
    let braceCount = 0;
    let jsonStart = firstBrace;
    let jsonEnd = -1;

    for (let i = firstBrace; i < cleanedString.length; i++) {
      // Skip escaped characters
      if (cleanedString[i] === "\\" && i + 1 < cleanedString.length) {
        i++; // Skip the escaped character
        continue;
      }
      
      if (cleanedString[i] === "{") {
        braceCount++;
      } else if (cleanedString[i] === "}") {
        braceCount--;
        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }
    }

    if (jsonEnd !== -1) {
      cleanedString = cleanedString.substring(jsonStart, jsonEnd + 1);
    } else {
      // Fallback: use first { to last }
      cleanedString = cleanedString.substring(firstBrace, lastBrace + 1);
    }
  }

  // Step 3: Try parsing with sanitization
  cleanedString = cleanedString.trim();
  
  // Strategy 1: Direct parse with sanitization
  try {
    const sanitized = sanitizePotentiallyInvalidJsonEscapes(cleanedString);
    const parsed = JSON.parse(sanitized);
    // Validate it's an object with auditQuestions array (old format) or sections (new format)
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      (Array.isArray(parsed.auditQuestions) || Array.isArray(parsed.sections))
    ) {
      return parsed;
    }
  } catch (error) {
    // Continue to next strategy
  }

  // Strategy 2: More aggressive extraction - remove everything before first { and after last }
  try {
    const fallbackJson = cleanedString
      .replace(/^[^{]*/, "")
      .replace(/[^}]*$/, "");

    if (fallbackJson.trim().length > 0) {
      const sanitizedFallback = sanitizePotentiallyInvalidJsonEscapes(
        fallbackJson.trim()
      );
      const parsed = JSON.parse(sanitizedFallback);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (innerError) {
    // Continue to next strategy
  }

  // Strategy 3: Try to find JSON object using regex pattern matching
  try {
    // Look for JSON object pattern: { "auditQuestions": [...] } or { "sectionName": "...", "auditQuestions": [...] }
    const jsonObjectRegex = /\{\s*"(?:sectionName|auditQuestions)"\s*:[\s\S]*\}/;
    const jsonObjectMatch = responseContent.match(jsonObjectRegex);
    if (jsonObjectMatch && jsonObjectMatch[0]) {
      const sanitizedMatch = sanitizePotentiallyInvalidJsonEscapes(
        jsonObjectMatch[0]
      );
      const parsed = JSON.parse(sanitizedMatch);
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        (Array.isArray(parsed.auditQuestions) || Array.isArray(parsed.sections))
      ) {
        return parsed;
      }
    }
  } catch (regexError) {
    // Continue to next strategy
  }

  // Strategy 4: Try parsing the original response content directly
  try {
    const sanitizedOriginal = sanitizePotentiallyInvalidJsonEscapes(responseContent);
    const parsed = JSON.parse(sanitizedOriginal);
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      (Array.isArray(parsed.auditQuestions) || Array.isArray(parsed.sections))
    ) {
      return parsed;
    }
  } catch (originalError) {
    // Continue to next strategy
  }

  // Strategy 5: Last resort - try to manually reconstruct JSON from the response
  // This is a fallback for cases where the JSON is severely malformed
  try {
    // Extract just the JSON-like structure using a more permissive regex
    const permissiveJsonRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/;
    const permissiveMatch = responseContent.match(permissiveJsonRegex);
    if (permissiveMatch && permissiveMatch[0]) {
      const sanitizedPermissive = sanitizePotentiallyInvalidJsonEscapes(
        permissiveMatch[0]
      );
      const parsed = JSON.parse(sanitizedPermissive);
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        (Array.isArray(parsed.auditQuestions) || Array.isArray(parsed.sections))
      ) {
        return parsed;
      }
    }
  } catch (permissiveError) {
    // All strategies failed
  }

  // If all strategies fail, log the error and return null
  console.error("Failed to parse JSON after all attempts");
  console.error("Original content (first 500 chars):", responseContent.substring(0, 500));
  console.error("Cleaned content (first 500 chars):", cleanedString.substring(0, 500));
  return null;
}

/**
 * Parses sections from the sections string
 * Format: "SectionName,Description\nSectionName2,Description2"
 */
export function parseSections(sectionsString: string): Array<{ name: string; description: string }> {
  if (!sectionsString || typeof sectionsString !== "string") {
    return [];
  }

  const sections: Array<{ name: string; description: string }> = [];
  const lines = sectionsString.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length >= 1 && parts[0]) {
      sections.push({
        name: parts[0],
        description: parts.slice(1).join(", ") || "",
      });
    }
  }

  return sections;
}

/**
 * Parses questions and groups them by section
 * Questions string format: "Section Name,,\nQuestion1,,\nQuestion2,,\nIf yes...,,\nIf no...,,\nNext Section,,\n..."
 * This function ensures ALL questions including conditional sub-questions are captured
 */
export function parseQuestionsBySection(
  questionsString: string,
  sections: Array<{ name: string; description: string }>
): Map<string, string[]> {
  const questionsBySection = new Map<string, string[]>();

  if (!questionsString || typeof questionsString !== "string") {
    return questionsBySection;
  }

  // Initialize all sections with empty arrays
  sections.forEach((section) => {
    questionsBySection.set(section.name, []);
  });

  // Split by double commas (,,) - this is the primary delimiter
  // Split and clean up each part
  const parts = questionsString
    .split(",,")
    .map((p) => p.trim())
    .filter((p) => p && p.length > 0);

  let currentSection: string | null = null;
  const sectionNames = sections.map((s) => s.name);

  // Create a more robust section matching function
  // Be more lenient to avoid missing questions that might look like section headers
  const findMatchingSection = (text: string): string | null => {
    const textLower = text.toLowerCase().trim();
    
    // Skip very short text - likely not a section header
    if (textLower.length < 3) {
      return null;
    }
    
    // Try exact match first
    for (const sectionName of sectionNames) {
      if (textLower === sectionName.toLowerCase()) {
        return sectionName;
      }
    }
    
    // Try partial matches - but be more strict to avoid false positives
    for (const sectionName of sectionNames) {
      const sectionLower = sectionName.toLowerCase();
      
      // Only match if:
      // 1. Text starts with section name (most reliable)
      // 2. Text is exactly the section name (already checked above)
      // 3. Section name is a significant portion of the text (at least 70% match)
      if (textLower.startsWith(sectionLower)) {
        // Make sure it's not just a partial word
        // Check if there's a word boundary after the section name
        const remainingText = textLower.substring(sectionLower.length).trim();
        if (remainingText.length === 0 || /^[,\s]/.test(remainingText)) {
          return sectionName;
        }
      }
      
      // Also check if section name contains the text (for abbreviations)
      if (sectionLower.includes(textLower) && textLower.length >= 5) {
        const matchRatio = textLower.length / sectionLower.length;
        if (matchRatio > 0.7) {
          return sectionName;
        }
      }
    }
    
    return null;
  };

  // Helper function to check if a question starts with a section name prefix
  const extractSectionFromQuestion = (text: string): { sectionName: string | null; questionText: string } => {
    const textLower = text.toLowerCase().trim();
    
    // Check if the question starts with any section name followed by a colon
    for (const sectionName of sectionNames) {
      const sectionLower = sectionName.toLowerCase();
      // Check if text starts with section name followed by colon and space
      const prefixPattern = new RegExp(`^${sectionLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*`, 'i');
      if (prefixPattern.test(text)) {
        // Extract the question text after the section prefix
        const questionText = text.replace(prefixPattern, '').trim();
        return { sectionName, questionText };
      }
    }
    
    return { sectionName: null, questionText: text };
  };

  // Process each part
  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart || trimmedPart.length === 0) continue;

    // Check if this part is a section header
    let matchingSection = findMatchingSection(trimmedPart);
    
    // Explicit check for "Strategy Target Audience" and "Creative Considerations"
    // These are section headers and should never be added as questions
    if (!matchingSection) {
      const trimmedLower = trimmedPart.toLowerCase();
      for (const sectionName of sectionNames) {
        if (trimmedLower === sectionName.toLowerCase()) {
          matchingSection = sectionName;
          break;
        }
      }
    }

    if (matchingSection) {
      // This is a section header - update current section
      // This ensures questions following this header go to the correct section
      currentSection = matchingSection;
      // Skip adding section headers as questions - they're just markers
      continue;
    } else {
      // Check if this question starts with a section name prefix (e.g., "Strategy Target Audience:")
      const { sectionName: prefixedSection, questionText } = extractSectionFromQuestion(trimmedPart);
      
      let targetSection: string | null = currentSection;
      let questionToAdd = trimmedPart;
      
      // If question has a section prefix, assign it to that section
      // Don't update currentSection - keep it as is for subsequent questions
      if (prefixedSection) {
        targetSection = prefixedSection;
        questionToAdd = questionText; // Use the question text without the prefix
        
        // Remove the prefixed version from the current section if it exists there
        if (currentSection && currentSection !== prefixedSection) {
          const currentSectionQuestions = questionsBySection.get(currentSection) || [];
          const filteredQuestions = currentSectionQuestions.filter(
            (q: string) => q.toLowerCase().trim() !== trimmedPart.toLowerCase().trim()
          );
          questionsBySection.set(currentSection, filteredQuestions);
        }
      }
      
      if (targetSection) {
        // This is a question (including conditional sub-questions)
        // Add it to the target section
        // Don't skip anything - include ALL questions including:
        // - Regular questions
        // - Conditional questions (If yes..., If no..., If unknown...)
        // - Sub-questions
        // - Questions that start with special characters or are very short
        const existingQuestions = questionsBySection.get(targetSection) || [];
        
        // Only add if it's not already in the list (avoid duplicates)
        // Use a more lenient duplicate check - compare normalized versions
        const normalizedQuestion = questionToAdd.toLowerCase().trim();
        const isDuplicate = existingQuestions.some(
          (q) => q.toLowerCase().trim() === normalizedQuestion
        );
        
        if (!isDuplicate) {
          existingQuestions.push(questionToAdd);
          questionsBySection.set(targetSection, existingQuestions);
        }
      } else {
        // No current section yet - this might be a question before the first section
        // Assign to the first section to avoid losing questions
        if (sections.length > 0) {
          const firstSection = sections[0].name;
          const existingQuestions = questionsBySection.get(firstSection) || [];
          const normalizedPart = trimmedPart.toLowerCase().trim();
          const isDuplicate = existingQuestions.some(
            (q) => q.toLowerCase().trim() === normalizedPart
          );
          if (!isDuplicate) {
            existingQuestions.push(trimmedPart);
            questionsBySection.set(firstSection, existingQuestions);
          }
        }
      }
    }
  }

  return questionsBySection;
}

/**
 * Gets questions for a specific section
 */
export function getQuestionsForSection(
  questionsString: string,
  sectionName: string,
  allSections: Array<{ name: string; description: string }>
): string {
  const questionsBySection = parseQuestionsBySection(questionsString, allSections);
  const questions = questionsBySection.get(sectionName) || [];
  return questions.join("\n");
}
