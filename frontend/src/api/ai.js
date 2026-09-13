import { post } from "./client";

export const sendChatMessage = (messages) => post("/ai/chat", { messages });
