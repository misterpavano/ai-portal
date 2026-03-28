export type Message = {
  name: string;
  role: "user" | "assistant" | "system" | "function";
  content: string;
  timestamp?: string;
  isFile?: boolean;
  originalFileName?: string;
  id?: string; // Message ID from database for deletion
};
