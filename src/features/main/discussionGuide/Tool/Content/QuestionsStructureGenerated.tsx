import { Box, FormHelperText, Skeleton, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { discussionGuideFlowAtom } from "../../../../../atoms/discussionGuideAtom";
import {
  disccusionGuideSectionsPrompt,
  discussionGuideQuestionsPrompt,
} from "../../../../../config/prompts";
import useOpenAI from "../../../../../hooks/useOpenAI";
import {
  cleanHTMLString,
  formatJsonOpenAiResponse,
} from "../../../../../utils/textFormatter";
import DiscussionObjectivesPrompts from "./DiscussionObjectivesPrompts";
import useAzureSharePoint from "../../../../../hooks/useAzureSharePoint";

interface Section {
  title: string;
  content: string;
}

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

const vectorStoreId = "vs_5uc8CLjqOrWnGgEoadrDoSkI";
const assistantId = "asst_u0R6sBPmAS6azRvOThzwgyVO";

const QuestionsStructureGenerated = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isParsed, setIsParsed] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [discussionFormValues, setDiscussionFormValues] = useAtom(
    discussionGuideFlowAtom
  );
  const { downloadFile } = useAzureSharePoint();
  const {
    addFileToVectorStore,
    deleteFileFromStorage,
    deleteFileFromVectorStore,
    askQuestionBasedOnFileWithoutPrompt,
    createThread,
    uploadFileByFormData,
  } = useOpenAI();

  const parseContentIntoSections = (htmlContent: string): Section[] => {
    console.log("Raw HTML content received:", htmlContent);
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const body = doc.body;
    const h2Elements = body.getElementsByTagName("h2");
    console.log("Number of h2 elements found:", h2Elements.length);

    const parsedSections: Section[] = [];

    for (let i = 0; i < h2Elements.length; i++) {
      const h2 = h2Elements[i];
      const title = h2.textContent?.trim() || "";
      let content = "";
      let currentNode = h2.nextElementSibling;

      console.log(`Processing section ${i + 1} with title:`, title);

      const fragment = document.createDocumentFragment();

      while (currentNode && currentNode.tagName !== "H2") {
        const clonedNode = currentNode.cloneNode(true);
        fragment.appendChild(clonedNode);
        currentNode = currentNode.nextElementSibling;
      }

      const tempContainer = document.createElement("div");
      tempContainer.appendChild(fragment);

      content = tempContainer.innerHTML;

      content = content.replace(
        /(<strong>[^<]+:<\/strong>)([^<]*)/g,
        (match, p1, p2) => {
          return `${p1} <p>${p2.trim()}</p>`;
        }
      );

      console.log(`Content for section ${i + 1}:`, content);

      parsedSections.push({ title, content });
    }

    console.log("Final parsed sections:", parsedSections);
    return parsedSections;
  };

  const handleSectionChange = (index: number, newContent: string): void => {
    const updatedSections = [...sections];
    updatedSections[index].content = newContent;
    setSections(updatedSections);

    const combinedContent = updatedSections
      .map((section) => `<h2>${section.title}</h2>${section.content}`)
      .join("");
    setGeneratedQuestions(combinedContent);
  };

  const handleGenerateContent = async (
    type: "questions" | "structure",
    id: string,
    prompt: string
  ) => {
    try {
      const fileBlob = await downloadFile(id);
      if (!(fileBlob instanceof Blob)) {
        throw new Error("Response is not a Blob");
      }

      const formData = new FormData();
      formData.append("file", fileBlob, "file.docx");
      formData.append("purpose", "assistants");

      try {
        const response = await uploadFileByFormData(formData);

        await addFileToVectorStore(vectorStoreId, response.id);

        const thread = await createThread();
        const res = await askQuestionBasedOnFileWithoutPrompt(
          thread.id,
          assistantId,
          prompt
        );
        if (type === "questions") {
          const result = cleanHTMLString(res);
          console.log("Clean HTML string result:", result);
          setGeneratedQuestions(result);
          setIsParsed(false);
        } else {
          const result = formatJsonOpenAiResponse(res);
          setDiscussionFormValues({
            ...discussionFormValues,
            toneDiscussionObjectives: result?.tone,
            paceAndFlowDiscussionObjectives: result?.["pace & flow"],
            lengthDiscussionObjectives: result?.["length"],
            phrasingDiscussionObjectives: result?.phrasing,
          });
        }

        await deleteFileFromVectorStore(vectorStoreId, response.id);
        await deleteFileFromStorage(response.id);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
      console.log("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  useEffect(() => {
    (async () => {
      await handleGenerateContent(
        "questions",
        discussionFormValues.questionsId,
        discussionGuideQuestionsPrompt(
          discussionFormValues.discussionObjectives
        )
      );
      await handleGenerateContent(
        "structure",
        discussionFormValues.structureId,
        disccusionGuideSectionsPrompt
      );
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (generatedQuestions && !isParsed) {
      console.log("Generated Questions updated:", generatedQuestions);
      const parsedSections = parseContentIntoSections(generatedQuestions);
      setSections(parsedSections);
      setIsParsed(true);
    }
  }, [generatedQuestions, isParsed]);

  return (
    <Box sx={{ padding: 2 }}>
      {loading ? (
        <Box>
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
          {sections.map((section, index) => (
            <Box sx={{ marginTop: "30px" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0.5,
                  pb: 1,
                }}
              >
                <FormHelperText sx={{ color: "#515151" }}>
                  {section.title}
                </FormHelperText>
                <Box sx={{ pb: 0.5 }}>
                  <Typography sx={{ fontSize: "11px", color: "#767373" }}>
                    This textarea contains attributes that you can modify. Feel
                    free to edit the content as needed.
                  </Typography>
                </Box>
              </Box>
              <ReactQuill
                value={section.content}
                onChange={(val) => handleSectionChange(index, val)}
                modules={toolbarConfig()}
                style={{
                  marginBottom: "60px",
                  borderRadius: "8px",
                  height: "240px",
                }}
              />
            </Box>
          ))}
          <DiscussionObjectivesPrompts
            initialValues={discussionFormValues}
            setDiscussionFormValues={setDiscussionFormValues}
          />
        </>
      )}
    </Box>
  );
};

export default QuestionsStructureGenerated;
