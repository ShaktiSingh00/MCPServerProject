import { Loader2, AlertTriangle } from "lucide-react";

export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl bg-white p-16 text-slate-400 shadow-sm">
      <Loader2 size={18} className="animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white p-16 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertTriangle size={22} />
      </div>
      <div>
        <p className="font-medium text-slate-700">Couldn't load data</p>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Retry
        </button>
      )}
    </div>
  );
}
