import type { ChatMessage } from "./chat-api";
import { newId } from "./local-store";

export const CHAT_HISTORY_KEY = "alafia.assistant.history.v1";
export const ACTIVE_CHAT_KEY = "alafia.assistant.active.v1";
export const MAX_SAVED_CONVERSATIONS = 50;
export const MAX_SAVED_MESSAGES = 100;

export type SavedConversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

export function createConversation(welcome: ChatMessage): SavedConversation {
  const now = Date.now();
  return {
    id: newId(),
    title: "Nouvelle discussion",
    createdAt: now,
    updatedAt: now,
    messages: [welcome],
  };
}

export function conversationTitle(messages: ChatMessage[]) {
  const firstQuestion = messages.find((message) => message.role === "user")?.content?.trim();
  if (!firstQuestion) return "Nouvelle discussion";
  return firstQuestion.length > 54 ? `${firstQuestion.slice(0, 51).trimEnd()}…` : firstQuestion;
}
