import { Document as DocxDocument, Packer, Paragraph, TextRun } from "docx";
import JSZip from "jszip";
import { Issue } from "../types";

const WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
type XmlDocument = ReturnType<DOMParser["parseFromString"]>;

function toArrayBuffer(input: File | Blob | ArrayBuffer): Promise<ArrayBuffer> {
    if (input instanceof ArrayBuffer) return Promise.resolve(input);
    return (input as Blob).arrayBuffer();
}

interface RunInfo {
    element: Element;
    text: string;
    startIndex?: number;
    endIndex?: number;
}

function getRunText(runElement: Element): string {
    let text = "";
    const nodes = runElement.childNodes;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        const el = node as Element;
        const local = el.localName;
        const ns = el.namespaceURI;
        if (ns !== WORD_NS) continue;
        if (local === "t") text += node.textContent || "";
        else if (local === "tab") text += "\t";
        else if (local === "br" || local === "cr") text += "\n";
    }
    return text;
}

function buildRunMapping(body: Element): { runs: RunInfo[]; extractedText: string } {
    const runs: RunInfo[] = [];
    const paragraphTexts: string[] = [];
    const paragraphs = body.getElementsByTagNameNS(WORD_NS, "p");
    for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        const runEls = p.getElementsByTagNameNS(WORD_NS, "r");
        let paraText = "";
        for (let j = 0; j < runEls.length; j++) {
            const runEl = runEls[j];
            const text = getRunText(runEl);
            runs.push({ element: runEl, text });
            paraText += text;
        }
        paragraphTexts.push(paraText);
    }
    const extractedText = paragraphTexts.join("\n");
    let globalIndex = 0;
    let runIdx = 0;
    for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        const runEls = p.getElementsByTagNameNS(WORD_NS, "r");
        for (let j = 0; j < runEls.length; j++) {
            const run = runs[runIdx++];
            run.startIndex = globalIndex;
            run.endIndex = globalIndex + run.text.length;
            globalIndex = run.endIndex;
        }
        if (i < paragraphs.length - 1) globalIndex += 1;
    }
    return { runs, extractedText };
}

function addHighlightToRun(xmlDoc: XmlDocument, runElement: Element, color: string): void {
    let rPr = runElement.getElementsByTagNameNS(WORD_NS, "rPr")[0];
    if (!rPr) {
        rPr = xmlDoc.createElementNS(WORD_NS, "rPr");
        runElement.insertBefore(rPr, runElement.firstChild);
    }
    let highlight = rPr.getElementsByTagNameNS(WORD_NS, "highlight")[0];
    if (!highlight) {
        highlight = xmlDoc.createElementNS(WORD_NS, "highlight");
        highlight.setAttributeNS(WORD_NS, "val", color);
        rPr.appendChild(highlight);
    } else {
        highlight.setAttributeNS(WORD_NS, "val", color);
    }
}

function insertCommentRange(xmlDoc: XmlDocument, commentId: number, firstRun: Element, lastRun: Element): void {
    const idStr = commentId.toString();
    const paraFirst = firstRun.parentElement;
    const paraLast = lastRun.parentElement;
    if (!paraFirst || !paraLast) return;
    const rangeStart = xmlDoc.createElementNS(WORD_NS, "commentRangeStart");
    rangeStart.setAttributeNS(WORD_NS, "id", idStr);
    paraFirst.insertBefore(rangeStart, firstRun);
    const rangeEnd = xmlDoc.createElementNS(WORD_NS, "commentRangeEnd");
    rangeEnd.setAttributeNS(WORD_NS, "id", idStr);
    const refRun = xmlDoc.createElementNS(WORD_NS, "r");
    const commentRef = xmlDoc.createElementNS(WORD_NS, "commentReference");
    commentRef.setAttributeNS(WORD_NS, "id", idStr);
    refRun.appendChild(commentRef);
    if (paraFirst === paraLast) {
        const afterLast = lastRun.nextSibling;
        paraFirst.insertBefore(rangeEnd, afterLast);
        paraFirst.insertBefore(refRun, afterLast);
    } else {
        paraLast.appendChild(rangeEnd);
        paraLast.appendChild(refRun);
    }
}

