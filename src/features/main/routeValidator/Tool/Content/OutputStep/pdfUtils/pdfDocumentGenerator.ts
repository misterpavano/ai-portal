import { PDFDocument, rgb, RGB, PDFName, PDFArray, PDFString } from "pdf-lib";
import { ImageData, Issue } from "../types";

/**
 * Color values for severity levels
 */
type ColorValues = { r: number; g: number; b: number };

/**
 * Convert severity (1-10) to PDF annotation color values
 */
const getSeverityColorValues = (severity: number): ColorValues => {
    const clampedSeverity = Math.max(1, Math.min(10, severity));

    // Map severity to colors (similar to Word generator)
    if (clampedSeverity <= 2) {
        return { r: 0, g: 0.8, b: 1 }; // Cyan - very low severity
    } else if (clampedSeverity <= 4) {
        return { r: 0, g: 0.4, b: 1 }; // Blue - low severity
    } else if (clampedSeverity <= 5) {
        return { r: 0, g: 0.8, b: 0 }; // Green - medium-low severity
    } else if (clampedSeverity <= 6) {
        return { r: 1, g: 1, b: 0 }; // Yellow - medium severity
    } else if (clampedSeverity <= 7) {
        return { r: 1, g: 0.8, b: 0 }; // Dark yellow - medium-high severity
    } else if (clampedSeverity <= 8) {
        return { r: 1, g: 0, b: 1 }; // Magenta - high severity
    } else {
        return { r: 1, g: 0, b: 0 }; // Red - very high severity (9-10)
    }
};

/**
 * Convert severity (1-10) to PDF RGB color for drawing
 */
const getSeverityColor = (severity: number): RGB => {
    const colorValues = getSeverityColorValues(severity);
    return rgb(colorValues.r, colorValues.g, colorValues.b);
};

/**
 * Load image from URL and convert to PDF image
 */
