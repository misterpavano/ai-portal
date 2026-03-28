import { Box, Dialog, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  assistantIdMeetingSummaryAtom,
  interviewSummariesFormAtom,
} from "../../../../../atoms/interviewDiscusstionGuideAtom";
import { IconCaretRightFilled, IconXboxXFilled } from "@tabler/icons-react";
import {
  useAskQuestionBasedOnFileMutation,
  useChatCompletionOpenAiMutation,
  useCreateThreadMutation,
} from "../../../../../api/slices/openAiSlice";
import { getAiContent } from "../../../../../utils/textFormatter";
import { aiToolModelsAtom } from "../../../../../atoms/toolsAtom";

type TGenerateQuotesModal = {
  highlightedText: string;
  isOpen: boolean;
  onClose: () => void;
  onQuoteSelect: (quote: string) => void;
};

function GenerateQuotesModal({
  highlightedText,
  isOpen,
  onClose,
  onQuoteSelect,
}: TGenerateQuotesModal) {
  const [chatCompletionOpenAi] = useChatCompletionOpenAiMutation();
  const [models] = useAtom(aiToolModelsAtom);
  const selectedModel = models["Meeting Summaries"] || "gpt-3.5-turbo";
  const [askQuestionBasedOnFile] = useAskQuestionBasedOnFileMutation();
  const [createThread] = useCreateThreadMutation();
  const [interviewSummariesFormValues] = useAtom(interviewSummariesFormAtom);
  const [assistantId] = useAtom(assistantIdMeetingSummaryAtom);
  const [generatedQuotes, setGeneratedQuotes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const getPrompt = () => {
    const content = interviewSummariesFormValues.objectives
      ? interviewSummariesFormValues.objectives
      : `from the file: ${interviewSummariesFormValues.file.fileName} with (FILE ID: ${interviewSummariesFormValues.file.fileId})`;

    return `Transform the third-person summarized note ${highlightedText} into a concise first-person quote directly extracted from the transcript ${content}. 

    Strict Requirements:
    1. ONLY use VERBATIM text from the transcript that exactly matches the summarized note.
    3. Ensure the quote is an extraction from the file.
    4. Identify the SPECIFIC named advisor speaking the quote, using their full name or professional title.
    5. If the speaker cannot be definitively identified, do NOT make up a quotes, rather generate "Cannot generate a quote for this highligted text".
    6. DO NOT INCLUDE ANY SOURCE REFERENCES: Do not include any source indicators, footnotes, or references like "[4: 17+source]" or any similar format. Present all information as if it's coming directly from the summarized content without citing specific sources or page numbers.
    
    Quote Format:
    - Wrap the verbatim quote in quotation marks ("")
    - Immediately follow with "- [Full Name/Title of Advisor]"
    
    Error Handling:
    - Do NOT generate or fabricate quotes
    - Do NOT paraphrase or modify the original transcript text
    - Do NOT use generic attributions like "Advisor"
    
    Example:
    Input Summarized Note: "The importance of strategic planning"
    Transcript Quote: "Strategic planning is critical for long-term success."
    Output: "Strategic planning is critical for long-term success." - Dr. Jane Smith`;
  };

  const generateQuotes = async () => {
    if (!highlightedText) return;

    setLoading(true);
    try {
      let response: string;

      if (interviewSummariesFormValues.objectives) {
        const openAiResult = await chatCompletionOpenAi({
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates quotes",
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
        response.includes("I can't generate a quote")
      ) {
        setGeneratedQuotes(["No quote can be generated."]);
      } else {
        const quotesArray = response
          .split("\n\n")
          .filter((quote) => quote.trim() !== "");
        setGeneratedQuotes(quotesArray);
      }
    } catch (error) {
      console.error("Error generating quotes:", error);
      setGeneratedQuotes(["No quote can be generated due to an error."]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && highlightedText) {
      generateQuotes();
    }
  }, [isOpen, highlightedText]);

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
            marginBottom: 4,
          }}
        >
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: "16px",
              marginBottom: 2,
            }}
          >
            Generated quotes for:
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
          <Typography sx={{ fontSize: "13px", color: "#7E7E7E" }}>
            {highlightedText}
          </Typography>
        </Box>

        {loading ? (
          <Typography sx={{ fontSize: "14px", color: "#7E7E7E" }}>
            Generating quotes...
          </Typography>
        ) : (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              mt={1}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "#1C1917",
                  marginBottom: 2,
                  whiteSpace: "pre-line",
                }}
              >
                Generated quotes:
              </Typography>
              <Typography
                onClick={generateQuotes}
                sx={{
                  fontSize: "14px",
                  color: "red",
                  marginBottom: 2,
                  whiteSpace: "pre-line",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Regenerate Quote
              </Typography>
            </Box>
            {generatedQuotes.length > 0 ? (
              generatedQuotes.map((quote, index) => (
                <Box
                  key={index}
                  onClick={() => {
                    onQuoteSelect(quote);
                    onClose();
                  }}
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
                      "& .insert-quote-text": {
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        className="insert-quote-text"
                        sx={{
                          fontSize: "12px",
                          color: "#57534E",
                          whiteSpace: "nowrap",
                          fontWeight: 500,
                        }}
                      >
                        Insert this quote into the summary
                      </Typography>
                      <IconCaretRightFilled className="caret-icon" size={16} />
                    </Box>
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
                      {quote}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography sx={{ fontSize: "14px", color: "#7E7E7E" }}>
                No quotes generated.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Dialog>
  );
}

export default GenerateQuotesModal;
