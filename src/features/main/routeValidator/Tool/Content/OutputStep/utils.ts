import { TValidationIssue } from "../../../../../../types/response/routeValidator";
import { Issue, IssuesByRange } from "./types";
import { TYPE_TO_SEVERITY, ISSUE_TYPE_COLORS, DEFAULT_HIGHLIGHT_COLOR } from "./constants";
import { devWarn } from "../../../../../../utils/devLog";

/** Single source of truth: max chars for one highlightable range (avoids huge/wrong highlights). */
export const RANGE_MAX_LENGTH = 500;

/** Max ratio of search text to document length (reject document-level "issues"). */
export const SEARCH_TEXT_MAX_DOC_RATIO = 0.5;

/**
 * Validate that a wordRange is valid and highlightable. Used by issue processing and highlight checks.
 */
export const validateWordRange = (
  range: { start: number; end: number },
  documentText: string
): boolean => {
  if (!range || typeof range.start !== "number" || typeof range.end !== "number") return false;
  if (range.start < 0 || range.end <= range.start) return false;
  if (range.start >= documentText.length || range.end > documentText.length) return false;
  const text = documentText.substring(range.start, range.end);
  if (!text || text.trim().length === 0) return false;
  const len = range.end - range.start;
  if (len < 2) return false; // never highlight only one character
  if (len > RANGE_MAX_LENGTH) return false;
  return true;
};

/**
 * Build a mapping from plain text positions to HTML text node positions
 * This is the same logic used in TextHighlighter for highlighting
 */
const buildTextPositionMapping = (
  tempDiv: HTMLDivElement,
  plainText: string
): Array<{ node: Text; plainStart: number; plainEnd: number }> => {
  const mapping: Array<{ node: Text; plainStart: number; plainEnd: number }> = [];
  const walker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_TEXT,
    null
  );

  let plainTextIndex = 0;
  let node;

  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      const nodeText = node.textContent;

      // Try to find this text in the plain text starting from current position
      const searchStart = Math.max(0, plainTextIndex - 10);
      const foundIndex = plainText.indexOf(nodeText, searchStart);

      if (foundIndex !== -1) {
        const nodePlainEnd = foundIndex + nodeText.length;
        mapping.push({
          node: node as Text,
          plainStart: foundIndex,
          plainEnd: nodePlainEnd
        });
        plainTextIndex = nodePlainEnd;
      } else {
        // If exact match not found, use current position and advance
        const nodePlainEnd = plainTextIndex + nodeText.length;
        mapping.push({
          node: node as Text,
          plainStart: plainTextIndex,
          plainEnd: nodePlainEnd
        });
        plainTextIndex = nodePlainEnd;
      }
    }
  }

  return mapping;
};

/**
 * Validates if an issue can be successfully highlighted in the document
 * Uses the SAME logic as TextHighlighter to ensure consistency
 * 
 * @param issue - The issue to validate
 * @param documentText - The plain text of the document
 * @param documentHtml - The HTML content of the document (optional)
 * @returns true if the issue can be highlighted, false otherwise
 */
export const canHighlightIssue = (
  issue: Issue,
  documentText: string,
  documentHtml?: string
): boolean => {
  // For screenshots, check coordinates - but ONLY if it's not a default position (50, 50)
  // Default position of (50, 50) is set when no coordinates are provided
  // Real screenshot coordinates should be more varied
  const hasRealCoordinates = issue.position &&
    typeof issue.position.x === 'number' &&
    typeof issue.position.y === 'number' &&
    !(issue.position.x === 50 && issue.position.y === 50); // Exclude default position


  // CRITICAL: For Word documents with text location, we MUST have wordRange
  // Don't rely on position for text-based issues
  // Only return true for coordinates if there's no wordRange (screenshot mode)
  if (hasRealCoordinates && !issue.wordRange) {
    return true;
  }

  // CRITICAL: For Word documents, ALL comments MUST have wordRange - no exceptions
  // This ensures no "dead comments" that aren't linked to text
  if (!issue.wordRange) {
    devWarn(`[canHighlightIssue] Issue ${issue.id} rejected - no wordRange`);
    return false;
  }

  if (!validateWordRange(issue.wordRange, documentText)) {
    devWarn(`[canHighlightIssue] Issue ${issue.id} rejected - invalid wordRange`);
    return false;
  }

  const range = issue.wordRange;
  const { start, end } = range;
  const rangeText = documentText.substring(start, end);

  // If HTML is provided, simulate the exact highlighting logic
  if (documentHtml) {
    try {
      // Create a temporary DOM to check if highlighting would work
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = documentHtml;

      // Build mapping from plain text positions to HTML text nodes
      // This is the SAME logic used in TextHighlighter
      const positionMapping = buildTextPositionMapping(tempDiv, documentText);

      // Try to find which text node contains this range
      let targetNode: Text | null = null;
      let targetStartInNode = -1;
      let targetEndInNode = -1;

      for (const { node, plainStart, plainEnd } of positionMapping) {
        // Check if our range overlaps with this text node's plain text range
        if (start < plainEnd && end > plainStart) {
          targetNode = node;
          const nodeText = node.textContent || "";

          // Try to find the exact text in the node
          const expectedText = documentText.substring(start, end);
          const nodeStartInPlain = Math.max(0, start - plainStart);
          const nodeEndInPlain = Math.min(nodeText.length, end - plainStart);

          // Try exact match first
          let foundStart = nodeText.indexOf(expectedText, Math.max(0, nodeStartInPlain - 5));
          if (foundStart !== -1 && foundStart < nodeEndInPlain) {
            targetStartInNode = foundStart;
            targetEndInNode = foundStart + expectedText.length;
          } else {
            // Fallback to calculated position
            targetStartInNode = Math.max(0, nodeStartInPlain);
            targetEndInNode = Math.min(nodeText.length, nodeEndInPlain);
          }

          break;
        }
      }

      // If we couldn't find a target node, highlighting will fail
      if (!targetNode || targetStartInNode < 0 || targetEndInNode <= targetStartInNode) {
        devWarn(`[canHighlightIssue] Issue ${issue.id} cannot be highlighted - no valid text node`, {
          rangeText: rangeText.substring(0, 50),
          range,
          foundNode: !!targetNode,
          targetStartInNode,
          targetEndInNode
        });
        return false;
      }

      // Check if already inside a highlight span (would be skipped by highlighter)
      let parent = targetNode.parentElement;
      while (parent && parent !== tempDiv) {
        if (parent.hasAttribute('data-issue-ids')) {
          // Already highlighted, would be skipped
          return false;
        }
        parent = parent.parentElement;
      }

      return true;
    } catch (error) {
      console.error(`[canHighlightIssue] Error validating issue ${issue.id}:`, error);
      return false;
    }
  }

  // If no HTML, just validate the range is valid
  return true;
};

/**
 * Convert API validation issue to component Issue format
 * 
 * @param validationIssue - The issue from the API
 * @param index - Index of the issue in the task's issues array
 * @param taskName - Name of the task (e.g., "seo", "wcag") - used for unique ID generation
 */
export const convertValidationIssueToIssue = (
  validationIssue: TValidationIssue,
  index: number,
  taskName?: string
): Issue => {
  // Use severity from API response if available, otherwise fall back to type-based mapping
  const severity = validationIssue.severity !== undefined
    ? validationIssue.severity
    : (TYPE_TO_SEVERITY[validationIssue.type.toLowerCase()] || 5);

  // Ensure severity is within valid range (1-10)
  const normalizedSeverity = Math.max(1, Math.min(10, severity));

  // Calculate position from coordinates if available, otherwise use default
  let position = { x: 50.0, y: 50.0 };
  if (validationIssue.location?.coordinates) {
    position = {
      x: validationIssue.location.coordinates.x,
      y: validationIssue.location.coordinates.y,
    };
  }

  // CRITICAL: Create unique ID using task name to avoid collisions
  // When multiple tasks (SEO + WCAG) both have issue id=1, they would collide without task prefix
  const uniqueId = taskName
    ? `issue-${taskName}-${validationIssue.id}`
    : `issue-${validationIssue.id}`;

  return {
    id: uniqueId,
    type: validationIssue.type,
    severity: normalizedSeverity,
    body: {
      issue: validationIssue.issue,
      reasoning: validationIssue.reasoning,
      recommendation: validationIssue.recommendation,
    },
    position,
    wordRange: undefined, // Will be calculated when we have the document text
    reviewStatus: "not_reviewed", // Default review status
  };
};

