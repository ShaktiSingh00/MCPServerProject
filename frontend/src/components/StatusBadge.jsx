const styles = {
  Approved: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Received: "bg-blue-100 text-blue-700",
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-200 text-slate-600",
  "Low Stock": "bg-red-100 text-red-700",
  "In Stock": "bg-emerald-100 text-emerald-700",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
