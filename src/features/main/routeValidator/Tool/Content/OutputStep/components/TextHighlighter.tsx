import React, { useMemo, useEffect, useRef } from "react";
import { TextHighlighterProps, Issue } from "../types";
import { DEFAULT_HIGHLIGHT_COLOR } from "../constants";
import {
  groupIssuesByRange,
  getUniqueSortedRanges,
  createIssueTitle,
  validateWordRange,
} from "../utils";
import { devWarn } from "../../../../../../../utils/devLog";

/**
 * Extract plain text from HTML (strip tags)
 * Normalizes whitespace to match backend extraction
 */
const extractTextFromHtml = (html: string): string => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const extracted = tempDiv.textContent || tempDiv.innerText || "";
  // Normalize whitespace to match backend extraction (mammoth.extractRawText)
  // Replace multiple spaces/newlines with single space, but preserve line breaks as newlines
  return extracted
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\r/g, "\n") // Normalize line endings
    .replace(/[ \t]+/g, " ") // Collapse multiple spaces/tabs to single space
    .replace(/ *\n */g, "\n") // Remove spaces around newlines
    .replace(/\n{3,}/g, "\n\n"); // Collapse multiple newlines to max 2
};

/**
 * Build a mapping from plain text positions to HTML text node positions
 * Accounts for HTML structure (tags, whitespace, images) that affects text positions.
 *
 * CRITICAL: When the document contains <img> tags, the HTML has elements that
 * produce NO text content. The backend's mammoth.extractRawText() also skips
 * images, so the plain text positions stay correct. However, the old indexOf
 * approach could mis-align because it searched backwards (`plainTextIndex - 10`)
 * and could match a duplicate string at the wrong offset.
 *
 * The fix: rebuild the plain text from the same DOM walk so positions are
 * guaranteed to match, then map those positions into the *backend* plain text
 * using a single forward scan.
 */
/**
 * Build a mapping from DOM text nodes to backend plain text positions.
 *
 * APPROACH: Walk through all DOM text nodes and the backend plain text
 * simultaneously, character by character. For each text node, find where
 * its NON-WHITESPACE content starts in the backend text by matching
 * the first non-whitespace character. This naturally handles:
 *
 * - <img> tags that produce no text (DOM has extra whitespace nodes around them,
 *   backend has nothing - we just skip DOM whitespace that doesn't match)
 * - Different whitespace normalization between HTML and mammoth.extractRawText()
 * - Block elements (<p>, <li>) that add newlines in DOM but mammoth adds different ones
 *
 * The key insight: non-whitespace characters appear in the SAME ORDER in both
 * the DOM and the backend text. We just need to sync on those characters.
 *
 * When the document has images, DOM has extra nodes (e.g. around <img>) that don't
 * exist in backend plain text. We use a strict forward distance (MAX_FORWARD_SKIP)
 * so we don't map a node to text 2 lines away — keeps highlights on the correct line.
 */
const MAX_FORWARD_SKIP = 120; // Max chars to skip forward when matching (avoids highlight on wrong line)
/** When a text node comes right after an image, use stricter skip so we don't map to a sentence far below (e.g. "anything" near image -> wrong sentence). */
const MAX_FORWARD_SKIP_AFTER_IMAGE = 40;