/**
 * Normalize text by collapsing whitespace for matching
 * Also handles various whitespace characters (non-breaking spaces, tabs, etc.)
 */
export const normalizeText = (text: string): string => {
  return text
    .replace(/[\s\u00A0\u2000-\u200B\u2028\u2029\uFEFF]+/g, " ") // Normalize all whitespace types
    .trim();
};

// Apostrophe/quote variants for Word docs (straight, curly, backtick, modifier letter)
const SINGLE_QUOTE_NORM = /[\u0027\u2018\u2019\u201A\u201B\u2032`]/g;
const DOUBLE_QUOTE_NORM = /[\u0022\u201C\u201D\u201E\u201F\u2033]/g;

/**
 * Normalize text for word matching - removes punctuation and extra whitespace.
 * Handles all Word apostrophe/quote variants (straight ', curly ', ").
 */
export const normalizeForWordMatch = (text: string): string => {
  return text
    .toLowerCase()
    .replace(DOUBLE_QUOTE_NORM, '"')
    .replace(SINGLE_QUOTE_NORM, "'")
    .replace(/[–—]/g, "-")
    .replace(/[^\w\s'-]/g, " ")
    .replace(/[\s\u00A0\u2000-\u200B\u2028\u2029\uFEFF]+/g, " ")
    .trim();
};

/**
 * Tokenize text into words for matching
 */
export const tokenizeText = (text: string): string[] => {
  return normalizeForWordMatch(text)
    .split(" ")
    .filter(word => word.length > 0);
};

/**
 * Calculate similarity score between two strings (0-1)
 * Uses Levenshtein-based similarity
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Simple word overlap similarity
  const words1 = new Set(tokenizeText(s1));
  const words2 = new Set(tokenizeText(s2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let overlap = 0;
  words1.forEach(word => {
    if (words2.has(word)) overlap++;
  });

  return (2 * overlap) / (words1.size + words2.size);
};

/**
 * Find a sequence of words in the document and return character positions
 * This is the primary matching strategy for word documents
 * Improved to handle spacing, punctuation, and minor variations
 */
export const findWordSequenceInDocument = (
  documentText: string,
  searchWords: string[]
): { start: number; end: number } | null => {
  if (searchWords.length === 0) return null;

  const docLower = documentText.toLowerCase();

  // Find all occurrences of the first word
  const firstWord = searchWords[0];
  let searchPos = 0;

  while (searchPos < docLower.length) {
    // Find next occurrence of first word (try with word boundary first, then without)
    let wordPattern = new RegExp(`\\b${escapeRegExp(firstWord)}\\b`, 'gi');
    wordPattern.lastIndex = searchPos;
    let match = wordPattern.exec(docLower);

    // If word boundary match fails, try without boundary (handles punctuation/compound words)
    if (!match) {
      wordPattern = new RegExp(escapeRegExp(firstWord), 'gi');
      wordPattern.lastIndex = searchPos;
      match = wordPattern.exec(docLower);
    }

    if (!match) break;

    const startIndex = match.index;

    // Try to match the rest of the sequence from this position
    let currentPos = startIndex;
    let allWordsFound = true;
    let lastMatchEnd = startIndex;

    for (let i = 0; i < searchWords.length; i++) {
      const word = searchWords[i].toLowerCase();

      // Increase search region for better tolerance (was 50, now 100)
      const searchRegion = docLower.substring(currentPos, Math.min(currentPos + word.length + 100, docLower.length));

      // Try word boundary match first
      let wordMatch = searchRegion.match(new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i'));

      if (wordMatch && wordMatch.index !== undefined) {
        lastMatchEnd = currentPos + wordMatch.index + word.length;
        currentPos = lastMatchEnd;
      } else {
        // Try without word boundary (handles punctuation, compound words)
        wordMatch = searchRegion.match(new RegExp(escapeRegExp(word), 'i'));
        if (wordMatch && wordMatch.index !== undefined && wordMatch.index < 80) {
          lastMatchEnd = currentPos + wordMatch.index + word.length;
          currentPos = lastMatchEnd;
        } else {
          // Word not found in expected region, try more lenient match (substring)
          const lenientMatch = searchRegion.toLowerCase().indexOf(word);
          if (lenientMatch !== -1 && lenientMatch < 80) {
            lastMatchEnd = currentPos + lenientMatch + word.length;
            currentPos = lastMatchEnd;
          } else {
            allWordsFound = false;
            break;
          }
        }
      }
    }

    if (allWordsFound) {
      // Find the actual end position in original text
      const endIndex = findActualEndPosition(documentText, startIndex, lastMatchEnd);
      return { start: startIndex, end: endIndex };
    }

    searchPos = startIndex + 1;
  }

  return null;
};

/**
 * Find word sequence in document with markup tag awareness
 * Specifically looks for text that appears after markup tags like [link], [button]
 */
const findWordSequenceWithMarkup = (
  documentText: string,
  searchWords: string[]
): { start: number; end: number } | null => {
  if (searchWords.length === 0) return null;

  const markupTagPattern = /\[(?:link|button|h[1-6]|p|div|span|a|strong|em|b|i|ul|ol|li|br|hr)\]/gi;

  // Find all markup tags in the document
  let match;
  markupTagPattern.lastIndex = 0; // Reset regex

  while ((match = markupTagPattern.exec(documentText)) !== null) {
    const markupEnd = match.index + match[0].length;

    // Skip whitespace after markup
    let textStart = markupEnd;
    while (textStart < documentText.length && /\s/.test(documentText[textStart])) {
      textStart++;
    }

    // Try to match the search words starting from after the markup
    const afterMarkup = documentText.substring(textStart);
    const afterMarkupLower = afterMarkup.toLowerCase();

    // Find first word - try with word boundary first
    const firstWord = searchWords[0].toLowerCase();

    // Try word boundary match first
    let firstWordPattern = new RegExp(`\\b${escapeRegExp(firstWord)}\\b`, 'i');
    let firstWordMatch = afterMarkupLower.match(firstWordPattern);
    let firstWordIndex = firstWordMatch ? (firstWordMatch.index || -1) : -1;

    // If word boundary fails, try without boundary
    if (firstWordIndex === -1) {
      firstWordIndex = afterMarkupLower.indexOf(firstWord);
    }

    if (firstWordIndex !== -1 && firstWordIndex < 100) {
      // Found first word, try to match the rest
      let currentPos = textStart + firstWordIndex;
      let allWordsFound = true;
      let lastMatchEnd = currentPos;

      for (let i = 0; i < searchWords.length; i++) {
        const word = searchWords[i].toLowerCase();
        const remaining = documentText.substring(currentPos).toLowerCase();

        // Try word boundary match first
        let wordPattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i');
        let wordMatch = remaining.match(wordPattern);
        let wordIndex = wordMatch ? (wordMatch.index || -1) : -1;

        // If word boundary fails, try without boundary
        if (wordIndex === -1) {
          wordIndex = remaining.indexOf(word);
        }

        if (wordIndex !== -1 && wordIndex < 100) {
          lastMatchEnd = currentPos + wordIndex + word.length;
          currentPos = lastMatchEnd;
        } else {
          allWordsFound = false;
          break;
        }
      }

      if (allWordsFound) {
        const startIndex = textStart + firstWordIndex;
        const endIndex = findActualEndPosition(documentText, startIndex, lastMatchEnd);
        return { start: startIndex, end: endIndex };
      }
    }
  }

  return null;
};

/**
 * Find actual end position considering the matched text
 */
const findActualEndPosition = (
  documentText: string,
  start: number,
  approximateEnd: number
): number => {
  // Extend to the end of the last word
  let end = approximateEnd;
  while (end < documentText.length && /\w/.test(documentText[end])) {
    end++;
  }
  return end;
};

/**
 * Escape special regex characters
 */
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Normalize quotes and punctuation for better matching
 * Handles different quote styles, apostrophes, dashes, etc.
 * Enhanced to handle more edge cases
 */
const normalizeQuotesAndPunctuation = (text: string): string => {
  return text
    .replace(DOUBLE_QUOTE_NORM, '"')  // Normalize all quote types to standard quote
    .replace(SINGLE_QUOTE_NORM, "'")     // Normalize all apostrophes
    .replace(/[–—]/g, "-")      // Normalize em/en dashes to hyphen
    .replace(/…/g, "...")       // Normalize ellipsis
    .replace(/[^\S\r\n]+/g, " ") // Normalize all whitespace types to single space
    .replace(/\s+/g, " ")       // Normalize whitespace
    .trim();
};

/**
 * Extract potential search text from issue body
 * Tries to find quoted text or key phrases that might match document text
 * Enhanced to handle button text and UI element text
 */
export const extractSearchTextFromIssue = (issue: {
  issue?: string;
  reasoning?: string;
  recommendation?: string;
}): string[] => {
  const candidates: string[] = [];

  // Strategy 1: Look for quoted text in issue description
  const issueText = issue.issue || "";
  const quotedMatches = issueText.match(/[""'"]([^""'"]+)[""'"']/g);
  if (quotedMatches) {
    quotedMatches.forEach(match => {
      const text = match.replace(/[""'"']/g, "").trim();
      if (text.length > 2 && text.length < 200) {
        candidates.push(text);
      }
    });
  }

  // Strategy 1.5: Look for button text patterns (e.g., "button text: Click here", "text 'Submit'")
  const buttonPatterns = [
    /button\s+text[:\s]+[""'"']?([^""'"\n]+)[""'"']?/i,
    /text\s+[""'"']([^""'"\n]+)[""'"']/i,
    /[""'"']([^""'"\n]{2,50})[""'"']\s+(?:button|link|text)/i,
    /(?:button|link|text)\s+[""'"']([^""'"\n]{2,50})[""'"']/i,
  ];

  buttonPatterns.forEach(pattern => {
    const matches = issueText.match(pattern);
    if (matches && matches[1]) {
      const text = matches[1].trim();
      if (text.length > 2 && text.length < 100) {
        candidates.push(text);
      }
    }
  });

  // Strategy 2: Extract first sentence or phrase from issue (often contains the problematic text)
  const firstSentence = issueText.split(/[.!?]\s+/)[0];
  if (firstSentence && firstSentence.length > 5 && firstSentence.length < 150) {
    // Remove common prefixes like "Issue:", "Problem:", etc.
    const cleaned = firstSentence
      .replace(/^(Issue|Problem|Error|Warning|Button|Link|Text):\s*/i, "")
      .replace(/\s+(?:button|link|text)$/i, "")
      .trim();
    if (cleaned.length > 5) {
      candidates.push(cleaned);
    }
  }

  // Strategy 3: Extract key phrases from reasoning (often mentions specific text)
  if (issue.reasoning) {
    const reasoningSentences = issue.reasoning.split(/[.!?]\s+/);
    reasoningSentences.forEach(sentence => {
      // Look for sentences that mention "text", "button", "link" or contain quoted content
      const hasTextMention = /(?:text|button|link|says|reads|displays?|shows?)/i.test(sentence);
      if (hasTextMention || sentence.match(/[""'"']/)) {
        // Try to extract quoted text first
        const quoted = sentence.match(/[""'"]([^""'"]+)[""'"']/);
        if (quoted && quoted[1].length > 2 && quoted[1].length < 200) {
          candidates.push(quoted[1]);
        }

        // Extract text after "text:", "button:", "says:", etc.
        const afterColon = sentence.match(/(?:text|button|link|says?|reads?|displays?|shows?)[:\s]+[""'"']?([^""'"\n]{2,50})[""'"']?/i);
        if (afterColon && afterColon[1]) {
          const text = afterColon[1].trim();
          if (text.length > 2 && text.length < 100) {
            candidates.push(text);
          }
        }
      }
    });
  }

  // Strategy 4: Extract first 3-8 words from issue (often the problematic text)
  const words = issueText.split(/\s+/).filter(w => w.length > 0);
  if (words.length >= 2) {
    // Try different lengths
    for (let len = Math.min(8, words.length); len >= 2; len--) {
      const phrase = words.slice(0, len).join(" ");
      // Skip if it's just a prefix like "Issue:", "Button text:", etc.
      if (!/^(issue|problem|error|warning|button|link|text):\s*$/i.test(phrase)) {
        if (phrase.length > 3 && phrase.length < 100) {
          candidates.push(phrase);
        }
      }
    }
  }

  // Strategy 5: Extract from recommendation if it mentions specific text
  if (issue.recommendation) {
    const recQuoted = issue.recommendation.match(/[""'"]([^""'"]+)[""'"']/g);
    if (recQuoted) {
      recQuoted.forEach(match => {
        const text = match.replace(/[""'"']/g, "").trim();
        if (text.length > 2 && text.length < 100) {
          candidates.push(text);
        }
      });
    }
  }

  // Remove duplicates and return
  return Array.from(new Set(candidates));
};

/**
 * Extract the exact phrase to change from recommendation (e.g. "Change '7 Topics:' to 'Seven Topics:'").
 * When the backend sends a wrong location.text (e.g. line above: "PhD"), we must prefer the quoted
 * phrase from the recommendation so we highlight "7 Topics:" not "PhD".
 */
export const extractQuotedPhraseFromRecommendation = (issue: {
  recommendation?: string;
  reasoning?: string;
  issue?: string;
}): string[] => {
  const candidates: string[] = [];
  const text = issue.recommendation || issue.reasoning || issue.issue || "";
  // Quote chars: straight + curly single (') and double (", \u201C, \u201D) so all Word cases are covered
  const q = "['\"\u2018\u2019\u201C\u201D]";
  const notQ = "[^'\"\u2018\u2019\u201C\u201D]";
  const changePattern = new RegExp(`(?:change|replace|use)\\s+${q}(${notQ}{1,80})${q}\\s+(?:to|with)`, "gi");
  const headingPattern = new RegExp(`(?:heading|title|text)\\s+${q}(${notQ}{1,80})${q}`, "gi");
  let m;
  while ((m = changePattern.exec(text)) !== null) {
    const phrase = m[1].trim();
    if (phrase.length >= 1 && phrase.length <= 80) candidates.push(phrase);
  }
  while ((m = headingPattern.exec(text)) !== null) {
    const phrase = m[1].trim();
    if (phrase.length >= 1 && phrase.length <= 80) candidates.push(phrase);
  }
  const quotedRegex = new RegExp(`${q}(${notQ}{2,80})${q}`, "g");
  let qm;
  while ((qm = quotedRegex.exec(text)) !== null) {
    const phrase = qm[1].trim();
    if (phrase.length >= 2 && phrase.length <= 80) candidates.push(phrase);
  }
  return Array.from(new Set(candidates));
};

/** Max length for a key term (abbreviation or quoted phrase). */
const MAX_KEY_TERM_LENGTH = 25;
const MIN_KEY_TERM_LENGTH = 2;

/** Only shrink to key term when term is short (abbreviation-like). Longer phrases stay full (e.g. "Quality of life"). */
const MAX_SHRINK_KEY_TERM_LENGTH = 10;

/**
 * Extract key terms from issue (e.g. quoted abbreviations "RCC", words in single quotes)
 * Used to prefer the occurrence that actually contains the issue subject, so we don't
 * highlight the wrong line (e.g. "Follow-Up" when the issue is about "RCC").
 * Single source of truth for patterns: straight quotes, curly quotes, "abbreviation 'X'".
 */
export const extractKeyTermsFromIssue = (issue: {
  issue?: string;
  reasoning?: string;
  recommendation?: string;
}): string[] => {
  const terms: string[] = [];
  const text = [issue.issue, issue.reasoning, issue.recommendation].filter(Boolean).join(" ");

  const pushTerm = (t: string) => {
    const s = t.trim();
    if (s.length >= MIN_KEY_TERM_LENGTH && s.length <= MAX_KEY_TERM_LENGTH) terms.push(s);
  };

  // Single-quoted: straight 'x' and curly ‘x’
  const singleQuoted = text.match(/'([^']{1,30})'|[\u2018]([^\u2019]{1,30})[\u2019]/g);
  if (singleQuoted) {
    singleQuoted.forEach((m) => {
      const t = m.replace(/^['\u2018]|['\u2019]$/g, "").trim();
      pushTerm(t);
    });
  }

  // Double-quoted: straight "x" and curly "x"
  const doubleQuoted = text.match(/[""]([^""]{1,30})[""]|[\u201C]([^\u201D]{1,30})[\u201D]/g);
  if (doubleQuoted) {
    doubleQuoted.forEach((m) => {
      const t = m.replace(/^[""\u201C]|[""\u201D]$/g, "").trim();
      pushTerm(t);
    });
  }

  // Explicit patterns: "abbreviation 'RCC'", "term 'X'", "the term 'Y'"
  const abbrevPattern = /(?:abbreviation|term|acronym)\s+['\u2018]([^'\u2019]{2,25})['\u2019]/gi;
  let match;
  while ((match = abbrevPattern.exec(text)) !== null) {
    pushTerm(match[1]);
  }

  // Heading/title phrases: "heading '7 Topics:'", "title 'X'" (so we prefer that occurrence)
  const headingQuoted = text.match(/(?:heading|title)\s+['""]([^'""]{1,30})['""]/gi);
  if (headingQuoted) {
    headingQuoted.forEach((m) => {
      const t = m.replace(/^(?:heading|title)\s+['""]|['""]$/gi, "").trim();
      pushTerm(t);
    });
  }

  return Array.from(new Set(terms));
};

/** Context chars around a match to check for key terms (same line / same phrase). */
const KEY_TERM_CONTEXT_CHARS = 60;

/**
 * Find the best occurrence of searchText in document when we have key terms from the issue.
 * Prefers the occurrence whose range (or nearby context) contains one of the key terms,
 * so we highlight the exact spot the issue refers to (e.g. "RCC") not another line.
 * Uses consistent lengths and bounds for predictability.
 */
export const findBestOccurrenceWithKeyTerms = (
  documentText: string,
  searchText: string,
  keyTerms: string[],
  range: { start: number; end: number }
): { start: number; end: number } => {
  if (keyTerms.length === 0) return range;

  const docLower = documentText.toLowerCase();
  const searchLower = searchText.toLowerCase().trim();
  const searchLen = searchLower.length;
  const keyTermsLower = keyTerms.filter((t) => t.length >= MIN_KEY_TERM_LENGTH).map((t) => t.toLowerCase());

  if (keyTermsLower.length === 0) return range;

  const rangeContainsKeyTerm = (start: number, end: number): boolean => {
    const ctxStart = Math.max(0, start - KEY_TERM_CONTEXT_CHARS);
    const ctxEnd = Math.min(documentText.length, end + KEY_TERM_CONTEXT_CHARS);
    const ctx = documentText.substring(ctxStart, ctxEnd).toLowerCase();
    return keyTermsLower.some((term) => ctx.includes(term));
  };

  if (rangeContainsKeyTerm(range.start, range.end)) return range;

  let pos = 0;
  let firstOccurrence: { start: number; end: number } | null = null;
  while (pos < docLower.length) {
    const idx = docLower.indexOf(searchLower, pos);
    if (idx === -1) break;
    const end = Math.min(idx + searchLen, documentText.length);
    if (rangeContainsKeyTerm(idx, end)) return { start: idx, end };
    if (!firstOccurrence) firstOccurrence = { start: idx, end };
    pos = idx + 1;
  }

  return firstOccurrence ?? range;
};

/** Words we should not highlight alone (would be wrong to highlight only "Landscape" or "life"). */
const AVOID_SHRINK_TO_SINGLE_WORD = new Set([
  "landscape", "life", "quality", "practice", "treatment", "considerations",
  "patterns", "insights", "study", "follow", "output", "input", "attempts",
]);

/**
 * Shrink range to the smallest span that still contains at least one key term.
 * Only shrinks when the key term is short (abbreviation-like, <= MAX_SHRINK_KEY_TERM_LENGTH)
 * so we keep full phrases like "Quality of life" or "Treatment Landscape" highlighted, not just one word.
 */
export const shrinkRangeToContainKeyTerm = (
  documentText: string,
  range: { start: number; end: number },
  keyTerms: string[]
): { start: number; end: number } => {
  if (keyTerms.length === 0) return range;

  const rangeLen = range.end - range.start;
  const segment = documentText.substring(range.start, range.end).toLowerCase();
  let best: { start: number; end: number } | null = null;
  let bestLen = rangeLen + 1;

  for (const term of keyTerms) {
    if (term.length < MIN_KEY_TERM_LENGTH || term.length > MAX_SHRINK_KEY_TERM_LENGTH) continue;
    const termLower = term.toLowerCase();
    let pos = 0;
    while (pos < segment.length) {
      const idx = segment.indexOf(termLower, pos);
      if (idx === -1) break;
      const absStart = range.start + idx;
      const absEnd = Math.min(range.start + idx + term.length, range.end);
      const len = absEnd - absStart;
      const shrunkText = documentText.substring(absStart, absEnd).toLowerCase().trim();
      const isSingleWord = /^\w+$/.test(shrunkText) && !shrunkText.includes(" ");
      const wouldShrinkToAvoidWord = isSingleWord && AVOID_SHRINK_TO_SINGLE_WORD.has(shrunkText);
      if (len < bestLen && !wouldShrinkToAvoidWord) {
        bestLen = len;
        best = { start: absStart, end: absEnd };
      }
      pos = idx + 1;
    }
  }

  return best ?? range;
};

/**
 * Find text position in document using multiple matching strategies
 * Returns the start and end position of the found text, or null if not found
 * 
 * CRITICAL: This function is essential for linking comments to text.
 * All issues must have a valid wordRange for the text-to-comment linking to work.
 * 
 * Strategies (in order):
 * 1. Exact match
 * 2. Case-insensitive exact match
 * 3. Normalized match (collapse whitespace)
 * 4. Quote/punctuation normalized match (handles different quote styles)
 * 5. Word-by-word sequence matching (primary for Word docs)
 * 6. Significant words matching (skip common words)
 * 7. Substring/partial matching
 * 8. Fuzzy word matching (handles minor variations)
 */
export const findTextInDocument = (
  documentText: string,
  searchText: string
): { start: number; end: number } | null => {
  if (!documentText || !searchText) {
    return null;
  }

  // Clean both texts - remove invisible characters and normalize whitespace
  const cleanDocText = documentText.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width chars
  const cleanSearchText = searchText.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();


  // Strategy 0: Direct case-insensitive search (most reliable)
  // This should catch most cases where the text exists but case differs
  const earlyDocLower = cleanDocText.toLowerCase();
  const earlySearchLower = cleanSearchText.toLowerCase();
  let directIndex = earlyDocLower.indexOf(earlySearchLower);
  if (directIndex !== -1) {
    return { start: directIndex, end: directIndex + cleanSearchText.length };
  }

  // Strategy 0.5: Try with normalized whitespace (collapse multiple spaces/newlines to single space)
  const earlyNormalizedDoc = cleanDocText.replace(/\s+/g, ' ');
  const earlyNormalizedSearch = cleanSearchText.replace(/\s+/g, ' ');
  const earlyNormalizedDocLower = earlyNormalizedDoc.toLowerCase();
  const earlyNormalizedSearchLower = earlyNormalizedSearch.toLowerCase();

  directIndex = earlyNormalizedDocLower.indexOf(earlyNormalizedSearchLower);
  if (directIndex !== -1) {
    // Map back to original document position
    const originalIndex = mapNormalizedWhitespaceIndex(cleanDocText, directIndex);
    if (originalIndex !== -1) {
      return { start: originalIndex, end: originalIndex + findMatchingEndPosition(cleanDocText, originalIndex, cleanSearchText) };
    }
  }

  // Strategy 1: Exact match (original text)
  let index = cleanDocText.indexOf(cleanSearchText);
  if (index !== -1) {
    return { start: index, end: index + cleanSearchText.length };
  }

  // Strategy 1.5: Match text that appears after markup tags (e.g., [link], [button], [h3])
  // This runs early because markup tags are very common in Word documents
  // Document: "[link] Review important information" or "[h3] Built for steady daily support"
  // AI returns: "Review important information" or "Built for steady daily support"
  // Should match by ignoring the markup prefix

  // Find all markup tags and check if searchText appears right after them
  const markupTagPattern = /\[(?:link|button|h[1-6]|p|div|span|a|strong|em|b|i|ul|ol|li|br|hr)\]/gi;
  const searchLower = searchText.toLowerCase().trim();
  const markupSearchWords = searchText.trim().split(/\s+/).filter(w => w.length > 0);

  // Reset regex lastIndex to ensure we search from the beginning
  markupTagPattern.lastIndex = 0;
  let markupMatch;

  while ((markupMatch = markupTagPattern.exec(documentText)) !== null) {
    const markupEnd = markupMatch.index + markupMatch[0].length;

    // Skip whitespace after markup
    let textStart = markupEnd;
    while (textStart < documentText.length && /\s/.test(documentText[textStart])) {
      textStart++;
    }

    // Check if the search text appears right after this markup tag
    const afterMarkup = documentText.substring(textStart);
    const afterMarkupLower = afterMarkup.toLowerCase();

    // Try exact match first (text starts immediately after markup)
    if (afterMarkupLower.startsWith(searchLower)) {
      return { start: textStart, end: textStart + searchText.length };
    }

    // Try word-by-word matching for better accuracy
    // This handles cases where there might be slight variations or extra whitespace
    if (markupSearchWords.length > 0) {
      let currentPos = textStart;
      let allWordsFound = true;
      let firstWordStart = -1;
      let lastWordEnd = -1;

      for (let i = 0; i < markupSearchWords.length; i++) {
        const word = markupSearchWords[i].toLowerCase();
        const remaining = documentText.substring(currentPos).toLowerCase();

        // Try to find the word with word boundary first
        const wordPattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i');
        const wordMatch = remaining.match(wordPattern);
        let wordIndex = wordMatch ? (wordMatch.index || -1) : -1;

        // If word boundary fails, try without boundary
        if (wordIndex === -1) {
          wordIndex = remaining.indexOf(word);
        }

        if (wordIndex !== -1 && wordIndex < 100) {
          if (i === 0) {
            firstWordStart = currentPos + wordIndex;
          }
          lastWordEnd = currentPos + wordIndex + word.length;
          currentPos = lastWordEnd;
        } else {
          allWordsFound = false;
          break;
        }
      }

      if (allWordsFound && firstWordStart !== -1 && lastWordEnd !== -1) {
        // Verify word boundaries
        const beforeChar = firstWordStart > 0 ? documentText[firstWordStart - 1] : ' ';
        const afterChar = lastWordEnd < documentText.length ? documentText[lastWordEnd] : ' ';

        // If surrounded by word boundaries or whitespace/markup, it's a good match
        if ((/\s|\[/.test(beforeChar) || firstWordStart === 0) && (/\s|\[|$/.test(afterChar) || lastWordEnd === documentText.length)) {
          return { start: firstWordStart, end: lastWordEnd };
        }
      }
    }

    // Fallback: Try flexible matching - find search text within reasonable distance (up to 50 chars)
    const flexibleIndex = afterMarkupLower.indexOf(searchLower);
    if (flexibleIndex !== -1 && flexibleIndex < 50) {
      // Verify it's a good match (not mid-word, etc.)
      const matchStart = textStart + flexibleIndex;
      const matchEnd = matchStart + searchText.length;

      // Check word boundaries for better accuracy
      const beforeChar = matchStart > 0 ? documentText[matchStart - 1] : ' ';
      const afterChar = matchEnd < documentText.length ? documentText[matchEnd] : ' ';

      // If surrounded by word boundaries or whitespace/markup, it's a good match
      if ((/\s|\[/.test(beforeChar) || matchStart === 0) && (/\s|\[|$/.test(afterChar) || matchEnd === documentText.length)) {
        return { start: matchStart, end: matchEnd };
      }
    }
  }

  // Also try a simpler pattern: find any closing bracket followed by whitespace and our text
  const afterBracketPattern = /\]\s+/g;
  let bracketMatch;
  afterBracketPattern.lastIndex = 0;

  while ((bracketMatch = afterBracketPattern.exec(documentText)) !== null) {
    const textStart = bracketMatch.index + bracketMatch[0].length;
    const afterBracket = documentText.substring(textStart);
    const searchLower = searchText.toLowerCase();
    const afterBracketLower = afterBracket.toLowerCase();

    // Check if search text appears right after this bracket
    if (afterBracketLower.startsWith(searchLower)) {
      return { start: textStart, end: textStart + searchText.length };
    }

    // Try within 50 characters
    const flexibleIndex = afterBracketLower.indexOf(searchLower);
    if (flexibleIndex !== -1 && flexibleIndex < 50) {
      const matchStart = textStart + flexibleIndex;
      const matchEnd = matchStart + searchText.length;

      // Verify word boundaries
      const beforeChar = matchStart > 0 ? documentText[matchStart - 1] : ' ';
      const afterChar = matchEnd < documentText.length ? documentText[matchEnd] : ' ';

      if ((/\s|\[/.test(beforeChar) || matchStart === 0) && (/\s|\[|$/.test(afterChar) || matchEnd === documentText.length)) {
        return { start: matchStart, end: matchEnd };
      }
    }
  }

  // Strategy 2.5: Quote/punctuation normalized match (NEW)
  // Handles cases where AI uses different quote styles or punctuation
  const normalizedDoc = normalizeQuotesAndPunctuation(documentText);
  const normalizedSearch = normalizeQuotesAndPunctuation(searchText);
  const normalizedDocLower = normalizedDoc.toLowerCase();
  const normalizedSearchLower = normalizedSearch.toLowerCase();

  index = normalizedDocLower.indexOf(normalizedSearchLower);
  if (index !== -1) {
    // Map back to original document position
    const originalIndex = mapNormalizedIndexToOriginal(documentText, index);
    if (originalIndex !== -1) {
      const endIndex = findMatchEndPosition(documentText, originalIndex, searchText);
      return { start: originalIndex, end: endIndex };
    }
  }

  // Strategy 3: Normalized match (collapse whitespace)
  const normalizedSearchText = normalizeText(searchText);
  const normalizedDocumentText = normalizeText(documentText);

  index = normalizedDocumentText.toLowerCase().indexOf(normalizedSearchText.toLowerCase());
  if (index !== -1) {
    const originalIndex = mapNormalizedIndexToOriginal(documentText, index);
    if (originalIndex !== -1) {
      // Calculate actual end position by finding matched text length
      const endIndex = findMatchEndPosition(documentText, originalIndex, searchText);
      return { start: originalIndex, end: endIndex };
    }
  }

  // Strategy 4: Word-by-word sequence matching (PRIMARY for Word docs)
  // Also handles markup tags - matches text that appears after [link], [button], etc.
  const searchWords = tokenizeText(searchText);
  if (searchWords.length > 0) {
    // First try normal word sequence matching
    const wordSequenceResult = findWordSequenceInDocument(documentText, searchWords);
    if (wordSequenceResult) {
      return wordSequenceResult;
    }

    // If that fails, try matching with markup tag awareness
    // Look for the search text that appears right after markup tags
    const markupAwareResult = findWordSequenceWithMarkup(documentText, searchWords);
    if (markupAwareResult) {
      return markupAwareResult;
    }

    // Strategy 4.5: Try with punctuation-removed words (NEW)
    // Sometimes AI includes punctuation that's not in the document
    const searchWordsNoPunct = tokenizeText(searchText.replace(/[^\w\s]/g, ' '));
    if (searchWordsNoPunct.length > 0 && searchWordsNoPunct.length === searchWords.length) {
      const wordSequenceResultNoPunct = findWordSequenceInDocument(documentText, searchWordsNoPunct);
      if (wordSequenceResultNoPunct) {
        return wordSequenceResultNoPunct;
      }
    }
  }

  // Strategy 5: Significant words only (skip short/common words)
  const significantWords = searchWords.filter(w => w.length > 3 && !isCommonWord(w));
  if (significantWords.length >= 2) {
    const significantResult = findWordSequenceInDocument(documentText, significantWords);
    if (significantResult) {
      return significantResult;
    }
  }

  // Strategy 6: Find longest matching substring
  const substringResult = findLongestMatchingSubstring(documentText, searchText);
  if (substringResult && substringResult.matchLength >= Math.min(20, searchText.length * 0.5)) {
    return { start: substringResult.start, end: substringResult.end };
  }

  // Strategy 7: First few words only (for very long search text)
  if (searchWords.length > 5) {
    const firstFewWords = searchWords.slice(0, 5);
    const firstWordsResult = findWordSequenceInDocument(documentText, firstFewWords);
    if (firstWordsResult) {
      return firstWordsResult;
    }
  }

  // Strategy 8: Try matching first 2-4 words (even for shorter text)
  if (searchWords.length >= 2) {
    const firstWords = searchWords.slice(0, Math.min(4, searchWords.length));
    const firstWordsResult = findWordSequenceInDocument(documentText, firstWords);
    if (firstWordsResult) {
      return firstWordsResult;
    }
  }

  // Strategy 9: Find first significant word occurrence (fallback for single-word or very short text)
  if (searchWords.length > 0) {
    const firstSignificantWord = searchWords.find(w => w.length > 2 && !isCommonWord(w)) || searchWords[0];
    if (firstSignificantWord) {
      // Try exact word boundary match first
      let wordPattern = new RegExp(`\\b${escapeRegExp(firstSignificantWord)}\\b`, 'i');
      let match = documentText.match(wordPattern);
      if (match && match.index !== undefined) {
        const start = match.index;
        const end = start + firstSignificantWord.length;
        return { start, end };
      }

      // Try without word boundary (handles cases where word is part of compound word or has punctuation)
      wordPattern = new RegExp(escapeRegExp(firstSignificantWord), 'i');
      match = documentText.match(wordPattern);
      if (match && match.index !== undefined) {
        const start = match.index;
        const end = start + firstSignificantWord.length;
        return { start, end };
      }
    }
  }

  // Strategy 10: Try matching ANY 2 consecutive words from search text
  if (searchWords.length >= 2) {
    for (let i = 0; i < searchWords.length - 1; i++) {
      const twoWords = [searchWords[i], searchWords[i + 1]];
      const twoWordsResult = findWordSequenceInDocument(documentText, twoWords);
      if (twoWordsResult) {
        return twoWordsResult;
      }
    }
  }

  // Strategy 10.5: Try matching first and last words (handles cases where AI adds extra words in middle) (NEW)
  if (searchWords.length >= 3) {
    const firstAndLast = [searchWords[0], searchWords[searchWords.length - 1]];
    const firstLastResult = findWordSequenceInDocument(documentText, firstAndLast);
    if (firstLastResult) {
      return firstLastResult;
    }
  }

  // Strategy 11: Last resort - find ANY word from search text (even common words)
  if (searchWords.length > 0) {
    // Try each word in order
    for (const anyWord of searchWords) {
      // Try with word boundary first
      let wordPattern = new RegExp(`\\b${escapeRegExp(anyWord)}\\b`, 'i');
      let match = documentText.match(wordPattern);
      if (match && match.index !== undefined) {
        const start = match.index;
        const end = start + anyWord.length;
        return { start, end };
      }

      // Try without word boundary
      wordPattern = new RegExp(escapeRegExp(anyWord), 'i');
      match = documentText.match(wordPattern);
      if (match && match.index !== undefined) {
        const start = match.index;
        const end = start + anyWord.length;
        return { start, end };
      }
    }
  }

  // Strategy 12: Try matching with leading/trailing whitespace trimmed and normalized (NEW)
  // Sometimes AI includes extra spaces or different whitespace
  const trimmedSearch = searchText.trim();
  if (trimmedSearch !== searchText) {
    const trimmedResult = findTextInDocument(documentText, trimmedSearch);
    if (trimmedResult) {
      return trimmedResult;
    }
  }

  // Strategy 13: Try removing leading/trailing punctuation and matching again
  // Sometimes AI includes punctuation that's not in the document
  const withoutEdgePunct = searchText.replace(/^[^\w]+|[^\w]+$/g, "").trim();
  if (withoutEdgePunct !== searchText && withoutEdgePunct.length > 5) {
    const edgePunctResult = findTextInDocument(documentText, withoutEdgePunct);
    if (edgePunctResult) {
      return edgePunctResult;
    }
  }

  // Strategy 14: Try matching with all punctuation removed (aggressive normalization)
  // This handles cases where punctuation differs significantly
  const noPunctDoc = documentText.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ");
  const noPunctSearch = searchText.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  if (noPunctSearch.length > 5) {
    const noPunctLowerDoc = noPunctDoc.toLowerCase();
    const noPunctLowerSearch = noPunctSearch.toLowerCase();
    const noPunctIndex = noPunctLowerDoc.indexOf(noPunctLowerSearch);
    if (noPunctIndex !== -1) {
      // Map back to original document position
      // This is approximate but better than nothing
      let originalPos = 0;
      let normalizedPos = 0;
      while (normalizedPos < noPunctIndex && originalPos < documentText.length) {
        if (/[^\w\s]/.test(documentText[originalPos])) {
          originalPos++;
        } else {
          normalizedPos++;
          originalPos++;
        }
      }
      // Find the end position
      let endPos = originalPos;
      let searchPos = 0;
      while (searchPos < noPunctSearch.length && endPos < documentText.length) {
        if (/[^\w\s]/.test(documentText[endPos])) {
          endPos++;
        } else {
          searchPos++;
          endPos++;
        }
      }
      if (endPos > originalPos) {
        return { start: originalPos, end: endPos };
      }
    }
  }

  // Strategy 15: Try matching with Unicode normalization (handles accented characters)
  // Some documents might have different Unicode representations
  try {
    const normalizedDoc = documentText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedSearch = searchText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normIndex = normalizedDoc.toLowerCase().indexOf(normalizedSearch.toLowerCase());
    if (normIndex !== -1) {
      // Map back to original - approximate mapping
      return { start: normIndex, end: normIndex + searchText.length };
    }
  } catch (e) {
    // Unicode normalization might fail, continue
  }

  // Strategy 16: Special handling for button text and UI elements (no recursion to avoid stack overflow)
  if (searchText.length > 2 && searchText.length < 50) {
    const buttonVariations = [
      searchText.replace(/^(button|btn|link|text):\s*/i, "").trim(),
      searchText.replace(/\s*\(button\)$/i, "").trim(),
      searchText.replace(/^[""'"']|[""'"']$/g, "").trim(),
      searchText.toUpperCase(),
      searchText.toLowerCase(),
      searchText.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "),
    ].filter(v => v.length > 2 && v !== searchText);

    const docLower = documentText.toLowerCase();
    for (const variation of buttonVariations) {
      const vLower = variation.toLowerCase();
      const idx = docLower.indexOf(vLower);
      if (idx !== -1) return { start: idx, end: idx + variation.length };
    }

    // Try matching button text that might be split across lines or have extra spaces
    const buttonTextNormalized = searchText.replace(/\s+/g, "\\s+");
    try {
      const buttonRegex = new RegExp(buttonTextNormalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const buttonMatch = documentText.match(buttonRegex);
      if (buttonMatch && buttonMatch.index !== undefined) {
        return { start: buttonMatch.index, end: buttonMatch.index + buttonMatch[0].length };
      }
    } catch (e) {
      // Regex might fail, continue
    }
  }

  return null;
};

/**
 * Find the next occurrence of searchText in document at or after minStartIndex.
 * Used so multiple issues with the same search text get different occurrences (click highlights correct one).
 */
export const findTextInDocumentFrom = (
  documentText: string,
  searchText: string,
  minStartIndex: number
): { start: number; end: number } | null => {
  if (!documentText || !searchText || minStartIndex >= documentText.length) return null;
  const cleanDocText = documentText.replace(/[\u200B-\u200D\uFEFF]/g, '');
  const cleanSearchText = searchText.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  const earlyDocLower = cleanDocText.toLowerCase();
  const earlySearchLower = cleanSearchText.toLowerCase();
  const directIndex = earlyDocLower.indexOf(earlySearchLower, minStartIndex);
  if (directIndex !== -1) {
    return { start: directIndex, end: directIndex + cleanSearchText.length };
  }
  return null;
};

/**
 * Find text in document and prefer the occurrence that contains issue key terms
 * (e.g. so we highlight "RCC" / "advanced RCC" instead of another line like "Follow-Up").
 * When key terms exist, shrinks the range to the minimal span containing the term for precise highlight.
 */
export const findTextInDocumentForIssue = (
  documentText: string,
  searchText: string,
  validationIssue: { issue?: string; reasoning?: string; recommendation?: string }
): { start: number; end: number } | null => {
  const range = findTextInDocument(documentText, searchText);
  if (!range) return null;
  const keyTerms = extractKeyTermsFromIssue(validationIssue);
  const bestRange = keyTerms.length > 0
    ? findBestOccurrenceWithKeyTerms(documentText, searchText, keyTerms, range)
    : range;
  return keyTerms.length > 0
    ? shrinkRangeToContainKeyTerm(documentText, bestRange, keyTerms)
    : bestRange;
};

/**
 * Same as findTextInDocumentForIssue but search only at or after minStartIndex.
 * Used so each issue gets its own occurrence when the same phrase appears multiple times (click -> correct highlight and comment).
 */
export const findTextInDocumentForIssueFrom = (
  documentText: string,
  searchText: string,
  validationIssue: { issue?: string; reasoning?: string; recommendation?: string },
  minStartIndex: number
): { start: number; end: number } | null => {
  const range = findTextInDocumentFrom(documentText, searchText, minStartIndex);
  if (!range) return null;
  const keyTerms = extractKeyTermsFromIssue(validationIssue);
  const bestRange = keyTerms.length > 0
    ? findBestOccurrenceWithKeyTerms(documentText, searchText, keyTerms, range)
    : range;
  return keyTerms.length > 0
    ? shrinkRangeToContainKeyTerm(documentText, bestRange, keyTerms)
    : bestRange;
};

/**
 * Common words to skip when doing significant word matching
 */
const COMMON_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'it',
  'its', 'they', 'them', 'their', 'we', 'our', 'you', 'your', 'he', 'she',
  'his', 'her', 'which', 'who', 'what', 'when', 'where', 'why', 'how'
]);

const isCommonWord = (word: string): boolean => {
  return COMMON_WORDS.has(word.toLowerCase());
};

/**
 * Find the longest matching substring between search text and document
 */
const findLongestMatchingSubstring = (
  documentText: string,
  searchText: string
): { start: number; end: number; matchLength: number } | null => {
  const docLower = documentText.toLowerCase();
  const searchLower = searchText.toLowerCase();

  // Try progressively smaller substrings
  for (let len = searchLower.length; len >= 10; len--) {
    for (let i = 0; i <= searchLower.length - len; i++) {
      const substring = searchLower.substring(i, i + len);
      const index = docLower.indexOf(substring);

      if (index !== -1) {
        return {
          start: index,
          end: index + len,
          matchLength: len
        };
      }
    }
  }

  return null;
};

/**
 * Find end position of matched text accounting for whitespace differences
 */
const findMatchEndPosition = (
  documentText: string,
  startIndex: number,
  searchText: string
): number => {
  const searchWords = tokenizeText(searchText);
  let pos = startIndex;

  for (const word of searchWords) {
    // Find this word starting from current position
    const remaining = documentText.substring(pos).toLowerCase();
    const wordIndex = remaining.indexOf(word.toLowerCase());

    if (wordIndex !== -1 && wordIndex < 50) {
      pos = pos + wordIndex + word.length;
    }
  }

  return pos;
};

/**
 * Map a position from whitespace-normalized text back to original text
 * When we collapse multiple whitespace chars to single space, positions shift
 */
const mapNormalizedWhitespaceIndex = (
  originalText: string,
  normalizedIndex: number
): number => {
  let normalizedPos = 0;
  let originalPos = 0;
  let inWhitespace = false;

  while (normalizedPos < normalizedIndex && originalPos < originalText.length) {
    const char = originalText[originalPos];
    const isWhitespace = /\s/.test(char);

    if (isWhitespace) {
      if (!inWhitespace) {
        // First whitespace char - this counts as one space in normalized
        normalizedPos++;
        inWhitespace = true;
      }
      // Additional consecutive whitespace chars don't increment normalizedPos
      originalPos++;
    } else {
      normalizedPos++;
      originalPos++;
      inWhitespace = false;
    }
  }

  return originalPos;
};

/**
 * Find the actual length of matched text in original document
 * accounting for whitespace differences between search text and document
 */
const findMatchingEndPosition = (
  documentText: string,
  startIndex: number,
  searchText: string
): number => {
  // Count non-whitespace chars in search text
  const searchLen = searchText.replace(/\s+/g, '').length;
  let matchedChars = 0;
  let pos = startIndex;

  while (matchedChars < searchLen && pos < documentText.length) {
    if (!/\s/.test(documentText[pos])) {
      matchedChars++;
    }
    pos++;
  }

  // Include trailing whitespace if any
  while (pos < documentText.length && /\s/.test(documentText[pos]) && pos - startIndex < searchText.length + 10) {
    pos++;
  }

  return Math.max(pos - startIndex, searchText.length);
};

/**
 * Map a position in normalized text back to the original text position
 */
export const mapNormalizedIndexToOriginal = (
  originalText: string,
  normalizedIndex: number
): number => {
  let normalizedPos = 0;
  let originalPos = 0;

  while (normalizedPos < normalizedIndex && originalPos < originalText.length) {
    if (/\s/.test(originalText[originalPos])) {
      // Skip consecutive whitespace in original, count as single space in normalized
      while (originalPos < originalText.length && /\s/.test(originalText[originalPos])) {
        originalPos++;
      }
      normalizedPos++;
    } else {
      normalizedPos++;
      originalPos++;
    }
  }

  return originalPos;
};

/**
 * Calculate severity color based on severity value (1-10)
 * Returns color transitioning from blue (low severity) through purple, brown, orange to red (high severity)
 * Matches the severity color scheme: blue → purple → brown → orange → red
 */
export const getSeverityColor = (severity: number): string => {
  // Clamp severity to valid range (1-10)
  const clampedSeverity = Math.max(1, Math.min(10, severity));

  // Color mapping based on severity levels
  // 1: vibrant blue, 2: lighter purple-blue, 3: muted purple, 4: muted purple-gray
  // 5: light brown, 6: darker orange-brown, 7: burnt orange, 8: vibrant red-orange, 9: darker red-orange, 10: muted red
  const severityColors: Record<number, string> = {
    1: "hsl(210, 85%, 58%)",   // Vibrant blue
    2: "hsl(230, 75%, 62%)",   // Lighter purple-blue
    3: "hsl(260, 60%, 55%)",   // Muted purple
    4: "hsl(280, 45%, 50%)",   // Muted purple-gray
    5: "hsl(30, 55%, 60%)",    // Light brown
    6: "hsl(25, 65%, 55%)",    // Darker orange-brown
    7: "hsl(20, 75%, 50%)",    // Burnt orange
    8: "hsl(15, 85%, 55%)",    // Vibrant red-orange
    9: "hsl(10, 80%, 45%)",    // Darker red-orange
    10: "hsl(5, 70%, 50%)",    // Muted red
  };

  return severityColors[clampedSeverity] || severityColors[5];
};

/**
 * Get color for issue type
 */
export const getIssueTypeColor = (type: string): string => {
  return ISSUE_TYPE_COLORS[type.toLowerCase()] || DEFAULT_HIGHLIGHT_COLOR;
};

/**
 * Check if range A contains range B (B is a subset of A)
 */
const rangeContains = (a: { start: number; end: number }, b: { start: number; end: number }): boolean => {
  return a.start <= b.start && a.end >= b.end;
};

/**
 * Check if two ranges overlap (not just touch)
 */
const rangesOverlap = (a: { start: number; end: number }, b: { start: number; end: number }): boolean => {
  return a.start < b.end && b.start < a.end;
};

/**
 * Merge overlapping ranges and combine their issues
 * CRITICAL: This handles the case where one comment is on "i am here" and another on "here"
 * Both comments should be associated with the larger range and highlighted together
 * 
 * @param issues - Array of issues with wordRanges
 * @returns Map of merged ranges to their combined issues
 */
export const mergeOverlappingRanges = (issues: Issue[]): IssuesByRange => {
  const issuesByRange: IssuesByRange = new Map();

  // Filter to issues with valid ranges
  const issuesWithRanges = issues.filter(
    issue => issue.wordRange && issue.wordRange.start >= 0 && issue.wordRange.end > issue.wordRange.start
  );

  if (issuesWithRanges.length === 0) {
    return issuesByRange;
  }

  // Sort by range size (largest first) to ensure larger ranges are processed first
  const sortedIssues = [...issuesWithRanges].sort((a, b) => {
    const aSize = (a.wordRange!.end - a.wordRange!.start);
    const bSize = (b.wordRange!.end - b.wordRange!.start);
    return bSize - aSize; // Larger ranges first
  });

  // Track which issues have been merged into a parent range
  const processedIssueIds = new Set<string>();

  // First pass: Create range groups for the largest ranges
  sortedIssues.forEach(issue => {
    if (processedIssueIds.has(issue.id)) return;

    const range = issue.wordRange!;
    const rangeKey = `${range.start}-${range.end}`;

    // Check if this range is contained within an existing range
    let foundParent = false;
    const existingEntries = Array.from(issuesByRange.entries());
    for (const [existingKey, existingIssues] of existingEntries) {
      const [existingStart, existingEnd] = existingKey.split('-').map(Number);
      const existingRange = { start: existingStart, end: existingEnd };

      // If this range is contained within an existing range, add to that group
      if (rangeContains(existingRange, range)) {
        existingIssues.push(issue);
        processedIssueIds.add(issue.id);
        // Update the issue's wordRange to match the parent (so it highlights properly)
        issue.wordRange = existingRange;
        foundParent = true;
        break;
      }

      // If this range contains an existing range, merge the existing into this one
      if (rangeContains(range, existingRange)) {
        // Move all issues from the smaller range to this one
        if (!issuesByRange.has(rangeKey)) {
          issuesByRange.set(rangeKey, []);
        }
        issuesByRange.get(rangeKey)!.push(issue);
        processedIssueIds.add(issue.id);

        // Move existing issues to the larger range and update their wordRanges
        existingIssues.forEach((existingIssue: Issue) => {
          issuesByRange.get(rangeKey)!.push(existingIssue);
          existingIssue.wordRange = range; // Update to larger range
        });

        // Remove the smaller range
        issuesByRange.delete(existingKey);
        foundParent = true;
        break;
      }

      // If ranges overlap but neither contains the other, merge them into a combined range
      if (rangesOverlap(existingRange, range)) {
        const mergedStart = Math.min(existingRange.start, range.start);
        const mergedEnd = Math.max(existingRange.end, range.end);
        const mergedKey = `${mergedStart}-${mergedEnd}`;
        const mergedRange = { start: mergedStart, end: mergedEnd };

        // Create new merged group
        if (!issuesByRange.has(mergedKey)) {
          issuesByRange.set(mergedKey, []);
        }

        // Add current issue
        issuesByRange.get(mergedKey)!.push(issue);
        processedIssueIds.add(issue.id);
        issue.wordRange = mergedRange;

        // Move existing issues to merged range
        existingIssues.forEach((existingIssue: Issue) => {
          issuesByRange.get(mergedKey)!.push(existingIssue);
          existingIssue.wordRange = mergedRange;
        });

        // Remove the old range
        issuesByRange.delete(existingKey);
        foundParent = true;
        break;
      }
    }

    // If no parent found, create a new group
    if (!foundParent) {
      if (!issuesByRange.has(rangeKey)) {
        issuesByRange.set(rangeKey, []);
      }
      issuesByRange.get(rangeKey)!.push(issue);
      processedIssueIds.add(issue.id);
    }
  });

  return issuesByRange;
};

/**
 * Group issues by their word range for efficient rendering
 * CRITICAL: Multiple issues can point to the same text range
 * Now handles overlapping ranges by merging them together
 */
export const groupIssuesByRange = (issues: Issue[]): IssuesByRange => {
  // Use the new merging logic to handle overlapping ranges
  return mergeOverlappingRanges(issues);
};

/**
 * Get unique sorted ranges from issues map
 */
export const getUniqueSortedRanges = (
  issuesByRange: IssuesByRange
): Array<{ start: number; end: number; key: string }> => {
  return Array.from(issuesByRange.keys())
    .map(key => {
      const [start, end] = key.split("-").map(Number);
      return { start, end, key };
    })
    .sort((a, b) => a.start - b.start);
};

/**
 * Find all issues that share the same text as the given issue
 * 
 * Works for BOTH document types:
 * - Word documents: Match by wordRange (start/end positions)
 * - Screenshots: Match by locationText (the text content itself)
 * 
 * This enables multiple comments (e.g., SEO + Grammar) on same text to activate together
 */
export const findRelatedIssues = (issues: Issue[], targetIssue: Issue): Issue[] => {
  // Strategy 1: Match by wordRange (for Word documents)
  if (targetIssue.wordRange) {
    const relatedByRange = issues.filter(
      issue =>
        issue.wordRange &&
        issue.wordRange.start === targetIssue.wordRange!.start &&
        issue.wordRange.end === targetIssue.wordRange!.end
    );

    if (relatedByRange.length > 0) {
      return relatedByRange;
    }
  }

  // Strategy 2: Match by locationText (for Screenshots or as fallback)
  if (targetIssue.locationText) {
    const targetTextKey = targetIssue.locationText.toLowerCase().trim();
    const relatedByText = issues.filter(
      issue =>
        issue.locationText &&
        issue.locationText.toLowerCase().trim() === targetTextKey
    );

    if (relatedByText.length > 0) {
      return relatedByText;
    }
  }

  // Fallback: just return the target issue
  return [targetIssue];
};

/**
 * Check if all issue IDs in a list are currently active
 */
export const areAllIssuesActive = (
  issueIds: string[],
  activeIssueIds: Set<string>
): boolean => {
  return issueIds.every(id => activeIssueIds.has(id));
};

/**
 * Toggle issue IDs in the active set
 * If all are active, remove them; otherwise, add all
 */
export const toggleIssueIds = (
  currentActive: Set<string>,
  issueIds: string[]
): Set<string> => {
  const newSet = new Set(currentActive);
  const allActive = issueIds.every(id => newSet.has(id));

  if (allActive) {
    issueIds.forEach(id => newSet.delete(id));
  } else {
    issueIds.forEach(id => newSet.add(id));
  }

  return newSet;
};

/**
 * Create issue title for tooltip (single or multiple issues)
 */
export const createIssueTitle = (issues: Issue[]): string => {
  if (issues.length === 1) {
    return `Issue: ${issues[0].body.issue.substring(0, 50)}...`;
  }

  const issueTitles = issues
    .map(issue => `${issue.type.toUpperCase()}: ${issue.body.issue.substring(0, 40)}`)
    .join("\n");

  return `Multiple issues (${issues.length}):\n${issueTitles}`;
};

/**
 * Validate that an issue has proper location data
 * CRITICAL: Issues without location.text cannot be linked to document text
 */
export const isValidTextIssue = (validationIssue: TValidationIssue): boolean => {
  if (!validationIssue.location) {
    return false;
  }

  if (validationIssue.location.type === "text") {
    return !!(validationIssue.location.text && validationIssue.location.text.trim());
  }

  if (validationIssue.location.type === "image") {
    return !!validationIssue.location.coordinates;
  }

  return false;
};

/**
 * Log issue linking status for debugging (no-op, console logs removed)
 */
export const logIssueLinking = (
  issueId: string,
  issueType: string,
  searchText: string,
  found: boolean,
  range?: { start: number; end: number }
): void => {
  // Console logs removed - function kept for API compatibility
};
