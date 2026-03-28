import JSZip from "jszip";

export interface ExtractedComment {
    id: string;
    author: string;
    date: string;
    text: string;
    issue?: string;
    reasoning?: string;
    recommendation?: string;
    type?: string;
    severity?: number;
    associatedText?: string; // The text that the comment highlights/refers to
}

export interface AnnotationSummary {
    summary: string;
    annotations: ExtractedComment[];
}

/**
 * Extract text from a node and its children recursively
 */
const extractTextFromNode = (node: Node, wordNS: string): string => {
    const textParts: string[] = [];

    if (node.nodeType === 1) { // ELEMENT_NODE
        const element = node as Element;
        if (element.namespaceURI === wordNS && element.localName === "t") {
            const text = element.textContent || "";
            if (text.trim()) {
                textParts.push(text);
            }
        } else {
            // Recursively search for w:t elements in child nodes
            const textNodes = element.getElementsByTagNameNS(wordNS, "t");
            Array.from(textNodes).forEach((textNode) => {
                const text = textNode.textContent || "";
                if (text.trim()) {
                    textParts.push(text);
                }
            });
        }
    } else if (node.nodeType === 3) { // TEXT_NODE
        const text = node.textContent || "";
        if (text.trim()) {
            textParts.push(text);
        }
    }

    return textParts.join("");
};

/**
 * Extract adjacent text near a comment location when selected text is empty
 * @param anchorNode - The node to start searching from (commentRangeStart or commentRangeEnd)
 * @param wordNS - Word namespace
 * @param maxChars - Maximum characters to extract (default: 200)
 * @returns Adjacent text or undefined
 */
const extractAdjacentText = (
    anchorNode: Node,
    wordNS: string,
    maxChars: number = 200
): string | undefined => {
    try {
        let charCount = 0;

        // Strategy 1: Look backward from commentRangeStart
        let currentNode: Node | null = anchorNode.previousSibling;
        const backwardText: string[] = [];

        while (currentNode && charCount < maxChars) {
            const text = extractTextFromNode(currentNode, wordNS);
            if (text.trim()) {
                backwardText.unshift(text); // Add to beginning
                charCount += text.length;
            }
            currentNode = currentNode.previousSibling;
        }

        // Strategy 2: Look forward from commentRangeEnd (or commentRangeStart if no end)
        currentNode = anchorNode.nextSibling;
        const forwardText: string[] = [];
        charCount = 0;

        while (currentNode && charCount < maxChars) {
            // Skip commentRangeEnd if we encounter it
            if (currentNode.nodeType === 1) {
                const element = currentNode as Element;
                if (element.namespaceURI === wordNS && element.localName === "commentRangeEnd") {
                    currentNode = currentNode.nextSibling;
                    continue;
                }
            }

            const text = extractTextFromNode(currentNode, wordNS);
            if (text.trim()) {
                forwardText.push(text);
                charCount += text.length;
            }
            currentNode = currentNode.nextSibling;
        }

        // Combine backward and forward text
        const combinedText = [...backwardText, ...forwardText].join("").trim();

        if (combinedText.length > 0) {
            // Limit to maxChars total
            return combinedText.length > maxChars
                ? combinedText.substring(0, maxChars) + "..."
                : combinedText;
        }

        // Strategy 3: If still no text, try to get text from the same paragraph
        let parent = anchorNode.parentElement;
        while (parent) {
            if (parent.namespaceURI === wordNS && parent.localName === "p") {
                const paraText = extractTextFromNode(parent, wordNS).trim();
                if (paraText.length > 0) {
                    return paraText.length > maxChars
                        ? paraText.substring(0, maxChars) + "..."
                        : paraText;
                }
            }
            parent = parent.parentElement;
        }
    } catch (error) {
        console.warn(`[ExtractComments] Error extracting adjacent text:`, error);
    }

    return undefined;
};

/**
 * Extract the text associated with a comment range from document.xml
 * If selected text is empty, auto-detect adjacent text near the comment location
 * @param documentXml - The parsed document.xml DOM
 * @param commentId - The comment ID to find text for
 * @param wordNS - Word namespace
 * @returns The associated text or undefined if not found
 */
