import Anthropic from "@anthropic-ai/sdk";
import { listMcpTools, callMcpTool } from "./mcpClient.js";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
const MAX_TOKENS = 4096;
const MAX_ITERATIONS = 6;

const SYSTEM_PROMPT =
  "You are the AI Assistant inside an inventory management dashboard. " +
  "You have tools for looking up and managing products, suppliers, purchase orders and stock levels. " +
  "Use the tools to answer questions with real data and to carry out actions the user asks for. " +
  "Keep replies short and to the point.";

function toAnthropicTools(mcpTools) {
  return mcpTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema,
  }));
}

function toMessageContent(result) {
  const text = (result.content ?? [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
  return text || (result.isError ? "Tool call failed." : "(no output)");
}

function extractText(response) {
  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

export async function chat(conversation) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set on the backend. Add it to backend/.env to enable the AI Assistant.");
  }

  const client = new Anthropic();
  const mcpTools = await listMcpTools();
  const tools = toAnthropicTools(mcpTools);

  const messages = conversation.map((m) => ({ role: m.role, content: m.text }));

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    if (response.stop_reason !== "tool_use") {
      return extractText(response) || "I don't have a response for that.";
    }

    messages.push({ role: "assistant", content: response.content });

    const toolUseBlocks = response.content.filter((block) => block.type === "tool_use");
    const toolResults = [];
    for (const block of toolUseBlocks) {
      const result = await callMcpTool(block.name, block.input).catch((err) => ({
        content: [{ type: "text", text: err.message }],
        isError: true,
      }));
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: toMessageContent(result),
        is_error: Boolean(result.isError),
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  throw new Error("The assistant took too many steps without finishing. Try rephrasing your question.");
}
