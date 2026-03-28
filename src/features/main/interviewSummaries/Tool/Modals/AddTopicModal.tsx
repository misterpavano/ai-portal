import { useCallback, useState } from "react";
import { Box, Popover, Typography } from "@mui/material";
import { IconXboxXFilled } from "@tabler/icons-react";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import TextArea from "../../../../../components/layouts/TextArea";
import {
  DetailedInsightTopicFormValues,
  KeyTakeawayTopicFormValues,
  SectionKey,
} from "../../../../../types/interviewSummaries";
import { useAtom } from "jotai";
import {
  assistantIdMeetingSummaryAtom,
  interviewSummariesFormAtom,
} from "../../../../../atoms/interviewDiscusstionGuideAtom";
import {
  detailedInsightTopicPrompt,
  generateOneDetailedInsightsPrompt,
  generateOneKeyTakeawayPrompt,
  keyTakeawayTopicPrompt,
} from "../../../../../config/prompts";
import {
  formatTopicsResponse,
  getAiContent,
  safeJSONParse,
} from "../../../../../utils/textFormatter";
import {
  useAskQuestionBasedOnFileMutation,
  useChatCompletionOpenAiMutation,
  useCreateThreadMutation,
} from "../../../../../api/slices/openAiSlice";
import { aiToolModelsAtom } from "../../../../../atoms/toolsAtom";
import { useGetToolsQuery } from "../../../../../api/slices/toolsSlice";

interface TopicModalProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  sectionKey: SectionKey | null;
  sectionLoading: SectionKey | null;
  setSectionLoading: (value: SectionKey | null) => void;
}

