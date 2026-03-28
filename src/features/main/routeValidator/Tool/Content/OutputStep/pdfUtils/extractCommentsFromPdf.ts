import type { AnnotationSummary, ExtractedComment } from "../wordDocUtils/extractCommentsFromDocx";

// @ts-ignore - legacy build
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

if (typeof window !== "undefined" && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `${process.env.PUBLIC_URL || ""}/pdf.worker.min.mjs`;
}

/** PDF annotation data shape from pdfjs getAnnotations() (worker may serialize differently) */
interface PdfAnnotationData {
  id?: string;
  subtype?: string;
  rect?: number[];
  titleObj?: { str?: string };
  contentsObj?: { str?: string };
  richText?: { str?: string };
  modificationDate?: string;
  /** Some builds may expose string fields directly */
  title?: string;
  contents?: string;
}

/**
 * Extract comments/annotations from a PDF file.
 * Uses pdfjs-dist to load the document and read annotation data (sticky notes, text markup, etc.).
 *
 * @param file - The PDF file
 * @returns Promise<AnnotationSummary> - Summary and extracted comments in the same shape as Word extraction
 */
export const extractCommentsFromPdf = async (file: File): Promise<AnnotationSummary> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdfDoc.numPages;
    const allAnnotations: ExtractedComment[] = [];
    let globalIndex = 0;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const anns: PdfAnnotationData[] = await page.getAnnotations({ intent: "any" });
      for (const a of anns) {
        const raw = a as Record<string, unknown>;
        const getStr = (obj: unknown): string =>
          obj != null && typeof obj === "object" && "str" in obj && typeof (obj as { str: unknown }).str === "string"
            ? (obj as { str: string }).str
            : "";
        const content =
          getStr(raw.contentsObj) ||
          getStr(raw.richText) ||
          (typeof raw.contents === "string" ? raw.contents : "");
        const author =
          getStr(raw.titleObj) ||
          (typeof raw.title === "string" ? raw.title : "");
        const subtype = (a.subtype ?? "").toLowerCase();
        const isCommentLike =
          subtype === "text" ||
          subtype === "freetext" ||
          subtype === "highlight" ||
          subtype === "underline" ||
          subtype === "strikeout" ||
          subtype === "squiggly" ||
          subtype === "ink" ||
          subtype === "stamp" ||
          subtype === "circle" ||
          subtype === "square" ||
          subtype === "polygon" ||
          subtype === "polyline";
        if (!isCommentLike && !String(content).trim()) continue;

        allAnnotations.push({
          id: a.id ?? `pdf-ann-${pageNum}-${globalIndex++}`,
          author: (author && String(author).trim()) ? String(author).trim() : "Unknown",
          date: a.modificationDate ?? "",
          text: String(content).trim() || "(No text)",
          type: subtype || undefined,
          associatedText: undefined, // PDF.js does not expose quoted text for markup in getAnnotations()
        });
      }
    }

    await pdfDoc.destroy();

    let summary = "";
    if (allAnnotations.length === 0) {
      summary = "No annotations found in this PDF.";
    } else {
      const total = allAnnotations.length;
      const types = new Set(allAnnotations.map((a) => a.type).filter(Boolean));
      const typeCounts = new Map<string, number>();
      allAnnotations.forEach((a) => {
        if (a.type) typeCounts.set(a.type, (typeCounts.get(a.type) ?? 0) + 1);
      });
      summary = `This PDF contains ${total} annotation${total !== 1 ? "s" : ""}`;
      if (types.size > 0) {
        const typeSummary = Array.from(typeCounts.entries())
          .map(([t, c]) => `${c} ${t}`)
          .join(", ");
        summary += ` (${typeSummary})`;
      }
      summary += ".";
    }

    return { summary, annotations: allAnnotations };
  } catch (error) {
    console.error("[ExtractComments] Error extracting PDF annotations:", error);
    return {
      summary: `Error extracting annotations: ${error instanceof Error ? error.message : "Unknown error"}`,
      annotations: [],
    };
  }
};