const loadImageAsPdfImage = async (
    pdfDoc: PDFDocument,
    imageUrl: string
): Promise<{ image: any; width: number; height: number }> => {
    try {
        // Fetch the image
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Determine image type from URL or content
        let pdfImage;
        let width: number;
        let height: number;

        if (imageUrl.toLowerCase().endsWith('.png') || uint8Array[0] === 0x89) {
            pdfImage = await pdfDoc.embedPng(uint8Array);
            const pngDims = pdfImage.scale(1);
            width = pngDims.width;
            height = pngDims.height;
        } else if (
            imageUrl.toLowerCase().endsWith('.jpg') ||
            imageUrl.toLowerCase().endsWith('.jpeg') ||
            uint8Array[0] === 0xFF
        ) {
            pdfImage = await pdfDoc.embedJpg(uint8Array);
            const jpgDims = pdfImage.scale(1);
            width = jpgDims.width;
            height = jpgDims.height;
        } else {
            // Try PNG first, then JPG
            try {
                pdfImage = await pdfDoc.embedPng(uint8Array);
                const pngDims = pdfImage.scale(1);
                width = pngDims.width;
                height = pngDims.height;
            } catch {
                pdfImage = await pdfDoc.embedJpg(uint8Array);
                const jpgDims = pdfImage.scale(1);
                width = jpgDims.width;
                height = jpgDims.height;
            }
        }

        return { image: pdfImage, width, height };
    } catch (error) {
        console.error("[PDFGenerator] Error loading image:", error);
        throw new Error(`Failed to load image: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};

/**
 * Generate a PDF document with images and comments from validation issues
 * 
 * @param images - Array of images with their issues
 * @param approvedIssues - Array of approved issues to include (filtered from all issues)
 * @param fileName - Original file name
 * @returns Promise<Blob> PDF document as blob for download
 */
export const generatePdfDocumentWithComments = async (
    images: ImageData[],
    approvedIssues: Issue[],
    fileName: string = "document"
): Promise<Blob> => {
    try {
        // Validate inputs
        if (!images || !Array.isArray(images) || images.length === 0) {
            throw new Error("images must be a non-empty array");
        }

        if (!approvedIssues || !Array.isArray(approvedIssues)) {
            throw new Error("approvedIssues must be an array");
        }

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();

        // Log summary of all approved issues before processing
        console.log(`[PDFGenerator] 📄 Starting PDF generation with ${images.length} images and ${approvedIssues.length} total approved issues`);
        console.log(`[PDFGenerator] 📊 Approved issues breakdown by page:`, 
            approvedIssues.reduce((acc, issue) => {
                const page = issue.page || 1;
                acc[page] = (acc[page] || 0) + 1;
                return acc;
            }, {} as Record<number, number>)
        );

        // Process each image
        for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
            const imageData = images[imageIndex];
            const pageNumber = imageIndex + 1;

            // Filter approved issues for this image/page
            // CRITICAL: This collects ALL approved issues from ALL images, but filters them by page
            // So if image 1 approves a comment for image 5, it will still appear on image 5's page
            const imageApprovedIssues = approvedIssues.filter((issue) => {
                // Match by page number (1-based)
                const issuePage = issue.page || 1;
                return issuePage === pageNumber;
            });

            console.log(`[PDFGenerator] 🖼️ Processing image ${pageNumber}/${images.length}: ${imageData.name} with ${imageApprovedIssues.length} approved issues`);
            console.log(`[PDFGenerator] 📍 Image URL: ${imageData.url}`);
            
            // Log which issues are being added to this page
            if (imageApprovedIssues.length > 0) {
                console.log(`[PDFGenerator] ✅ Adding ${imageApprovedIssues.length} comment(s) to page ${pageNumber}:`, 
                    imageApprovedIssues.map(issue => ({
                        id: issue.id,
                        type: issue.type,
                        page: issue.page,
                        position: issue.position
                    }))
                );
            } else {
                console.log(`[PDFGenerator] ℹ️ No comments for page ${pageNumber}, but image will still be added`);
            }

            // Load the image - CRITICAL: Always load and add image, even if no comments
            let imageWidth: number;
            let imageHeight: number;
            let page: any;
            
            try {
                const { image: pdfImage, width, height } = await loadImageAsPdfImage(
                    pdfDoc,
                    imageData.url
                );

                imageWidth = width;
                imageHeight = height;

                console.log(`[PDFGenerator] ✅ Image loaded successfully: ${imageWidth}x${imageHeight} points`);

                // Create a new page with the image dimensions
                // PDF uses points (1/72 inch), so we'll use the image dimensions directly
                page = pdfDoc.addPage([imageWidth, imageHeight]);

                // Draw the image on the page (full size) - ALWAYS draw image, even if no comments
                page.drawImage(pdfImage, {
                    x: 0,
                    y: 0,
                    width: imageWidth,
                    height: imageHeight,
                });

                console.log(`[PDFGenerator] ✅ Image drawn on page ${pageNumber}`);
            } catch (imageError) {
                console.error(`[PDFGenerator] ❌ Failed to load image for page ${pageNumber}:`, imageError);
                throw new Error(`Failed to load image ${imageData.name} for page ${pageNumber}: ${imageError instanceof Error ? imageError.message : "Unknown error"}`);
            }

            // Add proper PDF annotations/comments for each approved issue
            for (let issueIndex = 0; issueIndex < imageApprovedIssues.length; issueIndex++) {
                const issue = imageApprovedIssues[issueIndex];

                // Convert percentage coordinates (0-100) to PDF coordinates
                // Issue position is in percentage: 0 = left/top, 100 = right/bottom (same as frontend canvas/connectors).
                // CRITICAL: Use full image dimensions so full-height images get correct annotation positions.
                const xPercent = issue.position.x / 100; // Convert to 0-1
                const yPercent = issue.position.y / 100; // Convert to 0-1

                // PDF coordinates: (0,0) is bottom-left, (width, height) is top-right
               // Our percentage is from top-left, so flip Y for PDF
                const x = xPercent * imageWidth;
                const y = imageHeight - (yPercent * imageHeight); // Flip Y axis

                // Get color based on severity (for drawing)
                const color = getSeverityColor(issue.severity || 5);
                // Get color values for annotation (for PDF annotation color array)
                const colorValues = getSeverityColorValues(issue.severity || 5);

                // Build comment text (formatted like Word comments)
                const issueType = (issue.type || "issue").toUpperCase().replace(/_/g, " ");
                const commentText = [
                    `Issue: ${issue.body.issue || ""}`,
                    ``,
                    `Reasoning: ${issue.body.reasoning || ""}`,
                    ``,
                    `Recommendation: ${issue.body.recommendation || ""}`,
                ].join("\n");

                // Create proper PDF text annotation (comment)
                // This creates a clickable annotation that shows a popup when clicked
                const annotationSize = 20; // Size of the comment icon
                const annotationX = x - annotationSize / 2;
                const annotationY = y - annotationSize / 2;

                // Get the page's context for creating PDF objects
                const context = pdfDoc.context;

                // Create the annotation rectangle (where the comment icon appears)
                // PDF rectangle: [x1, y1, x2, y2] where (x1,y1) is bottom-left, (x2,y2) is top-right
                const rect = context.obj([
                    annotationX,
                    annotationY,
                    annotationX + annotationSize,
                    annotationY + annotationSize,
                ]);

                // Get or create the Annots array for this page
                let annotsArray = page.node.get(PDFName.of("Annots")) as PDFArray | undefined;
                if (!annotsArray) {
                    annotsArray = context.obj([]) as PDFArray;
                    page.node.set(PDFName.of("Annots"), annotsArray);
                }

                // Create the text annotation dictionary (the comment icon)
                // This creates a clickable annotation that shows content when clicked
                const annotationDict = context.obj({
                    Type: PDFName.of("Annot"),
                    Subtype: PDFName.of("Text"), // Text annotation type (comment icon)
                    Rect: rect,
                    Contents: PDFString.of(commentText),
                    T: PDFString.of(`${issueType} - Severity ${issue.severity || 5}`), // Title/Author
                    C: context.obj([
                        colorValues.r,
                        colorValues.g,
                        colorValues.b,
                    ]), // Color (RGB values 0-1)
                    Open: false, // Don't open popup by default
                    Name: PDFName.of("Comment"), // Icon type (comment icon)
                });

                // Add the text annotation to the page's Annots array
                annotsArray.push(annotationDict);

                // Draw a visual marker (comment icon style) at the annotation position
                // This helps users see where comments are located on the image
                const markerSize = annotationSize;

                // Draw the comment icon background (square)
                page.drawRectangle({
                    x: annotationX,
                    y: annotationY,
                    width: markerSize,
                    height: markerSize,
                    borderColor: color,
                    borderWidth: 2,
                    color: rgb(1, 1, 0.95), // Very light yellow/white fill
                    opacity: 0.95,
                });

                // Draw a small triangle/pointer to indicate it's a comment
                // Using drawLine to create a triangle shape (pdf-lib doesn't have drawPolygon)
                const triangleSize = 6;
                const centerX = annotationX + markerSize / 2;
                const triangleTopY = annotationY - triangleSize;

                // Draw triangle using lines
                page.drawLine({
                    start: { x: centerX, y: annotationY },
                    end: { x: centerX - triangleSize / 2, y: triangleTopY },
                    thickness: 1.5,
                    color: color,
                });
                page.drawLine({
                    start: { x: centerX - triangleSize / 2, y: triangleTopY },
                    end: { x: centerX + triangleSize / 2, y: triangleTopY },
                    thickness: 1.5,
                    color: color,
                });
                page.drawLine({
                    start: { x: centerX + triangleSize / 2, y: triangleTopY },
                    end: { x: centerX, y: annotationY },
                    thickness: 1.5,
                    color: color,
                });
            }
        }

        // Log final summary
        const totalCommentsAdded = approvedIssues.length;
        const pagesWithComments = approvedIssues.reduce((acc, issue) => {
            const page = issue.page || 1;
            if (!acc.has(page)) {
                acc.add(page);
            }
            return acc;
        }, new Set<number>());
        
        console.log(`[PDFGenerator] ✅ PDF generation complete:`);
        console.log(`[PDFGenerator]   - Total pages: ${images.length}`);
        console.log(`[PDFGenerator]   - Total comments added: ${totalCommentsAdded}`);
        console.log(`[PDFGenerator]   - Pages with comments: ${pagesWithComments.size} out of ${images.length}`);
        console.log(`[PDFGenerator]   - Pages without comments: ${images.length - pagesWithComments.size} (images still added)`);

        // Generate PDF bytes
        const pdfBytes = await pdfDoc.save();
        // pdfBytes is a Uint8Array, which works with Blob constructor
        // Type assertion needed due to TypeScript strictness with ArrayBufferLike types
        return new Blob([pdfBytes as any], { type: "application/pdf" });
    } catch (error) {
        console.error("[PDFGenerator] Error generating PDF:", error);
        throw error;
    }
};