const buildTextPositionMapping = (
  tempDiv: HTMLDivElement,
  plainText: string,
): Array<{ node: Text; plainStart: number; plainEnd: number }> => {
  const mapping: Array<{ node: Text; plainStart: number; plainEnd: number }> =
    [];
  const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null);

  // Collect all text nodes
  const textNodes: Text[] = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      textNodes.push(node as Text);
    }
  }

  // For each text node, detect if there's an <img> between it and the previous text node (in document order)
  const hasImageBefore: boolean[] = [];
  const allNodesWalker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null,
  );
  let seenImageSinceLastText = false;
  let textIndex = 0;
  let n;
  while ((n = allNodesWalker.nextNode())) {
    if (n.nodeType === Node.TEXT_NODE && n.textContent) {
      hasImageBefore[textIndex] = seenImageSinceLastText;
      textIndex++;
      seenImageSinceLastText = false;
    } else if (
      n.nodeType === Node.ELEMENT_NODE &&
      (n as Element).tagName === "IMG"
    ) {
      seenImageSinceLastText = true;
    }
  }

  let backendCursor = 0;

  for (let i = 0; i < textNodes.length; i++) {
    const textNode = textNodes[i];
    const maxSkip = hasImageBefore[i]
      ? MAX_FORWARD_SKIP_AFTER_IMAGE
      : MAX_FORWARD_SKIP;
    const nodeText = textNode.textContent || "";
    if (nodeText.length === 0) continue;

    const trimmed = nodeText.trim();

    // Pure whitespace node: try to match against backend whitespace at cursor
    if (trimmed.length === 0) {
      let wsEnd = backendCursor;
      while (wsEnd < plainText.length && /\s/.test(plainText[wsEnd])) {
        wsEnd++;
      }
      mapping.push({
        node: textNode,
        plainStart: backendCursor,
        plainEnd: wsEnd,
      });
      backendCursor = wsEnd;
      continue;
    }

    // Non-whitespace node: find where it starts in backend text
    // Strategy 1: Exact match at cursor (fast path)
    if (
      plainText.substring(backendCursor, backendCursor + nodeText.length) ===
      nodeText
    ) {
      mapping.push({
        node: textNode,
        plainStart: backendCursor,
        plainEnd: backendCursor + nodeText.length,
      });
      backendCursor += nodeText.length;
      continue;
    }

    // Strategy 2: Forward indexOf — only accept if within maxSkip (stricter after image so "anything" near image doesn't map to sentence below)
    const foundIndex = plainText.indexOf(nodeText, backendCursor);
    if (foundIndex !== -1 && foundIndex - backendCursor < maxSkip) {
      mapping.push({
        node: textNode,
        plainStart: foundIndex,
        plainEnd: foundIndex + nodeText.length,
      });
      backendCursor = foundIndex + nodeText.length;
      continue;
    }

    // Strategy 3: First non-whitespace char align (strict distance)
    const firstNonWs = trimmed[0];
    let searchFrom = backendCursor;
    while (searchFrom < plainText.length && /\s/.test(plainText[searchFrom])) {
      searchFrom++;
    }

    if (searchFrom < plainText.length && plainText[searchFrom] === firstNonWs) {
      const trimmedIndex = plainText.indexOf(trimmed, searchFrom);
      if (trimmedIndex !== -1 && trimmedIndex - backendCursor < maxSkip) {
        mapping.push({
          node: textNode,
          plainStart: trimmedIndex,
          plainEnd: trimmedIndex + trimmed.length,
        });
        backendCursor = trimmedIndex + trimmed.length;
        continue;
      }
    }

    // Strategy 4: Broader char search but still strict distance
    const charIndex = plainText.indexOf(firstNonWs, backendCursor);
    if (charIndex !== -1 && charIndex - backendCursor < maxSkip) {
      const trimmedIndex = plainText.indexOf(trimmed, charIndex);
      if (trimmedIndex !== -1 && trimmedIndex - backendCursor < maxSkip) {
        mapping.push({
          node: textNode,
          plainStart: trimmedIndex,
          plainEnd: trimmedIndex + trimmed.length,
        });
        backendCursor = trimmedIndex + trimmed.length;
        continue;
      }

      // Partial character-by-character matching (only if within window)
      let matchLen = 0;
      let bIdx = charIndex;
      for (
        let nIdx = 0;
        nIdx < nodeText.length && bIdx < plainText.length;
        nIdx++
      ) {
        if (nodeText[nIdx] === plainText[bIdx]) {
          matchLen++;
          bIdx++;
        } else if (/\s/.test(nodeText[nIdx]) && /\s/.test(plainText[bIdx])) {
          matchLen++;
          bIdx++;
        } else if (/\s/.test(nodeText[nIdx])) {
          continue;
        } else if (/\s/.test(plainText[bIdx])) {
          bIdx++;
          nIdx--;
        } else {
          break;
        }
      }

      if (matchLen > trimmed.length * 0.5) {
        mapping.push({
          node: textNode,
          plainStart: charIndex,
          plainEnd: bIdx,
        });
        backendCursor = bIdx;
        continue;
      }
    }

    // Last resort: assign current position and advance (no large skip)
    const nodePlainEnd = Math.min(
      backendCursor + nodeText.length,
      plainText.length,
    );
    mapping.push({
      node: textNode,
      plainStart: backendCursor,
      plainEnd: nodePlainEnd,
    });
    backendCursor = nodePlainEnd;
  }

  return mapping;
};

