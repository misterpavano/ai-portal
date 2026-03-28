import { Box, Drawer, IconButton, Typography } from "@mui/material";
import { IconXboxXFilled } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { meetingNotesFormAtom } from "../../../../../atoms/meetingNotesAtom";
import ActionItemsForm from "../Forms/ActionItemsForm";
import {
  ActionItemsNextStepFormValues,
  IndividualsFormValues,
  MeetingOverviewFormValues,
  MeetingSummariesFormValues,
  ProjectsFormValues,
} from "../../../../../types/meetingNotesTypes";
import MeetingOverviewForm from "../Forms/MeetingOverviewForm";
import MeetingSummariesForm from "../Forms/MeetingSummariesForm";
import useOpenAI from "../../../../../hooks/useOpenAI";
import { useCallback, useEffect } from "react";
import {
  meetingNotesIndividualPrompt,
  meetingNotesProjectPrompt,
} from "../../../../../config/meetingNotesPrompt";
import { formatTopicsResponse } from "../../../../../utils/textFormatter";

export type MeetingNotesDrawerProps = {
  open: boolean;
  onClose: () => void;
  text: string;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const meetingNotesAssistantId = "asst_44A627lDxXoKq91CQmmAw5qj";

const MeetingNotesDrawer = ({
  open,
  onClose,
  text,
  isLoading,
  setIsLoading,
}: MeetingNotesDrawerProps) => {
  const {
    chatCompletionOpenAi,
    askQuestionBasedOnFileWithoutPrompt,
    createThread,
  } = useOpenAI();
  const [meetingNotesFormValues, setMeetingNotesFormValues] =
    useAtom(meetingNotesFormAtom);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const thread = await createThread();

      let projectsResponse;
      if (meetingNotesFormValues.objectives) {
        projectsResponse = await chatCompletionOpenAi([
          {
            role: "system",
            content: "I am a bot generating content response",
            name: "system",
          },
          {
            role: "user",
            content: meetingNotesProjectPrompt(meetingNotesFormValues),
            name: "user",
          },
        ]);
      } else {
        projectsResponse = await askQuestionBasedOnFileWithoutPrompt(
          thread.id,
          meetingNotesAssistantId,
          meetingNotesProjectPrompt(meetingNotesFormValues)
        );
      }

      console.log("projectsResponse", projectsResponse);
      const { meetingProjects } = formatTopicsResponse(projectsResponse);

      let formattedSections = meetingProjects.sections?.length
        ? meetingProjects.sections
        : [];

      if (formattedSections.length === 0) {
        const retryResponse = await (meetingNotesFormValues.objectives
          ? chatCompletionOpenAi([
              {
                role: "system",
                content: "I am a bot generating content response",
                name: "system",
              },
              {
                role: "user",
                content: meetingNotesProjectPrompt(meetingNotesFormValues),
                name: "user",
              },
            ])
          : askQuestionBasedOnFileWithoutPrompt(
              thread.id,
              meetingNotesAssistantId,
              meetingNotesProjectPrompt(meetingNotesFormValues)
            ));
        const { meetingProjects: retryProjects } =
          formatTopicsResponse(retryResponse);
        if (retryProjects && retryProjects.sections) {
          formattedSections = retryProjects.sections;
        }
      }

      setMeetingNotesFormValues((prevValues) => {
        const existingSections = prevValues.meetingProjects.sections ?? [];

        const newSections = formattedSections.map(
          (item: ProjectsFormValues) => ({
            projects: item.projects,
          })
        );

        const mergedSections = [...existingSections, ...newSections];

        return {
          ...prevValues,
          meetingProjects: {
            ...prevValues.meetingProjects,
            sections: mergedSections,
          },
        };
      });
    } catch (error) {
      console.log("Error fetching AI content", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    askQuestionBasedOnFileWithoutPrompt,
    chatCompletionOpenAi,
    createThread,
    meetingNotesFormValues.objectives,
    setMeetingNotesFormValues,
  ]);

  const fetchIndividuals = useCallback(async () => {
    setIsLoading(true);
    try {
      const thread = await createThread();

      let individualsResponse;
      if (meetingNotesFormValues.objectives) {
        individualsResponse = await chatCompletionOpenAi([
          {
            role: "system",
            content: "I am a bot generating content response",
            name: "system",
          },
          {
            role: "user",
            content: meetingNotesIndividualPrompt(meetingNotesFormValues),
            name: "user",
          },
        ]);
      } else {
        individualsResponse = await askQuestionBasedOnFileWithoutPrompt(
          thread.id,
          meetingNotesAssistantId,
          meetingNotesIndividualPrompt(meetingNotesFormValues)
        );
      }

      console.log("individualsResponse", individualsResponse);
      const { meetingIndividuals } = formatTopicsResponse(individualsResponse);

      let formattedSections = meetingIndividuals.sections?.length
        ? meetingIndividuals.sections
        : [];

      if (formattedSections.length === 0) {
        const retryResponse = await (meetingNotesFormValues.objectives
          ? chatCompletionOpenAi([
              {
                role: "system",
                content: "I am a bot generating content response",
                name: "system",
              },
              {
                role: "user",
                content: meetingNotesIndividualPrompt(meetingNotesFormValues),
                name: "user",
              },
            ])
          : askQuestionBasedOnFileWithoutPrompt(
              thread.id,
              meetingNotesAssistantId,
              meetingNotesIndividualPrompt(meetingNotesFormValues)
            ));
        const { meetingIndividuals: retryIndividuals } =
          formatTopicsResponse(retryResponse);
        if (retryIndividuals && retryIndividuals.sections) {
          formattedSections = retryIndividuals.sections;
        }
      }

      setMeetingNotesFormValues((prevValues) => {
        const existingSections = prevValues.meetingIndividuals.sections ?? [];

        const newSections = formattedSections.map(
          (item: IndividualsFormValues) => ({
            projects: item.projects,
            assignedIndividuals: item.assignedIndividuals,
          })
        );

        const mergedSections = [...existingSections, ...newSections];

        return {
          ...prevValues,
          meetingIndividuals: {
            ...prevValues.meetingIndividuals,
            sections: mergedSections,
          },
        };
      });
    } catch (error) {
      console.log("Error fetching AI content", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    askQuestionBasedOnFileWithoutPrompt,
    chatCompletionOpenAi,
    createThread,
    meetingNotesFormValues.objectives,
    setMeetingNotesFormValues,
  ]);

  const fetchCombined = useCallback(async () => {
    setIsLoading(true);
    try {
      const thread = await createThread();
      const objectives = meetingNotesFormValues.objectives;

      const promptContent = `Parse the following meeting notes and return a JSON array of names and teams, following these exact rules: Include all real people's names (ESPECIALLY any names that appear with initials in parentheses like "Tamela (TC)" or "Caroline (CW)" - scan thoroughly for this pattern) and ALL organization/company/team names (including abbreviated organizations like PMRC, MEI, etc. and any mentioned companies like Jazz, Healix, etc.). If these names mentioned dont appear in the file with ${
        meetingNotesFormValues.file.fileName
      }(FILE ID: ${
        meetingNotesFormValues.file.fileId
      }) then don't generate them. Format individual names as "FirstName (INITIALS)" if initials are provided - search specifically for Name followed by parentheses containing capital letters. Keep organization/company names as-is without parentheses. Exclude any items containing domain extensions (.com, .net, etc.), project names, product names, or activity descriptions. For names that appear with different variations (e.g., Tamela (TC)), always use the full name with initials format. Convert all valid entries to sentence case. Alphabetize the final list. Format output as a single-line JSON array like ["Name One", "Name Two"]. Important: Any entity that is performing actions (reviewing, developing, submitting, etc.) should be included as either a person or organization. The response must contain only the JSON array with no additional text. CONTENT: ${
        objectives
          ? objectives
          : `ALWAYS BE BASED ON THE UPLOADED FILE CONTENT WITH FILENAME: ${meetingNotesFormValues.file.fileName}(FILE ID: ${meetingNotesFormValues.file.fileId})`
      }`;

      let combinedResponse;

      if (objectives) {
        combinedResponse = await chatCompletionOpenAi(
          [
            {
              role: "user",
              content: promptContent,
              name: "user",
            },
          ],
          0.1
        );
      } else {
        combinedResponse = await askQuestionBasedOnFileWithoutPrompt(
          thread.id,
          meetingNotesAssistantId,
          promptContent
        );
      }

      console.log("Meeting notes:", combinedResponse);

      let extractedEntities: string[] = [];

      try {
        extractedEntities = formatTopicsResponse(combinedResponse);
      } catch (jsonError) {
        console.warn(
          "Response is not valid JSON, extracting entities manually"
        );
      }

      setMeetingNotesFormValues((prevValues) => ({
        ...prevValues,
        actionItemsNextStep: {
          ...prevValues.actionItemsNextStep,
          highlightedOutput: extractedEntities,
        },
      }));
    } catch (error) {
      console.error("Error fetching AI content:", error);
      setMeetingNotesFormValues((prevValues) => ({
        ...prevValues,
        actionItemsNextStep: {
          ...prevValues.actionItemsNextStep,
          highlightedOutput: [],
        },
      }));
    } finally {
      setIsLoading(false);
    }
  }, [
    chatCompletionOpenAi,
    askQuestionBasedOnFileWithoutPrompt,
    createThread,
    meetingNotesFormValues.objectives,
    meetingNotesFormValues.file.fileName,
    meetingNotesFormValues.file.fileId,
    setMeetingNotesFormValues,
  ]);

  useEffect(() => {
    fetchCombined();
    fetchProjects();
    fetchIndividuals();
  }, [fetchCombined, fetchProjects]);

  const handleMeetingOverviewForm = (formValues: MeetingOverviewFormValues) => {
    setMeetingNotesFormValues((prevValues) => ({
      ...prevValues,
      meetingOverview: formValues,
    }));
    onClose();
  };

  const handleMeetingSummariesForm = (
    formValues: MeetingSummariesFormValues
  ) => {
    setMeetingNotesFormValues((prevValues) => ({
      ...prevValues,
      meetingSummaries: formValues,
    }));
    onClose();
  };

  const handleActionItemsNextStepForm = (
    formValues: ActionItemsNextStepFormValues
  ) => {
    setMeetingNotesFormValues((prevValues) => ({
      ...prevValues,
      actionItemsNextStep: formValues,
    }));
    onClose();
  };

  const renderForm = () => {
    switch (text) {
      case "Meeting Overview":
        return <MeetingOverviewForm handleSubmit={handleMeetingOverviewForm} />;
      case "Meeting Summaries":
        return (
          <MeetingSummariesForm handleSubmit={handleMeetingSummariesForm} />
        );
      case "Action Items/Next Steps":
        return <ActionItemsForm handleSubmit={handleActionItemsNextStepForm} />;
      default:
        return <Typography variant="body1">No data for this item</Typography>;
    }
  };
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 550, padding: 4 }} role="presentation">
        <IconButton onClick={onClose} sx={{ float: "right", color: "black" }}>
          <IconXboxXFilled />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ marginTop: "16px", fontSize: "16px", fontWeight: "bold" }}
        >
          {text}
        </Typography>
        <Box sx={{ marginTop: "40px" }}>{renderForm()}</Box>
      </Box>
    </Drawer>
  );
};

export default MeetingNotesDrawer;
