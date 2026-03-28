import { Box, Dialog, Typography } from "@mui/material";
import { useState } from "react";
import { useAtom } from "jotai";
import {
  assistantIdMeetingSummaryAtom,
  interviewSummariesFormAtom,
} from "../../../../../atoms/interviewDiscusstionGuideAtom";
import { IconCaretRightFilled, IconXboxXFilled } from "@tabler/icons-react";
import TextArea from "../../../../../components/layouts/TextArea";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import {
  useAskQuestionBasedOnFileMutation,
  useChatCompletionOpenAiMutation,
  useCreateThreadMutation,
} from "../../../../../api/slices/openAiSlice";
import { getAiContent } from "../../../../../utils/textFormatter";
import { aiToolModelsAtom } from "../../../../../atoms/toolsAtom";

type TGenerateBulletModal = {
  highlightedText: string;
  isOpen: boolean;
  onClose: () => void;
  onBulletSelect: (bullet: string) => void;
};

function GenerateBulletModal({
  highlightedText,
  isOpen,
  onClose,
  onBulletSelect,
}: TGenerateBulletModal) {
  const [chatCompletionOpenAi] = useChatCompletionOpenAiMutation();
  const [models] = useAtom(aiToolModelsAtom);
  const selectedModel = models["Meeting Summaries"] || "gpt-3.5-turbo";
  const [askQuestionBasedOnFile] = useAskQuestionBasedOnFileMutation();
  const [createThread] = useCreateThreadMutation();
  const [interviewSummariesFormValues] = useAtom(interviewSummariesFormAtom);
  const [assistantId] = useAtom(assistantIdMeetingSummaryAtom);
  const [generatedBullets, setGeneratedBullets] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [directions, setDirections] = useState<string>("");

  const getPrompt = () => {
    const content = interviewSummariesFormValues.objectives
      ? interviewSummariesFormValues.objectives
      : `from the file: ${interviewSummariesFormValues.file.fileName} with (FILE ID: ${interviewSummariesFormValues.file.fileId})`;

    return `Regenerate the following text: "${highlightedText}" based on the directions provided: ${directions}. Ensure the regenerated text follows the given guidelines while retaining the original meaning and intent. DO NOT INCLUDE ANY SOURCE REFERENCES: Do not include any source indicators, footnotes, or references like "[4: 17+source]" or any similar format. Present all information as if it's coming directly from the summarized content without citing specific sources or page numbers. Pay special attention to aligning the text with the objectives: ${content}.`;
  };

  const handleRegenerate = async () => {
    if (!highlightedText || !directions) {
      return;
    }

    setLoading(true);
    try {
      let response: string;

      if (interviewSummariesFormValues.objectives) {
        const openAiResult = await chatCompletionOpenAi({
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            { role: "user", content: getPrompt() },
          ],
          model: selectedModel,
        }).unwrap();

        response = getAiContent(openAiResult);
      } else {
        const thread = await createThread().unwrap();
        const openAiResult = await askQuestionBasedOnFile({
          threadId: thread.id,
          assistantId,
          message: getPrompt(),
          assistantPrompt: "",
        }).unwrap();

        response = getAiContent(openAiResult);
      }

      if (
        response.includes("I'm sorry") ||
        response.includes("I can't generate a bullet")
      ) {
        setGeneratedBullets(["No bullet can be generated."]);
      } else {
        const bulletArray = response
          .split("\n\n")
          .filter((bullet) => bullet.trim() !== "");
        setGeneratedBullets(bulletArray);
      }
    } catch (error) {
      console.error("Error generating bullets:", error);
      setGeneratedBullets(["No bullet can be generated due to an error."]);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDirections(e.target.value);
  };

  const handleBulletSelect = (bullet: string) => {
    onBulletSelect(bullet);
    setDirections("");
    setGeneratedBullets([]);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="reset-content-title"
      PaperProps={{
        sx: {
          borderRadius: "16px",
        },
      }}
    >
      <Box
        sx={{
          marginTop: 1,
          pb: 2,
          pr: "20px",
          pl: "20px",
          pt: 2,
          backgroundColor: "white",
          width: 550,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            marginBottom: 1,
          }}
        >
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: "16px",
            }}
          >
            Re-Generate Bullet
          </Typography>
          <IconXboxXFilled
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 8,
              width: 40,
              height: 20,
              borderRadius: "50%",
              cursor: "pointer",
            }}
            size={20}
          />
        </Box>

        <TextArea
          name="directions"
          topText="Provide additional notes and direction:"
          styles={{ width: "95%" }}
          value={directions}
          onChange={handleNoteChange}
          placeholder="Enter additional note here..."
        />

        <Box mt={1} display="flex" justifyContent="flex-start">
          <DefaultButton
            style={{
              borderRadius: "15px",
              height: 40,
              marginBottom: 4,
            }}
            textStyle={{ fontSize: "12px" }}
            title={loading ? "Regenerating..." : "Regenerate"}
            type="primary"
            onClick={handleRegenerate}
            disabled={loading}
          />
        </Box>

        {loading ? null : generatedBullets.length > 0 ? (
          <Box>
            <Box mt={1} display="flex" justifyContent="flex-start">
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "#1C1917",
                  marginBottom: 2,
                  whiteSpace: "pre-line",
                }}
              >
                Generated bullets:
              </Typography>
            </Box>
            {generatedBullets.map((bullet, index) => (
              <Box
                key={index}
                onClick={() => handleBulletSelect(bullet)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: "1px solid #C8C8C8",
                  borderRadius: "8px",
                  marginBottom: 2,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#F5F5F4",
                    "& .caret-icon": {
                      color: "red",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    backgroundColor: "#FAFAF9",
                    borderTopRightRadius: "8px",
                    borderTopLeftRadius: "8px",
                    padding: "5px",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    key={index}
                    sx={{
                      fontSize: "14px",
                      color: "#1C1917",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {`Option ${index + 1}`}
                  </Typography>
                  <IconCaretRightFilled className="caret-icon" size={16} />
                </Box>
                <Box sx={{ padding: 2 }}>
                  <Typography
                    key={index}
                    sx={{
                      fontSize: "14px",
                      color: "#1C1917",
                      marginBottom: 2,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {bullet}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : null}
      </Box>
    </Dialog>
  );
}

export default GenerateBulletModal;
