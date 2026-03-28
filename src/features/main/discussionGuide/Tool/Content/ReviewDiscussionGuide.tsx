/* eslint-disable react-hooks/exhaustive-deps */
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { discussionGuideFlowAtom } from "../../../../../atoms/discussionGuideAtom";
import { droppedItemsAtom } from "../../../../../atoms/dndAtom";
import Skeleton from "../../../../../components/layouts/Skeleton";
import { discussionTopicsTrainingData } from "../../../../../constants/training-data";
import useOpenAI from "../../../../../hooks/useOpenAI";
import { DiscussionFlowFormValues } from "../../../../../types/discussionGuidesTypes";
import RegenerateIntroductionModal from "../Modals/RegenerateIntroductionModal";
import ReviewDiscussionTable from "./ReviewDiscussionTable";
import ReviewDiscussionTopicsTable from "./ReviewDiscussionTopicsTable";

const ReviewDiscussionGuide = () => {
  const { chatCompletionOpenAi } = useOpenAI();
  const [isLoading, setIsLoading] = useState(false);
  const [isIntroductionLoading, setIntroductionLoading] = useState(false);
  const [sectionLoading, setSectionLoading] = useState<boolean[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [droppedItems] = useAtom(droppedItemsAtom);
  const [discussionGuideFlow, setDiscussionGuideFlowValues] = useAtom(
    discussionGuideFlowAtom
  );

  const handleRegenerateTopic = async (
    topics: string,
    index: number,
    note?: string
  ) => {
    setSectionLoading((prevLoading) => {
      const newLoading = [...prevLoading];
      newLoading[index] = true;
      return newLoading;
    });

    try {
      let prompt = `Create a minimum of 5 and a maximum of 10 questions based on this topic: ${topics}. Provide the output as a JSON object in the following format: { "questions": ["question1", "question2", "question3"] }. Each question should be influenced by the sample questions provided in the training data. Ensure that the maximum length of each question does not exceed 20 words.
  
                    Use the content from the provided [TRAINING DATA] here: ${discussionTopicsTrainingData} to help generate relevant questions. Replace any placeholder terms in brackets, such as [DISEASE], [SYMPTOM], [TESTING/USAGE], [GENDER], [OTHER GENDER], [PRODUCT/THERAPY], [EQUIPMENT], [MANUFACTURER], and [CONDITION], with actual names or terms relevant to the topic. Ensure that no bracketed placeholders appear in the final questions. Instead, use the specific disease names or other relevant terms directly in the questions where applicable.`;

      if (discussionGuideFlow.discussionObjectives) {
        prompt += `\n\nThe Discussion Objectives are: ${discussionGuideFlow.discussionObjectives}`;
      }

      if (discussionGuideFlow.audienceDiscussionObjectives) {
        prompt += `\n\nThe Audience Discussion Objectives are: ${discussionGuideFlow.audienceDiscussionObjectives}`;
      }

      if (discussionGuideFlow.respondentTypeObjectives) {
        prompt += `\n\nThe Respondent Type Objectives are: ${discussionGuideFlow.respondentTypeObjectives}`;
      }

      prompt += `\n\nPlease note: Do **not** include any bracketed placeholders like [DISEASE], [SYMPTOM], etc., in the output questions. The output should only include the actual terms that replace these placeholders.\n\nProvide the final output as a JSON object with the key 'questions'.`;

      const additionalNote = note ? ` Additional Note: ${note}` : "";

      const response = await chatCompletionOpenAi([
        { role: "system", content: "I am a bot generating content response" },
        { role: "user", content: prompt + additionalNote },
      ]);

      const { questions }: { questions: string[] } = JSON.parse(response);

      setDiscussionGuideFlowValues((prevValues) => ({
        ...prevValues,
        discussionTopicsForm: {
          ...prevValues.discussionTopicsForm,
          sections: prevValues.discussionTopicsForm.sections.map(
            (section, i) => {
              if (i === index) {
                return {
                  ...section,
                  generatedAiQuestions: questions
                    .slice(0, 10)
                    .map((question: string) => ({
                      question,
                      followUpQuestions: [],
                    })),
                };
              }
              return section;
            }
          ),
        },
      }));
    } catch (error) {
      console.error("Error fetching AI content:", error);
    } finally {
      setSectionLoading((prevLoading) => {
        const newLoading = [...prevLoading];
        newLoading[index] = false;
        return newLoading;
      });
    }
  };

  const updateSectionLoading = (index: number, isLoading: boolean) => {
    setSectionLoading((prevLoading) => {
      const newLoading = [...prevLoading];
      newLoading[index] = isLoading;
      return newLoading;
    });
  };

  const fetchBackgroundIntroductionFormCompletions = useCallback(async () => {
    try {
      const introductionResponse = await chatCompletionOpenAi([
        { role: "system", content: "I am a bot generating content response" },
        {
          role: "user",
          content: `The Background and Introduction section of the discussion guide will be a maximum of ${discussionGuideFlow.introductionForm.maxCharacterCount} words. The audience for this discussion is/are: ${discussionGuideFlow.introductionForm.audience}. Only address these individuals based on their audience value. The purpose of the conversation is: ${discussionGuideFlow.introductionForm.purpose}. Only prepare content for this purpose. Please follow the example below when generating this content: Hi, my name is [NAME] and I'll be conducting this focus group discussion. Thank you all for taking the time to speak with me today. The purpose of this focus group is to capture feedback from {audience identified above} like yourselves on {purpose identified above}. We are here to learn from your experiences and want to understand individual opinions as well have you collectively work together to identify any opportunities for refinement and identify potential objections to the messages.`,
        },
      ]);

      setDiscussionGuideFlowValues((prevValues) => ({
        ...prevValues,
        discussionGuideGeneratedAi: {
          ...prevValues.discussionGuideGeneratedAi,
          introductionGenerated: introductionResponse,
          introductionForm: {
            ...prevValues.introductionForm,
            audience: discussionGuideFlow.introductionForm.audience,
            purpose: discussionGuideFlow.introductionForm.purpose,
          },
        },
      }));
    } catch (error) {
      console.error("Error fetching AI content:", error);
    }
  }, [discussionGuideFlow.introductionForm, setDiscussionGuideFlowValues]);

  const fetchDisccusionTopicsQuestions = useCallback(async () => {
    try {
      const sections = discussionGuideFlow.discussionTopicsForm.sections;
      await Promise.all(
        sections.map((section, index) =>
          handleRegenerateTopic(section.topics, index)
        )
      );
    } catch (error) {
      console.error("Error fetching AI content:", error);
    }
  }, [
    discussionGuideFlow.discussionTopicsForm.sections,
    handleRegenerateTopic,
  ]);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchBackgroundIntroductionFormCompletions(),
        fetchDisccusionTopicsQuestions(),
      ]);
      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  const isBackgroundIntroductionDropped = droppedItems.some(
    (section) => section.title === "Background & Introduction"
  );

  const isMarketResearchDropped = droppedItems.some(
    (section) => section.title === "Market Research Disclosures"
  );

  const handleOpenModal = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setAnchorEl(null);
    setIsModalOpen(false);
  };

  const handleDeleteQuestion = (topics: string, questionIndex: number) => {
    setDiscussionGuideFlowValues((prev) => ({
      ...prev,
      discussionTopicsForm: {
        ...prev.discussionTopicsForm,
        sections: prev.discussionTopicsForm.sections.map((section) => {
          if (section.topics === topics) {
            return {
              ...section,
              generatedAiQuestions: section.generatedAiQuestions.filter(
                (_, i) => i !== questionIndex
              ),
            };
          }
          return section;
        }),
      },
    }));
  };

  const handleTopicChange = (index: number, newTopic: string) => {
    setDiscussionGuideFlowValues((prev) => ({
      ...prev,
      discussionTopicsForm: {
        ...prev.discussionTopicsForm,
        sections: prev.discussionTopicsForm.sections.map((section, i) =>
          i === index ? { ...section, topics: newTopic } : section
        ),
      },
    }));
  };

  const handleQuestionChange = (
    sectionIndex: number,
    questionIndex: number,
    newQuestion: string
  ) => {
    setDiscussionGuideFlowValues((prev) => ({
      ...prev,
      discussionTopicsForm: {
        ...prev.discussionTopicsForm,
        sections: prev.discussionTopicsForm.sections.map((section, i) => {
          if (i === sectionIndex) {
            return {
              ...section,
              generatedAiQuestions: section.generatedAiQuestions.map(
                (question, j) =>
                  j === questionIndex
                    ? { ...question, question: newQuestion }
                    : question
              ),
            };
          }
          return section;
        }),
      },
    }));
  };

  const handleDeleteTopic = (index: number) => {
    setDiscussionGuideFlowValues((prev) => ({
      ...prev,
      discussionTopicsForm: {
        ...prev.discussionTopicsForm,
        sections: prev.discussionTopicsForm.sections.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const handleAddQuestion = (topics: string, question: string) => {
    setDiscussionGuideFlowValues((prev) => ({
      ...prev,
      discussionTopicsForm: {
        ...prev.discussionTopicsForm,
        sections: prev.discussionTopicsForm.sections.map((section) => {
          if (section.topics === topics) {
            return {
              ...section,
              generatedAiQuestions: [
                ...section.generatedAiQuestions,
                { question, followUpQuestions: [] },
              ],
            };
          }
          return section;
        }),
      },
    }));
  };

  const handleSectionsChange = (
    updatedSections: DiscussionFlowFormValues[]
  ) => {
    setDiscussionGuideFlowValues((prevValues) => ({
      ...prevValues,
      discussionFlowForm: {
        ...prevValues.discussionFlowForm,
        sections: updatedSections,
      },
    }));
  };

  const handleDeleteFollowUpQuestion = (
    sectionIndex: number,
    questionIndex: number,
    followUpIndex: number
  ) => {
    const updatedSections = [
      ...discussionGuideFlow.discussionTopicsForm.sections,
    ];
    const updatedFollowUpQuestions = [
      ...updatedSections[sectionIndex].generatedAiQuestions[questionIndex]
        .followUpQuestions,
    ];
    updatedFollowUpQuestions.splice(followUpIndex, 1);
    updatedSections[sectionIndex].generatedAiQuestions[
      questionIndex
    ].followUpQuestions = updatedFollowUpQuestions;

    setDiscussionGuideFlowValues((prevValues) => ({
      ...prevValues,
      discussionTopicsForm: {
        ...prevValues.discussionTopicsForm,
        sections: updatedSections,
      },
    }));
  };

  const handleChangeFollowUpQuestion = (
    sectionIndex: number,
    questionIndex: number,
    followUpIndex: number,
    newQuestion: string
  ) => {
    const updatedSections = [
      ...discussionGuideFlow.discussionTopicsForm.sections,
    ];
    updatedSections[sectionIndex].generatedAiQuestions[
      questionIndex
    ].followUpQuestions[followUpIndex] = newQuestion;

    setDiscussionGuideFlowValues((prevValues) => ({
      ...prevValues,
      discussionTopicsForm: {
        ...prevValues.discussionTopicsForm,
        sections: updatedSections,
      },
    }));
  };

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

  return (
    <Box sx={{ width: "100%", marginTop: "40px" }}>
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
          {droppedItems.map((item) => {
            if (item.title === "Discussion Flow") {
              return (
                <Box sx={{ padding: "0 20px 0 20px" }} key={item.title}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, fontSize: "16px", paddingBottom: 1 }}
                  >
                    Discussion Flow
                  </Typography>
                  <ReviewDiscussionTable
                    sections={discussionGuideFlow.discussionFlowForm.sections}
                    onSectionsChange={handleSectionsChange}
                  />
                </Box>
              );
            }
            if (item.title === "Discussion Topics") {
              return (
                <Box sx={{ padding: "0 20px 0 20px" }} key={item.title}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, fontSize: "16px", paddingBottom: 1 }}
                  >
                    Discussion Topics
                  </Typography>

                  <ReviewDiscussionTopicsTable
                    sections={discussionGuideFlow.discussionTopicsForm.sections}
                    handleDeleteQuestion={handleDeleteQuestion}
                    handleDeleteTopic={handleDeleteTopic}
                    handleRegenerateTopic={handleRegenerateTopic}
                    handleAddQuestion={handleAddQuestion}
                    handleQuestionChange={handleQuestionChange}
                    handleTopicChange={handleTopicChange}
                    sectionLoading={sectionLoading}
                    setSectionLoading={updateSectionLoading}
                    handleDeleteFollowUpQuestion={handleDeleteFollowUpQuestion}
                    handleChangeFollowUpQuestion={handleChangeFollowUpQuestion}
                  />
                </Box>
              );
            }
            if (item.title === "Background & Introduction") {
              return (
                <Box sx={{ padding: "0 20px 0 20px" }} key={item.title}>
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        fontSize: "16px",
                        paddingBottom: 1,
                      }}
                    >
                      Introduction & Background
                    </Typography>
                    {isBackgroundIntroductionDropped && (
                      <>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            textDecoration: "underline",
                            cursor: "pointer",
                            color: "primary.600",
                          }}
                          onClick={handleOpenModal}
                        >
                          Regenerate
                        </Typography>
                        <RegenerateIntroductionModal
                          open={isModalOpen}
                          onClose={handleCloseModal}
                          anchorEl={anchorEl}
                          isIntroductionLoading={isIntroductionLoading}
                          setIntroductionLoading={setIntroductionLoading}
                        />
                      </>
                    )}
                  </Box>
                  {isBackgroundIntroductionDropped ? (
                    isIntroductionLoading ? (
                      <Box sx={{ marginBottom: 4 }}>
                        <Skeleton variant="text" width="100%" height={30} />
                        <Skeleton variant="text" width="100%" height={80} />
                        <Skeleton variant="text" width="100%" height={80} />
                        <Skeleton variant="text" width="100%" height={80} />
                      </Box>
                    ) : (
                      <ReactQuill
                        value={
                          discussionGuideFlow.discussionGuideGeneratedAi
                            .introductionGenerated!
                        }
                        onChange={(content) =>
                          setDiscussionGuideFlowValues((prev) => ({
                            ...prev,
                            discussionGuideGeneratedAi: {
                              ...prev.discussionGuideGeneratedAi,
                              introductionGenerated: content,
                            },
                          }))
                        }
                        modules={{
                          ...toolbarConfig(),
                        }}
                        style={{
                          width: "100%",
                          marginBottom: "50px",
                          borderRadius: "8px",
                          minHeight: "100px",
                        }}
                      />
                    )
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "text.secondary",
                        textAlign: "start",
                        marginBottom: "50px",
                      }}
                    >
                      Background & Introduction was not included
                    </Typography>
                  )}
                </Box>
              );
            }
            if (item.title === "Market Research Disclosures") {
              return (
                <Box sx={{ padding: "0 20px 0 20px" }} key={item.title}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, fontSize: "16px", paddingBottom: 1 }}
                  >
                    Market Research Disclosures
                  </Typography>
                  {isMarketResearchDropped ? (
                    <ReactQuill
                      value={
                        discussionGuideFlow.marketResearchForm
                          .marketResearchDisclousers!
                      }
                      onChange={(content) =>
                        setDiscussionGuideFlowValues((prev) => ({
                          ...prev,
                          marketResearchForm: {
                            ...prev.marketResearchForm,
                            marketResearchDisclousers: content,
                          },
                        }))
                      }
                      modules={{
                        ...toolbarConfig(),
                      }}
                      style={{
                        width: "100%",
                        marginBottom: "50px",
                        borderRadius: "8px",
                        minHeight: "100px",
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "text.secondary",
                        textAlign: "start",
                        marginBottom: "50px",
                      }}
                    >
                      Market Research Disclosures was not included
                    </Typography>
                  )}
                </Box>
              );
            }
          })}
        </>
      )}
    </Box>
  );
};

export default ReviewDiscussionGuide;