async function generateWordDocumentFromOriginal(
    originalBuffer: ArrayBuffer,
    documentText: string,
    issues: Issue[]
): Promise<Blob> {
    const issuesWithRanges = issues.filter(
        (issue) => issue.wordRange && issue.wordRange.start >= 0 && issue.wordRange.end > issue.wordRange.start
    );
    issuesWithRanges.sort((a, b) => {
        const aStart = a.wordRange!.start;
        const bStart = b.wordRange!.start;
        if (aStart !== bStart) return aStart - bStart;
        return (a.wordRange!.end - b.wordRange!.end);
    });
    const zip = await JSZip.loadAsync(originalBuffer);
    const documentXml = await zip.file("word/document.xml")?.async("string");
    if (!documentXml) throw new Error("Original document has no word/document.xml");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, "text/xml");
    if (xmlDoc.querySelector("parsererror")) throw new Error("Failed to parse document.xml");
    const body = xmlDoc.getElementsByTagNameNS(WORD_NS, "body")[0];
    if (!body) throw new Error("document.xml has no w:body");
    const { runs } = buildRunMapping(body);
    const commentData: Array<{ commentId: number; text: string; issue: string; reasoning: string; recommendation: string; type: string; severity: number; author: string; date: string }> = [];
    let commentId = 0;
    for (const issue of issuesWithRanges) {
        const start = issue.wordRange!.start;
        const end = issue.wordRange!.end;
        const overlappingRuns = runs.filter((r) => r.startIndex! < end && r.endIndex! > start);
        if (overlappingRuns.length === 0) continue;
        commentId++;
        const issueType = (issue.type || "issue").toUpperCase().replace(/_/g, " ");
        const severity = issue.severity ?? 5;
        const highlightedText = documentText.substring(start, end);
        commentData.push({
            commentId,
            text: highlightedText,
            issue: issue.body?.issue ?? "",
            reasoning: issue.body?.reasoning ?? "",
            recommendation: issue.body?.recommendation ?? "",
            type: issueType,
            severity,
            author: `${issueType} - Severity ${severity}`,
            date: new Date().toISOString(),
        });
        const highlightColor = getWordHighlightColor(severity);
        for (const run of overlappingRuns) addHighlightToRun(xmlDoc, run.element, highlightColor);
        const firstRun = overlappingRuns[0];
        const lastRun = overlappingRuns[overlappingRuns.length - 1];
        insertCommentRange(xmlDoc, commentId, firstRun.element, lastRun.element);
    }
    const serializer = new XMLSerializer();
    zip.file("word/document.xml", serializer.serializeToString(xmlDoc));
    if (commentData.length > 0) {
        zip.file("word/comments.xml", buildCommentsXml(commentData));
        const contentTypesXml = await zip.file("[Content_Types].xml")?.async("string");
        if (contentTypesXml) zip.file("[Content_Types].xml", addCommentsToContentTypes(contentTypesXml));
        const relsXml = await zip.file("word/_rels/document.xml.rels")?.async("string");
        if (relsXml) zip.file("word/_rels/document.xml.rels", addCommentsRelationship(relsXml));
    }
    const newBuffer = await zip.generateAsync({ type: "arraybuffer" });
    return new Blob([newBuffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

/**
 * Convert severity (1-10) to Word highlight color
 * Word supports: yellow, green, cyan, magenta, blue, red, darkBlue, darkCyan, darkGreen, darkMagenta, darkRed, darkYellow, darkGray, lightGray, black, white, none
 * Maps severity levels to appropriate Word highlight colors
 */
const getWordHighlightColor = (severity: number): "cyan" | "blue" | "green" | "yellow" | "darkYellow" | "magenta" | "red" => {
    const clampedSeverity = Math.max(1, Math.min(10, severity));

    // Map severity to Word highlight colors
    // Lower severity (1-3): blue/cyan (calm, informational)
    // Medium severity (4-6): yellow/green (warning, attention)
    // High severity (7-10): red/magenta (critical, urgent)
    if (clampedSeverity <= 2) {
        return "cyan"; // Very low severity - informational
    } else if (clampedSeverity <= 4) {
        return "blue"; // Low severity - notice
    } else if (clampedSeverity <= 5) {
        return "green"; // Medium-low severity - minor issue
    } else if (clampedSeverity <= 6) {
        return "yellow"; // Medium severity - warning (default)
    } else if (clampedSeverity <= 7) {
        return "darkYellow"; // Medium-high severity - important warning
    } else if (clampedSeverity <= 8) {
        return "magenta"; // High severity - critical
    } else {
        return "red"; // Very high severity (9-10) - urgent/critical
    }
};

/**
 * Generate a Word document with comments from validation issues.
 * When originalDocxFile is provided, preserves the original document (formatting, images) and only adds highlights and comments.
 *
 * @param documentText - The full text of the document
 * @param issues - Array of issues with wordRanges
 * @param fileName - Original file name
 * @param originalDocxFile - Optional original .docx (File | Blob | ArrayBuffer) to preserve formatting and images
 * @returns Promise<Blob> Word document as blob for download
 */
export const generateWordDocumentWithComments = async (
    documentText: string,
    issues: Issue[],
    fileName: string = "document",
    originalDocxFile?: File | Blob | ArrayBuffer
): Promise<Blob> => {
    try {
        if (!documentText || typeof documentText !== "string") {
            throw new Error("documentText must be a non-empty string");
        }
        if (!issues || !Array.isArray(issues)) {
            throw new Error("issues must be a non-empty array");
        }
        if (originalDocxFile) {
            const buffer = await toArrayBuffer(originalDocxFile);
            return generateWordDocumentFromOriginal(buffer, documentText, issues);
        }

        const issuesWithRanges = issues.filter(
            (issue) => issue.wordRange && issue.wordRange.start >= 0 && issue.wordRange.end > issue.wordRange.start
        );

        if (issuesWithRanges.length === 0) {
            console.warn("[WordDocumentGenerator] No issues with valid wordRanges, generating document without comments");
        }

        // Sort issues by start position, then by end position
        issuesWithRanges.sort((a, b) => {
            const aStart = a.wordRange!.start;
            const bStart = b.wordRange!.start;
            if (aStart !== bStart) return aStart - bStart;
            return (a.wordRange!.end - b.wordRange!.end);
        });

        // Build document paragraphs with highlights and track comment data
        const paragraphs: Paragraph[] = [];
        const commentData: Array<{
            commentId: number;
            text: string;
            issue: string;
            reasoning: string;
            recommendation: string;
            type: string;
            severity: number;
            author: string;
            date: string;
        }> = [];
        let commentId = 0;

        // Split document by lines (newlines) to process line by line
        const documentLines: string[] = [];
        let currentLine = "";
        const lineStartIndices: number[] = [0];

        for (let i = 0; i < documentText.length; i++) {
            const char = documentText[i];
            if (char === "\n") {
                documentLines.push(currentLine);
                currentLine = "";
                lineStartIndices.push(i + 1);
            } else {
                currentLine += char;
            }
        }
        // Add last line if document doesn't end with newline
        if (currentLine.length > 0 || documentText.endsWith("\n")) {
            documentLines.push(currentLine);
        }

        // Process each line and add highlights/comments
        documentLines.forEach((line, lineIndex) => {
            const lineStart = lineStartIndices[lineIndex];
            const lineEnd = lineStart + line.length;

            // Find all issues that overlap with this line
            const lineIssues = issuesWithRanges.filter((issue) => {
                const issueStart = issue.wordRange!.start;
                const issueEnd = issue.wordRange!.end;
                return issueStart < lineEnd && issueEnd > lineStart;
            });

            // Sort issues by start position within this line
            const sortedLineIssues = lineIssues.sort((a, b) => {
                return a.wordRange!.start - b.wordRange!.start;
            });

            const lineChildren: TextRun[] = [];
            let linePos = 0;

            if (sortedLineIssues.length === 0) {
                // No issues in this line, add entire line as plain text
                if (line.length > 0) {
                    lineChildren.push(new TextRun(line));
                }
            } else {
                // Group issues by their wordRange to handle multiple issues on same text
                const issuesByRange = new Map<string, Issue[]>();
                sortedLineIssues.forEach((issue) => {
                    const rangeKey = `${issue.wordRange!.start}-${issue.wordRange!.end}`;
                    if (!issuesByRange.has(rangeKey)) {
                        issuesByRange.set(rangeKey, []);
                    }
                    issuesByRange.get(rangeKey)!.push(issue);
                });

                // Process each unique range
                Array.from(issuesByRange.entries()).sort(([keyA], [keyB]) => {
                    const [startA] = keyA.split("-").map(Number);
                    const [startB] = keyB.split("-").map(Number);
                    return startA - startB;
                }).forEach(([rangeKey, issuesAtRange]) => {
                    const firstIssue = issuesAtRange[0];
                    const issueStart = firstIssue.wordRange!.start;
                    const issueEnd = firstIssue.wordRange!.end;

                    // Add text before this issue range
                    const beforeStart = Math.max(lineStart, linePos);
                    const beforeEnd = Math.min(issueStart, lineEnd);
                    if (beforeEnd > beforeStart) {
                        const beforeText = documentText.substring(beforeStart, beforeEnd);
                        if (beforeText.length > 0) {
                            lineChildren.push(new TextRun(beforeText));
                        }
                    }

                    // Add highlighted text for this range (all issues at this range share the highlight)
                    const highlightStart = Math.max(issueStart, lineStart);
                    const highlightEnd = Math.min(issueEnd, lineEnd);
                    if (highlightEnd > highlightStart) {
                        const highlightedText = documentText.substring(highlightStart, highlightEnd);

                        // Create comment data for EACH issue at this range
                        issuesAtRange.forEach((issueRange) => {
                            commentId++;
                            const issueType = (issueRange.type || "issue").toUpperCase().replace(/_/g, " ");
                            const severity = issueRange.severity || 0;
                            const commentInfo = {
                                commentId,
                                text: highlightedText,
                                issue: issueRange.body.issue || "",
                                reasoning: issueRange.body.reasoning || "",
                                recommendation: issueRange.body.recommendation || "",
                                type: issueType,
                                severity: severity,
                                author: `${issueType} - Severity ${severity}`,
                                date: new Date().toISOString(),
                            };
                            commentData.push(commentInfo);
                        });

                        // Add single highlighted text run (shared by all issues at this range)
                        // Use the highest severity when multiple issues share the same text
                        const maxSeverity = Math.max(...issuesAtRange.map(issue => issue.severity || 5));
                        const highlightColor = getWordHighlightColor(maxSeverity);

                        lineChildren.push(
                            new TextRun({
                                text: highlightedText,
                                highlight: highlightColor,
                            })
                        );
                    }

                    linePos = Math.max(linePos, highlightEnd);
                });

                // Add remaining text after last issue
                if (linePos < lineEnd) {
                    const remainingText = documentText.substring(linePos, lineEnd);
                    if (remainingText.length > 0) {
                        lineChildren.push(new TextRun(remainingText));
                    }
                }
            }

            // If line is empty but has issues, add a space
            if (lineChildren.length === 0) {
                lineChildren.push(new TextRun(" "));
            }

            // Create paragraph for this line
            paragraphs.push(
                new Paragraph({
                    children: lineChildren.length > 0 ? lineChildren : [new TextRun(" ")],
                })
            );
        });

        // If no paragraphs were created, add at least one with the full text
        if (paragraphs.length === 0) {
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun(documentText || " ")],
                })
            );
        }

        // Create the document WITHOUT comments (to avoid docx library bug)
        const doc = new DocxDocument({
            sections: [
                {
                    children: paragraphs,
                },
            ],
        });

        // Generate initial blob using browser-compatible method
        const blob = await Packer.toBlob(doc);

        // If we have comments, manually inject them into the DOCX XML
        if (commentData.length > 0) {
            try {
                // Convert blob to ArrayBuffer for ZIP manipulation
                const arrayBuffer = await blob.arrayBuffer();
                const bufferWithComments = await injectCommentsIntoDocx(arrayBuffer, commentData);
                return new Blob([bufferWithComments], {
                    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                });
            } catch (error) {
                // Return document with highlights but without comments if injection fails
                return blob;
            }
        }

        return blob;
    } catch (error) {
        throw error;
    }
};

