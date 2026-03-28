import OpenAI from "openai";
import { FileCreateParams } from "openai/resources";
import { TextContentBlock } from "openai/resources/beta/threads/messages";
import { useCallback } from "react";

const openai = new OpenAI({
  apiKey: process.env["REACT_APP_OPENAI_API_KEY"] || "placeholder",
  dangerouslyAllowBrowser: true,
});

const useOpenAI = () => {
  const chatCompletionOpenAi = useCallback(
    async (
      messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature?: number,
      model?: string
    ): Promise<string> => {
      const completion = await openai.chat.completions.create({
        messages,
        model: model || "gpt-3.5-turbo-1106",
        temperature: temperature,
      });
      return completion.choices[0].message.content ?? "";
    },
    []
  );

  const createAssistant = useCallback(async () => {
    if (!openai) {
      throw new Error("OpenAI not initialized");
    }
    const assistant = openai.beta.assistants.create({
      name: "Machine",
      tools: [{ type: "retrieval" }] as any,
      model: "gpt-3.5-turbo",
    });
    return assistant;
  }, []);

  const createThread = useCallback(async () => {
    const thread = await openai.beta.threads.create();
    return thread;
  }, []);

  const addFileToVectorStore = (vectorId: string, fileId: string) => {
    return openai.beta.vectorStores.files.create(vectorId, {
      file_id: fileId,
    });
  };

  const uploadFile = async (file: FileCreateParams) => {
    return await openai.files.create(file);
  };

  const uploadFileByFormData = useCallback(async (formData: FormData) => {
    try {
      const file = formData.get("file") as File;

      if (!file) {
        throw new Error("No file found in the form data.");
      }

      const fileCreateParams: OpenAI.FileCreateParams = {
        purpose: "assistants",
        file,
      };

      const response = await openai.files.create(fileCreateParams);

      return response;
    } catch (error) {
      console.error("Error uploading file using OpenAI:", error);
      throw error;
    }
  }, []);

  const uploadFileToAssistant = useCallback(
    async (
      file: FileCreateParams | null,
      assistantId: string,
      fileId?: string
    ) => {
      if (file) {
        const createdFile = await openai.files.create(file);
        await openai.beta.assistants.update(assistantId, {
          file_ids: [createdFile.id],
        } as any);
        return createdFile;
      }
      if (fileId) {
        await openai.beta.assistants.update(assistantId, {
          file_ids: [fileId],
        } as any);
      }
    },
    []
  );

  const deleteFileFromVectorStore = useCallback(
    async (vectorStoreId: string, fileId: string) => {
      try {
        await openai.beta.vectorStores.files.del(vectorStoreId, fileId);
        console.log(
          `File ${fileId} deleted from vector store ${vectorStoreId}`
        );

        return true;
      } catch (error) {
        console.error("Error deleting file from vector store:", error);
        throw error;
      }
    },
    []
  );

  const updateAssistantInstructions = useCallback(
    async (assistantId: string, newInstructions: string) => {
      try {
        const updatedAssistant = await openai.beta.assistants.update(
          assistantId,
          {
            instructions: newInstructions,
          }
        );
        console.log("Assistant instructions updated:", updatedAssistant);
        return updatedAssistant;
      } catch (error) {
        console.error("Error updating assistant instructions:", error);
        throw error;
      }
    },
    []
  );

  const deleteFileFromStorage = useCallback(async (fileId: string) => {
    try {
      await openai.files.del(fileId);
      console.log(`File ${fileId} deleted from OpenAI's file storage`);
      return true;
    } catch (error) {
      console.error("Error deleting file from OpenAI's file storage:", error);
      throw error;
    }
  }, []);

  const askQuestionBasedOnFile = useCallback(
    async (
      threadId: string,
      assistantId: string,
      message: string,
      assistantPrompt?: string
    ) => {
      // Add a system message to set the assistant's behavior
      await openai.beta.threads.messages.create(threadId, {
        role: "assistant",
        content: assistantPrompt || "",
      });

      // User's message
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message,
      });

      // Initiate the assistant's response
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      // Polling for the run's status
      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
          console.log(
            `Run status is '${runStatus.status}'. Unable to complete the request.`
          );
          break;
        }
      }

      // Retrieve messages from the thread
      const messages = await openai.beta.threads.messages.list(threadId);
      const lastMessageForRun = messages.data
        .filter(
          (message) => message.run_id === run.id && message.role === "assistant"
        )
        .pop();

      // Extract and return the assistant's response
      if (lastMessageForRun) {
        const contentBlock = lastMessageForRun.content[0];
        if (contentBlock.type === "text") {
          return (contentBlock as TextContentBlock).text.value;
        } else {
          return "No text response from the assistant.";
        }
      } else if (
        !["failed", "cancelled", "expired"].includes(runStatus.status)
      ) {
        return "No response received from the assistant.";
      }
      return "";
    },
    []
  );

  const askQuestionBasedOnFileWithoutPrompt = useCallback(
    async (threadId: string, assistantId: string, message: string) => {
      // Add a system message to set the assistant's behavior

      // User's message
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message,
      });

      // Initiate the assistant's response
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      // Polling for the run's status
      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
          console.log(
            `Run status is '${runStatus.status}'. Unable to complete the request.`
          );
          break;
        }
      }

      // Retrieve messages from the thread
      const messages = await openai.beta.threads.messages.list(threadId);
      const lastMessageForRun = messages.data
        .filter(
          (message) => message.run_id === run.id && message.role === "assistant"
        )
        .pop();

      // Extract and return the assistant's response
      if (lastMessageForRun) {
        const contentBlock = lastMessageForRun.content[0];
        if (contentBlock.type === "text") {
          return (contentBlock as TextContentBlock).text.value;
        } else {
          return "No text response from the assistant.";
        }
      } else if (
        !["failed", "cancelled", "expired"].includes(runStatus.status)
      ) {
        return "No response received from the assistant.";
      }
      return "";
    },
    []
  );
  return {
    chatCompletionOpenAi,
    createAssistant,
    createThread,
    addFileToVectorStore,
    uploadFileToAssistant,
    askQuestionBasedOnFile,
    deleteFileFromVectorStore,
    askQuestionBasedOnFileWithoutPrompt,
    deleteFileFromStorage,
    uploadFile,
    uploadFileByFormData,
    updateAssistantInstructions,
  };
};
export default useOpenAI;
