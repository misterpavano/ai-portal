import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useAtom } from "jotai";
import JSZip from "jszip";
import { routeValidatorFormAtom } from "../../../../../../../atoms/routeValidatorAtom";
import { ImageData, Issue, ReviewStatus } from "../types";
import { devLog, devWarn } from "../../../../../../../utils/devLog";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];

/** Merge reviewStatusMap into base images so like/approve updates are fast (no full rebuild) */
function mergeReviewStatusIntoImages(
    baseImages: ImageData[],
    reviewStatusMap: Map<string, ReviewStatus>
): ImageData[] {
    return baseImages.map((img) => ({
        ...img,
        issues: img.issues.map((issue) => {
            const originalId = issue.id.replace(/-img-\d+$/, "");
            const status =
                reviewStatusMap.get(issue.id) ||
                reviewStatusMap.get(originalId) ||
                issue.reviewStatus ||
                "not_reviewed";
            return { ...issue, reviewStatus: status };
        }),
    }));
}

export const useImageHandling = (
    documentType: string,
    validationResults: any,
    allValidationIssues: Issue[],
    reviewStatusMap: Map<string, ReviewStatus>
) => {
    const [routeValidatorFormValues] = useAtom(routeValidatorFormAtom);
    const [baseImages, setBaseImages] = useState<ImageData[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const imagesRef = useRef<ImageData[]>([]);

    // Derive display images by merging reviewStatus (fast when only like/approve changes)
    const images = useMemo(
        () => mergeReviewStatusIntoImages(baseImages, reviewStatusMap),
        [baseImages, reviewStatusMap]
    );

    useEffect(() => {
        imagesRef.current = images;
    }, [images]);

    const extractImagesFromZip = useCallback(async () => {
        const zipFile = routeValidatorFormValues.file?.fileObject;
        if (!zipFile) return;

        try {
            const zip = new JSZip();
            const zipData = await zip.loadAsync(zipFile);
            const imageFiles: ImageData[] = [];

            // Sort by filename so page 1..N matches backend (backend sorts the same way)
            const imageEntries: { filename: string; file: (typeof zipData.files)[string] }[] = [];
            for (const [filename, file] of Object.entries(zipData.files)) {
                if (file.dir) continue;
                const baseName = filename.split("/").pop() || filename;
                if (baseName.startsWith(".") || baseName.startsWith("._") || filename.includes("__MACOSX")) continue;
                const isImage = IMAGE_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext));
                if (isImage) imageEntries.push({ filename, file });
            }
            imageEntries.sort((a, b) => {
                const nameA = (a.filename.split("/").pop() || a.filename).toLowerCase();
                const nameB = (b.filename.split("/").pop() || b.filename).toLowerCase();
                return nameA.localeCompare(nameB, undefined, { numeric: true });
            });

            for (let imageIndex = 0; imageIndex < imageEntries.length; imageIndex++) {
                const { filename, file } = imageEntries[imageIndex];
                try {
                    const blob = await file.async("blob");
                    if (blob.size === 0) continue;
                    const imageUrl = URL.createObjectURL(blob);
                    const pageNumber = imageIndex + 1;
                    const imageIssues = allValidationIssues
                        .filter((issue) => (issue.page || 1) === pageNumber)
                        .map((issue) => ({ ...issue, id: `${issue.id}-img-${pageNumber}` }));

                    imageFiles.push({
                        id: `img-${pageNumber}`,
                        url: imageUrl,
                        name: filename,
                        issues: imageIssues,
                    });
                } catch {
                    // Continue with other images
                }
            }

            if (imageFiles.length > 0) {
                const perPage = imageFiles.map((img, i) => `p${i + 1}:${img.issues.length}`).join(" ");
                console.log(`[RouteValidator] Issues per page (ZIP): ${perPage} total=${allValidationIssues.length}`);
                setBaseImages(imageFiles);
            }
        } catch (error) {
            // Error extracting ZIP - continue without images
        }
    }, [routeValidatorFormValues.file?.fileObject, allValidationIssues]);

    useEffect(() => {
        if (documentType !== "screenshots" && documentType !== "route") return;

        const extractedImages = routeValidatorFormValues.extractedImages || [];

        if (extractedImages.length > 0) {
            const imageFiles: ImageData[] = extractedImages.map((extractedImg: any, index: number) => {
                const pageNumber = index + 1;
                let imageIssues: Issue[] = [];

                if (validationResults && allValidationIssues.length > 0) {
                    imageIssues = allValidationIssues
                        .filter((issue) => (issue.page || 1) === pageNumber)
                        .map((issue) => ({
                            ...issue,
                            id: `${issue.id}-img-${pageNumber}`,
                            reviewStatus: "not_reviewed" as ReviewStatus,
                        }));
                }

                return {
                    id: extractedImg.id || `img-${pageNumber}`,
                    url: extractedImg.url,
                    name: extractedImg.name,
                    issues: imageIssues,
                };
            });

            const perPage = imageFiles.map((img, i) => `p${i + 1}:${img.issues.length}`).join(" ");
            console.log(`[RouteValidator] Issues per page (extractedImages): ${perPage} total=${allValidationIssues.length}`);
            setBaseImages(imageFiles);
        } else if (routeValidatorFormValues.file?.fileObject) {
            extractImagesFromZip();
        }
    }, [
        documentType,
        routeValidatorFormValues.extractedImages,
        routeValidatorFormValues.file?.fileObject,
        validationResults,
        allValidationIssues,
        extractImagesFromZip,
    ]);

    // Cleanup blob URLs only on unmount, not on images change
    // This prevents revoking URLs that are still in use
    useEffect(() => {
        return () => {
            // Only cleanup on component unmount - use ref to get latest images
            imagesRef.current.forEach((img) => {
                if (img.url?.startsWith("blob:")) {
                    try {
                        URL.revokeObjectURL(img.url);
                    } catch (error) {
                        // Ignore errors if URL was already revoked
                        devWarn(`[useImageHandling] Error revoking blob URL`);
                    }
                }
            });
        };
    }, []); // Empty deps - only run on unmount

    return { images, selectedImageIndex, setSelectedImageIndex };
};

