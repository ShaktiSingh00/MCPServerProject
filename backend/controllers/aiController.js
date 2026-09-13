import * as aiChatService from "../services/aiChatService.js";

export async function chat(req, res) {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const reply = await aiChatService.chat(messages);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