const extractAssociatedText = (
    documentXml: Document,
    commentId: string,
    wordNS: string
): string | undefined => {
    try {
        // Find all commentRangeStart elements
        const commentRangeStarts = documentXml.getElementsByTagNameNS(wordNS, "commentRangeStart");
        const commentRangeEnds = documentXml.getElementsByTagNameNS(wordNS, "commentRangeEnd");

        for (let i = 0; i < commentRangeStarts.length; i++) {
            const startEl = commentRangeStarts[i];
            const startCommentId = startEl.getAttribute("w:id");

            if (startCommentId === commentId) {
                // Find the corresponding commentRangeEnd
                let currentNode: Node | null = startEl.nextSibling;
                const textParts: string[] = [];

                while (currentNode) {
                    // Check if we've reached the matching commentRangeEnd
                    const isElement = currentNode.nodeType === 1; // ELEMENT_NODE = 1
                    if (isElement) {
                        const element = currentNode as Element;
                        if (element.namespaceURI === wordNS && element.localName === "commentRangeEnd") {
                            const endCommentId = element.getAttribute("w:id");
                            if (endCommentId === commentId) {
                                break; // Found the matching end
                            }
                        }
                    }

                    // Extract text from w:t elements
                    if (isElement) {
                        const element = currentNode as Element;
                        if (element.namespaceURI === wordNS && element.localName === "t") {
                            const text = element.textContent || "";
                            if (text.trim()) {
                                textParts.push(text);
                            }
                        } else {
                            // Recursively search for w:t elements in child nodes
                            const textNodes = element.getElementsByTagNameNS(wordNS, "t");
                            Array.from(textNodes).forEach((textNode) => {
                                const text = textNode.textContent || "";
                                if (text.trim()) {
                                    textParts.push(text);
                                }
                            });
                        }
                    } else if (currentNode.nodeType === 3) { // TEXT_NODE = 3
                        const text = currentNode.textContent || "";
                        if (text.trim()) {
                            textParts.push(text);
                        }
                    }

                    currentNode = currentNode.nextSibling;
                }

                const associatedText = textParts.join("").trim();

                // If selected text is empty, auto-detect adjacent text
                if (!associatedText || associatedText.length === 0) {
                    console.log(`[ExtractComments] Comment ${commentId} has no selected text, detecting adjacent text...`);

                    // Try to find commentRangeEnd to use as anchor
                    let anchorNode: Node | null = startEl;

                    // Look for matching commentRangeEnd
                    for (let j = 0; j < commentRangeEnds.length; j++) {
                        const endEl = commentRangeEnds[j];
                        const endCommentId = endEl.getAttribute("w:id");
                        if (endCommentId === commentId) {
                            anchorNode = endEl;
                            break;
                        }
                    }

                    if (anchorNode) {
                        const adjacentText = extractAdjacentText(anchorNode, wordNS);
                        if (adjacentText) {
                            console.log(`[ExtractComments] Detected adjacent text for comment ${commentId}: "${adjacentText.substring(0, 50)}..."`);
                            return adjacentText;
                        }
                    }

                    // Fallback: use commentRangeStart as anchor
                    const adjacentFromStart = extractAdjacentText(startEl, wordNS);
                    if (adjacentFromStart) {
                        console.log(`[ExtractComments] Detected adjacent text from start for comment ${commentId}: "${adjacentFromStart.substring(0, 50)}..."`);
                        return adjacentFromStart;
                    }
                }

                return associatedText || undefined;
            }
        }
    } catch (error) {
        console.warn(`[ExtractComments] Error extracting associated text for comment ${commentId}:`, error);
    }

    return undefined;
};

/**
 * Extract comments from a Word document (.docx)
 * Reads the comments.xml file from the DOCX archive and associates comments with their highlighted text
 * 
 * @param file - The Word document file
 * @returns Promise<AnnotationSummary> - Summary and extracted comments with associated text
 */
