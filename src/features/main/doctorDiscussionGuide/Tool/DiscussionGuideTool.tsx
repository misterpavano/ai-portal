import { Box } from "@mui/material";
import dayjs from "dayjs";
import Docxtemplater from "docxtemplater";
import FileSaver from "file-saver";
import PizZip from "pizzip";
import { useState } from "react";
import Toast from "../../../../components/layouts/Toast";
import useGemini from "../../../../hooks/useGeminiAI";
import useOpenAI from "../../../../hooks/useOpenAI";
import { DiscussionGuidesTypeForm } from "../../../../types/discussionGuidesTypes";
import { loadFile } from "../../../../utils/pzip";
import { formatJsonOpenAiResponse } from "../../../../utils/textFormatter";
import DiscussionGuideForm from "./DiscussionGuideForm";
import QuestionsView from "./QuestionsView";
import Spinner from "../../../../components/layouts/Spinner";
import useClaude from "../../../../hooks/useClaudeAi";

const initialValues: DiscussionGuidesTypeForm = {
  drugName: "",
  numberOfQuestions: "10",
  patientFamiliarity: "5",
  focusAreas: ["General Questions"],
  tone: "Curious",
  indicators: [],
  exercise: "5",
  allergies: [""],
  aiType: "openai",
};

const DiscussionGuideTool = () => {
  const { chatCompletionOpenAi } = useOpenAI();
  const { chatCompletionGemini } = useGemini();
  const { chatCompletionClaude } = useClaude();
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [formValues, setFormValues] = useState<DiscussionGuidesTypeForm>();
  const [indicators, setIndicators] = useState<string[]>([]);
  const [addedIndicator, setAddedIndicator] = useState<string>("");
  const [aiType, setAiType] = useState<string>("openai");
  const questions = formValues?.questions;

  const chatCompletionAI = async (values: DiscussionGuidesTypeForm) => {
    const {
      drugName,
      numberOfQuestions,
      patientFamiliarity,
      focusAreas,
      tone,
      indicators,
      exercise,
      allergies,
    } = values;

    const selectedIndicators = indicators?.join(", ");

    const content = `Could you please provide exactly ${numberOfQuestions} questions that patients should ask their doctors about ${drugName}, a medication recently prescribed to them?
    Create the questions as a patient who’s familiarity with the drug can be categorized as ${patientFamiliarity}.
    The focus area for these questions must be ${focusAreas}. 
    Prepare the questions so that they focus on the following indications: ${selectedIndicators}.
    The tone of the patient is ${tone}.
    On a scale of 1 to 10 where 1 represents no activity and 10 represents very active, the patient's exercise habits is a ${exercise}.
    Assume that the patient asking the questions has the following allergies: ${allergies}. 
    Format the output in json(Array with objects) => 
      [
        {"question": "...(without the question number)"},
        {"question": "...(without the question number)"},
        {"question": "...(without the question number)"},
        ...
      ]
    KEEP ALWAYS THIS TYPE OF RESPONSE FORMAT`;
    setIsLoading(true);

    let response;
    if (aiType === "openai") {
      response = await chatCompletionOpenAi([
        { role: "system", content: "I am a bot generating content response" },
        { role: "user", content },
      ]);
    } else if (aiType === "gemini") {
      response = await chatCompletionGemini(content);
    } else if (aiType === "claude") {
      response = await chatCompletionClaude(content);
    } else {
      throw new Error("Invalid AI type selected.");
    }

    setIsLoading(false);
    console.log(response, "response");
    return response;
  };

  const generateIndicators = async (drugName: string) => {
    try {
      setIsLoading(true);

      const prompt = `Provide a comprehensive list of all indications or uses for the drug ${drugName} (e.g., pain relief, fever reduction, inflammation). Do not exceed 10 indications. Limit each indication to a maximum of 4 words. Only respond with the list of indications and nothing else.`;

      const indicatorsResponse = await chatCompletionOpenAi([
        { role: "system", content: "You are a medical expert assistant." },
        { role: "user", content: prompt },
      ]);

      const generatedIndicators = indicatorsResponse
        .split("\n")
        .map((line) => line.trim().replace(/^(?:-|\d+\.)\s*/, ""))
        .filter((line) => line.trim() !== "");

      setIndicators(generatedIndicators);
    } catch (error) {
      console.error("Error generating indicators:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrugNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDrugName = e.target.value;
    setIndicators([]);
    if (newDrugName.trim() !== "") {
      setIsLoading(false);
    }
  };

  const addIndicator = () => {
    if (addedIndicator.trim() !== "") {
      setIndicators([...indicators, addedIndicator.trim()]);
      setAddedIndicator("");
    }
  };

  const generateWordContent = async () => {
    loadFile(
      "./discussion-guide-sample.docx",
      async function (error: any, content: any) {
        if (error) {
          throw error;
        }

        const zip = new PizZip(content);
        const doc = new Docxtemplater().loadZip(zip);

        const data: { [key: string]: any } = {
          drug: formValues?.drugName,
          numberOfQuestions: questions?.length,
          date: dayjs().format("DD MM YYYY"),
          time: dayjs().format("HH:mm"),
          questions: questions?.map(
            (item: { question: string }, index: number) => ({
              key: index + 1,
              question: item.question,
            })
          ),
        };

        doc.setData(data);
        doc.render();

        const updatedContent = doc
          .getZip()
          .generate({ type: "blob", linebreaks: true, paragraphLoop: true });
        FileSaver.saveAs(
          updatedContent,
          "discussion_guide_tool" + dayjs().format("DD MM YYYY") + ".docx"
        );
        setIsLoading(false);
        setFormValues(undefined);
      }
    );
  };

  const handleGenerateContent = async (values: DiscussionGuidesTypeForm) => {
    const response = await chatCompletionAI(values);

    const formattedAiResponse = formatJsonOpenAiResponse(response);
    if (formattedAiResponse === "error") {
      setShowErrorMessage(true);
      return;
    }
    setFormValues({ ...values, questions: formattedAiResponse });
  };

  return (
    <Box>
      {questions?.length! > 0 ? (
        <QuestionsView
          formValues={formValues!}
          setFormValues={setFormValues}
          setIsLoading={setIsLoading}
          generateWordContent={generateWordContent}
          handleGenerateContent={handleGenerateContent}
          setIndicators={setIndicators}
        />
      ) : (
        <DiscussionGuideForm
          onSelect={(e) => setAiType(e)}
          initialValues={initialValues}
          handleGenerateContent={handleGenerateContent}
          generateIndicators={generateIndicators}
          setIndicators={setIndicators}
          handleDrugNameChange={handleDrugNameChange}
          indicators={indicators}
          addIndicator={addIndicator}
          addedIndicator={addedIndicator}
          setAddedIndicator={setAddedIndicator}
        />
      )}

      {isLoading && <Spinner overlay />}
      {showErrorMessage && (
        <Toast
          open={showErrorMessage}
          onClose={() => setShowErrorMessage(false)}
          type="error"
          title="There was an error generating the content. Please try again."
        />
      )}
    </Box>
  );
};

export default DiscussionGuideTool;
