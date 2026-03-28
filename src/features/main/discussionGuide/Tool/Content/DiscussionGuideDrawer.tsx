import { useCallback, useEffect, useRef } from "react";
import { Box, Drawer, IconButton, Typography } from "@mui/material";
import { IconXboxXFilled } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { discussionGuideFlowAtom } from "../../../../../atoms/discussionGuideAtom";
import {
  DiscussionFlowFormValues,
  DiscussionTopicsFormValues,
  IntroductionFormValues,
  MarketResearchFormValues,
} from "../../../../../types/discussionGuidesTypes";
import DiscussionFlowForm from "../Forms/ComponentForms/Forms/DiscussionFlowForm";
import IntroductionForm from "../Forms/ComponentForms/Forms/IntroductionForm";
import MarketResearchForm from "../Forms/ComponentForms/Forms/MarketResearchForm";
import useOpenAI from "../../../../../hooks/useOpenAI";
import DiscussionTopicsForm from "../Forms/ComponentForms/Forms/DiscussionTopicsForm";
import { ChatCompletionMessageParam } from "openai/resources";
import {
  createTopicOrganizationPrompt,
  discussionCombinedPrompt,
  marketResearchDisclosurePrompt,
} from "../../../../../config/prompts";

export type DiscussionGuideDrawerProps = {
  open: boolean;
  onClose: () => void;
  text: string;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const DiscussionGuideDrawer = ({
  open,
  onClose,
  text,
  isLoading,
  setIsLoading,
}: DiscussionGuideDrawerProps) => {
  const { chatCompletionOpenAi } = useOpenAI();
  const [discussionGuideFlowValues, setDiscussionGuideFlowValues] = useAtom(
    discussionGuideFlowAtom
  );
  const hasOrganizedTopics = useRef(false);

  const fetchMarketResearchDisclosure = useCallback(async () => {
    try {
      const marketResearchPrompt: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: "I am a bot generating content response",
          name: "system",
        },
        {
          role: "user",
          content: marketResearchDisclosurePrompt(
            discussionGuideFlowValues.discussionObjectives
          ),
          name: "user",
        },
      ];

      const marketResearchResponse = await chatCompletionOpenAi(
        marketResearchPrompt
      );

      setDiscussionGuideFlowValues((prevValues) => ({
        ...prevValues,
        marketResearchForm: {
          ...prevValues.marketResearchForm,
          marketResearchDisclousers: marketResearchResponse,
        },
      }));
    } catch (error) {
      console.log("Error fetching market research disclosure", error);
    }
  }, [
    chatCompletionOpenAi,
    discussionGuideFlowValues.discussionObjectives,
    setDiscussionGuideFlowValues,
  ]);

  const fetchCombined = useCallback(async () => {
    setIsLoading(true);
    try {
      const combinedPrompt: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: "I am a bot generating content response",
          name: "system",
        },
        {
          role: "user",
          content: discussionCombinedPrompt(
            discussionGuideFlowValues.discussionObjectives,
            discussionGuideFlowValues.communicationStyleDiscussionObjectives,
            discussionGuideFlowValues.audienceDiscussionObjectives,
            discussionGuideFlowValues.respondentTypeObjectives,
            discussionGuideFlowValues.caveatsDiscussionObjectives,
            discussionGuideFlowValues.lengthDiscussionObjectives,
            discussionGuideFlowValues.paceAndFlowDiscussionObjectives,
            discussionGuideFlowValues.phrasingDiscussionObjectives,
            discussionGuideFlowValues.toneDiscussionObjectives,
            discussionGuideFlowValues.type.name
          ),
          name: "user",
        },
      ];

      const combinedResponse = await chatCompletionOpenAi(combinedPrompt);

      console.log("response", combinedPrompt);
      console.log("type", discussionGuideFlowValues.type);

      const { introductionForm, discussionFlow, discussionTopics } =
        JSON.parse(combinedResponse);

      setDiscussionGuideFlowValues((prevValues) => ({
        ...prevValues,
        introductionForm: {
          ...prevValues.introductionForm,
          audience: introductionForm.audience || "",
          purpose: introductionForm.purpose || "",
        },
        discussionTopicsForm: {
          ...prevValues.discussionTopicsForm,
          sections: discussionTopics.sections.map(
            (item: DiscussionTopicsFormValues) => ({
              topics: item.topics,
              duration: item.duration,
              lead: item.lead,
              numberOfQuestionsPerTopic: item.numberOfQuestionsPerTopic,
            })
          ),
        },
        discussionFlowForm: {
          ...prevValues.discussionFlowForm,
          sections: discussionFlow.sections.map(
            (item: DiscussionFlowFormValues) => ({
              section: item.section,
              sectionTitle: item.sectionTitle || "",
              time: item.time || "",
            })
          ),
        },
      }));

      hasOrganizedTopics.current = false;
    } catch (error) {
      console.log("Error fetching AI content", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    chatCompletionOpenAi,
    discussionGuideFlowValues.discussionObjectives,
    setDiscussionGuideFlowValues,
  ]);

  const organizeSections = useCallback(async () => {
    if (
      !hasOrganizedTopics.current &&
      discussionGuideFlowValues.discussionTopicsForm?.sections?.length > 0 &&
      discussionGuideFlowValues.discussionFlowForm?.sections?.length > 0
    ) {
      try {
        setIsLoading(true);

        const topics =
          discussionGuideFlowValues.discussionTopicsForm.sections.map(
            (section) => section.topics
          );
        const sectionTitles =
          discussionGuideFlowValues.discussionFlowForm.sections
            .map((section) => section.sectionTitle)
            .filter(Boolean) as string[];

        const prompt = createTopicOrganizationPrompt(topics, sectionTitles);
        const response = await chatCompletionOpenAi(prompt);
        const organizedContent = JSON.parse(response) as {
          organizedSections: Array<{
            sectionTitle: string;
            childrenTopics: string[];
          }>;
          unassignedTopics: string[];
        };

        setDiscussionGuideFlowValues((prevValues) => ({
          ...prevValues,
          discussionFlowForm: {
            ...prevValues.discussionFlowForm,
            sections: prevValues.discussionFlowForm.sections.map((section) => ({
              ...section,
              childrenTopics:
                organizedContent.organizedSections.find(
                  (os) => os.sectionTitle === section.sectionTitle
                )?.childrenTopics || [],
            })),
          },
        }));

        // Mark as organized
        hasOrganizedTopics.current = true;
      } catch (error) {
        console.error("Error organizing topics:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [
    chatCompletionOpenAi,
    discussionGuideFlowValues,
    setDiscussionGuideFlowValues,
    setIsLoading,
  ]);

  useEffect(() => {
    if (
      discussionGuideFlowValues.discussionTopicsForm?.sections?.length > 0 &&
      discussionGuideFlowValues.discussionFlowForm?.sections?.length > 0 &&
      !hasOrganizedTopics.current
    ) {
      organizeSections();
    }
  }, [
    organizeSections,
    discussionGuideFlowValues.discussionTopicsForm?.sections?.length,
    discussionGuideFlowValues.discussionFlowForm?.sections?.length,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchCombined(), fetchMarketResearchDisclosure()]);
      } catch (error) {
        console.log("Error fetching data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchCombined, fetchMarketResearchDisclosure]);

  const handleSubmitIntroductionForm = (formValues: IntroductionFormValues) => {
    setDiscussionGuideFlowValues((prevValues) => ({
      ...prevValues,
      introductionForm: formValues,
    }));
    onClose();
  };

  const handleSubmitMarketResearchForm = (
    formValues: MarketResearchFormValues
  ) => {
    setDiscussionGuideFlowValues((prevValues) => ({
      ...prevValues,
      marketResearchForm: formValues,
    }));
    onClose();
  };

  const handleSubmitDiscussionFlowForm = () => {
    onClose();
  };

  const handleSubmitDiscussionTopicsForm = () => {
    onClose();
  };

  const renderForm = () => {
    switch (text) {
      case "Background & Introduction":
        return <IntroductionForm handleSubmit={handleSubmitIntroductionForm} />;
      case "Discussion Flow":
        return (
          <DiscussionFlowForm
            handleSubmit={handleSubmitDiscussionFlowForm}
            isLoading={isLoading}
          />
        );
      case "Market Research Disclosures":
        return (
          <MarketResearchForm handleSubmit={handleSubmitMarketResearchForm} />
        );
      case "Discussion Topics":
        return (
          <DiscussionTopicsForm
            isLoading={isLoading}
            handleSubmit={handleSubmitDiscussionTopicsForm}
          />
        );
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

export default DiscussionGuideDrawer;