/**
 * Manually inject comments into DOCX XML structure
 * This is a workaround for the docx library bug with comments
 */
async function injectCommentsIntoDocx(
    buffer: ArrayBuffer,
    commentData: Array<{
        commentId: number;
        text: string;
        issue: string;
        reasoning: string;
        recommendation: string;
        type: string;
        severity: number;
        author: string;
        date: string;
    }>
): Promise<ArrayBuffer> {
    const zip = await JSZip.loadAsync(buffer);

    // Step 1: Create comments.xml
    const commentsXml = buildCommentsXml(commentData);
    zip.file("word/comments.xml", commentsXml);

    // Step 2: Update document.xml to add comment ranges
    const documentXml = await zip.file("word/document.xml")?.async("string");
    if (!documentXml) {
        throw new Error("Could not read document.xml");
    }

    const updatedDocumentXml = addCommentRangesToDocument(documentXml, commentData);
    zip.file("word/document.xml", updatedDocumentXml);

    // Step 3: Update [Content_Types].xml
    const contentTypesXml = await zip.file("[Content_Types].xml")?.async("string");
    if (contentTypesXml) {
        const updatedContentTypes = addCommentsToContentTypes(contentTypesXml);
        zip.file("[Content_Types].xml", updatedContentTypes);
    }

    // Step 4: Update word/_rels/document.xml.rels
    const relsXml = await zip.file("word/_rels/document.xml.rels")?.async("string");
    if (relsXml) {
        const updatedRels = addCommentsRelationship(relsXml);
        zip.file("word/_rels/document.xml.rels", updatedRels);
    }

    // Generate new buffer
    const newBuffer = await zip.generateAsync({ type: "arraybuffer" });
    return newBuffer;
}

