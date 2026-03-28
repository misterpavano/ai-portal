import { AnnotationSummary } from "../wordDocUtils/extractCommentsFromDocx";

/**
 * Format annotations for inclusion in the AI prompt
 * Associates comments with their highlighted text for better context
 * 
 * @param annotationData - The extracted annotation data
 * @returns Formatted string ready to include in the prompt
 */
export const formatAnnotationsForPrompt = (annotationData: AnnotationSummary | undefined): string => {
    if (!annotationData || !annotationData.annotations || annotationData.annotations.length === 0) {
        return "";
    }

    const parts: string[] = [];
    parts.push("Annotations from previous review round:");
    parts.push("");

    annotationData.annotations.forEach((annotation, index) => {
        const annotationNum = index + 1;

        // Format based on whether we have associated text
        if (annotation.associatedText) {
            // We have the highlighted text - format with context
            if (annotation.issue && annotation.reasoning && annotation.recommendation) {
                // Structured format with associated text
                parts.push(`${annotationNum}. [${annotation.type || 'Issue'}] Issue: ${annotation.issue}`);
                parts.push(`   Associated text: "${annotation.associatedText}"`);
                parts.push(`   Reasoning: ${annotation.reasoning}`);
                parts.push(`   Recommendation: ${annotation.recommendation}`);
            } else {
                // Simple comment with associated text
                parts.push(`${annotationNum}. Comment: "${annotation.text}"`);
                parts.push(`   Associated text: "${annotation.associatedText}"`);
            }
        } else {
            // No associated text - just the comment (less ideal but better than nothing)
            if (annotation.issue && annotation.reasoning && annotation.recommendation) {
                parts.push(`${annotationNum}. [${annotation.type || 'Issue'}] Issue: ${annotation.issue}`);
                parts.push(`   Reasoning: ${annotation.reasoning}`);
                parts.push(`   Recommendation: ${annotation.recommendation}`);
            } else {
                parts.push(`${annotationNum}. ${annotation.text}`);
            }
        }

        parts.push(""); // Empty line between annotations
    });

    return parts.join("\n");
};

