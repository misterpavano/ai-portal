import { GoogleGenerativeAI } from "@google/generative-ai";

const useGemini = () => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY!;
  const genAI = new GoogleGenerativeAI(apiKey);

  const chatCompletionGemini = async (prompt: string) => {
    const completion = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await completion.generateContent(prompt);
    return result.response.text();
  };

  return { chatCompletionGemini };
};

export default useGemini;
