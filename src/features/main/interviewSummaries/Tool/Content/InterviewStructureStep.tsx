import { Box, Stack, Typography, Snackbar, Alert } from "@mui/material";
import { useAtom } from "jotai";
import DiscussionTopicsForm from "../Forms/DiscussionTopics";
import { interviewSelectedComponentsAtom } from "../../../../../atoms/dndAtom";
import { useCallback, useEffect, useMemo, useState } from "react";
import InterviewStructureCheckIcon from "../../../../../assets/svg/InterviewStructureCheckIcon";
import { IconArrowRight } from "@tabler/icons-react";
import { interviewDiscussionPrompt } from "../../../../../config/prompts";
import {
  assistantIdMeetingSummaryAtom,
  interviewSummariesFormAtom,
} from "../../../../../atoms/interviewDiscusstionGuideAtom";
import { DiscussionTopicsFormValues } from "../../../../../types/interviewSummaries";
import InteviewSummariesDrawer from "./InterviewSummariesDrawer";
import {
  formatTopicsResponse,
  getAiContent,
} from "../../../../../utils/textFormatter";
import {
  useAskQuestionBasedOnFileMutation,
  useChatCompletionOpenAiMutation,
  useCreateThreadMutation,
} from "../../../../../api/slices/openAiSlice";
import { aiToolModelsAtom } from "../../../../../atoms/toolsAtom";
import { useGetToolsQuery } from "../../../../../api/slices/toolsSlice";

type InterviewStructureStepProps = {
  selectedType: string;
};

export type ComponentItem = {
  title: string;
  id: number;
  checked?: boolean;
};

const typeItemsMap: { [key: string]: ComponentItem[] } = {
  "Advisory Boards": [
    { title: "Discussion Topics", id: 1 },
    { title: "Key takeaways", id: 2 },
    { title: "Key Recommendations", id: 3 },
    { title: "Action Items", id: 4 },
    { title: "Detailed Insights", id: 5 },
  ],
  "1on1 Interview": [
    { title: "Discussion Topics", id: 1 },
    { title: "Key takeaways", id: 2 },
    { title: "Key Recommendations", id: 3 },
    { title: "Action Items", id: 4 },
    { title: "Detailed Insights", id: 5 },
  ],
  "Transcript Based Summary": [
    { title: "Discussion Topics", id: 1 },
    { title: "Key takeaways", id: 2 },
    { title: "Key Recommendations", id: 3 },
    { title: "Action Items", id: 4 },
    { title: "Detailed Insights", id: 5 },
  ],
  "1on1/TLE interviews": [
    { title: "Discussion Topics", id: 1 },
    { title: "Key takeaways", id: 2 },
    { title: "Key Recommendations", id: 3 },
    { title: "Action Items", id: 4 },
    { title: "Detailed Insights", id: 5 },
  ],
};

