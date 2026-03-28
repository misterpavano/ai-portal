import { useState } from "react";
import { useAtom } from "jotai";
import {
  assistantIdMeetingSummaryAtom,
  interviewSummariesFormAtom,
  vectorStoreIdMeetingSummaryAtom,
} from "../../../../../../atoms/interviewDiscusstionGuideAtom";
import { aiToolModelsAtom } from "../../../../../../atoms/toolsAtom";
import { SectionKey } from "../../../../../../types/interviewSummaries";
import { safeJSONParse } from "../../../../../../utils/textFormatter";
import {
  generateActionItemsPrompt,
  generateDetailedInsightsPrompt,
  generateKeyRecommendationsPrompt,
  generateKeyTakeawaysPrompt,
} from "../../../../../../config/prompts";
import {
  useAskQuestionBasedOnFileMutation,
  useChatCompletionOpenAiMutation,
  useCreateThreadMutation,
  useDeleteFileFromStorageMutation,
  useDeleteFileFromVectorStoreMutation,
} from "../../../../../../api/slices/openAiSlice";
import { logCost, CostTracker, formatCost } from "../../../../../../utils/costCalculator";
import { useGetToolsQuery } from "../../../../../../api/slices/toolsSlice";

// Helper function to detect if content is fallback
const isFallbackContent = (content: string): boolean => {
  const fallbackPatterns = [
    "No action items have been identified",
    "No Key Recommendations can be determined",
    "No action items can be determined",
    "No Key Recommendations have been identified",
  ];
  return fallbackPatterns.some((pattern) =>
    content.toLowerCase().includes(pattern.toLowerCase())
  );
};

// Helper function to check if parsed result contains only fallback content
const hasOnlyFallbackItems = (parsed: any, sectionType: "actionItems" | "keyRecommendations"): boolean => {
  if (!parsed || !parsed[sectionType] || !Array.isArray(parsed[sectionType])) {
    return false;
  }

  if (parsed[sectionType].length === 0) {
    return true;
  }

  // Check if all items are fallback content
  const fallbackPatterns = sectionType === "actionItems"
    ? ["no action items have been identified", "no action items can be determined"]
    : ["no key recommendations can be determined", "no key recommendations have been identified"];

  return parsed[sectionType].every((item: any) => {
    const bulletText = (item.bullet || "").toLowerCase();
    return fallbackPatterns.some((pattern) => bulletText.includes(pattern));
  });
};

// Helper function to check if error is rate limit/quota exceeded
const isQuotaExceededError = (error: any): boolean => {
  const errorCode = error?.data?.error?.code || error?.data?.error_code || error?.error?.code;
  const errorMessage = error?.data?.error?.message || error?.data?.message || error?.error?.message || "";
  const statusCode = error?.status;

  return (
    errorCode === "rate_limit_exceeded" ||
    errorCode === "insufficient_quota" ||
    statusCode === 429 ||
    errorMessage.toLowerCase().includes("quota") ||
    errorMessage.toLowerCase().includes("rate limit") ||
    errorMessage.toLowerCase().includes("insufficient quota")
  );
};

// Helper function to extract quota error message
const extractQuotaErrorMessage = (error: any): string => {
  const errorMessage = error?.data?.error?.message || error?.data?.message || error?.error?.message || "";

  if (errorMessage.includes("You exceeded your current quota, please check your plan and billing details.")) {
    return "You exceeded your current quota, please check your plan and billing details.";
  }

  return errorMessage || "Quota exceeded. Please check your plan and billing details.";
};

