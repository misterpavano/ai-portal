import Claude, { Conversation } from "claude-ai";

const useClaude = () => {
  const claude = new Claude({
    sessionKey: process.env["REACT_APP_CLAUDE_API_KEY"]!,
  });

  const chatCompletionClaude = async (prompt: string): Promise<string> => {
    await claude.init();
    const conversation = await claude.startConversation(prompt);
    const content = await extractConversationContent(conversation);
    return content;
  };

  const extractConversationContent = async (
    conversation: Conversation
  ): Promise<string> => {
    const messages = await conversation.getMessages();
    const lastMessage = messages[messages.length - 1];
    return lastMessage ? lastMessage.text : "";
  };

  return { chatCompletionClaude };
};

export default useClaude;
