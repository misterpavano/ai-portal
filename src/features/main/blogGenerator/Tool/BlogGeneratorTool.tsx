import { Box } from "@mui/material";
import { useState } from "react";
import Spinner from "../../../../components/layouts/Spinner";
import Toast from "../../../../components/layouts/Toast";
import useOpenAI from "../../../../hooks/useOpenAI";
import BlogEditor from "./BlogEditor";
import BlogPrompt from "./BlogPrompt";

const BlogGeneratorTool = () => {
  const { createThread, chatCompletionOpenAi, askQuestionBasedOnFile } = useOpenAI();
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [step, setStep] = useState<number>(0);

  const [blog, setBlog] = useState<string>("");
  const [quotes, setQuotes] = useState<string>("");

  const handleGeneratePrompt = async (value: string) => {
    setIsLoading(true);
    const thread = await createThread();
    const response = await askQuestionBasedOnFile(
      thread.id,
      'asst_i2w5uoSEzKwvhFwmXtdeSA8H', // AI PORTAL BLOG GENERATOR
      value + '\n***DONT FORGET BLOG RESPONSE SHOULD CONTAIN AT LEAST 1300 WORDS, MINIMUM 4 TO 9 SENTENCES FOR EACH PARAGRAPHS WHERE AT LEAST THERE SHOULD BE 3 PARAGRAPHS FOR EACH TOPIC. NO HTML MARKDOWN(like adding ```html in the beggining and in the end) ONLY HTML CONTENT'
    );
    setBlog(response);
    handleGenerateQuotes(response)
  }

  const handleGenerateQuotes = async (value: string) => {
    setIsLoading(true);
    const response = await chatCompletionOpenAi(
      [{
        role: 'user',
        content: `Based on this blog text: ${value}, please generate 10 short quotes that can be used in the blog. RESPONSE SHOULD BE IN HTML FORMAT(<b>1.[content]</b><br/>...)`
      }]
    )
    setQuotes(response);
    setStep(1);
    setIsLoading(false);
  }

  return (
    <Box sx={{ flex: 1 }}>
      {isLoading && <Spinner overlay />}
      {showErrorMessage && (
        <Toast
          open={showErrorMessage}
          onClose={() => setShowErrorMessage(false)}
          type="error"
          title="There was an error generating the content. Please try again!"
        />
      )}
      {step === 0 ?
        <BlogEditor isDisabled={isLoading} handleGeneratePrompt={handleGeneratePrompt} />
        :
        <BlogPrompt handleBackButton={() => setStep(0)} blog={blog} quotes={quotes} />
      }
    </Box>
  );
};

export default BlogGeneratorTool;