/**
 * Apply highlights to HTML by finding the exact position based on plain text positions
 * Only highlights the specific instance at the exact position, not all occurrences
 */
const applyHighlightsToHtml = (
  html: string,
  plainText: string,
  ranges: Array<{ start: number; end: number; key: string; issues: Issue[] }>,
  activeIssueIds: Set<string>,
): string => {
  if (!html || ranges.length === 0) return html;

  // Create a temporary DOM to work with
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Build mapping from plain text positions to HTML text nodes
  const positionMapping = buildTextPositionMapping(tempDiv, plainText);

  // Sort ranges by start position (reverse order to avoid offset issues when inserting)
  const sortedRanges = [...ranges].sort((a, b) => b.start - a.start);

  const createHighlightSpan = (
    highlightText: string,
    issueIds: string,
    key: string,
    isAnyActive: boolean,
  ) => {
    const span = document.createElement("span");
    span.setAttribute("data-issue-ids", issueIds);
    span.setAttribute("data-highlight-key", key);
    span.className = "issue-highlight";
    span.style.backgroundColor = DEFAULT_HIGHLIGHT_COLOR;
    span.style.cursor = "pointer";
    span.style.padding = "2px 0";
    span.style.opacity = isAnyActive ? "1" : "0.7";
    span.style.borderRadius = "2px";
    span.style.transition = "opacity 0.15s ease, background-color 0.15s ease";
    span.textContent = highlightText;
    return span;
  };

  // Process each range: support ranges that span multiple text nodes (e.g. across images/tags)
  sortedRanges.forEach(({ start, end, key, issues }) => {
    const highlightedText = plainText.substring(start, end);
    if (!highlightedText || highlightedText.trim().length === 0) return;

    const isAnyActive = issues.some((issue) => activeIssueIds.has(issue.id));
    const issueIds = issues.map((issue) => issue.id).join(",");

    type Segment = { node: Text; startInNode: number; endInNode: number };
    const segments: Segment[] = [];

    for (const { node, plainStart, plainEnd } of positionMapping) {
      if (start >= plainEnd || end <= plainStart) continue;

      const nodeText = node.textContent || "";
      const segmentPlainStart = Math.max(start, plainStart);
      const segmentPlainEnd = Math.min(end, plainEnd);
      let startInNode = Math.max(0, segmentPlainStart - plainStart);
      let endInNode = Math.min(nodeText.length, segmentPlainEnd - plainStart);

      const segmentText = plainText.substring(
        segmentPlainStart,
        segmentPlainEnd,
      );
      if (nodeText.substring(startInNode, endInNode) !== segmentText) {
        const found = nodeText.indexOf(
          segmentText,
          Math.max(0, startInNode - 5),
        );
        if (found !== -1) {
          startInNode = found;
          endInNode = found + segmentText.length;
        }
      }

      if (endInNode > startInNode)
        segments.push({ node, startInNode, endInNode });
    }

    segments.forEach(({ node, startInNode, endInNode }) => {
      let parent: Element | null = node.parentElement;
      while (parent && parent !== tempDiv) {
        if (parent.hasAttribute("data-issue-ids")) return;
        parent = parent.parentElement;
      }

      const nodeText = node.textContent || "";
      const beforeText = nodeText.substring(0, startInNode);
      const highlightText = nodeText.substring(startInNode, endInNode);
      const afterText = nodeText.substring(endInNode);

      const fragment = document.createDocumentFragment();
      if (beforeText) fragment.appendChild(document.createTextNode(beforeText));
      fragment.appendChild(
        createHighlightSpan(highlightText, issueIds, key, isAnyActive),
      );
      if (afterText) fragment.appendChild(document.createTextNode(afterText));

      if (node.parentNode) node.parentNode.replaceChild(fragment, node);
    });
  });

  return tempDiv.innerHTML;
};