export const useInterviewFetch = () => {
  const [models] = useAtom(aiToolModelsAtom);
  const { data: toolsData } = useGetToolsQuery();

  // Get model from backend first (source of truth), fallback to atom, then default
  const tools = Array.isArray(toolsData) ? toolsData : toolsData?.data ?? [];
  const meetingSummariesTool = tools.find((tool) => tool.name === "Meeting Summaries");
  const backendModel = meetingSummariesTool?.model?.modelId;
  const atomModel = models["Meeting Summaries"];

  // Priority: Backend model > Atom model > Default
  const selectedModel = backendModel || atomModel || "gpt-3.5-turbo";

  const [deleteFileFromVectorStore] = useDeleteFileFromVectorStoreMutation();
  const [deleteFileFromStorage] = useDeleteFileFromStorageMutation();
  const [askQuestionBasedOnFile] = useAskQuestionBasedOnFileMutation();
  const [createThread] = useCreateThreadMutation();
  const [chatCompletionOpenAi] = useChatCompletionOpenAiMutation();
  const [sectionLoading, setSectionLoading] = useState<SectionKey | null>(null);
  const [interviewSummariesFormValues, setInterviewSummariesFormValues] =
    useAtom(interviewSummariesFormAtom);
  const [assistantId] = useAtom(assistantIdMeetingSummaryAtom);
  const [vectorStoreId] = useAtom(vectorStoreIdMeetingSummaryAtom);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [quotaErrorMessage, setQuotaErrorMessage] = useState("");

  // Cost tracker for debugging
  const costTracker = new CostTracker();

  // Log model selection
  console.log(` Meeting Summaries - Selected Model: ${selectedModel} (Backend: ${backendModel || 'N/A'}, Atom: ${atomModel || 'N/A'})`);

  // Warn if there's a mismatch between backend and atom
  if (backendModel && atomModel && backendModel !== atomModel) {
    console.warn(`[WARNING] Model mismatch detected! Backend has "${backendModel}" but Atom has "${atomModel}". Using backend model: ${backendModel}`);
  }

  const fetchKeyTakeaways = async (additionalNote?: string) => {
    try {
      setSectionLoading("generatedKeyTakeaways");
      const {
        type,
        summaryType,
        objectives,
        objectivesSummary,
        discussionTopics,
        keyTakeaways,
        generateTopicsChecked,
        file,
      } = interviewSummariesFormValues;

      const generateContentForTopic = async (topic: any) => {
        const prompt = generateKeyTakeawaysPrompt({
          values: {
            file,
            type,
            summaryType,
            objectives,
            objectivesSummary,
            generateTopicsChecked,
            additionalNotes: additionalNote,
            discussionTopics: {
              ...discussionTopics,
              additionalNote: additionalNote,
              sections: [topic],
            },
            keyTakeaways: {
              ...keyTakeaways,
            },
          },
        });

        console.log(
          `Key Takeaways Prompt for topic "${topic.topics}":`,
          prompt
        );

        let result: string;

        if (objectives) {
          try {

            const openAiResult = await chatCompletionOpenAi({
              messages: [
                {
                  role: "system",
                  content: "I am a bot generating content response",
                },
                { role: "user", content: prompt },
              ],
              model: selectedModel,
            }).unwrap();
            result = openAiResult.choices?.[0]?.message?.content || "";

            // Log cost for this API call
            if (openAiResult.usage) {
              console.log(`[Key Takeaways] Usage:`, openAiResult.usage);
              logCost(selectedModel, openAiResult.usage, "Key Takeaways");
              costTracker.addCall(selectedModel, openAiResult.usage, "Key Takeaways");
            } else {
              console.warn(`[Key Takeaways] No usage data in response`);
            }
          } catch (error: any) {
            if (isQuotaExceededError(error)) {
              setQuotaExceeded(true);
              setQuotaErrorMessage(extractQuotaErrorMessage(error));
              throw error; // Re-throw to stop execution
            }
            throw error;
          }
        } else {
          try {
            const thread = await createThread().unwrap();
            const openAiResult = await askQuestionBasedOnFile({
              threadId: thread.id,
              assistantId,
              message: prompt,
              assistantPrompt: "",
            }).unwrap();
            result = openAiResult.content || "";
          } catch (error: any) {
            if (isQuotaExceededError(error)) {
              setQuotaExceeded(true);
              setQuotaErrorMessage(extractQuotaErrorMessage(error));
              throw error; // Re-throw to stop execution
            }
            throw error;
          }
        }

        const parsed = safeJSONParse(result);

        if (
          parsed &&
          parsed.keyTakeaways &&
          Array.isArray(parsed.keyTakeaways)
        ) {
          const htmlContent = parsed.keyTakeaways
            .map(
              (item: {
                title: string;
                bullets: Array<{ id: number; text: string }>;
              }) => {
                const actualTopicTitle = topic.topics;
                const bulletsHtml = item.bullets
                  .map((bullet) => {
                    const cleanText = bullet.text.replace(/\n/g, " ").trim();
                    return `<li>${cleanText}</li>`;
                  })
                  .join("");
                return `<h3>${actualTopicTitle}</h3><ul>${bulletsHtml}</ul>`;
              }
            )
            .join("\n\n");
          return { keyTakeaways: htmlContent };
        }

        return parsed;
      };

      const topicResults = await Promise.all(
        discussionTopics.sections.map(generateContentForTopic)
      );

      const combinedKeyTakeaways = topicResults
        .map((result) => {
          if (result && result.keyTakeaways) {
            return result.keyTakeaways;
          }
          return "";
        })
        .filter((content) => content)
        .join("\n\n");

      setInterviewSummariesFormValues((prevValues) => ({
        ...prevValues,
        generatedInterviewSummaries: {
          ...prevValues.generatedInterviewSummaries,
          generatedKeyTakeaways: [combinedKeyTakeaways],
        },
      }));
    } catch (error) {
      console.error("Error fetching key takeaways:", error);
    } finally {
      setSectionLoading(null);
    }
  };

  const fetchDetailedInsights = async (additionalNote?: string) => {
    try {
      setSectionLoading("generatedDetailedInsights");
      const {
        type,
        summaryType,
        objectives,
        objectivesSummary,
        discussionTopics,
        detailedInsights,
        generatedInterviewSummaries,
        generateTopicsChecked,
        file,
      } = interviewSummariesFormValues;

      const generateContentForTopic = async (topic: any) => {
        const maxRetries = 1; // Increased to 3 attempts to handle incomplete JSON responses

        // Check if current content for this topic is fallback
        const currentContent = generatedInterviewSummaries?.generatedDetailedInsights?.[0] || "";
        const isCurrentContentFallback = currentContent.includes("Content for this topic is being processed") ||
          currentContent.includes("Please try regenerating this section.");
        const enhancedNote = isCurrentContentFallback
          ? `${additionalNote || ""} REGENERATE: Previous result was fallback content for topic "${topic.topics}". You MUST find real detailed insights.`
          : additionalNote;

        // Retry on errors including incomplete JSON responses
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            // Use enhanced note only on first attempt, no retry notes needed since we accept empty results
            const retryNote = enhancedNote;

            const prompt = generateDetailedInsightsPrompt({
              values: {
                file,
                type,
                summaryType,
                objectives,
                objectivesSummary,
                generateTopicsChecked,
                additionalNotes: retryNote,
                discussionTopics: {
                  ...discussionTopics,
                  additionalNote: retryNote,
                  sections: [topic],
                },
                detailedInsights: {
                  ...detailedInsights,
                },
                generatedInterviewSummaries,
              },
            });

            console.log(
              `Detailed Insights Prompt for topic "${topic.topics}" (Attempt ${attempt}):`,
              prompt.substring(0, 500)
            );

            let result: string;

            if (objectives) {
              try {
                const openAiResult = await chatCompletionOpenAi({
                  messages: [
                    {
                      role: "system",
                      content: "You are an expert at extracting detailed insights from interview notes and documents. The document you are analyzing contains real content - you MUST extract and return detailed insights for EVERY topic. Returning empty arrays or fallback content is NOT ACCEPTABLE. You MUST search thoroughly through ALL sections of the document and extract insights, opinions, data points, clinical observations, treatment considerations, market insights, or any relevant information. Generate at least 10-20 detailed bullet points per topic. If specific content seems limited, extract general discussion points, related insights, or contextual information from the entire document.",
                    },
                    { role: "user", content: prompt },
                  ],
                  model: selectedModel,
                }).unwrap();
                result = openAiResult.choices?.[0]?.message?.content || "";

                // Log cost for this API call
                if (openAiResult.usage) {
                  console.log(` [Detailed Insights - ${topic.topics}] Usage:`, openAiResult.usage);
                  logCost(selectedModel, openAiResult.usage, `Detailed Insights - ${topic.topics}`);
                  costTracker.addCall(selectedModel, openAiResult.usage, `Detailed Insights - ${topic.topics}`);
                } else {
                  console.warn(`[Detailed Insights - ${topic.topics}] No usage data in response`);
                }
              } catch (error: any) {
                if (isQuotaExceededError(error)) {
                  setQuotaExceeded(true);
                  setQuotaErrorMessage(extractQuotaErrorMessage(error));
                  throw error; // Re-throw to stop execution
                }
                throw error;
              }
            } else {
              try {
                const thread = await createThread().unwrap();
                const openAiResult = await askQuestionBasedOnFile({
                  threadId: thread.id,
                  assistantId,
                  message: prompt,
                  assistantPrompt: "You are an expert at extracting detailed insights from interview notes and documents. The document contains real content - you MUST extract and return detailed insights for EVERY topic. Returning empty arrays or fallback content is NOT ACCEPTABLE. You MUST search thoroughly through ALL sections and extract insights, opinions, data points, clinical observations, treatment considerations, market insights, or any relevant information. Generate at least 10-20 detailed bullet points per topic. If specific content seems limited, extract general discussion points, related insights, or contextual information from the entire document.",
                }).unwrap();
                result = openAiResult.content || "";

                // Log cost for this API call (if usage info is available)
                // Note: File-based API calls (Assistants API) don't include usage in response
                // Usage is available in run status, but we'd need to fetch it separately
                console.log(`[Detailed Insights (File-based) - ${topic.topics}] Response:`, openAiResult);
                console.warn(`[Detailed Insights (File-based) - ${topic.topics}] Usage tracking not available for Assistants API calls`);
              } catch (error: any) {
                if (isQuotaExceededError(error)) {
                  setQuotaExceeded(true);
                  setQuotaErrorMessage(extractQuotaErrorMessage(error));
                  throw error; // Re-throw to stop execution
                }
                throw error;
              }
            }

            console.log(
              `Raw result for topic "${topic.topics}" (Attempt ${attempt}):`,
              result.substring(0, 500)
            );

            // Validate response before parsing
            if (!result || result.trim() === "") {
              console.error(`Empty response received for topic "${topic.topics}"`);
              throw new Error("Empty response from API");
            }

            // Check if response looks like it might be incomplete JSON
            const trimmedResult = result.trim();
            const hasOpeningBrace = trimmedResult.includes('{') || trimmedResult.includes('[');
            const hasClosingBrace = trimmedResult.includes('}') || trimmedResult.includes(']');
            
            if (hasOpeningBrace && !hasClosingBrace) {
              console.error(`Incomplete JSON detected for topic "${topic.topics}" - response appears truncated`);
              throw new Error("Incomplete JSON response - API response was truncated");
            }

            const parsed = safeJSONParse(result);
            
            // If parsing failed and we have retries left, throw error to trigger retry
            if (!parsed && attempt < maxRetries) {
              console.error(`JSON parsing failed for topic "${topic.topics}" on attempt ${attempt} - will retry`);
              throw new Error("JSON parsing failed - will retry");
            }

            // Validate parsed structure
            if (!parsed) {
              if (attempt < maxRetries) {
                console.error(`Parsed result is null for topic "${topic.topics}" on attempt ${attempt} - will retry`);
                throw new Error("JSON parsing returned null - will retry");
              }
              console.warn(`Parsed result is null for topic "${topic.topics}" after all retries - using fallback`);
              const fallbackContent = `<h3>${topic.topics}</h3><ul><li>No detailed insights found for this topic.</li></ul>`;
              return { detailedInsights: fallbackContent, topicTitle: topic.topics };
            }

            if (
              parsed &&
              parsed.detailedInsights &&
              Array.isArray(parsed.detailedInsights) &&
              parsed.detailedInsights.length > 0
            ) {
              // Accept the result even if it has fewer bullets - don't retry on successful API calls
              // Only retry on actual errors, not on "insufficient" content quality
              const htmlContent = parsed.detailedInsights
                .map(
                  (item: {
                    title: string;
                    bullets: Array<{ id: number; text: string }>;
                  }) => {
                    const actualTopicTitle = topic.topics;
                    const bulletsHtml = item.bullets
                      .map((bullet) => {
                        const cleanText = bullet.text.replace(/\n/g, " ").trim();
                        return `<li>${cleanText}</li>`;
                      })
                      .join("");
                    return `<h3>${actualTopicTitle}</h3><ul>${bulletsHtml}</ul>`;
                  }
                )
                .join("\n\n");
              console.log(
                `Successfully processed topic "${topic.topics}" with ${parsed.detailedInsights[0]?.bullets?.length || 0} bullets`
              );
              return { detailedInsights: htmlContent, topicTitle: topic.topics };
            } else {
              // Check if we should retry based on the structure
              const hasInvalidStructure = !parsed.detailedInsights || 
                                         !Array.isArray(parsed.detailedInsights) ||
                                         parsed.detailedInsights.length === 0;
              
              if (hasInvalidStructure && attempt < maxRetries) {
                console.warn(
                  `Attempt ${attempt}: Invalid structure for topic "${topic.topics}" - missing or empty detailedInsights array. Retrying...`
                );
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
                continue; // Retry
              }
              
              // If we've exhausted retries or result is just empty (not invalid structure), use fallback
              console.warn(
                `Attempt ${attempt}: Empty or invalid result for topic "${topic.topics}". Using fallback.`
              );
              const fallbackContent = `<h3>${topic.topics}</h3><ul><li>No detailed insights found for this topic.</li></ul>`;
              return { detailedInsights: fallbackContent, topicTitle: topic.topics };
            }
          } catch (error: any) {
            console.error(`Attempt ${attempt} error for topic "${topic.topics}":`, error);
            
            // Check if error is due to incomplete JSON or parsing failure - retry if we have attempts left
            const isIncompleteJsonError = error?.message?.includes("Incomplete JSON") || 
                                         error?.message?.includes("JSON parsing failed") ||
                                         error?.message?.includes("Empty response");
            
            if (isIncompleteJsonError && attempt < maxRetries) {
              console.warn(`Incomplete JSON detected on attempt ${attempt} for topic "${topic.topics}" - retrying...`);
              // Exponential backoff: 1s, 2s, 3s
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
              continue; // Retry the loop
            }
            
            // If it's a quota error, re-throw it to stop execution
            if (isQuotaExceededError(error)) {
              setQuotaExceeded(true);
              setQuotaErrorMessage(extractQuotaErrorMessage(error));
              throw error; // Re-throw to stop execution
            }
            
            // On other errors or max retries reached, return fallback
            if (attempt >= maxRetries) {
              console.error(`Max retries (${maxRetries}) reached for topic "${topic.topics}". Using fallback.`);
            }
            const fallbackContent = `<h3>${topic.topics}</h3><ul><li>Please try regenerating this section.</li></ul>`;
            return { detailedInsights: fallbackContent, topicTitle: topic.topics };
          }
        }

        // If all retries failed, we still need to return something, but try one more time with a very aggressive prompt
        console.error(`All retries failed for topic "${topic.topics}". Attempting final aggressive retry...`);
        try {
          const finalPrompt = generateDetailedInsightsPrompt({
            values: {
              file,
              type,
              summaryType,
              objectives,
              objectivesSummary,
              generateTopicsChecked,
              additionalNotes: `FINAL ATTEMPT - CRITICAL: You MUST generate detailed insights for topic "${topic.topics}". Extract ANY relevant information from the document - discussions, opinions, data, clinical insights, treatment considerations, or related content. Generate at least 10-15 detailed bullet points. Do NOT return empty content.`,
              discussionTopics: {
                ...discussionTopics,
                additionalNote: `FINAL ATTEMPT - CRITICAL: You MUST generate detailed insights for topic "${topic.topics}".`,
                sections: [topic],
              },
              detailedInsights: {
                ...detailedInsights,
              },
              generatedInterviewSummaries,
            },
          });

          let result: string;
          if (objectives) {
            try {
              const openAiResult = await chatCompletionOpenAi({
                messages: [
                  {
                    role: "system",
                    content: "I am a bot generating content response. This is a FINAL ATTEMPT - you MUST find real detailed insights. Extract any relevant information from the document.",
                  },
                  { role: "user", content: finalPrompt },
                ],
                model: selectedModel,
              }).unwrap();
              result = openAiResult.choices?.[0]?.message?.content || "";
            } catch (error: any) {
              if (isQuotaExceededError(error)) {
                setQuotaExceeded(true);
                setQuotaErrorMessage(extractQuotaErrorMessage(error));
                throw error; // Re-throw to stop execution
              }
              throw error;
            }
          } else {
            try {
              const thread = await createThread().unwrap();
              const openAiResult = await askQuestionBasedOnFile({
                threadId: thread.id,
                assistantId,
                message: finalPrompt,
                assistantPrompt: "This is a FINAL ATTEMPT - you MUST find real detailed insights. Extract any relevant information from the document.",
              }).unwrap();
              result = openAiResult.content || "";
            } catch (error: any) {
              if (isQuotaExceededError(error)) {
                setQuotaExceeded(true);
                setQuotaErrorMessage(extractQuotaErrorMessage(error));
                throw error; // Re-throw to stop execution
              }
              throw error;
            }
          }

          const parsed = safeJSONParse(result);
          if (
            parsed &&
            parsed.detailedInsights &&
            Array.isArray(parsed.detailedInsights) &&
            parsed.detailedInsights.length > 0
          ) {
            const htmlContent = parsed.detailedInsights
              .map(
                (item: {
                  title: string;
                  bullets: Array<{ id: number; text: string }>;
                }) => {
                  const actualTopicTitle = topic.topics;
                  const bulletsHtml = item.bullets
                    .map((bullet) => {
                      const cleanText = bullet.text.replace(/\n/g, " ").trim();
                      return `<li>${cleanText}</li>`;
                    })
                    .join("");
                  return `<h3>${actualTopicTitle}</h3><ul>${bulletsHtml}</ul>`;
                }
              )
              .join("\n\n");
            console.log(`Final attempt succeeded for topic "${topic.topics}"`);
            return { detailedInsights: htmlContent, topicTitle: topic.topics };
          }
        } catch (finalError) {
          console.error(`Final attempt also failed for topic "${topic.topics}":`, finalError);
        }

        // Absolute last resort - return fallback only if everything failed
        console.error(`All attempts failed for topic "${topic.topics}". Using fallback as absolute last resort.`);
        const fallbackContent = `<h3>${topic.topics}</h3><ul><li>Content for this topic is being processed. Please try regenerating this section.</li></ul>`;
        return { detailedInsights: fallbackContent, topicTitle: topic.topics };
      };

      console.log(
        `Processing ${discussionTopics.sections.length} topics for detailed insights:`,
        discussionTopics.sections.map((s: any) => s.topics)
      );

      const topicResults = await Promise.all(
        discussionTopics.sections.map(generateContentForTopic)
      );

      console.log(
        `Received ${topicResults.length} results. Expected ${discussionTopics.sections.length} topics.`
      );

      // Ensure we have results for all topics
      const combinedDetailedInsights = topicResults
        .map((result, index) => {
          if (result && result.detailedInsights) {
            return result.detailedInsights;
          }
          // Fallback if result is missing
          const topicTitle = discussionTopics.sections[index]?.topics || `Topic ${index + 1}`;
          console.warn(`Missing result for topic: ${topicTitle}`);
          return `<h3>${topicTitle}</h3><ul><li>Content for this topic is being processed. Please try regenerating this section.</li></ul>`;
        })
        .filter((content) => content)
        .join("\n\n");

      // Verify we have content for all topics
      const expectedTopicCount = discussionTopics.sections.length;
      const actualTopicCount = (combinedDetailedInsights.match(/<h3>/g) || []).length;
      console.log(
        `Topic count verification: Expected ${expectedTopicCount}, Found ${actualTopicCount}`
      );

      if (actualTopicCount < expectedTopicCount) {
        console.warn(
          `WARNING: Missing topics! Expected ${expectedTopicCount} topics but only found ${actualTopicCount}`
        );
      }

      // Fallback for invalid or missing response
      if (!combinedDetailedInsights || combinedDetailedInsights.trim() === "") {
        const fallbackContent = `<ul><li>No detailed insights can be determined.</li></ul>`;
        setInterviewSummariesFormValues((prevValues) => ({
          ...prevValues,
          generatedInterviewSummaries: {
            ...prevValues.generatedInterviewSummaries,
            generatedDetailedInsights: [fallbackContent],
          },
        }));
      } else {
        setInterviewSummariesFormValues((prevValues) => ({
          ...prevValues,
          generatedInterviewSummaries: {
            ...prevValues.generatedInterviewSummaries,
            generatedDetailedInsights: [combinedDetailedInsights],
          },
        }));
      }

      // Log cost summary for Detailed Insights section
      const detailedInsightsCost = costTracker.getTotalCost();
      if (detailedInsightsCost > 0) {
        console.log(`Detailed Insights Total Cost: ${formatCost(detailedInsightsCost)}`);
        costTracker.logSummary();
        costTracker.reset();
      }
    } catch (error) {
      console.error("Error fetching detailed insights:", error);
      // Fallback on error
      const fallbackContent = `<ul><li>No detailed insights can be determined.</li></ul>`;
      setInterviewSummariesFormValues((prevValues) => ({
        ...prevValues,
        generatedInterviewSummaries: {
          ...prevValues.generatedInterviewSummaries,
          generatedDetailedInsights: [fallbackContent],
        },
      }));
    } finally {
      setSectionLoading(null);
    }
  };

  const fetchActionItems = async (additionalNote?: string) => {
    try {
      setSectionLoading("generatedActions");
      const {
        type,
        summaryType,
        objectives,
        objectivesSummary,
        discussionTopics,
        actionItems,
        generatedInterviewSummaries,
        generateTopicsChecked,
        file,
      } = interviewSummariesFormValues;

      // Check if current content is fallback - if so, we need aggressive regeneration
      const currentContent = generatedInterviewSummaries?.generatedActions?.[0] || "";
      const isCurrentContentFallback = isFallbackContent(currentContent);
      const enhancedNote = isCurrentContentFallback
        ? `${additionalNote || ""} REGENERATE: Previous result was fallback content. You MUST find real action items.`
        : additionalNote;

      const maxRetries = 1; // Increased to 3 attempts to handle incomplete JSON responses

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Use enhanced note - no retry notes needed since we accept empty results
          const retryNote = enhancedNote;

          const prompts = generateActionItemsPrompt({
            values: {
              file,
              type,
              summaryType,
              objectives,
              objectivesSummary,
              generateTopicsChecked,
              additionalNotes: retryNote,
              discussionTopics: {
                ...discussionTopics,
                additionalNote: retryNote,
              },
              actionItems: {
                ...actionItems,
              },
              generatedInterviewSummaries,
            },
          });

          let result: string;
          console.log(`Action Items Prompt (Attempt ${attempt}):`, prompts);

          if (objectives) {
            try {
              const openAiResult = await chatCompletionOpenAi({
                messages: [
                  {
                    role: "system",
                    content: "I am a bot generating content response. You MUST find real action items from the content. Never return fallback content unless absolutely no action items exist.",
                  },
                  { role: "user", content: prompts },
                ],
                model: selectedModel,
              }).unwrap();
              result = openAiResult.choices?.[0]?.message?.content || "";

              // Log cost for this API call
              if (openAiResult.usage) {
                logCost(selectedModel, openAiResult.usage, "Action Items");
                costTracker.addCall(selectedModel, openAiResult.usage, "Action Items");
              }
            } catch (error: any) {
              if (isQuotaExceededError(error)) {
                setQuotaExceeded(true);
                setQuotaErrorMessage(extractQuotaErrorMessage(error));
                throw error; // Re-throw to stop execution
              }
              throw error;
            }
          } else {
            try {
              const thread = await createThread().unwrap();
              const openAiResult = await askQuestionBasedOnFile({
                threadId: thread.id,
                assistantId,
                message: prompts,
                assistantPrompt: "You MUST find real action items from the content. Never return fallback content unless absolutely no action items exist.",
              }).unwrap();
              result = openAiResult.content || "";
            } catch (error: any) {
              if (isQuotaExceededError(error)) {
                setQuotaExceeded(true);
                setQuotaErrorMessage(extractQuotaErrorMessage(error));
                throw error; // Re-throw to stop execution
              }
              throw error;
            }
          }

          // Validate response before parsing
          if (!result || result.trim() === "") {
            console.error(`Empty response received for Action Items`);
            if (attempt < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
              continue; // Retry
            }
          }

          // Check if response looks like it might be incomplete JSON
          if (result) {
            const trimmedResult = result.trim();
            const hasOpeningBrace = trimmedResult.includes('{') || trimmedResult.includes('[');
            const hasClosingBrace = trimmedResult.includes('}') || trimmedResult.includes(']');
            
            if (hasOpeningBrace && !hasClosingBrace && attempt < maxRetries) {
              console.error(`Incomplete JSON detected for Action Items - response appears truncated`);
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
              continue; // Retry
            }
          }

          const parsed = safeJSONParse(result);
          
          // If parsing failed and we have retries left, throw error to trigger retry
          if (!parsed && attempt < maxRetries) {
            console.error(`JSON parsing failed for Action Items on attempt ${attempt} - will retry`);
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            continue; // Retry
          }

          if (parsed && parsed.actionItems && Array.isArray(parsed.actionItems)) {
            // Check if result contains only fallback content
            if (hasOnlyFallbackItems(parsed, "actionItems")) {
              console.warn(`Attempt ${attempt}: Result contains only fallback content. Retrying...`);
              if (attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
                continue;
              }
            }

            // If we have real content (not just fallback), use it
            if (parsed.actionItems.length > 0 && !hasOnlyFallbackItems(parsed, "actionItems")) {
              const bulletsHtml = parsed.actionItems
                .map((item: { id: number; bullet: string }) => {
                  const cleanText = item.bullet.replace(/\n/g, " ").trim();
                  return `<li>${cleanText}</li>`;
                })
                .join("");
              const htmlContent = `<ul>${bulletsHtml}</ul>`;

              setInterviewSummariesFormValues((prevValues) => ({
                ...prevValues,
                generatedInterviewSummaries: {
                  ...prevValues.generatedInterviewSummaries,
                  generatedActions: [htmlContent],
                },
              }));
              return; // Success - exit function
            }

            // If we reach here and it's the last attempt, we'll use fallback
            if (attempt === maxRetries) {
              console.error("Max retries reached. Using fallback content as last resort.");
              const fallbackContent = `<ul><li>No action items have been identified.</li></ul>`;
              setInterviewSummariesFormValues((prevValues) => ({
                ...prevValues,
                generatedInterviewSummaries: {
                  ...prevValues.generatedInterviewSummaries,
                  generatedActions: [fallbackContent],
                },
              }));
              return;
            }
          } else {
            // Invalid or missing response - accept it instead of retrying to save API costs
            // Only retry on actual errors (caught in catch block), not on empty/invalid responses
            console.warn(`Attempt ${attempt}: Invalid or missing response for action items. Accepting fallback.`);
            const fallbackContent = `<ul><li>No action items have been identified.</li></ul>`;
            setInterviewSummariesFormValues((prevValues) => ({
              ...prevValues,
              generatedInterviewSummaries: {
                ...prevValues.generatedInterviewSummaries,
                generatedActions: [fallbackContent],
              },
            }));
            return; // Exit - don't retry on empty responses
          }
        } catch (error) {
          console.error(`Attempt ${attempt} error:`, error);
          // On error, return fallback immediately - don't retry to save API costs
          const fallbackContent = `<ul><li>Please try regenerating this section.</li></ul>`;
          setInterviewSummariesFormValues((prevValues) => ({
            ...prevValues,
            generatedInterviewSummaries: {
              ...prevValues.generatedInterviewSummaries,
              generatedActions: [fallbackContent],
            },
          }));
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching action items:", error);
    } finally {
      setSectionLoading(null);
    }
  };

  const fetchKeyRecommendations = async (additionalNote?: string) => {
    try {
      setSectionLoading("generatedKeyRecommendations");
      const {
        type,
        summaryType,
        objectives,
        objectivesSummary,
        discussionTopics,
        keyRecommendation,
        generatedInterviewSummaries,
        generateTopicsChecked,
        file,
      } = interviewSummariesFormValues;

      // Check if current content is fallback - if so, we need aggressive regeneration
      const currentContent = generatedInterviewSummaries?.generatedKeyRecommendations?.[0] || "";
      const isCurrentContentFallback = isFallbackContent(currentContent);
      const enhancedNote = isCurrentContentFallback
        ? `${additionalNote || ""} REGENERATE: Previous result was fallback content. You MUST find real key recommendations.`
        : additionalNote;

      const maxRetries = 1; // Increased to 3 attempts to handle incomplete JSON responses

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Use enhanced note - no retry notes needed since we accept empty results
          const retryNote = enhancedNote;

          const prompts = generateKeyRecommendationsPrompt({
            values: {
              type,
              summaryType,
              objectives,
              objectivesSummary,
              generateTopicsChecked,
              file,
              additionalNotes: retryNote,
              discussionTopics: {
                ...discussionTopics,
                additionalNote: retryNote,
              },
              keyRecommendations: {
                ...keyRecommendation,
              },
              generatedInterviewSummaries,
            },
          });

          let result: string;
          console.log(`Key Recommendation Prompt (Attempt ${attempt}):`, prompts);

          if (objectives) {
            try {
              const openAiResult = await chatCompletionOpenAi({
                messages: [
                  {
                    role: "system",
                    content: "I am a bot generating content response. You MUST find real key recommendations from the content. Never return fallback content unless absolutely no recommendations exist.",
                  },
                  { role: "user", content: prompts },
                ],
                model: selectedModel,
              }).unwrap();
              result = openAiResult.choices?.[0]?.message?.content || "";

              // Log cost for this API call
              if (openAiResult.usage) {
                logCost(selectedModel, openAiResult.usage, "Key Recommendations");
                costTracker.addCall(selectedModel, openAiResult.usage, "Key Recommendations");
              }
            } catch (error: any) {
              if (isQuotaExceededError(error)) {
                setQuotaExceeded(true);
                setQuotaErrorMessage(extractQuotaErrorMessage(error));
                throw error; // Re-throw to stop execution
              }
              throw error;
            }
          } else {
            try {
              const thread = await createThread().unwrap();
              const openAiResult = await askQuestionBasedOnFile({
                threadId: thread.id,
                assistantId,
                message: prompts,
                assistantPrompt: "You MUST find real key recommendations from the content. Never return fallback content unless absolutely no recommendations exist.",
              }).unwrap();
              result = openAiResult.content || "";

              // Log cost for this API call (if usage info is available)
              // Note: File-based API calls may not always include usage info
              if ((openAiResult as any).usage) {
                logCost(selectedModel, (openAiResult as any).usage, "Key Recommendations (File-based)");
                costTracker.addCall(selectedModel, (openAiResult as any).usage, "Key Recommendations (File-based)");
              }
            } catch (error: any) {
              if (isQuotaExceededError(error)) {
                setQuotaExceeded(true);
                setQuotaErrorMessage(extractQuotaErrorMessage(error));
                throw error; // Re-throw to stop execution
              }
              throw error;
            }
          }

          // Validate response before parsing
          if (!result || result.trim() === "") {
            console.error(`Empty response received for Key Recommendations`);
            if (attempt < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
              continue; // Retry
            }
          }

          // Check if response looks like it might be incomplete JSON
          if (result) {
            const trimmedResult = result.trim();
            const hasOpeningBrace = trimmedResult.includes('{') || trimmedResult.includes('[');
            const hasClosingBrace = trimmedResult.includes('}') || trimmedResult.includes(']');
            
            if (hasOpeningBrace && !hasClosingBrace && attempt < maxRetries) {
              console.error(`Incomplete JSON detected for Key Recommendations - response appears truncated`);
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
              continue; // Retry
            }
          }

          const parsed = safeJSONParse(result);
          
          // If parsing failed and we have retries left, throw error to trigger retry
          if (!parsed && attempt < maxRetries) {
            console.error(`JSON parsing failed for Key Recommendations on attempt ${attempt} - will retry`);
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            continue; // Retry
          }

          if (
            parsed &&
            parsed.keyRecommendations &&
            Array.isArray(parsed.keyRecommendations)
          ) {
            // Check if result contains only fallback content
            if (hasOnlyFallbackItems(parsed, "keyRecommendations")) {
              console.warn(`Attempt ${attempt}: Result contains only fallback content. Retrying...`);
              if (attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
                continue;
              }
            }

            // If we have real content (not just fallback), use it
            if (parsed.keyRecommendations.length > 0 && !hasOnlyFallbackItems(parsed, "keyRecommendations")) {
              const bulletsHtml = parsed.keyRecommendations
                .map((item: { id: number; bullet: string }) => {
                  const cleanText = item.bullet.replace(/\n/g, " ").trim();
                  return `<li>${cleanText}</li>`;
                })
                .join("");
              const htmlContent = `<ul>${bulletsHtml}</ul>`;

              setInterviewSummariesFormValues((prevValues) => ({
                ...prevValues,
                generatedInterviewSummaries: {
                  ...prevValues.generatedInterviewSummaries,
                  generatedKeyRecommendations: [htmlContent],
                },
              }));
              return; // Success - exit function
            }

            // If we reach here and it's the last attempt, we'll use fallback
            if (attempt === maxRetries) {
              console.error("Max retries reached. Using fallback content as last resort.");
              const fallbackContent = `<ul><li>No Key Recommendations can be determined.</li></ul>`;
              setInterviewSummariesFormValues((prevValues) => ({
                ...prevValues,
                generatedInterviewSummaries: {
                  ...prevValues.generatedInterviewSummaries,
                  generatedKeyRecommendations: [fallbackContent],
                },
              }));
              return;
            }
          } else {
            // Invalid or missing response - accept it instead of retrying to save API costs
            // Only retry on actual errors (caught in catch block), not on empty/invalid responses
            console.warn(`Attempt ${attempt}: Invalid or missing response for key recommendations. Accepting fallback.`);
            const fallbackContent = `<ul><li>No Key Recommendations can be determined.</li></ul>`;
            setInterviewSummariesFormValues((prevValues) => ({
              ...prevValues,
              generatedInterviewSummaries: {
                ...prevValues.generatedInterviewSummaries,
                generatedKeyRecommendations: [fallbackContent],
              },
            }));
            return; // Exit - don't retry on empty responses
          }
        } catch (error) {
          console.error(`Attempt ${attempt} error:`, error);
          // On error, return fallback immediately - don't retry to save API costs
          const fallbackContent = `<ul><li>Please try regenerating key recommendations.</li></ul>`;
          setInterviewSummariesFormValues((prevValues) => ({
            ...prevValues,
            generatedInterviewSummaries: {
              ...prevValues.generatedInterviewSummaries,
              generatedKeyRecommendations: [fallbackContent],
            },
          }));
          return;
        }
      }

      // Log cost summary for Key Recommendations section
      const keyRecommendationsCost = costTracker.getTotalCost();
      if (keyRecommendationsCost > 0) {
        console.log(` Key Recommendations Total Cost: ${formatCost(keyRecommendationsCost)}`);
        costTracker.reset();
      }
    } catch (error) {
      console.error("Error fetching key recommendations:", error);
    } finally {
      setSectionLoading(null);
    }
  };

  const removeFiles = () => {
    if (!interviewSummariesFormValues.file?.fileId) return;

    // Validate vectorStoreId before making the API call
    if (!vectorStoreId || vectorStoreId.trim() === "") {
      console.error("⚠️ Cannot remove file: vectorStoreId is missing or empty");
      return;
    }

    // Validate fileId doesn't look like a vector store ID
    const fileId = interviewSummariesFormValues.file.fileId;
    if (fileId.startsWith("vs_")) {
      console.error("⚠️ Invalid fileId - appears to be a vector store ID:", fileId);
      return;
    }

    deleteFileFromVectorStore({
      vectorStoreId,
      file_id: fileId,
    });
    deleteFileFromStorage(fileId);
  };

  return {
    fetchKeyTakeaways,
    fetchDetailedInsights,
    fetchActionItems,
    fetchKeyRecommendations,
    removeFiles,
    sectionLoading,
    setSectionLoading,
    interviewSummariesFormValues,
    setInterviewSummariesFormValues,
    quotaExceeded,
    quotaErrorMessage,
    setQuotaExceeded,
  };
};

