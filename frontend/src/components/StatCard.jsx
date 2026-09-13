import { ArrowUp, ArrowDown } from "lucide-react";

const themes = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  violet: "bg-violet-50 text-violet-600",
};

export default function StatCard({ icon: Icon, label, value, change, trend, theme = "blue" }) {
  const isUp = trend === "up";
  return (
    <div className="flex flex-1 flex-col gap-4 rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${themes[theme]}`}>
          <Icon size={20} />
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${isUp ? "text-emerald-600" : "text-red-500"}`}>
          {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {change}
        </div>
      </div>
    </div>
  );
}
