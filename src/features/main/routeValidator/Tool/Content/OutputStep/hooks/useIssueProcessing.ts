import { useMemo } from "react";
import { TValidateDocumentResponse, TValidationIssue } from "../../../../../../../types/response/routeValidator";
import { Issue, DocumentType, isImageDocumentType } from "../types";
import {
  convertValidationIssueToIssue,
  findTextInDocumentForIssue,
  findTextInDocumentForIssueFrom,
  extractKeyTermsFromIssue,
  findBestOccurrenceWithKeyTerms,
  logIssueLinking,
  extractSearchTextFromIssue,
  extractQuotedPhraseFromRecommendation,
  validateWordRange,
  RANGE_MAX_LENGTH,
  SEARCH_TEXT_MAX_DOC_RATIO,
} from "../utils";
import { devWarn } from "../../../../../../../utils/devLog";

interface UseIssueProcessingResult {
  issues: Issue[];
  issuesByRange: Map<string, Issue[]>;
  issuesByText: Map<string, Issue[]>; // Group issues by location.text for multi-comment support
}

/**
 * Hook to process validation results into Issue format
 * 
 * CRITICAL REQUIREMENTS FOR ALL DOCUMENT TYPES:
 * - ALL comments MUST be linked to specific text - no orphan comments allowed
 * - Multiple comments on same text (e.g., SEO + Grammar) should activate together
 * 
 * The DIFFERENCE is HOW we find the text position:
 * - Word documents: Find text position via JavaScript word matching
 * - PDF/ZIP (screenshots): Find text position via x/y coordinates from AI
 */
