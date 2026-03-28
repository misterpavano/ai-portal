/* eslint-disable react-hooks/exhaustive-deps */
import "react-quill/dist/quill.snow.css";
import { FormLabel, Skeleton, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { useAtom } from "jotai";
import { meetingNotesDroppedItemsAtom } from "../../../../../atoms/dndAtom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { meetingNotesFormAtom } from "../../../../../atoms/meetingNotesAtom";
import ReactQuill from "react-quill";
import {
  generateActionItemsNextStepByIndividualPrompt,
  generateActionItemsNextStepPrompt,
  generateMeetingOverviewPrompt,
  generateMeetingSummariesIndividualPrompt,
  generateMeetingSummariesPrompt,
} from "../../../../../config/meetingNotesPrompt";
import useOpenAI from "../../../../../hooks/useOpenAI";
import {
  removeNewLinesAndEmptyLines,
  safeJSONParse,
} from "../../../../../utils/textFormatter";
import {
  GeneratedMeetingNotes,
  MeetingNotesSectionKey,
  ProjectsFormValues,
} from "../../../../../types/meetingNotesTypes";
import RegenerateMeetingNotesModal from "../Modals/RegenerateMeetingNotesModal";

function highlightSelectedItems(
  htmlContent: string,
  selectedHighlightedOutput: string[]
): string {
  if (!selectedHighlightedOutput?.length || !htmlContent) {
    return htmlContent;
  }

  const highlightItems = selectedHighlightedOutput.map((item) => {
    const match = item.match(/(.+?)\s\((\w+)\)/);
    if (match) {
      return {
        fullName: match[1].toLowerCase().trim(),
        abbreviation: match[2].toLowerCase(),
      };
    }
    return { fullName: item.toLowerCase().trim(), abbreviation: null };
  });

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  const listItems = tempDiv.querySelectorAll("li");
  listItems.forEach((li) => {
    const hasStrongTag = li.querySelector("strong") !== null;
    const liText = li.textContent?.toLowerCase() || "";

    const shouldHighlight = highlightItems.some(
      ({ fullName, abbreviation }) => {
        const fullNameRegex = new RegExp(`\\b${fullName}\\b`);
        const abbreviationRegex = abbreviation
          ? new RegExp(`\\b${abbreviation}\\b`)
          : null;

        return (
          fullNameRegex.test(liText) ||
          (abbreviationRegex && abbreviationRegex.test(liText))
        );
      }
    );

    if (!hasStrongTag && shouldHighlight) {
      const span = document.createElement("span");
      span.style.color = "red";
      li.parentNode?.insertBefore(span, li);
      span.appendChild(li);
    }
  });

  return tempDiv.innerHTML;
}

const meetingNotesAssistantId = "asst_44A627lDxXoKq91CQmmAw5qj";

const ReviewMeetingNotes = () => {
  const {
    chatCompletionOpenAi,
    askQuestionBasedOnFileWithoutPrompt,
    createThread,
  } = useOpenAI();
  const [droppedItems] = useAtom(meetingNotesDroppedItemsAtom);
  const [sectionLoading, setSectionLoading] =
    useState<MeetingNotesSectionKey | null>(null);
  const [currentSection, setCurrentSection] =
    useState<MeetingNotesSectionKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [meetingNotesValues, setMeetingNotesValues] =
    useAtom(meetingNotesFormAtom);
  const getHighlightedOutput = useCallback(() => {
    const selectedOutput =
      meetingNotesValues.actionItemsNextStep?.selectedHighlightedOutput;

    return selectedOutput?.length ? selectedOutput : [];
  }, [
    meetingNotesValues.actionItemsNextStep?.selectedHighlightedOutput?.length,
  ]);

  // Memoize the highlighted output to prevent unnecessary recalculations
  const selectedHighlightedOutput = useMemo(() => {
    return getHighlightedOutput();
  }, [getHighlightedOutput]);

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
    section: MeetingNotesSectionKey,
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

  const fetchMeetingSummaries = async (additionalNote?: string) => {
    try {
      setSectionLoading("generatedMeetingSummaries");
      const {
        file,
        type,
        objectives,
        structureType,
        meetingProjects,
        generatedMeetingNotes,
        meetingSummaries,
      } = meetingNotesValues;

      const generateContentForProject = async (project: ProjectsFormValues) => {
        const prompt = generateMeetingSummariesPrompt({
          values: {
            file,
            type,
            structureType,
            objectives,
            additionalNotes: additionalNote,
            meetingProjects: {
              ...meetingProjects,
              sections: [project],
            },
            meetingSummaries: {
              ...meetingSummaries,
            },
            generatedMeetingNotes,
          },
        });

        console.log("Meeting Summaries Prompt:", prompt);
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

      const projectResults = await Promise.all(
        meetingProjects.sections.map(generateContentForProject)
      );

      const combinedMeetingSummaries = projectResults
        .map((result) => result.meetingSummaries)
        .join("\n\n");

      setMeetingNotesValues((prevValues) => ({
        ...prevValues,
        generatedMeetingNotes: {
          ...prevValues.generatedMeetingNotes,
          generatedMeetingSummaries: [combinedMeetingSummaries],
        },
      }));
    } catch (error) {
      console.error("Error fetching meeting summaries:", error);
    } finally {
      setSectionLoading(null);
    }
  };

  const fetchMeetingSummariesByIndividual = async (additionalNote?: string) => {
    try {
      setSectionLoading("generatedMeetingSummaries");
      const {
        file,
        type,
        objectives,
        structureType,
        meetingIndividuals,
        generatedMeetingNotes,
        meetingSummaries,
      } = meetingNotesValues;

      const generateContentForProject = async (project: ProjectsFormValues) => {
        const prompt = generateMeetingSummariesIndividualPrompt({
          values: {
            file,
            type,
            structureType,
            objectives,
            additionalNotes: additionalNote,
            meetingIndividuals: {
              ...meetingIndividuals,
              sections: [project],
            },
            meetingSummaries: {
              ...meetingSummaries,
            },
            generatedMeetingNotes,
          },
        });

        console.log("Meeting Summaries Prompt:", prompt);
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

      const projectResults = await Promise.all(
        meetingIndividuals.sections.map(generateContentForProject)
      );

      const combinedMeetingSummaries = projectResults
        .map((result) => result.meetingSummaries)
        .join("\n\n");

      setMeetingNotesValues((prevValues) => ({
        ...prevValues,
        generatedMeetingNotes: {
          ...prevValues.generatedMeetingNotes,
          generatedMeetingSummaries: [combinedMeetingSummaries],
        },
      }));
    } catch (error) {
      console.error("Error fetching meeting summaries:", error);
    } finally {
      setSectionLoading(null);
    }
  };

  const fetchMeetingOverview = async (additionalNote?: string) => {
    try {
      setSectionLoading("generatedMeetingOverviews");
      const {
        file,
        type,
        objectives,
        structureType,
        meetingProjects,
        generatedMeetingNotes,
        meetingOverview,
      } = meetingNotesValues;

      const generateContentForProject = async (project: ProjectsFormValues) => {
        const prompt = generateMeetingOverviewPrompt({
          values: {
            file,
            type,
            structureType,
            objectives,
            additionalNotes: additionalNote,
            meetingProjects: {
              ...meetingProjects,
              sections: [project],
            },
            meetingOverview: {
              ...meetingOverview,
            },
            generatedMeetingNotes,
          },
        });

        console.log("Meeting Overview Prompt:", prompt);
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

      const projectResults = await Promise.all(
        meetingProjects.sections.map(generateContentForProject)
      );

      const combinedMeetingOverview = projectResults
        .map((result) => result.meetingOverview)
        .join("\n\n");

      setMeetingNotesValues((prevValues) => ({
        ...prevValues,
        generatedMeetingNotes: {
          ...prevValues.generatedMeetingNotes,
          generatedMeetingOverviews: [combinedMeetingOverview],
        },
      }));
    } catch (error) {
      console.error("Error fetching meeting overview:", error);
    } finally {
      setSectionLoading(null);
    }
  };

  const fetchActionItemsNextStep = async (additionalNote?: string) => {
    try {
      setSectionLoading("generatedActionsItemsNextStep");
      const {
        file,
        type,
        objectives,
        structureType,
        meetingProjects,
        generatedMeetingNotes,
        actionItemsNextStep,
      } = meetingNotesValues;

      const generateContentForProject = async (project: ProjectsFormValues) => {
        const prompt = generateActionItemsNextStepPrompt({
          values: {
            file,
            type,
            structureType,
            objectives,
            additionalNotes: additionalNote,
            selectedHighlightedOutput:
              actionItemsNextStep.selectedHighlightedOutput,
            meetingProjects: {
              ...meetingProjects,
              sections: [project],
            },
            actionItemsNextStep: {
              ...actionItemsNextStep,
            },
            generatedMeetingNotes,
          },
        });

        console.log("Action Items Next Step Prompt:", prompt);

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

      const projectResults = await Promise.all(
        meetingProjects.sections.map(generateContentForProject)
      );

      const combinedActionItemsNextStep = projectResults
        .map((result) => result.actionItemsNextStep)
        .join("\n\n");

      setMeetingNotesValues((prevValues) => ({
        ...prevValues,
        generatedMeetingNotes: {
          ...prevValues.generatedMeetingNotes,
          generatedActionsItemsNextStep: [combinedActionItemsNextStep],
        },
      }));
    } catch (error) {
      console.error("Error fetching action items:", error);
    } finally {
      setSectionLoading(null);
    }
  };

  const fetchActionItemsNextStepByIndividual = async (
    additionalNote?: string
  ) => {
    try {
      setSectionLoading("generatedActionsItemsNextStep");
      const {
        file,
        type,
        objectives,
        structureType,
        meetingIndividuals,
        generatedMeetingNotes,
        actionItemsNextStep,
      } = meetingNotesValues;

      const generateContentForProject = async (project: ProjectsFormValues) => {
        const prompt = generateActionItemsNextStepByIndividualPrompt({
          values: {
            file,
            type,
            structureType,
            objectives,
            additionalNotes: additionalNote,
            selectedHighlightedOutput:
              actionItemsNextStep.selectedHighlightedOutput,
            meetingIndividuals: {
              ...meetingIndividuals,
              sections: [project],
            },
            actionItemsNextStep: {
              ...actionItemsNextStep,
            },
            generatedMeetingNotes,
          },
        });

        console.log("Action Items Next Step Prompt:", prompt);

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

      const projectResults = await Promise.all(
        meetingIndividuals.sections.map(generateContentForProject)
      );

      const combinedActionItemsNextStep = projectResults
        .map((result) => result.actionItemsNextStep)
        .join("\n\n");

      setMeetingNotesValues((prevValues) => ({
        ...prevValues,
        generatedMeetingNotes: {
          ...prevValues.generatedMeetingNotes,
          generatedActionsItemsNextStep: [combinedActionItemsNextStep],
        },
      }));
    } catch (error) {
      console.error("Error fetching action items:", error);
    } finally {
      setSectionLoading(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (meetingNotesValues.structureType === "Group by project") {
          await Promise.all([
            fetchMeetingSummaries(),
            fetchMeetingOverview(),
            fetchActionItemsNextStep(),
          ]);
        } else if (
          meetingNotesValues.structureType === "Group by individuals"
        ) {
          await Promise.all([
            fetchMeetingSummariesByIndividual(),
            fetchMeetingOverview(),
            fetchActionItemsNextStepByIndividual(),
          ]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [meetingNotesValues.type]);

  const Editor = useCallback(
    (label: string, itemTitle: string) => {
      const valueKey = {
        "Meeting Overview": "generatedMeetingOverviews",
        "Meeting Summaries": "generatedMeetingSummaries",
        "Action Items/Next Steps": "generatedActionsItemsNextStep",
      }[itemTitle] as keyof GeneratedMeetingNotes;

      const value =
        meetingNotesValues.generatedMeetingNotes?.[valueKey]?.join("\n") || "";
      const isLoadingSection = sectionLoading === valueKey;

      // Highlight only for "Action Items/Next Steps"
      const highlightedValue =
        itemTitle === "Action Items/Next Steps" && value
          ? highlightSelectedItems(value, selectedHighlightedOutput)
          : value;

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
              value={highlightedValue}
              modules={toolbarConfig()}
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
      meetingNotesValues.generatedMeetingNotes,
      sectionLoading,
      selectedHighlightedOutput,
      handleOpenModal,
      setMeetingNotesValues,
    ]
  );

  const handleRegenerate = async (note: string) => {
    if (currentSection === "generatedMeetingSummaries") {
      await fetchMeetingSummaries(note);
    } else if (currentSection === "generatedMeetingOverviews") {
      await fetchMeetingOverview(note);
    } else if (currentSection === "generatedActionsItemsNextStep") {
      await fetchActionItemsNextStep(note);
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
          {droppedItems.map((item) => (
            <Box sx={{ padding: "20px 20px 0 20px" }} key={item.id}>
              {Editor(item.title, item.title)}
            </Box>
          ))}
        </>
      )}
      <RegenerateMeetingNotesModal
        open={modalOpen}
        anchorEl={anchorEl}
        sectionKey={currentSection}
        onClose={handleCloseModal}
        onRegenerate={handleRegenerate}
      />
    </Box>
  );
};

export default ReviewMeetingNotes;