const AddTopicModal: React.FC<TopicModalProps> = ({
  open,
  onClose,
  anchorEl,
  sectionKey,
  sectionLoading,
  setSectionLoading,
}) => {
  const [interviewSummariesFormValues, setInterviewSummariesFormValues] =
    useAtom(interviewSummariesFormAtom);
  const [chatCompletionOpenAi] = useChatCompletionOpenAiMutation();
  const [models] = useAtom(aiToolModelsAtom);
  const { data: toolsData } = useGetToolsQuery();

  // Get model from backend first (source of truth), fallback to atom, then default
  const tools = Array.isArray(toolsData) ? toolsData : (toolsData?.data ?? []);
  const meetingSummariesTool = tools.find(
    (tool) => tool.name === "Meeting Summaries",
  );
  const backendModel = meetingSummariesTool?.model?.modelId;
  const atomModel = models["Meeting Summaries"];

  // Priority: Backend model > Atom model > Default
  const selectedModel = backendModel || atomModel || "gpt-3.5-turbo";
  const [askQuestionBasedOnFile] = useAskQuestionBasedOnFileMutation();
  const [createThread] = useCreateThreadMutation();
  const [assistantId] = useAtom(assistantIdMeetingSummaryAtom);
  const [notes, setNotes] = useState<Record<SectionKey, string>>(
    {} as Record<SectionKey, string>,
  );

  const fetchOneKeyTakeawayTopic = useCallback(async () => {
    try {
      const thread = await createThread().unwrap();

      let topicResponse;
      if (interviewSummariesFormValues.objectives) {
        const openAiResult = await chatCompletionOpenAi({
          messages: [
            {
              role: "system",
              content: "I am a bot generating content response",
            },
            {
              role: "user",
              content: keyTakeawayTopicPrompt(interviewSummariesFormValues),
            },
          ],
          model: selectedModel,
        }).unwrap();
        topicResponse = getAiContent(openAiResult);
      } else {
        const openAiResult = await askQuestionBasedOnFile({
          threadId: thread.id,
          assistantId,
          message: keyTakeawayTopicPrompt(interviewSummariesFormValues),
          assistantPrompt: "",
        }).unwrap();
        topicResponse = getAiContent(openAiResult);
      }

      console.log("topicResponse", topicResponse);
      const { keyTakeawayTopic } = formatTopicsResponse(topicResponse);

      let formattedSections = keyTakeawayTopic.sections?.length
        ? keyTakeawayTopic.sections
        : [];

      if (formattedSections.length === 0) {
        let retryResponse;

        if (interviewSummariesFormValues.objectives) {
          const openAiResult = await chatCompletionOpenAi({
            messages: [
              {
                role: "system",
                content: "I am a bot generating content response",
              },
              {
                role: "user",
                content: keyTakeawayTopicPrompt(interviewSummariesFormValues),
              },
            ],
            model: selectedModel,
          }).unwrap();

          retryResponse = getAiContent(openAiResult);
        } else {
          const openAiResult = await askQuestionBasedOnFile({
            threadId: thread.id,
            assistantId,
            message: keyTakeawayTopicPrompt(interviewSummariesFormValues),
          }).unwrap();

          retryResponse = getAiContent(openAiResult);
        }

        const { keyTakeawayTopic: retryTopics } =
          formatTopicsResponse(retryResponse);

        if (retryTopics && retryTopics.sections) {
          formattedSections = retryTopics.sections;
        }
      }

      setInterviewSummariesFormValues((prevValues) => {
        const existingSections = prevValues.keyTakeawayTopic.sections ?? [];

        const newSections = formattedSections.map(
          (item: KeyTakeawayTopicFormValues) => ({
            topic: item.topic,
            maxWordCountPerTopic: item.maxWordCountPerTopic,
          }),
        );

        const mergedSections = [...existingSections, ...newSections];

        return {
          ...prevValues,
          keyTakeawayTopic: {
            ...prevValues.keyTakeawayTopic,
            sections: mergedSections,
          },
        };
      });

      return formattedSections; // Return the generated sections
    } catch (error) {
      console.log("Error fetching AI content", error);
      return []; // Return an empty array in case of error
    }
  }, [
    askQuestionBasedOnFile,
    chatCompletionOpenAi,
    createThread,
    setInterviewSummariesFormValues,
    assistantId,
    interviewSummariesFormValues,
    selectedModel,
  ]);

  const fetchOneDetailedInsightTopic = useCallback(async () => {
    try {
      const thread = await createThread().unwrap();

      let topicResponse;
      if (interviewSummariesFormValues.objectives) {
        const openAiResult = await chatCompletionOpenAi({
          messages: [
            {
              role: "system",
              content: "I am a bot generating content response",
            },
            {
              role: "user",
              content: detailedInsightTopicPrompt(interviewSummariesFormValues),
            },
          ],
          model: selectedModel,
        }).unwrap();
        topicResponse = getAiContent(openAiResult);
      } else {
        const openAiResult = await askQuestionBasedOnFile({
          threadId: thread.id,
          assistantId,
          message: detailedInsightTopicPrompt(interviewSummariesFormValues),
        }).unwrap();
        topicResponse = getAiContent(openAiResult);
      }

      console.log("topicResponse", topicResponse);
      const { detailedInsightTopic } = formatTopicsResponse(topicResponse);

      let formattedSections = detailedInsightTopic.sections?.length
        ? detailedInsightTopic.sections
        : [];

      if (formattedSections.length === 0) {
        let retryResponse;

        if (interviewSummariesFormValues.objectives) {
          const openAiResult = await chatCompletionOpenAi({
            messages: [
              {
                role: "system",
                content: "I am a bot generating content response",
              },
              {
                role: "user",
                content: detailedInsightTopicPrompt(
                  interviewSummariesFormValues,
                ),
              },
            ],
            model: selectedModel,
          }).unwrap();

          retryResponse = getAiContent(openAiResult);
        } else {
          const openAiResult = await askQuestionBasedOnFile({
            threadId: thread.id,
            assistantId,
            message: detailedInsightTopicPrompt(interviewSummariesFormValues),
          }).unwrap();

          retryResponse = getAiContent(openAiResult);
        }

        const { detailedInsightTopic: retryTopics } =
          formatTopicsResponse(retryResponse);

        if (retryTopics && retryTopics.sections) {
          formattedSections = retryTopics.sections;
        }
      }

      setInterviewSummariesFormValues((prevValues) => {
        const existingSections = prevValues.detailedInsightTopic.sections ?? [];

        const newSections = formattedSections.map(
          (item: DetailedInsightTopicFormValues) => ({
            topic: item.topic,
            maxWordCountPerTopic: item.maxWordCountPerTopic,
          }),
        );

        const mergedSections = [...existingSections, ...newSections];

        return {
          ...prevValues,
          detailedInsightTopic: {
            ...prevValues.detailedInsightTopic,
            sections: mergedSections,
          },
        };
      });
      return formattedSections;
    } catch (error) {
      console.log("Error fetching AI content", error);
      return [];
    }
  }, [
    askQuestionBasedOnFile,
    chatCompletionOpenAi,
    createThread,
    setInterviewSummariesFormValues,
    assistantId,
    interviewSummariesFormValues,
    selectedModel,
  ]);

  const fetchOneKeyTakeaway = async (
    keyTakeawayTopicSections: KeyTakeawayTopicFormValues[],
  ) => {
    try {
      const {
        type,
        summaryType,
        objectives,
        objectivesSummary,
        keyTakeaways,
        generateTopicsChecked,
        aiTool,
        file,
      } = interviewSummariesFormValues;

      const generateContentForTopic = async (
        keyTakeawayTopic: KeyTakeawayTopicFormValues,
      ) => {
        const prompt = generateOneKeyTakeawayPrompt({
          values: {
            file,
            type,
            summaryType,
            objectives,
            objectivesSummary,
            generateTopicsChecked,
            keyTakeawayTopic: {
              ...keyTakeawayTopic,
              sections: [keyTakeawayTopic],
            },
            keyTakeaways: {
              ...keyTakeaways,
            },
          },
        });

        console.log(`ONE TOPIC "${keyTakeawayTopic.topic}":`, prompt);

        let result: string;
        if (aiTool === "Open AI") {
          if (objectives) {
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

            result = getAiContent(openAiResult);
          } else {
            const thread = await createThread().unwrap();

            const openAiResult = await askQuestionBasedOnFile({
              threadId: thread.id,
              assistantId,
              message: prompt,
            }).unwrap();

            result = getAiContent(openAiResult);
          }
        } else {
          throw new Error("Invalid AI tool selected");
        }

        const parsed = safeJSONParse(result);

        // Convert the new JSON structure to HTML for React Quill
        if (
          parsed &&
          parsed.keyTakeaways &&
          Array.isArray(parsed.keyTakeaways)
        ) {
          // Use the actual topic title from keyTakeawayTopic, not the AI-generated one
          const actualTopicTitle = keyTakeawayTopic.topic;
          const htmlContent = parsed.keyTakeaways
            .map(
              (item: {
                title: string;
                bullets: Array<{ id: number; text: string }>;
              }) => {
                // Remove all newlines from bullet text
                const bulletsHtml = item.bullets
                  .map((bullet) => {
                    const cleanText = bullet.text.replace(/\n/g, " ").trim();
                    return `<li>${cleanText}</li>`;
                  })
                  .join("");
                return `<h3>${actualTopicTitle}</h3><ul>${bulletsHtml}</ul>`;
              },
            )
            .join("\n\n");
          return { keyTakeaways: htmlContent };
        }

        // Fallback for old format (if AI still returns old format)
        return parsed;
      };

      const topicResults = await Promise.all(
        keyTakeawayTopicSections.map(generateContentForTopic),
      );

      // Combine all HTML content from all topics
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
        generatedKeyTakeawayTopic: {
          ...prevValues.generatedKeyTakeawayTopic,
          generatedTopic: [
            ...(prevValues.generatedKeyTakeawayTopic.generatedTopic || []),
            combinedKeyTakeaways,
          ],
        },
        generatedInterviewSummaries: {
          ...prevValues.generatedInterviewSummaries,
          generatedKeyTakeaways: [
            ...(prevValues.generatedInterviewSummaries.generatedKeyTakeaways ||
              []),
            combinedKeyTakeaways,
          ],
        },
      }));
    } catch (error) {
      console.error("Error fetching key takeaways:", error);
    }
  };

  const fetchOneDetailedInsights = async (
    detailedInsightsTopicSections: DetailedInsightTopicFormValues,
  ) => {
    try {
      const {
        type,
        summaryType,
        objectives,
        objectivesSummary,
        detailedInsightTopic,
        detailedInsights,
        generateTopicsChecked,
        aiTool,
        file,
      } = interviewSummariesFormValues;

      const generateContentForTopic = async (
        detailedInsightTopic: DetailedInsightTopicFormValues,
      ) => {
        const prompt = generateOneDetailedInsightsPrompt({
          values: {
            file,
            type,
            summaryType,
            objectives,
            objectivesSummary,
            generateTopicsChecked,
            detailedInsightTopic: {
              ...detailedInsightTopic,
              sections: [detailedInsightTopic],
            },
            detailedInsights: {
              ...detailedInsights,
            },
          },
        });

        console.log(`ONE TOPIC "${detailedInsightTopic.topic}":`, prompt);

        let result: string;
        if (aiTool === "Open AI") {
          if (objectives) {
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

            result = getAiContent(openAiResult);
          } else {
            const thread = await createThread().unwrap();

            const openAiResult = await askQuestionBasedOnFile({
              threadId: thread.id,
              assistantId,
              message: prompt,
            }).unwrap();

            result = getAiContent(openAiResult);
          }
        } else {
          throw new Error("Invalid AI tool selected");
        }

        const parsed = safeJSONParse(result);

        // Convert the new JSON structure to HTML for React Quill
        if (
          parsed &&
          parsed.detailedInsights &&
          Array.isArray(parsed.detailedInsights)
        ) {
          // Use the actual topic title from detailedInsightTopic, not the AI-generated one
          const actualTopicTitle = detailedInsightTopic.topic;
          const htmlContent = parsed.detailedInsights
            .map(
              (item: {
                title: string;
                bullets: Array<{ id: number; text: string }>;
              }) => {
                // Remove all newlines from bullet text
                const bulletsHtml = item.bullets
                  .map((bullet) => {
                    const cleanText = bullet.text.replace(/\n/g, " ").trim();
                    return `<li>${cleanText}</li>`;
                  })
                  .join("");
                return `<h3>${actualTopicTitle}</h3><ul>${bulletsHtml}</ul>`;
              },
            )
            .join("\n\n");
          return { detailedInsights: htmlContent };
        }

        // Fallback for old format (if AI still returns old format)
        return parsed;
      };

      const topicResults = await Promise.all(
        detailedInsightTopic.sections.map(generateContentForTopic),
      );

      // Combine all HTML content from all topics
      const combinedDetailedInsights = topicResults
        .map((result) => {
          if (result && result.detailedInsights) {
            return result.detailedInsights;
          }
          return "";
        })
        .filter((content) => content)
        .join("\n\n");

      setInterviewSummariesFormValues((prevValues) => ({
        ...prevValues,
        generatedDetailedInsightTopic: {
          ...prevValues.generatedDetailedInsightTopic,
          generatedTopic: [
            ...(prevValues.generatedDetailedInsightTopic.generatedTopic || []),
            combinedDetailedInsights,
          ],
        },
        generatedInterviewSummaries: {
          ...prevValues.generatedInterviewSummaries,
          generatedDetailedInsights: [
            ...(prevValues.generatedInterviewSummaries
              .generatedDetailedInsights || []),
            combinedDetailedInsights,
          ],
        },
      }));
    } catch (error) {
      console.error("Error fetching detailed insights:", error);
    }
  };

  const handleAddTopic = async () => {
    try {
      onClose();
      setSectionLoading(sectionKey);

      if (sectionKey === "generatedKeyTakeaways") {
        const keyTakeawayTopicSections = await fetchOneKeyTakeawayTopic();
        if (keyTakeawayTopicSections && keyTakeawayTopicSections.length > 0) {
          await fetchOneKeyTakeaway(keyTakeawayTopicSections);
        } else {
          console.error("No sections available for key takeaways.");
        }
      } else {
        const detailedInsightTopicSections =
          await fetchOneDetailedInsightTopic();
        if (
          detailedInsightTopicSections &&
          detailedInsightTopicSections.length > 0
        ) {
          await fetchOneDetailedInsights(detailedInsightTopicSections);
        } else {
          console.error("No sections available for detailed insights.");
        }
      }
    } catch (error) {
      console.error("Error generating topics and takeaways:", error);
    } finally {
      setSectionLoading(null);
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!sectionKey) return;

    setNotes((prevNotes) => ({
      ...prevNotes,
      [sectionKey]: e.target.value,
    }));
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            boxShadow: "none",
            border: "1px solid #D6D3D1",
          },
        },
      }}
    >
      <Box
        sx={{
          marginTop: 1,
          pb: 2,
          pr: 2,
          pl: 2,
          pt: 4,
          backgroundColor: "white",
          borderRadius: 2,
          maxWidth: 500,
          position: "relative",
        }}
      >
        <Box sx={{ marginBottom: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              position: "absolute",
              top: 5,
              left: 8,
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Add a new topic
          </Typography>

          <IconXboxXFilled
            onClick={onClose}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 30,
              height: 18,
              borderRadius: "50%",
              cursor: "pointer",
            }}
            size={15}
          />
        </Box>
        <TextArea
          name="additionalNote"
          topText="Provide additional notes or direction to add a new topic within this section."
          styles={{ width: "90%" }}
          value={sectionKey ? notes[sectionKey] || "" : ""}
          onChange={handleNoteChange}
          placeholder="Enter additional note here..."
          isLongText
        />
        <Box mt={2} display="flex" justifyContent="flex-start">
          <DefaultButton
            style={{
              borderRadius: "15px",
              height: 40,
            }}
            textStyle={{ fontSize: "12px" }}
            title={
              sectionLoading === sectionKey ? "Adding..." : "Add a new topic"
            }
            type="primary"
            onClick={handleAddTopic}
            disabled={sectionLoading !== null}
          />
        </Box>
      </Box>
    </Popover>
  );
};

export default AddTopicModal;