export const useIssueProcessing = (
  validationResults: TValidateDocumentResponse | undefined,
  documentText: string,
  documentType: DocumentType = "word"
): UseIssueProcessingResult => {
  const result = useMemo(() => {
    if (!validationResults) {
      return { issues: [], issuesByRange: new Map(), issuesByText: new Map() };
    }

    const issues: Issue[] = [];
    const issuesByRange = new Map<string, Issue[]>();
    const issuesByText = new Map<string, Issue[]>(); // Group by location.text for multi-comment support

    // ============================================================
    // SCREENSHOTS MODE (PDF/ZIP): 
    // - Find text position via x/y coordinates from AI
    // - ALL comments MUST have location.text - no orphans allowed
    // - Multiple comments on same text should activate together
    // ============================================================
    if (isImageDocumentType(documentType)) {

      validationResults.results.forEach((taskResult) => {
        // Extract task name for unique ID generation (e.g., "seo", "wcag", "spell_check")
        const taskName = taskResult.task?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'unknown';

        taskResult.issues.forEach((validationIssue, index) => {
          // CRITICAL: Screenshots also require location.text - no orphan comments
          if (!validationIssue.location?.text || validationIssue.location.text.trim().length === 0) {
            return; // Skip issues without text - no orphan comments allowed
          }

          // CRITICAL: Screenshots also require coordinates to know WHERE the text is
          if (!validationIssue.location?.coordinates) {
            return; // Skip issues without coordinates - can't position on image
          }

          // Pass task name for unique ID generation across multiple tasks
          const issue = convertValidationIssueToIssue(validationIssue, index, taskName);
          const locationText = validationIssue.location.text.trim();

          // Convert normalized coordinates (0-1) to percentage (0-100) for frontend storage
          // Backend returns normalized coordinates where 0.0 = left/top, 1.0 = right/bottom
          // Frontend expects percentage where 0 = left/top, 100 = right/bottom
          const normalizedX = validationIssue.location.coordinates.x;
          const normalizedY = validationIssue.location.coordinates.y;


          // Validate coordinates are in valid range (0-1)
          if (normalizedX < 0 || normalizedX > 1 || normalizedY < 0 || normalizedY > 1) {
            devWarn(`[IssueProcessing] Skipping issue ${issue.id} - invalid coordinates`);
            return;
          }

          // Convert to percentage (0-100)
          issue.position = {
            x: normalizedX * 100,
            y: normalizedY * 100,
          };


          // Store the page number for filtering issues by image
          issue.page = validationIssue.location.page || 1;
          // DEBUG: log page from backend (to catch wrong-page: e.g. page 6 issues showing on last page)
          console.log(`[RouteValidator] issue page=${issue.page} task=${taskName} issue="${(validationIssue.issue || "").substring(0, 40)}..."`);

          // Store the location text for grouping
          issue.locationText = locationText;

          // Group issues by their location.text (for multi-comment support)
          // This allows SEO + Grammar issues on same text to activate together
          const textKey = locationText.toLowerCase().trim();
          if (!issuesByText.has(textKey)) {
            issuesByText.set(textKey, []);
          }
          issuesByText.get(textKey)!.push(issue);

          issues.push(issue);
        });
      });

      return { issues, issuesByRange, issuesByText };
    }

    // ============================================================
    // WORD MODE: 
    // - Find text position via JavaScript word matching
    // - ALL comments MUST be linked to text - no orphan comments
    // - Multiple comments on same text should activate together
    // ============================================================

    // Collect all issues with their search text
    const issuesWithSearchText: Array<{
      issue: Issue;
      validationIssue: TValidationIssue;
      searchText: string;
    }> = [];

    validationResults.results.forEach((taskResult) => {
      // Extract task name for unique ID generation (e.g., "seo", "wcag", "spell_check")
      const taskName = taskResult.task?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'unknown';

      taskResult.issues.forEach((validationIssue, index) => {
        // CRITICAL: Validate that location has all required fields
        // Filter out issues where page, line, or text is null/undefined
        const location = validationIssue.location;

        // For Word documents, we REQUIRE location.text - no orphan comments
        if (!location?.text) {
          devWarn(`[IssueProcessing] Skipping issue ${validationIssue.id} - missing location.text`);
          return;
        }

        // Validate that page and line are not null (AI should always provide these)
        if (location.page === null || location.page === undefined) {
          devWarn(`[IssueProcessing] Issue ${validationIssue.id} has null page, defaulting to 1`);
          // Default to page 1 if not provided
          location.page = 1;
        }

        if (location.line === null || location.line === undefined) {
          devWarn(`[IssueProcessing] Issue ${validationIssue.id} has null line, will estimate`);
          // Line number will be estimated based on text position
        }

        // Pass task name for unique ID generation across multiple tasks
        // This prevents ID collision (e.g., SEO issue-1 vs WCAG issue-1)
        const issue = convertValidationIssueToIssue(validationIssue, index, taskName);
        const searchText = location.text.trim();

        if (searchText.length === 0) {
          devWarn(`[IssueProcessing] Skipping issue ${validationIssue.id} - empty location.text`);
          return;
        }

        // CRITICAL: Filter out "document-level" issues that span too much text
        const docLengthRatio = documentText ? searchText.length / documentText.length : 0;
        if (searchText.length > RANGE_MAX_LENGTH || docLengthRatio > SEARCH_TEXT_MAX_DOC_RATIO) {
          // Skip these issues - they can't be properly linked to text
          logIssueLinking(issue.id, issue.type, searchText, false);
          return;
        }

        issuesWithSearchText.push({
          issue,
          validationIssue,
          searchText,
        });
      });
    });

    // Find text matches for each issue
    // CRITICAL: Prefer the exact phrase from recommendation (e.g. "7 Topics:") over location.text
    // when the backend sends the wrong line (e.g. "Julia Zhang, MD, PhD" / "PhD") so we highlight
    // the correct heading "7 Topics:" not the text above it.
    // When the same phrase appears multiple times, use a different occurrence per issue so click -> correct highlight and comment.
    const usedRangeKeys = new Set<string>();
    const toRangeKey = (r: { start: number; end: number }) => `${r.start}-${r.end}`;
    const getNextUnusedRange = (
      doc: string,
      text: string,
      val: TValidationIssue,
      afterIndex: number
    ): { start: number; end: number } | null => {
      let r = findTextInDocumentForIssueFrom(doc, text, val, afterIndex);
      while (r && usedRangeKeys.has(toRangeKey(r))) {
        r = findTextInDocumentForIssueFrom(doc, text, val, r.end + 1);
      }
      return r;
    };
    issuesWithSearchText.forEach(({ issue, validationIssue, searchText }) => {
      let range: { start: number; end: number } | null = null;
      let matchedText = searchText;

      // Strategy 0: Try quoted phrase from recommendation FIRST (e.g. "Change '7 Topics:' to ..." -> "7 Topics:")
      const recommendationPhrases = extractQuotedPhraseFromRecommendation(validationIssue);
      for (const phrase of recommendationPhrases) {
        range = findTextInDocumentForIssue(documentText, phrase, validationIssue);
        if (range) {
          matchedText = phrase;
          break;
        }
      }

      // Strategy 1: location.text from API
      if (!range) {
        range = findTextInDocumentForIssue(documentText, searchText, validationIssue);
        if (range) matchedText = searchText;
      }

      // If still no match, try fallback strategies
      if (!range) {
        const fallbackTexts = extractSearchTextFromIssue(validationIssue);
        for (const fallbackText of fallbackTexts) {
          if (recommendationPhrases.includes(fallbackText)) continue; // already tried
          range = findTextInDocumentForIssue(documentText, fallbackText, validationIssue);
          if (range) {
            matchedText = fallbackText;
            break;
          }
        }
      }

      // Strategy 2: Try variations of the search text
      if (!range && searchText.length > 5) {
        const variations = [
          searchText.replace(/^(the|a|an)\s+/i, "").trim(),
          searchText.replace(/\s+(is|are|was|were|be|been)$/i, "").trim(),
          searchText.replace(/^[""'"']|[""'"']$/g, "").trim(),
          searchText.replace(/\s+/g, " ").trim(),
          searchText.replace(/^[^\w]+|[^\w]+$/g, "").trim(),
        ].filter(v => v.length > 5 && v !== searchText);

        for (const variation of variations) {
          range = findTextInDocumentForIssue(documentText, variation, validationIssue);
          if (range) {
            matchedText = variation;
            break;
          }
        }
      }

      // Strategy 3: Try case-insensitive substring search as last resort
      if (!range && searchText.length >= 10) {
        const searchLower = searchText.toLowerCase().trim();
        const docLower = documentText.toLowerCase();
        const directIndex = docLower.indexOf(searchLower);
        if (directIndex !== -1) {
          const rawRange = { start: directIndex, end: directIndex + searchText.length };
          const keyTerms = extractKeyTermsFromIssue(validationIssue);
          range = keyTerms.length > 0
            ? findBestOccurrenceWithKeyTerms(documentText, searchText, keyTerms, rawRange)
            : rawRange;
        }
      }

      // If this range was already assigned to another issue (same phrase, multiple occurrences), use next occurrence so click highlights correct one
      if (range && usedRangeKeys.has(toRangeKey(range))) {
        range = getNextUnusedRange(documentText, matchedText, validationIssue, range.end + 1);
      }
      if (range) usedRangeKeys.add(toRangeKey(range));

      // CRITICAL: Validate range before accepting it
      // STRICT VALIDATION: Only accept issues that are properly linked to text
      if (range && validateWordRange(range, documentText)) {
        // Additional validation: Ensure text at range is not empty
        const rangeText = documentText.substring(range.start, range.end);
        if (!rangeText || rangeText.trim().length === 0) {
          // FAILED: Range is valid but contains no text
          devWarn(`[IssueProcessing] Rejected issue ${issue.id} - range contains no text`);
          logIssueLinking(issue.id, issue.type, searchText, false);
          return; // Skip this issue - don't add it
        }

        // SUCCESS: Issue is linked to text with valid range and actual text content
        issue.wordRange = range;
        issue.locationText = matchedText; // Store matched text for grouping

        // Track this range for grouping (multiple issues can point to same text)
        const rangeKey = `${range.start}-${range.end}`;
        if (!issuesByRange.has(rangeKey)) {
          issuesByRange.set(rangeKey, []);
        }
        issuesByRange.get(rangeKey)!.push(issue);

        // Also group by location.text for consistency with screenshots
        const textKey = matchedText.toLowerCase().trim();
        if (!issuesByText.has(textKey)) {
          issuesByText.set(textKey, []);
        }
        issuesByText.get(textKey)!.push(issue);

        logIssueLinking(issue.id, issue.type, matchedText, true, range);
        issues.push(issue);
      } else {
        // FAILED: Could not find text in document after all strategies OR invalid range
        // CRITICAL: For Word documents, we DO NOT include orphan comments (dead comments)
        devWarn(`[IssueProcessing] Rejected issue ${issue.id} - not linked to text`);
        logIssueLinking(issue.id, issue.type, searchText, false);
        // Issue is NOT added to the issues array - it's a dead comment
      }
    });

    // CRITICAL: Final filter - remove any issues without wordRange or with invalid ranges
    // This ensures ALL comments are linked to text and can be highlighted when clicked
    const linkedIssues = issues.filter(issue => {
      if (!issue.wordRange) {
        devWarn(`[IssueProcessing] Filtered out issue ${issue.id} - no wordRange`);
        return false;
      }

      // Validate the range is actually valid and highlightable
      if (!validateWordRange(issue.wordRange, documentText)) {
        devWarn(`[IssueProcessing] Filtered out issue ${issue.id} - invalid range`);
        return false;
      }

      // Additional validation: Ensure the text at this range is actually highlightable
      // Check that the range contains actual text (not just whitespace or special chars)
      const rangeText = documentText.substring(issue.wordRange.start, issue.wordRange.end);
      if (!rangeText || rangeText.trim().length === 0) {
        devWarn(`[IssueProcessing] Filtered out issue ${issue.id} - empty range`);
        return false;
      }

      const rangeLength = issue.wordRange.end - issue.wordRange.start;
      if (rangeLength < 1 || rangeLength > RANGE_MAX_LENGTH) {
        devWarn(`[IssueProcessing] Filtered out issue ${issue.id} - unreasonable range length`);
        return false;
      }

      return true;
    });

    // CRITICAL: Merge overlapping ranges BEFORE creating the final maps
    // This handles the case where one comment is on "i am here" and another on "here"
    // Both should be merged into the same range and highlight together
    const mergedIssuesByRange = mergeOverlappingRangesForProcessing(linkedIssues);

    // Update maps to only include linked issues with merged ranges
    const filteredIssuesByRange = mergedIssuesByRange;
    const filteredIssuesByText = new Map<string, Issue[]>();

    // Rebuild issuesByText after merging (use updated wordRanges)
    linkedIssues.forEach(issue => {
      if (issue.locationText) {
        const textKey = issue.locationText.toLowerCase().trim();
        if (!filteredIssuesByText.has(textKey)) {
          filteredIssuesByText.set(textKey, []);
        }
        filteredIssuesByText.get(textKey)!.push(issue);
      }
    });

    // Sort issues by wordRange start to ensure proper rendering order
    linkedIssues.sort((a, b) => {
      const aStart = a.wordRange?.start ?? Infinity;
      const bStart = b.wordRange?.start ?? Infinity;
      return aStart - bStart;
    });

    return {
      issues: linkedIssues,
      issuesByRange: filteredIssuesByRange,
      issuesByText: filteredIssuesByText
    };
  }, [validationResults, documentText, documentType]);

  return result;
};

