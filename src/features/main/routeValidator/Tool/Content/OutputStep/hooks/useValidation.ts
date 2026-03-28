import { useEffect, useState, useCallback } from "react";
import { useAtom } from "jotai";
import { routeValidatorFormAtom } from "../../../../../../../atoms/routeValidatorAtom";
import { useValidateSingleTaskMutation, useLazyGetSingleTaskStatusQuery, useProcessDocumentMutation } from "../../../../../../../api/slices/routeValidatorSlice";
import { TaskProgress } from "../types";
import { formatAnnotationsForPrompt } from "../utils/formatAnnotationsForPrompt";

const MAX_RETRIES = 2;
const POLL_INTERVAL = 1000; // 1 second – snappier UI feedback on task completion
const MAX_POLL_TIME = 300000; // 5 minutes – tasks run in parallel but Gemini can vary; avoid marking slow task as failed
const STAGGER_DELAY = 1000; // 1s stagger between tasks – balance speed vs Gemini rate-limit pressure
const WARNING_TIME = 30000; // Show warning after 30 seconds of loading
const MAX_CONSECUTIVE_ERRORS = 5; // Allow more transient poll errors before failing the task

/**
 * Normalize and deduplicate additional notes text
 * Removes duplicate sentences/paragraphs and normalizes whitespace
 */
const normalizeAdditionalNotes = (notes: string): string => {
    if (!notes || !notes.trim()) {
        return '';
    }

    // Split by newlines and filter out empty lines
    const lines = notes
        .split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

    // Remove duplicate lines (case-insensitive, but preserve original case)
    const seen = new Set<string>();
    const uniqueLines: string[] = [];

    for (const line of lines) {
        const normalizedLine = line.toLowerCase().trim();
        // Skip if we've seen this exact line before (case-insensitive)
        if (!seen.has(normalizedLine)) {
            seen.add(normalizedLine);
            uniqueLines.push(line);
        }
    }

    // Join back with single newlines
    return uniqueLines.join('\n').trim();
};

/**
 * Deduplicate issues based on location and content
 * Issues are considered duplicates if they have the same:
 * - location.text (normalized)
 * - issue type
 * - task
 */
const deduplicateIssues = (issues: any[]): any[] => {
    if (!issues || issues.length === 0) {
        return issues;
    }

    const seen = new Map<string, any>();
    const deduplicated: any[] = [];

    for (const issue of issues) {
        // Create a unique key based on location text, type, and task
        const locationText = issue.location?.text?.toLowerCase().trim() || '';
        const issueType = issue.type || '';
        const task = issue.task || '';

        // Normalize location text for comparison (remove extra whitespace)
        const normalizedLocationText = locationText.replace(/\s+/g, ' ').trim();

        const key = `${task}:${issueType}:${normalizedLocationText}`;

        if (!seen.has(key)) {
            seen.set(key, issue);
            deduplicated.push(issue);
        } else {
            // If we find a duplicate, keep the one with higher severity or more complete data
            const existing = seen.get(key);
            if (issue.severity > (existing.severity || 0) ||
                (issue.reasoning && !existing.reasoning) ||
                (issue.recommendation && !existing.recommendation)) {
                // Replace with the better issue
                const index = deduplicated.indexOf(existing);
                if (index >= 0) {
                    deduplicated[index] = issue;
                    seen.set(key, issue);
                }
            }
        }
    }

    return deduplicated;
};