const InterviewStructureStep = ({
  selectedType,
}: InterviewStructureStepProps) => {
  const [assistantId] = useAtom(assistantIdMeetingSummaryAtom);
  const [selectedItems, setSelectedItems] = useAtom(
    interviewSelectedComponentsAtom,
  );
  const items = useMemo(() => typeItemsMap[selectedType] || [], [selectedType]);
  const [isLoading, setIsLoading] = useState(false);
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
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    setSelectedItems(items.map((item) => ({ ...item, checked: true })));
  }, [items, setSelectedItems]);

  const renderItem = ({
    item,
    index,
    onClick,
    onRightArrowClick,
    isHovered,
    setHoveredIndex,
  }: {
    item: ComponentItem;
    index: number;
    onClick: () => void;
    onRightArrowClick: () => void;
    isHovered: boolean;
    setHoveredIndex: (index: number | null) => void;
  }) => {
    return (
      <Stack
        key={index}
        sx={{
          position: "relative",
          flexDirection: "row",
          width: "250px",
          padding: 2,
          cursor: "pointer",
          display: "inline-flex",
          gap: 0.5,
          alignItems: "center",
          borderRadius: 2,
          background: item.checked ? "#CFDFFF" : "white",
          border: "2px solid #D6D3D1",
        }}
      >
        <Stack onClick={onClick} sx={{ cursor: "pointer", width: 30 }}>
          {item.checked ? (
            <InterviewStructureCheckIcon />
          ) : (
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: 18,
                border: "1px solid black",
              }}
            ></Box>
          )}
        </Stack>
        <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
          {item.title}
        </Typography>
        {item.checked && (
          <Box
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
            onClick={onRightArrowClick}
          >
            <IconArrowRight color={isHovered ? "#0066ff" : "black"} />
          </Box>
        )}
      </Stack>
    );
  };

  const handleRightArrowClick = (text: string) => {
    setDrawerOpen(true);
    setText(text);
  };

  const handleOnClick = (id: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const fetchDiscussionTopics = useCallback(async () => {
    setIsLoading(true);
    try {
      const thread = await createThread().unwrap();

      let discussionResponse;
      if (interviewSummariesFormValues.objectives) {
        discussionResponse = await chatCompletionOpenAi({
          messages: [
            {
              role: "system",
              content: "I am a bot generating content response",
            },
            {
              role: "user",
              content: interviewDiscussionPrompt(interviewSummariesFormValues),
            },
          ],
          model: selectedModel,
        }).unwrap();
      } else {
        discussionResponse = await askQuestionBasedOnFile({
          threadId: thread.id,
          assistantId,
          message: interviewDiscussionPrompt(interviewSummariesFormValues),
          assistantPrompt: "",
        }).unwrap();
      }

      console.log("discussionResponse", discussionResponse);
      const discussionResponseText = getAiContent(discussionResponse);
      const { discussionTopics } = formatTopicsResponse(discussionResponseText);

      let formattedSections = discussionTopics?.sections?.length
        ? discussionTopics.sections
        : [];

      if (formattedSections.length === 0) {
        const retryResponse = await (interviewSummariesFormValues.objectives
          ? chatCompletionOpenAi({
              messages: [
                {
                  role: "system",
                  content: "I am a bot generating content response",
                },
                {
                  role: "user",
                  content: interviewDiscussionPrompt(
                    interviewSummariesFormValues,
                  ),
                },
              ],
              model: selectedModel,
            }).unwrap()
          : askQuestionBasedOnFile({
              threadId: thread.id,
              assistantId,
              message: interviewDiscussionPrompt(interviewSummariesFormValues),
              assistantPrompt: "",
            }).unwrap());

        const retryResponseText = getAiContent(retryResponse);
        const { discussionTopics: retryTopics } =
          formatTopicsResponse(retryResponseText);
        if (retryTopics?.sections) {
          formattedSections = retryTopics.sections;
        }
      }

      setInterviewSummariesFormValues((prevValues) => {
        const existingSections = prevValues.discussionTopics.sections ?? [];

        const newSections = formattedSections.map(
          (item: DiscussionTopicsFormValues) => ({
            topics: item.topics,
            maxWordCountPerTopic: item.maxWordCountPerTopic,
          }),
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
    } catch (error: any) {
      console.error("Error fetching AI content", error);

      // Extract error message with more details
      let errorMsg =
        error?.message ||
        error?.data?.message ||
        "An error occurred while generating discussion topics. Please try again.";

      // Check if it's a run failure error
      if (error?.data?.error || error?.data?.error_code) {
        const errorDetails = error.data.error;
        const errorCode = error.data.error_code;

        // Provide more helpful error messages based on error type
        if (errorCode === "rate_limit_exceeded") {
          errorMsg = "Rate limit exceeded. Please wait a moment and try again.";
        } else if (
          errorCode === "server_error" ||
          errorCode === "internal_error"
        ) {
          errorMsg = "Server error occurred. Please try again in a moment.";
        } else if (
          errorDetails?.message?.toLowerCase().includes("vector store") ||
          errorDetails?.message?.toLowerCase().includes("file")
        ) {
          errorMsg =
            "The assistant cannot access the uploaded file. Please ensure the file was successfully uploaded in the previous step and try again.";
        } else if (errorDetails?.message) {
          errorMsg = errorDetails.message;
        }
      }

      setErrorMessage(errorMsg);
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    askQuestionBasedOnFile,
    assistantId,
    chatCompletionOpenAi,
    createThread,
    interviewSummariesFormValues,
    selectedModel,
    setInterviewSummariesFormValues,
  ]);

  const handleGenerateTopics = () => {
    fetchDiscussionTopics();
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Error Generating Discussion Topics
          </Typography>
          <Typography sx={{ fontSize: "14px" }}>
            {errorMessage ||
              "An error occurred while generating discussion topics."}
          </Typography>
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", gap: "16px", padding: "20px 0 0 1px" }}>
        <Box
          sx={{
            flex: 1,
            padding: "16px",
            borderRadius: "26px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
            Discussion Topics
          </Typography>
          <Typography sx={{ mb: 1, fontSize: "12px" }}>
            *You have the option to use and/or modify the discussion topics
            generated below and/or add your own discussion topics
          </Typography>
          <DiscussionTopicsForm isLoading={isLoading} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <Box>
              <Typography
                onClick={handleGenerateTopics}
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  textDecoration: "underline",
                  cursor: "pointer",
                  color: "primary.600",
                  alignSelf: "flex-end",
                  textAlign: "right",
                }}
              >
                Generate Discussion Topics
              </Typography>
              <Typography
                sx={{
                  fontSize: "10px",
                  color: "gray",
                }}
              >
                Please select this option, If AI is needed to generate the
                discussion topics based on the meeting notes. This is optional.
              </Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
            Components
          </Typography>
          <Typography sx={{ fontSize: "12px" }}>
            *Check/Uncheck the components that you want to include in the
            summary
          </Typography>
          <Typography sx={{ fontSize: "12px" }}>
            *The colored indicator shows parameter status. A green box means all
            parameters are filled. A red box with a number indicates incomplete
            fields.
          </Typography>

          <Typography sx={{ mb: 1, fontSize: "12px" }}>
            *To adjust the direction or prompt for a given component, click the
            “
            <IconArrowRight size={10} />” icon
          </Typography>
          <Stack spacing={1}>
            {selectedItems.slice(1).map((item, index) =>
              renderItem({
                item,
                index,
                onClick: () => handleOnClick(item.id),
                onRightArrowClick: () => handleRightArrowClick(item.title),
                isHovered: hoveredIndex === index,
                setHoveredIndex,
              }),
            )}
          </Stack>
        </Box>
        <InteviewSummariesDrawer
          open={drawerOpen}
          onClose={handleCloseDrawer}
          text={text}
        />
      </Box>
    </>
  );
};

export default InterviewStructureStep;
