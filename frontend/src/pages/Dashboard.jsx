import { useEffect, useState } from "react";
import { Boxes, Users, FileText, AlertTriangle, Plus, UserPlus, ClipboardPlus, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import StockOverviewChart from "../components/StockOverviewChart";
import CategoryDonutChart from "../components/CategoryDonutChart";
import AIAssistantPanel from "../components/AIAssistantPanel";
import { LoadingState, ErrorState } from "../components/AsyncState";
import { getDashboardSummary } from "../api/dashboard";

const quickActions = [
  { to: "/products", icon: Plus, title: "Add Product", subtitle: "Create a new product", theme: "bg-blue-50 text-blue-600" },
  { to: "/suppliers", icon: UserPlus, title: "Add Supplier", subtitle: "Create a new supplier", theme: "bg-emerald-50 text-emerald-600" },
  { to: "/purchase-orders", icon: ClipboardPlus, title: "Create Purchase Order", subtitle: "Generate a new PO", theme: "bg-amber-50 text-amber-600" },
  { to: "/reports", icon: BarChart3, title: "View Reports", subtitle: "Analytics and insights", theme: "bg-violet-50 text-violet-600" },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    setSummary(null);
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!summary) return <LoadingState label="Loading dashboard..." />;

  const { stats, categoryDistribution, stockOverview, recentPurchaseOrders, lowStockProducts } = summary;

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Welcome back, Shakti! Here's an overview of your inventory and purchase orders.
            </p>
          </div>
          <span className="text-sm text-slate-500">Today, {today}</span>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Boxes} label="Total Products" value={stats.totalProducts} change="Live from database" trend="up" theme="blue" />
          <StatCard icon={Users} label="Total Suppliers" value={stats.totalSuppliers} change="Live from database" trend="up" theme="green" />
          <StatCard icon={FileText} label="Total Purchase Orders" value={stats.totalPurchaseOrders} change="Live from database" trend="up" theme="amber" />
          <StatCard icon={AlertTriangle} label="Low Stock Items" value={stats.lowStockItems} change="Live from database" trend="down" theme="red" />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Stock Overview</h2>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-400" /> Stock In</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-violet-300" /> Stock Out</span>
              </div>
            </div>
            {stockOverview.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">No stock movements recorded yet.</p>
            ) : (
              <StockOverviewChart stockOverview={stockOverview} />
            )}
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900">Category Distribution</h2>
            <CategoryDonutChart categoryDistribution={categoryDistribution} totalProducts={stats.totalProducts} />
            <div className="mt-4 flex flex-col gap-2">
              {categoryDistribution.map((c) => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.category}
                  </span>
                  <span className="font-medium text-slate-900">{c.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent Purchase Orders</h2>
              <Link to="/purchase-orders" className="text-sm font-medium text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-slate-400">
                    <th className="pb-2 font-medium">PO Number</th>
                    <th className="pb-2 font-medium">Supplier</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPurchaseOrders.map((po) => (
                    <tr key={po.poNumber} className="border-t border-slate-100">
                      <td className="py-2.5 font-medium text-slate-800">{po.poNumber}</td>
                      <td className="py-2.5 text-slate-600">{po.supplier}</td>
                      <td className="py-2.5 text-slate-600">₹{po.totalAmount.toLocaleString("en-IN")}</td>
                      <td className="py-2.5"><StatusBadge status={po.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Low Stock Products</h2>
              <Link to="/inventory" className="text-sm font-medium text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-slate-400">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">Part Code</th>
                    <th className="pb-2 font-medium">Stock</th>
                    <th className="pb-2 font-medium">Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="py-2.5 font-medium text-slate-800">{p.name}</td>
                      <td className="py-2.5 text-slate-600">{p.partCode}</td>
                      <td className="py-2.5 font-semibold text-red-500">{p.quantity}</td>
                      <td className="py-2.5 text-slate-600">{p.threshold}</td>
                    </tr>
                  ))}
                  {lowStockProducts.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-slate-400">Nothing low on stock.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ to, icon: Icon, title, subtitle, theme }) => (
            <Link
              key={title}
              to={to}
              className={`flex items-center gap-3 rounded-xl p-5 shadow-sm transition-transform hover:-translate-y-0.5 ${theme}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/70">
                <Icon size={20} />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{title}</div>
                <div className="text-xs text-slate-600">{subtitle}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <AIAssistantPanel />
    </div>
  );
}
