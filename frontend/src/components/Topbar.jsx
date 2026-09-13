import { Search, Bell } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
      <div className="flex w-full max-w-md items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search products, suppliers, PO..."
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-slate-500 hover:text-slate-700">
          <Bell size={20} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
            SS
          </div>
          <span className="text-sm font-medium text-slate-700">Shakti Singh</span>
        </div>
      </div>
    </header>
  );
}
