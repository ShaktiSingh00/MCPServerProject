import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import PageHeader from "../components/PageHeader";
import * as aiApi from "../api/ai";

const suggestions = [
  "Show me all products",
  "Which products have low stock?",
  "List purchase orders from ABC Supplier",
  "Create a purchase order for 20 keyboards at ₹500 each",
  "What is the total inventory value?",
  "Which supplier has the most purchase orders?",
];

const greeting = {
  role: "assistant",
  text: "Hi! Ask me about your products, suppliers, purchase orders or inventory — I can look things up and make changes for you.",
};

export default function AIAssistant() {
  const [messages, setMessages] = useState([greeting]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const send = async (text) => {
    if (!text.trim() || sending) return;

    const history = [...messages.slice(1), { role: "user", text }];
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setError(null);
    setSending(true);
    try {
      const { reply } = await aiApi.sendChatMessage(history);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHeader title="AI Assistant" subtitle="Ask questions about your inventory, suppliers and purchase orders." />

      <div className="flex h-[60vh] flex-col rounded-xl bg-white shadow-sm">
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-md rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {m.role === "assistant" && (
                  <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-blue-500">
                    <Sparkles size={12} /> Assistant
                  </span>
                )}
                {m.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="max-w-md rounded-lg bg-slate-100 px-4 py-2.5 text-sm text-slate-400">Thinking...</div>
            </div>
          )}
          {error && (
            <div className="flex justify-start">
              <div className="max-w-md rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 p-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={sending}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-slate-100 p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={sending}
            className="input"
          />
          <button
            type="submit"
            disabled={sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