/**
 * Component that renders document text with highlighted issue areas
 * CRITICAL: Supports multiple issues pointing to the same text
 * Now supports HTML rendering with formatting preserved
 */
export const TextHighlighter: React.FC<TextHighlighterProps> = ({
  text,
  html,
  issues,
  activeIssueIds,
  highlightedSpanRefs,
  onTextClick,
  onClearSelection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightedHtmlCacheRef = useRef<{
    cacheKey: string;
    html: string;
  } | null>(null);

  // Extract plain text for matching
  // CRITICAL: Always use backend's documentText (text prop) for position matching
  // wordRange positions are based on backend's plain text extraction
  // Only extract from HTML if backend text is not available
  const plainText = useMemo(() => {
    // Always prefer backend's documentText - it's what wordRange positions are based on
    if (text) {
      return text;
    }
    // Fallback: extract from HTML if backend text not available
    if (html) {
      return extractTextFromHtml(html);
    }
    return "";
  }, [text, html]);

  // Update refs and attach click handlers when HTML content or highlights change
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    // Capture ref at effect start to avoid stale closure issues
    const refs = highlightedSpanRefs.current;

    // Function to update refs for highlight elements
    const updateRefs = () => {
      const highlightElements = container.querySelectorAll(
        "[data-highlight-key]",
      );

      // Set up refs for all highlight elements
      highlightElements.forEach((el) => {
        const issueIds = el.getAttribute("data-issue-ids")?.split(",") || [];
        issueIds.forEach((issueId) => {
          refs.set(issueId, el as HTMLSpanElement);
        });
      });
    };

    // Use a small delay to ensure DOM is updated after dangerouslySetInnerHTML
    const timeoutId = setTimeout(updateRefs, 0);

    // Set up click handler via event delegation
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const highlightedSpan = target.closest("[data-issue-ids]") as HTMLElement;

      if (highlightedSpan) {
        e.stopPropagation();
        const issueIds =
          highlightedSpan.getAttribute("data-issue-ids")?.split(",") || [];
        if (issueIds.length > 0 && onTextClick) {
          onTextClick(issueIds);
        }
      } else if (onClearSelection) {
        // Clicked on non-highlighted text
        onClearSelection();
      }
    };

    container.addEventListener("click", handleClick);

    return () => {
      clearTimeout(timeoutId);
      // Cleanup refs using captured ref value
      const highlightElements = container.querySelectorAll(
        "[data-highlight-key]",
      );
      highlightElements.forEach((el) => {
        const issueIds = el.getAttribute("data-issue-ids")?.split(",") || [];
        issueIds.forEach((issueId) => {
          refs.delete(issueId);
        });
      });
      // Remove event listener
      container.removeEventListener("click", handleClick);
    };
  }, [
    html,
    issues,
    activeIssueIds,
    highlightedSpanRefs,
    onTextClick,
    onClearSelection,
  ]);

  /**
   * Build the rendered content with highlights
   * Groups issues by range so multiple issues can point to the same text
   */
  const renderedContent = useMemo(() => {
    if (!plainText) return null;

    // CRITICAL: Filter out any issues without valid wordRange (same rules as useIssueProcessing)
    const validIssues = issues.filter((issue) => {
      if (!issue.wordRange) {
        devWarn(
          `[TextHighlighter] Filtered out issue ${issue.id} - no wordRange`,
        );
        return false;
      }
      if (!validateWordRange(issue.wordRange, plainText)) {
        devWarn(
          `[TextHighlighter] Filtered out issue ${issue.id} - invalid wordRange`,
        );
        return false;
      }
      return true;
    });

    // Group issues by their word range
    const issuesByRange = groupIssuesByRange(validIssues);
    const uniqueRanges = getUniqueSortedRanges(issuesByRange);

    // If HTML is available, use it and apply highlights
    if (html) {
      const rangesWithIssues = uniqueRanges.map(({ start, end, key }) => ({
        start,
        end,
        key,
        issues: issuesByRange.get(key) || [],
      }));

      // Cache highlighted HTML - only recompute when ranges or activeIssueIds change
      // Optimized cache key: use hash of ranges + activeIssueIds (faster than string concat)
      const rangesKey =
        rangesWithIssues.length > 0
          ? `${rangesWithIssues.length}-${rangesWithIssues[0]?.start ?? 0}-${rangesWithIssues[rangesWithIssues.length - 1]?.end ?? 0}`
          : "0";
      const activeIdsKey =
        activeIssueIds.size > 0
          ? `${activeIssueIds.size}-${Array.from(activeIssueIds).sort().join(",")}`
          : "0";
      const cacheKey = `${html.length}-${rangesKey}-${activeIdsKey}`;
      let highlightedHtml: string;

      if (highlightedHtmlCacheRef.current?.cacheKey === cacheKey) {
        highlightedHtml = highlightedHtmlCacheRef.current.html;
      } else {
        highlightedHtml = applyHighlightsToHtml(
          html,
          plainText,
          rangesWithIssues,
          activeIssueIds,
        );
        highlightedHtmlCacheRef.current = { cacheKey, html: highlightedHtml };
      }

      return (
        <>
          <style>{`
            .word-document-content {
              max-width: 100%;
              overflow-x: auto;
              word-wrap: break-word;
            }
            .word-document-content * {
              max-width: 100%;
            }
            .word-document-content img {
              max-width: 100% !important;
              height: auto !important;
              display: block;
              margin: 10px auto;
              border-radius: 4px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .word-document-content table {
              max-width: 100%;
              table-layout: auto;
              border-collapse: collapse;
            }
            .word-document-content table img {
              max-width: 100% !important;
              margin: 5px auto;
            }
            .word-document-content figure {
              max-width: 100%;
              margin: 15px auto;
              text-align: center;
            }
            .word-document-content figure img {
              max-width: 100%;
            }
          `}</style>
          <div
            ref={containerRef}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            style={{
              padding: "20px",
              maxWidth: "100%",
              overflowX: "auto",
              wordWrap: "break-word",
            }}
            className="word-document-content"
          />
        </>
      );
    }

    // Fallback to plain text rendering (original implementation)
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Process each unique range
    uniqueRanges.forEach(({ start, end, key }, index) => {
      const issuesForRange = issuesByRange.get(key) || [];

      // Ensure we don't go backwards
      const actualStart = Math.max(start, lastIndex);
      const actualEnd = Math.min(end, plainText.length);

      // Skip invalid ranges
      if (actualStart >= actualEnd) return;

      // Check if there are nearby SEPARATE highlights (on same line)
      const hasNearbyHighlights = uniqueRanges.some(
        (otherRange, otherIndex) => {
          if (otherIndex === index) return false;

          const gapBefore = actualStart - otherRange.end;
          const gapAfter = otherRange.start - actualEnd;

          const isOverlapping =
            actualStart < otherRange.end && actualEnd > otherRange.start;
          if (isOverlapping) return false;

          const isVeryClose =
            (gapBefore >= 0 && gapBefore < 30) ||
            (gapAfter >= 0 && gapAfter < 30);
          if (!isVeryClose) return false;

          const textBetween = plainText.substring(
            Math.min(actualStart, otherRange.start),
            Math.max(actualEnd, otherRange.end),
          );
          const hasNewlineBetween =
            textBetween.includes("\n") || textBetween.includes("\r");

          return !hasNewlineBetween;
        },
      );

      // Add text before highlight
      if (actualStart > lastIndex) {
        const beforeText = plainText.substring(lastIndex, actualStart);
        if (beforeText.length > 0) {
          parts.push(
            <React.Fragment key={`text-before-${actualStart}`}>
              {beforeText}
            </React.Fragment>,
          );
        }
      }

      // Add highlighted text
      const highlightedText = plainText.substring(actualStart, actualEnd);
      if (highlightedText.length > 0) {
        const isAnyActive = issuesForRange.some((issue) =>
          activeIssueIds.has(issue.id),
        );
        const title = createIssueTitle(issuesForRange);
        const issueIds = issuesForRange.map((issue) => issue.id);

        parts.push(
          <HighlightedSpan
            key={`highlight-${key}-${actualStart}`}
            text={highlightedText}
            issues={issuesForRange}
            isActive={isAnyActive}
            title={title}
            hasNearbyHighlights={hasNearbyHighlights}
            highlightedSpanRefs={highlightedSpanRefs}
            onClick={() => {
              onTextClick(issueIds);
            }}
          />,
        );
      }

      lastIndex = actualEnd;
    });

    // Add remaining text
    if (lastIndex < plainText.length) {
      const remainingText = plainText.substring(lastIndex);
      if (remainingText.length > 0) {
        parts.push(
          <React.Fragment key={`text-end-${lastIndex}`}>
            {remainingText}
          </React.Fragment>,
        );
      }
    }

    return (
      <div
        style={{ padding: "20px", whiteSpace: "pre-wrap" }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const isHighlightedText = target.closest("[data-issue-ids]");

          if (!isHighlightedText && onClearSelection) {
            onClearSelection();
          }
        }}
      >
        {parts}
      </div>
    );
  }, [
    plainText,
    html,
    issues,
    activeIssueIds,
    highlightedSpanRefs,
    onTextClick,
    onClearSelection,
  ]);

  return <>{renderedContent}</>;
};