/**
 * Merge overlapping ranges for issue processing
 * CRITICAL: Handles the case where one comment is on "i am here" (range 0-9) 
 * and another on "here" (range 5-9). Both should be merged so they highlight together.
 * 
 * This mutates the issue.wordRange to point to the merged range.
 */
const mergeOverlappingRangesForProcessing = (issues: Issue[]): Map<string, Issue[]> => {
  const issuesByRange = new Map<string, Issue[]>();

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

  // Helper to check if range A contains range B
  const rangeContains = (a: { start: number; end: number }, b: { start: number; end: number }): boolean => {
    return a.start <= b.start && a.end >= b.end;
  };

  // Helper to check if ranges overlap
  const rangesOverlap = (a: { start: number; end: number }, b: { start: number; end: number }): boolean => {
    return a.start < b.end && b.start < a.end;
  };

  // Process each issue and merge overlapping ranges
  sortedIssues.forEach(issue => {
    if (processedIssueIds.has(issue.id)) return;

    const range = issue.wordRange!;
    const rangeKey = `${range.start}-${range.end}`;

    // Check if this range overlaps with an existing range
    let foundOverlap = false;
    const existingEntries = Array.from(issuesByRange.entries());
    for (const [existingKey, existingIssues] of existingEntries) {
      const [existingStart, existingEnd] = existingKey.split('-').map(Number);
      const existingRange = { start: existingStart, end: existingEnd };

      // If this range is contained within an existing range, add to that group
      if (rangeContains(existingRange, range)) {
        existingIssues.push(issue);
        processedIssueIds.add(issue.id);
        // Update the issue's wordRange to match the parent (so it highlights properly)
        issue.wordRange = { start: existingRange.start, end: existingRange.end };
        foundOverlap = true;
        break;
      }

      // If this range contains an existing range, merge the existing into this one
      if (rangeContains(range, existingRange)) {
        // Create new group with larger range
        if (!issuesByRange.has(rangeKey)) {
          issuesByRange.set(rangeKey, []);
        }
        issuesByRange.get(rangeKey)!.push(issue);
        processedIssueIds.add(issue.id);

        // Move existing issues to the larger range and update their wordRanges
        existingIssues.forEach((existingIssue: Issue) => {
          issuesByRange.get(rangeKey)!.push(existingIssue);
          existingIssue.wordRange = { start: range.start, end: range.end }; // Update to larger range
        });

        // Remove the smaller range
        issuesByRange.delete(existingKey);
        foundOverlap = true;
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
        issue.wordRange = { start: mergedRange.start, end: mergedRange.end };

        // Move existing issues to merged range
        existingIssues.forEach((existingIssue: Issue) => {
          issuesByRange.get(mergedKey)!.push(existingIssue);
          existingIssue.wordRange = { start: mergedRange.start, end: mergedRange.end };
        });

        // Remove the old range
        issuesByRange.delete(existingKey);
        foundOverlap = true;
        break;
      }
    }

    // If no overlap found, create a new group
    if (!foundOverlap) {
      if (!issuesByRange.has(rangeKey)) {
        issuesByRange.set(rangeKey, []);
      }
      issuesByRange.get(rangeKey)!.push(issue);
      processedIssueIds.add(issue.id);
    }
  });

  return issuesByRange;
};

export default useIssueProcessing;

