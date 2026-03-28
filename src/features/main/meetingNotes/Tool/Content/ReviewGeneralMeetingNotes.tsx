/* eslint-disable react-hooks/exhaustive-deps */
import "react-quill/dist/quill.snow.css";
import { FormLabel, Skeleton, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { useAtom } from "jotai";
import { generalMeetingNotesDroppedItemsAtom } from "../../../../../atoms/dndAtom";
import { useCallback, useEffect, useState } from "react";
import { meetingNotesFormAtom } from "../../../../../atoms/meetingNotesAtom";
import ReactQuill from "react-quill";
import useOpenAI from "../../../../../hooks/useOpenAI";
import {
  formatTopicsResponse,
  removeNewLinesAndEmptyLines,
  safeJSONParse,
} from "../../../../../utils/textFormatter";
import {
  DiscussionTopicsFormValues,
  GeneralMeetingNotesSectionKey,
  GeneratedGeneralMeetingNotes,
} from "../../../../../types/meetingNotesTypes";
import RegenerateGeneralMeetingNotesModal from "../Modals/RegenerateGeneralMeetingNotesModal";
import {
  generateMeetingSummariesKeyTakeawaysPrompt,
  meetingNotesDiscussionPrompt,
} from "../../../../../config/meetingNotesPrompt";
import { ComponentItem } from "../../../interviewSummaries/Tool/Content/InterviewStructureStep";

const meetingNotesAssistantId = "asst_44A627lDxXoKq91CQmmAw5qj";

const ReviewGeneralMeetingNotes = () => {
  const {
    chatCompletionOpenAi,
    askQuestionBasedOnFileWithoutPrompt,
    createThread,
  } = useOpenAI();
  const [selectedItems, setSelectedItems] = useAtom(
    generalMeetingNotesDroppedItemsAtom
  );
  const [sectionLoading, setSectionLoading] =
    useState<GeneralMeetingNotesSectionKey | null>(null);
  const [currentSection, setCurrentSection] =
    useState<GeneralMeetingNotesSectionKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [meetingNotesValues, setMeetingNotesValues] =
    useAtom(meetingNotesFormAtom);
  const [discussionTopicsFetched, setDiscussionTopicsFetched] = useState(false);

  const typeItemsMap: { [key: string]: ComponentItem[] } = {
    "General Meeting Notes": [{ title: "Meeting Summaries", id: 1 }],
  };

  useEffect(() => {
    if (meetingNotesValues.type.name === "General Meeting Notes") {
      const defaultItem = typeItemsMap["General Meeting Notes"][0];
      setSelectedItems([defaultItem]);
    }
  }, [meetingNotesValues.type, setSelectedItems]);

  const toolbarConfig = () => {
    return {
      toolbar: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
      ],
    };
  };

  const handleOpenModal = (
    section: GeneralMeetingNotesSectionKey,
    event: React.MouseEvent<HTMLElement>
  ) => {
    setCurrentSection(section);
    setAnchorEl(event.currentTarget);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAnchorEl(null);
  };

  const fetchDiscussionTopics = useCallback(async () => {
    setIsLoading(true);
    try {
      const thread = await createThread();

      let discussionResponse;
      if (meetingNotesValues.objectives) {
        discussionResponse = await chatCompletionOpenAi([
          {
            role: "system",
            content: "I am a bot generating content response",
            name: "system",
          },
          {
            role: "user",
            content: meetingNotesDiscussionPrompt(meetingNotesValues),
            name: "user",
          },
        ]);
      } else {
        discussionResponse = await askQuestionBasedOnFileWithoutPrompt(
          thread.id,
          meetingNotesAssistantId,
          meetingNotesDiscussionPrompt(meetingNotesValues)
        );
      }

      console.log("discussionResponse", discussionResponse);
      const { discussionTopics } = formatTopicsResponse(discussionResponse);

      let formattedSections = discussionTopics.sections?.length
        ? discussionTopics.sections
        : [];

      if (formattedSections.length === 0) {
        const retryResponse = await (meetingNotesValues.objectives
          ? chatCompletionOpenAi([
              {
                role: "system",
                content: "I am a bot generating content response",
                name: "system",
              },
              {
                role: "user",
                content: meetingNotesDiscussionPrompt(meetingNotesValues),
                name: "user",
              },
            ])
          : askQuestionBasedOnFileWithoutPrompt(
              thread.id,
              meetingNotesAssistantId,
              meetingNotesDiscussionPrompt(meetingNotesValues)
            ));
        const { discussionTopics: retryTopics } =
          formatTopicsResponse(retryResponse);
        if (retryTopics && retryTopics.sections) {
          formattedSections = retryTopics.sections;
        }
      }

      setMeetingNotesValues((prevValues) => {
        const existingSections = prevValues.discussionTopics.sections ?? [];

        const newSections = formattedSections.map(
          (item: DiscussionTopicsFormValues) => ({
            topics: item.topics,
          })
        );

        const mergedSections = [...existingSections, ...newSections];

        return {
          ...prevValues,
          discussionTopics: {
            ...prevValues.discussionTopics,
            sections: mergedSections,
          },
        };
      });

      setDiscussionTopicsFetched(true);
    } catch (error) {
      console.log("Error fetching AI content", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    askQuestionBasedOnFileWithoutPrompt,
    chatCompletionOpenAi,
    createThread,
    meetingNotesValues.objectives,
    setMeetingNotesValues,
  ]);

  const fetchMeetingSummaries = async (additionalNote?: string) => {
    if (!discussionTopicsFetched) return;
    try {
      setSectionLoading("generatedMeetingSummariesKeyTakeaways");
      const {
        type,
        file,
        objectives,
        discussionTopics,
        meetingSummariesKeyTakeaways,
        generatedGeneralMeetingNotes,
      } = meetingNotesValues;

      const generateContentForTopic = async (
        topic: DiscussionTopicsFormValues
      ) => {
        const prompt = generateMeetingSummariesKeyTakeawaysPrompt({
          values: {
            file,
            type,
            objectives,
            additionalNotes: additionalNote,
            discussionTopics: {
              ...discussionTopics,
              sections: [topic],
            },
            meetingSummariesKeyTakeaways: {
              ...meetingSummariesKeyTakeaways,
            },
            generatedGeneralMeetingNotes,
          },
        });

        console.log(
          `Key Takeaways Prompt for topic "${topic.topics}":`,
          prompt
        );

        let result: string;
        try {
          if (objectives) {
            const openAiResult = await chatCompletionOpenAi([
              {
                role: "system",
                content: "I am a bot generating content response",
              },
              { role: "user", content: prompt },
            ]);
            result = openAiResult;
          } else {
            const thread = await createThread();
            const openAiResult = await askQuestionBasedOnFileWithoutPrompt(
              thread.id,
              meetingNotesAssistantId,
              prompt
            );
            result = openAiResult;
          }
        } catch (error) {
          throw new Error("Error generating content with Open AI");
        }

        return safeJSONParse(removeNewLinesAndEmptyLines(result));
      };

      const topicResults = await Promise.all(
        discussionTopics.sections.map(generateContentForTopic)
      );

      const combinedKeyTakeaways = topicResults
        .map((result) => result.meetingSummariesKeyTakeaways)
        .join("\n\n");

      setMeetingNotesValues((prevValues) => ({
        ...prevValues,
        generatedGeneralMeetingNotes: {
          ...prevValues.generatedGeneralMeetingNotes,
          generatedMeetingSummariesKeyTakeaways: [combinedKeyTakeaways],
        },
      }));
    } catch (error) {
      console.error("Error fetching key takeaways:", error);
    } finally {
      setSectionLoading(null);
    }
  };

  useEffect(() => {
    fetchDiscussionTopics();
  }, [fetchDiscussionTopics]);

  useEffect(() => {
    if (discussionTopicsFetched) {
      setIsLoading(true);
      fetchMeetingSummaries().finally(() => setIsLoading(false));
    }
  }, [discussionTopicsFetched]);

  const Editor = useCallback(
    (label: string, valueKey: keyof GeneratedGeneralMeetingNotes) => {
      const value =
        meetingNotesValues.generatedGeneralMeetingNotes?.[valueKey]?.join(
          "\n"
        ) || "";
      const isLoadingSection = sectionLoading === valueKey;

      return (
        <>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <FormLabel sx={{ pb: 1 }} component="legend">
              {label}
            </FormLabel>
            <Typography
              sx={{
                fontSize: "14px",
                textDecoration: isLoadingSection ? "none" : "underline",
                cursor: isLoadingSection ? "not-allowed" : "pointer",
                color: isLoadingSection ? "gray" : "primary.600",
              }}
              onClick={(event) => {
                if (!isLoadingSection) {
                  handleOpenModal(valueKey, event);
                }
              }}
            >
              Regenerate
            </Typography>
          </Box>
          {isLoadingSection ? (
            <Box sx={{ marginBottom: 4 }}>
              <Skeleton variant="text" width="100%" height={30} />
              <Skeleton variant="text" width="100%" height={80} />
              <Skeleton variant="text" width="100%" height={80} />
              <Skeleton variant="text" width="100%" height={80} />
            </Box>
          ) : (
            <ReactQuill
              value={value}
              modules={toolbarConfig()}
              onChange={(val) => {
                setMeetingNotesValues((prev) => ({
                  ...prev,
                  generatedGeneralMeetingNotes: {
                    ...prev.generatedGeneralMeetingNotes,
                    [valueKey]: val.split("\n"),
                  },
                }));
              }}
              style={{
                width: "100%",
                marginBottom: "30px",
                borderRadius: "8px",
                minHeight: "40px",
              }}
            />
          )}
        </>
      );
    },
    [
      meetingNotesValues.generatedGeneralMeetingNotes,
      sectionLoading,
      handleOpenModal,
      setMeetingNotesValues,
    ]
  );

  const handleRegenerate = async (note: string) => {
    if (currentSection === "generatedMeetingSummariesKeyTakeaways") {
      await fetchMeetingSummaries(note);
    }
    setSectionLoading(null);
  };

  return (
    <Box sx={{ width: "100%", marginTop: "10px", marginBottom: "20px" }}>
      {isLoading ? (
        <Box sx={{ padding: "0 20px 0 20px" }}>
          <Box sx={{ marginBottom: 4 }}>
            <Skeleton variant="text" width="100%" height={30} />
            <Skeleton variant="text" width="100%" height={80} />
            <Skeleton variant="text" width="100%" height={80} />
            <Skeleton variant="text" width="100%" height={80} />
          </Box>
          <Box>
            <Skeleton variant="text" width="100%" height={30} />
            <Skeleton variant="text" width="100%" height={80} />
            <Skeleton variant="text" width="100%" height={80} />
            <Skeleton variant="text" width="100%" height={80} />
          </Box>
        </Box>
      ) : (
        <>
          {selectedItems?.map((item) => {
            const valueKey = {
              "Meeting Summaries": "generatedMeetingSummariesKeyTakeaways",
            }[item.title] as keyof GeneratedGeneralMeetingNotes;

            return (
              <Box sx={{ padding: "20px 20px 0 20px" }} key={item.id}>
                {Editor(item.title, valueKey)}
              </Box>
            );
          })}
        </>
      )}
      <RegenerateGeneralMeetingNotesModal
        open={modalOpen}
        anchorEl={anchorEl}
        sectionKey={currentSection}
        onClose={handleCloseModal}
        onRegenerate={handleRegenerate}
      />
    </Box>
  );
};

export default ReviewGeneralMeetingNotes;