/**
 * Individual highlighted span component
 * Stores refs for all issues pointing to this text
 */
interface HighlightedSpanProps {
  text: string;
  issues: Issue[];
  isActive: boolean;
  title: string;
  hasNearbyHighlights: boolean;
  highlightedSpanRefs: React.MutableRefObject<Map<string, HTMLSpanElement>>;
  onClick: () => void;
}

const HighlightedSpan: React.FC<HighlightedSpanProps> = ({
  text,
  issues,
  isActive,
  title,
  hasNearbyHighlights,
  highlightedSpanRefs,
  onClick,
}) => {
  // Use lighter styling when there are multiple highlights nearby
  const baseOpacity = isActive ? 1 : 0.7;
  const nearbyOpacity = hasNearbyHighlights ? baseOpacity * 0.85 : baseOpacity;

  return (
    <span
      ref={(el) => {
        if (el) {
          // Store ref for ALL issues pointing to this text
          // CRITICAL: This enables connector drawing for any issue
          issues.forEach((issue) => {
            highlightedSpanRefs.current.set(issue.id, el);
          });
        } else {
          issues.forEach((issue) => {
            highlightedSpanRefs.current.delete(issue.id);
          });
        }
      }}
      data-issue-ids={issues.map((issue) => issue.id).join(",")}
      data-issue-text={text}
      title={title}
      style={{
        backgroundColor: hasNearbyHighlights
          ? "rgba(255, 235, 59, 0.5)" // Lighter yellow when multiple highlights nearby
          : DEFAULT_HIGHLIGHT_COLOR,
        cursor: "pointer",
        padding: "2px 0",
        opacity: nearbyOpacity,
        borderRadius: "2px",
        transition: "opacity 0.15s ease, background-color 0.15s ease",
        // Add visual separator when there are nearby highlights
        borderLeft: hasNearbyHighlights
          ? "2px solid rgba(255, 193, 7, 0.4)"
          : "none",
        borderRight: hasNearbyHighlights
          ? "2px solid rgba(255, 193, 7, 0.4)"
          : "none",
        marginLeft: hasNearbyHighlights ? "1px" : "0",
        marginRight: hasNearbyHighlights ? "1px" : "0",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {text}
    </span>
  );
};

export default TextHighlighter;