/**
 * Build comments.xml XML string
 */
function buildCommentsXml(commentData: Array<{
    commentId: number;
    issue: string;
    reasoning: string;
    recommendation: string;
    type: string;
    severity: number;
    author: string;
    date: string;
}>): string {
    const comments = commentData.map((comment) => {
        const dateStr = comment.date.replace("T", "T").split(".")[0] + "Z";
        return `    <w:comment w:id="${comment.commentId}" w:author="${escapeXml(comment.author)}" w:date="${dateStr}" w:initials="${escapeXml(comment.type.substring(0, 2))}">
      <w:p>
        <w:r>
          <w:rPr>
            <w:b/>
          </w:rPr>
          <w:t xml:space="preserve">Issue:</w:t>
        </w:r>
        <w:r>
          <w:t xml:space="preserve"> ${escapeXml(comment.issue)}</w:t>
        </w:r>
      </w:p>
      <w:p>
        <w:r>
          <w:rPr>
            <w:b/>
          </w:rPr>
          <w:t xml:space="preserve">Reasoning:</w:t>
        </w:r>
        <w:r>
          <w:t xml:space="preserve"> ${escapeXml(comment.reasoning)}</w:t>
        </w:r>
      </w:p>
      <w:p>
        <w:r>
          <w:rPr>
            <w:b/>
          </w:rPr>
          <w:t xml:space="preserve">Recommendation:</w:t>
        </w:r>
        <w:r>
          <w:t xml:space="preserve"> ${escapeXml(comment.recommendation)}</w:t>
        </w:r>
      </w:p>
    </w:comment>`;
    }).join("\n");

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
${comments}
</w:comments>`;
}

/**
 * Add comment ranges to document.xml
 * Uses DOMParser for proper XML manipulation
 */
function addCommentRangesToDocument(documentXml: string, commentData: Array<{
    commentId: number;
    text: string;
}>): string {
    try {
        // Parse XML using DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(documentXml, "text/xml");

        // Check for parsing errors
        const parseError = xmlDoc.querySelector("parsererror");
        if (parseError) {
            console.warn("[WordDocumentGenerator] XML parsing error, using fallback method:", parseError.textContent);
            return addCommentRangesFallback(documentXml, commentData);
        }

        // Group comments by text to handle multiple comments on same text
        const commentsByText = new Map<string, number[]>();
        commentData.forEach((comment) => {
            const textKey = comment.text.toLowerCase().trim();
            if (!commentsByText.has(textKey)) {
                commentsByText.set(textKey, []);
            }
            commentsByText.get(textKey)!.push(comment.commentId);
        });

        // Track which comment IDs have been processed to avoid duplicates
        const processedComments = new Set<number>();

        // Build a map of highlighted runs with their comment IDs
        const highlightedRuns: Array<{ run: Element; commentIds: number[] }> = [];

        // Define the Word namespace
        const wordNS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

        // Find all text runs (w:t elements) using getElementsByTagNameNS for namespaced XML
        const textRuns = xmlDoc.getElementsByTagNameNS(wordNS, "t");

        Array.from(textRuns).forEach((textNode) => {
            const textContent = textNode.textContent || "";
            const normalizedText = textContent.toLowerCase().trim();

            // Skip empty text nodes
            if (!normalizedText) return;

            const parentRun = textNode.parentElement; // w:r
            if (!parentRun) return;

            // Check if this run has highlighting (any highlight color indicates our issue text)
            const highlight = parentRun.getElementsByTagNameNS(wordNS, "highlight")[0];
            if (!highlight) {
                return; // Only process highlighted text
            }

            // Check if this text matches any of our comment texts
            const matchingCommentIds: number[] = [];
            commentsByText.forEach((commentIds, commentText) => {
                // Only match if the text content exactly matches or contains the comment text as a significant portion
                const isExactMatch = normalizedText === commentText;
                const isSubstringMatch = normalizedText.includes(commentText) && commentText.length > 3;

                if (isExactMatch || isSubstringMatch) {
                    commentIds.forEach(id => {
                        if (!processedComments.has(id)) {
                            matchingCommentIds.push(id);
                            processedComments.add(id);
                        }
                    });
                }
            });

            if (matchingCommentIds.length > 0) {
                highlightedRuns.push({ run: parentRun, commentIds: matchingCommentIds });
            }
        });

        // Now add comment ranges around each highlighted run
        highlightedRuns.forEach(({ run, commentIds }) => {
            const parentPara = run.parentElement; // Should be w:p
            if (!parentPara) return;


            // Create elements for all comment IDs at this location
            commentIds.forEach((commentId) => {
                // Create comment range start element
                const rangeStart = xmlDoc.createElementNS(wordNS, "commentRangeStart");
                rangeStart.setAttributeNS(wordNS, "id", commentId.toString());

                // Insert range start immediately before the highlighted run
                parentPara.insertBefore(rangeStart, run);
            });

            // Create comment range ends and references after the run
            const afterElement = run.nextSibling;
            commentIds.forEach((commentId) => {
                // Create comment range end element
                const rangeEnd = xmlDoc.createElementNS(wordNS, "commentRangeEnd");
                rangeEnd.setAttributeNS(wordNS, "id", commentId.toString());

                // Create comment reference run
                const commentRefRun = xmlDoc.createElementNS(wordNS, "r");
                const commentRef = xmlDoc.createElementNS(wordNS, "commentReference");
                commentRef.setAttributeNS(wordNS, "id", commentId.toString());
                commentRefRun.appendChild(commentRef);

                // Insert range end and comment reference after the run
                if (afterElement) {
                    parentPara.insertBefore(rangeEnd, afterElement);
                    parentPara.insertBefore(commentRefRun, afterElement);
                } else {
                    parentPara.appendChild(rangeEnd);
                    parentPara.appendChild(commentRefRun);
                }
            });
        });

        // Serialize back to string
        const serializer = new XMLSerializer();
        return serializer.serializeToString(xmlDoc);
    } catch (error) {
        console.warn("[WordDocumentGenerator] Error parsing XML, using fallback:", error);
        return addCommentRangesFallback(documentXml, commentData);
    }
}

/**
 * Fallback method for adding comment ranges using string replacement
 * Used when XML parsing fails
 */
function addCommentRangesFallback(documentXml: string, commentData: Array<{
    commentId: number;
    text: string;
}>): string {
    // Group comments by text
    const commentsByText = new Map<string, number[]>();
    commentData.forEach((comment) => {
        const textKey = comment.text.toLowerCase().trim();
        if (!commentsByText.has(textKey)) {
            commentsByText.set(textKey, []);
        }
        commentsByText.get(textKey)!.push(comment.commentId);
    });

    let updatedXml = documentXml;
    const processedComments = new Set<number>();


    // Process each comment group
    commentsByText.forEach((commentIds, text) => {
        // Skip if already processed
        if (commentIds.every(id => processedComments.has(id))) {
            return;
        }

        const escapedText = escapeRegex(text);
        // Look for highlighted text runs - match the entire <w:r> element with any highlight color
        const pattern = new RegExp(`(<w:r>\\s*<w:rPr>.*?<w:highlight w:val="[^"]+".*?</w:rPr>\\s*<w:t[^>]*>)([^<]*${escapedText}[^<]*)(</w:t>\\s*</w:r>)`, "gi");

        let hasMatched = false;
        updatedXml = updatedXml.replace(pattern, (match, runStart, content, runEnd) => {
            // Only process first match for this text
            if (hasMatched) return match;

            // Check if we've already processed these comments
            const alreadyProcessed = commentIds.every(id => processedComments.has(id));
            if (alreadyProcessed) {
                return match;
            }

            // Check if comment ranges already exist in this match
            if (match.includes('commentRangeStart') || match.includes('commentRangeEnd')) {
                return match;
            }

            hasMatched = true;

            // Mark these comments as processed
            commentIds.forEach(id => processedComments.add(id));

            // Build the result with comment ranges wrapping around the highlighted run
            let result = "";

            // Add all commentRangeStart before the run
            commentIds.forEach((commentId) => {
                result += `<w:commentRangeStart w:id="${commentId}"/>`;
            });

            // Add the highlighted run itself
            result += runStart + content + runEnd;

            // Add all commentRangeEnd and commentReference after the run
            commentIds.forEach((commentId) => {
                result += `<w:commentRangeEnd w:id="${commentId}"/>`;
                result += `<w:r><w:commentReference w:id="${commentId}"/></w:r>`;
            });

            return result;
        });
    });

    return updatedXml;
}

