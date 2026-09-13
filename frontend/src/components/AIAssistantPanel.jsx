import { useState } from "react";
import { Sparkles, Send } from "lucide-react";

const suggestions = [
  "Show me all low stock products",
  "List purchase orders from ABC Supplier",
  "Create a purchase order for 10 keyboards",
  "What is the total inventory value?",
];

export default function AIAssistantPanel() {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Phase 4 will wire this up to the MCP-backed AI endpoint.
    setQuestion("");
  };

  return (
    <div className="flex w-80 shrink-0 flex-col gap-4 rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Sparkles size={16} />
        </div>
        <span className="font-semibold text-slate-900">AI Assistant</span>
        <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
          Beta
        </span>
      </div>

      <p className="text-sm text-slate-500">
        Ask anything about your inventory, purchase orders or suppliers.
      </p>

      <div className="flex flex-col gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setQuestion(s)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-600 hover:border-blue-300 hover:bg-blue-50"
          >
            "{s}"
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-auto flex items-center gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          type="text"
          placeholder="Type your question..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <button
          type="submit"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