export const extractCommentsFromDocx = async (
    file: File
): Promise<AnnotationSummary> => {
    try {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Load the DOCX file (which is a ZIP archive)
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Read comments.xml if it exists
        const commentsFile = zip.file("word/comments.xml");

        if (!commentsFile) {
            // No comments found
            return {
                summary: "No annotations found in this document.",
                annotations: [],
            };
        }

        // Parse comments.xml
        const commentsXml = await commentsFile.async("string");
        const parser = new DOMParser();
        const commentsDoc = parser.parseFromString(commentsXml, "text/xml");

        // Check for parsing errors
        const parseError = commentsDoc.querySelector("parsererror");
        if (parseError) {
            throw new Error("Failed to parse comments.xml");
        }

        // Read document.xml to extract associated text
        const documentFile = zip.file("word/document.xml");
        let documentDoc: Document | null = null;

        if (documentFile) {
            try {
                const documentXml = await documentFile.async("string");
                documentDoc = parser.parseFromString(documentXml, "text/xml");

                // Check for parsing errors
                const docParseError = documentDoc.querySelector("parsererror");
                if (docParseError) {
                    console.warn("[ExtractComments] Failed to parse document.xml, will extract comments without associated text");
                    documentDoc = null;
                }
            } catch (error) {
                console.warn("[ExtractComments] Error reading document.xml:", error);
                documentDoc = null;
            }
        }

        // Define Word namespace
        const wordNS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

        // Extract all comments
        const commentElements = commentsDoc.getElementsByTagNameNS(wordNS, "comment");
        const annotations: ExtractedComment[] = [];

        Array.from(commentElements).forEach((commentEl, index) => {
            const commentId = commentEl.getAttribute("w:id") || `comment-${index}`;

            // Extract author
            const authorEl = commentEl.getElementsByTagNameNS(wordNS, "author")[0];
            const author = authorEl?.textContent || "Unknown";

            // Extract date
            const dateEl = commentEl.getElementsByTagNameNS(wordNS, "date")[0];
            const date = dateEl?.getAttribute("w:val") || dateEl?.textContent || "";

            // Extract comment text (all w:t elements within w:p elements)
            const paragraphs = commentEl.getElementsByTagNameNS(wordNS, "p");
            const textParts: string[] = [];

            Array.from(paragraphs).forEach((para) => {
                const textNodes = para.getElementsByTagNameNS(wordNS, "t");
                Array.from(textNodes).forEach((textNode) => {
                    const text = textNode.textContent || "";
                    if (text.trim()) {
                        textParts.push(text);
                    }
                });
            });

            const commentText = textParts.join(" ").trim();

            // Try to parse structured comment format
            // Format: "Issue (type): issue\n\nReasoning: reasoning\n\nRecommendation: recommendation"
            let issue: string | undefined;
            let reasoning: string | undefined;
            let recommendation: string | undefined;
            let type: string | undefined;

            if (commentText.includes("Issue (") && commentText.includes("Reasoning:") && commentText.includes("Recommendation:")) {
                // Use [\s\S] instead of . with s flag for ES2017 compatibility
                const issueMatch = commentText.match(/Issue\s*\(([^)]+)\):\s*([\s\S]+?)(?:\n\nReasoning:|$)/);
                if (issueMatch) {
                    type = issueMatch[1].trim();
                    issue = issueMatch[2].trim();
                }

                const reasoningMatch = commentText.match(/Reasoning:\s*([\s\S]+?)(?:\n\nRecommendation:|$)/);
                if (reasoningMatch) {
                    reasoning = reasoningMatch[1].trim();
                }

                const recommendationMatch = commentText.match(/Recommendation:\s*([\s\S]+?)$/);
                if (recommendationMatch) {
                    recommendation = recommendationMatch[1].trim();
                }
            }

            // Extract associated text (the text that the comment highlights)
            let associatedText: string | undefined;
            if (documentDoc) {
                associatedText = extractAssociatedText(documentDoc, commentId, wordNS);
            }

            annotations.push({
                id: commentId,
                author,
                date,
                text: commentText,
                issue,
                reasoning,
                recommendation,
                type,
                associatedText,
            });
        });

        // Generate summary
        let summary = "";
        if (annotations.length === 0) {
            summary = "No annotations found in this document.";
        } else {
            const totalAnnotations = annotations.length;
            const types = new Set(annotations.map((a) => a.type).filter(Boolean));
            const typeCounts = new Map<string, number>();

            annotations.forEach((a) => {
                if (a.type) {
                    typeCounts.set(a.type, (typeCounts.get(a.type) || 0) + 1);
                }
            });

            summary = `This document contains ${totalAnnotations} annotation${totalAnnotations !== 1 ? "s" : ""}`;

            if (types.size > 0) {
                const typeSummary = Array.from(typeCounts.entries())
                    .map(([type, count]) => `${count} ${type}`)
                    .join(", ");
                summary += ` (${typeSummary})`;
            }

            summary += ". ";

            // Add general summary based on common issues
            const commonIssues = annotations
                .filter((a) => a.issue)
                .map((a) => a.issue!)
                .slice(0, 3);

            if (commonIssues.length > 0) {
                summary += "Key focus areas include: " + commonIssues.join(", ") + ".";
            }
        }

        return {
            summary,
            annotations,
        };
    } catch (error) {
        console.error("[ExtractComments] Error extracting comments:", error);
        return {
            summary: `Error extracting annotations: ${error instanceof Error ? error.message : "Unknown error"}`,
            annotations: [],
        };
    }
};