/**
 * Add comments to [Content_Types].xml
 */
function addCommentsToContentTypes(contentTypesXml: string): string {
    if (contentTypesXml.includes("/word/comments.xml")) {
        return contentTypesXml; // Already has comments
    }

    // Find the </Types> tag and insert before it
    const insertPos = contentTypesXml.lastIndexOf("</Types>");
    if (insertPos === -1) {
        return contentTypesXml;
    }

    const override = `  <Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/>
`;

    return contentTypesXml.substring(0, insertPos) + override + contentTypesXml.substring(insertPos);
}

/**
 * Add comments relationship to word/_rels/document.xml.rels
 */
function addCommentsRelationship(relsXml: string): string {
    if (relsXml.includes("comments.xml")) {
        return relsXml; // Already has relationship
    }

    // Find the </Relationships> tag and insert before it
    const insertPos = relsXml.lastIndexOf("</Relationships>");
    if (insertPos === -1) {
        return relsXml;
    }

    // Find the highest relationship ID
    const idMatch = relsXml.match(/rId(\d+)/g);
    let maxId = 0;
    if (idMatch) {
        idMatch.forEach((match) => {
            const id = parseInt(match.replace("rId", ""), 10);
            if (id > maxId) maxId = id;
        });
    }
    const newId = maxId + 1;

    const relationship = `  <Relationship Id="rId${newId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments" Target="comments.xml"/>
`;

    return relsXml.substring(0, insertPos) + relationship + relsXml.substring(insertPos);
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Escape regex special characters
 */
function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