export const useValidation = () => {
    const [routeValidatorFormValues, setRouteValidatorFormValues] = useAtom(routeValidatorFormAtom);
    const [taskProgress, setTaskProgress] = useState<Map<string, TaskProgress>>(new Map());
    const [validateSingleTask] = useValidateSingleTaskMutation();
    const [getSingleTaskStatus] = useLazyGetSingleTaskStatusQuery();
    const [processDocument] = useProcessDocumentMutation();

    const validationResults = routeValidatorFormValues.validationResults;

    const isRetryableError = useCallback((err: any): boolean => {
        return (
            err?.error?.status === 'FETCH_ERROR' ||
            err?.error?.status === 'TIMEOUT_ERROR' ||
            err?.error?.status === 503 ||
            err?.error?.status === 502 ||
            err?.error?.status === 504 ||
            err?.error?.status === 429 ||
            err?.data?.code === 'CORS_OR_SERVER' ||
            err?.data?.code === 'SERVER_ERROR' ||
            err?.data?.error === 'SERVER ISSUE' ||
            err?.message?.includes('Failed to fetch') ||
            err?.message?.includes('NetworkError') ||
            err?.message?.includes('timeout') ||
            err?.message?.includes('503')
        );
    }, []);

    const getErrorMessage = useCallback((err: any): string => {
        // Prefer API message (user-facing, e.g. "SERVER ISSUE - please try again later.")
        return (
            err?.data?.message ||
            err?.data?.error ||
            err?.error?.data?.message ||
            err?.error?.data?.error ||
            (err?.error?.status === 503 ? "SERVER ISSUE - please try again later." :
                err?.error?.status === 502 ? "Bad gateway. Please try again." :
                    err?.error?.status === 504 ? "Request timeout. Please try again." :
                        err?.error?.status === 429 ? "Too many requests. Please wait and try again." :
                            err?.error?.message ||
                            err?.message ||
                            "SERVER ISSUE - please try again later.")
        );
    }, []);

    const validateTask = useCallback(async (task: string, index: number) => {
        await new Promise(resolve => setTimeout(resolve, index * STAGGER_DELAY));

        setTaskProgress((prev) => {
            const newMap = new Map(prev);
            newMap.set(task, { task, status: "loading", startedAt: Date.now() });
            return newMap;
        });

        // Build direction string from additional notes and/or annotations
        const directionParts: string[] = [];

        if (routeValidatorFormValues.useAdditionalNotes && routeValidatorFormValues.additionalNotes) {
            // Normalize and deduplicate additional notes to prevent duplicate issues
            const normalizedNotes = normalizeAdditionalNotes(routeValidatorFormValues.additionalNotes);
            if (normalizedNotes) {
                directionParts.push(normalizedNotes);
            }
        }

        if (routeValidatorFormValues.useAnnotatedFile && routeValidatorFormValues.annotationData) {
            const formattedAnnotations = formatAnnotationsForPrompt(routeValidatorFormValues.annotationData);
            if (formattedAnnotations) {
                // Add separator if we already have additional notes
                if (directionParts.length > 0) {
                    directionParts.push("\n\n--- Previous Review Annotations ---\n");
                }
                directionParts.push(formattedAnnotations);
            }
        }

        const direction = directionParts.length > 0 ? directionParts.join("\n") : undefined;

        const clientBrand =
            routeValidatorFormValues.brandGuideline ||
            routeValidatorFormValues.selectedClient ||
            undefined;
        const organizationGuideline = routeValidatorFormValues.organizationGuideline || undefined;
        const brandGuideline = routeValidatorFormValues.brandGuideline || undefined;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const startResponse = await validateSingleTask({
                    fileId: routeValidatorFormValues.file!.fileId,
                    task,
                    direction: direction || undefined,
                    clientBrand,
                    organizationGuideline,
                    brandGuideline,
                    model: routeValidatorFormValues.documentType === "word" ? undefined : (routeValidatorFormValues.geminiModel || undefined),
                }).unwrap();

                if (startResponse.jobId && startResponse.status === 'processing') {
                    const jobId = startResponse.jobId;
                    const startTime = Date.now();
                    let lastWarningTime = 0;

                    let consecutiveErrors = 0;

                    while (Date.now() - startTime < MAX_POLL_TIME) {
                        try {
                            const elapsed = Date.now() - startTime;

                            // Log warning if taking too long (every 30 seconds)
                            if (elapsed - lastWarningTime >= WARNING_TIME) {
                                console.warn(`[Validation] Task "${task}" still processing after ${Math.round(elapsed / 1000)}s (jobId: ${jobId})`);
                                lastWarningTime = elapsed;
                            }

                            const statusResponse = await getSingleTaskStatus({ jobId }).unwrap();
                            consecutiveErrors = 0; // Reset error counter on success

                            if (statusResponse.status === 'completed') {
                                try {
                                    const response = statusResponse as any & { result?: any; fileId?: string; fileName?: string; documentText?: string; documentHtml?: string; metadata?: { pagesProcessed?: number; imagesProcessed?: number } };
                                    // Defensive: Heroku/Word+images can return truncated or different shape – never throw so UI always updates
                                    const rawResult = response?.result;
                                    const deduplicatedResult = {
                                        ...(typeof rawResult === 'object' && rawResult !== null ? rawResult : {}),
                                        task: (rawResult?.task ?? task) as string,
                                        issues: deduplicateIssues(Array.isArray(rawResult?.issues) ? rawResult.issues : []),
                                    };

                                    setTaskProgress((prev) => {
                                        const newMap = new Map(prev);
                                        newMap.set(task, { task, status: "completed", result: deduplicatedResult });
                                        return newMap;
                                    });

                                    const meta = response?.metadata ?? {};
                                    setRouteValidatorFormValues((prev: any) => {
                                        const existingResults = prev.validationResults?.results || [];
                                        const existingIndex = existingResults.findIndex((r: any) => r.task === deduplicatedResult.task);
                                        const newResults = existingIndex >= 0
                                            ? existingResults.map((r: any, idx: number) => idx === existingIndex ? deduplicatedResult : r)
                                            : [...existingResults, deduplicatedResult];

                                        const allIssues: any[] = [];
                                        newResults.forEach((result: any) => {
                                            if (result.issues && Array.isArray(result.issues)) {
                                                allIssues.push(...result.issues.map((issue: any) => ({ ...issue, task: result.task })));
                                            }
                                        });
                                        const globallyDeduplicatedIssues = deduplicateIssues(allIssues);
                                        const finalResults = newResults.map((result: any) => ({
                                            ...result,
                                            issues: globallyDeduplicatedIssues.filter((issue: any) => issue.task === result.task)
                                        }));
                                        const totalIssues = finalResults.reduce((sum: number, result: any) => sum + (result.issues?.length || 0), 0);

                                        return {
                                            ...prev,
                                            validationResults: {
                                                fileId: response?.fileId ?? prev.validationResults?.fileId,
                                                fileName: response?.fileName ?? prev.validationResults?.fileName,
                                                tasks: routeValidatorFormValues.tasks!,
                                                results: finalResults,
                                                documentText: response?.documentText ?? prev.extractedText ?? prev.validationResults?.documentText ?? "",
                                                documentHtml: response?.documentHtml ?? prev.validationResults?.documentHtml ?? undefined,
                                                metadata: {
                                                    totalIssues,
                                                    pagesProcessed: meta.pagesProcessed ?? prev.validationResults?.metadata?.pagesProcessed ?? 1,
                                                    imagesProcessed: meta.imagesProcessed ?? prev.validationResults?.metadata?.imagesProcessed ?? 0,
                                                },
                                            },
                                            extractedText: response?.documentText ?? prev.extractedText,
                                        };
                                    });
                                } catch (completedErr: any) {
                                    console.error(`[Validation] Error applying completed result for task "${task}" – updating UI anyway:`, completedErr);
                                    setTaskProgress((prev) => {
                                        const newMap = new Map(prev);
                                        newMap.set(task, { task, status: "completed", result: { task, issues: [] } });
                                        return newMap;
                                    });
                                }
                                return;
                            } else if (statusResponse.status === 'failed') {
                                const apiError = (statusResponse as { status: 'failed'; error?: string }).error || 'Task validation failed';
                                setTaskProgress((prev) => {
                                    const newMap = new Map(prev);
                                    newMap.set(task, { task, status: "error", error: apiError });
                                    return newMap;
                                });
                                return;
                            }

                            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
                        } catch (pollErr: any) {
                            consecutiveErrors++;
                            console.error(`[Validation] Poll error for task "${task}" (attempt ${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`, pollErr);

                            // If too many consecutive errors, fail the task
                            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                                throw new Error(`Task polling failed after ${MAX_CONSECUTIVE_ERRORS} consecutive errors: ${pollErr?.data?.error || pollErr?.message || 'Unknown error'}`);
                            }

                            // Wait a bit longer before retrying after an error
                            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL * 2));
                        }
                    }

                    throw new Error(`Polling timeout - task "${task}" took too long (>${MAX_POLL_TIME / 1000}s)`);
                } else {
                    // Sync fallback – same defensive handling as async path
                    const response = startResponse as any;
                    const rawResult = response?.result;
                    const deduplicatedResult = {
                        ...(typeof rawResult === 'object' && rawResult !== null ? rawResult : {}),
                        task: (rawResult?.task ?? task) as string,
                        issues: deduplicateIssues(Array.isArray(rawResult?.issues) ? rawResult.issues : []),
                    };

                    setTaskProgress((prev) => {
                        const newMap = new Map(prev);
                        newMap.set(task, { task, status: "completed", result: deduplicatedResult });
                        return newMap;
                    });

                    const meta = response?.metadata ?? {};
                    setRouteValidatorFormValues((prev: any) => {
                        const existingResults = prev.validationResults?.results || [];
                        const existingIndex = existingResults.findIndex((r: any) => r.task === deduplicatedResult.task);
                        const newResults = existingIndex >= 0
                            ? existingResults.map((r: any, idx: number) => idx === existingIndex ? deduplicatedResult : r)
                            : [...existingResults, deduplicatedResult];

                        const allIssues: any[] = [];
                        newResults.forEach((result: any) => {
                            if (result.issues && Array.isArray(result.issues)) {
                                allIssues.push(...result.issues.map((issue: any) => ({ ...issue, task: result.task })));
                            }
                        });
                        const globallyDeduplicatedIssues = deduplicateIssues(allIssues);
                        const finalResults = newResults.map((result: any) => ({
                            ...result,
                            issues: globallyDeduplicatedIssues.filter((issue: any) => issue.task === result.task)
                        }));
                        const totalIssues = finalResults.reduce((sum: number, result: any) => sum + (result.issues?.length || 0), 0);

                        return {
                            ...prev,
                            validationResults: {
                                fileId: response?.fileId ?? prev.validationResults?.fileId,
                                fileName: response?.fileName ?? prev.validationResults?.fileName,
                                tasks: routeValidatorFormValues.tasks!,
                                results: finalResults,
                                documentText: response?.documentText ?? prev.extractedText ?? prev.validationResults?.documentText ?? "",
                                documentHtml: response?.documentHtml ?? prev.validationResults?.documentHtml ?? undefined,
                                metadata: {
                                    totalIssues,
                                    pagesProcessed: meta.pagesProcessed ?? prev.validationResults?.metadata?.pagesProcessed ?? 1,
                                    imagesProcessed: meta.imagesProcessed ?? prev.validationResults?.metadata?.imagesProcessed ?? 0,
                                },
                            },
                            extractedText: response?.documentText ?? prev.extractedText,
                        };
                    });

                    return;
                }
            } catch (err: any) {
                if (attempt === MAX_RETRIES || !isRetryableError(err)) {
                    const errorMessage = getErrorMessage(err);
                    setTaskProgress((prev) => {
                        const newMap = new Map(prev);
                        newMap.set(task, { task, status: "error", error: errorMessage });
                        return newMap;
                    });
                    return;
                }

                const isServerOverload = err?.error?.status === 503 || err?.error?.status === 502 || err?.error?.status === 504;
                const baseDelay = isServerOverload ? 2000 : 1000;
                const retryDelay = baseDelay * (attempt + 1);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }, [routeValidatorFormValues, validateSingleTask, getSingleTaskStatus, setRouteValidatorFormValues, isRetryableError, getErrorMessage]);

    useEffect(() => {
        if (
            validationResults ||
            !routeValidatorFormValues.file?.fileId ||
            !routeValidatorFormValues.tasks?.length
        ) {
            return;
        }

        const fileId = routeValidatorFormValues.file.fileId;
        const tasks = routeValidatorFormValues.tasks;
        const initialProgress = new Map<string, TaskProgress>();
        tasks.forEach((task: string) => {
            initialProgress.set(task, { task, status: "pending" });
        });
        setTaskProgress(initialProgress);

        // Process document once first so all validate/task calls hit cache (faster, no duplicate S3/download)
        const runValidation = async () => {
            try {
                const processRes = await processDocument({ fileId }).unwrap();
                if (processRes?.documentText != null || processRes?.documentHtml != null) {
                    setRouteValidatorFormValues((prev: any) => ({
                        ...prev,
                        validationResults: {
                            ...prev.validationResults,
                            fileId,
                            fileName: prev.file?.fileName,
                            tasks,
                            results: prev.validationResults?.results || [],
                            documentText: processRes.documentText ?? prev.validationResults?.documentText,
                            documentHtml: processRes.documentHtml ?? prev.validationResults?.documentHtml,
                            metadata: prev.validationResults?.metadata,
                        },
                    }));
                }
            } catch {
                // Continue – workers will process on first task if endpoint failed
            }

            // Start all selected tasks, but with a built-in 1s stagger per index inside validateTask.
            // Example for 6 tasks: calls at ~0s, 1s, 2s, 3s, 4s, 5s – all enqueued quickly, backend queue concurrency controls parallelism.
            const validationPromises = tasks.map((task: string, index: number) => validateTask(task, index));
            await Promise.allSettled(validationPromises);
        };
        runValidation();
    }, [validationResults, routeValidatorFormValues.file?.fileId, routeValidatorFormValues.tasks, validateTask, processDocument, setRouteValidatorFormValues]);

    const hasAnyCompletedTaskWithResults = Array.from(taskProgress.values()).some(
        (progress) => progress.status === "completed" && progress.result
    );
    const hasAnyLoadingTask = Array.from(taskProgress.values()).some(
        (progress) => progress.status === "loading" || progress.status === "pending"
    );
    const isValidating = hasAnyLoadingTask && !hasAnyCompletedTaskWithResults;

    /** Retry a single failed task (re-runs only that task). */
    const retryTask = useCallback((task: string) => {
        const progress = taskProgress.get(task);
        if (progress?.status !== "error") return;
        validateTask(task, 0);
    }, [taskProgress, validateTask]);

    return { taskProgress, isValidating, retryTask };
};

