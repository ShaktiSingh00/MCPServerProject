import { useEffect, useState } from "react";
import { Wallet, ShoppingCart, Clock, CheckCircle2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StockOverviewChart from "../components/StockOverviewChart";
import SupplierSpendChart from "../components/SupplierSpendChart";
import MonthlyPurchaseChart from "../components/MonthlyPurchaseChart";
import { LoadingState, ErrorState } from "../components/AsyncState";
import { getPurchaseOrders } from "../api/purchaseOrders";
import { getProducts } from "../api/products";
import { getDashboardSummary } from "../api/dashboard";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildSupplierSpend(purchaseOrders) {
  const bySupplier = new Map();
  for (const po of purchaseOrders) {
    const entry = bySupplier.get(po.supplier) ?? { supplier: po.supplier, total: 0, count: 0 };
    entry.total += po.totalAmount;
    entry.count += 1;
    bySupplier.set(po.supplier, entry);
  }
  return [...bySupplier.values()].sort((a, b) => b.total - a.total);
}

function buildMonthlySummary(purchaseOrders) {
  const byMonth = new Map();
  for (const po of purchaseOrders) {
    const [year, month] = po.date.split("-");
    const key = `${year}-${month}`;
    const entry = byMonth.get(key) ?? { key, label: `${MONTH_NAMES[Number(month) - 1]} ${year}`, total: 0, count: 0 };
    entry.total += po.totalAmount;
    entry.count += 1;
    byMonth.set(key, entry);
  }
  return [...byMonth.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    setData(null);
    Promise.all([getPurchaseOrders(), getProducts(), getDashboardSummary()])
      .then(([purchaseOrders, products, summary]) => setData({ purchaseOrders, products, summary }))
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingState label="Loading reports..." />;

  const { purchaseOrders, products, summary } = data;

  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const totalPurchaseValue = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const pendingCount = purchaseOrders.filter((po) => po.status === "Pending").length;
  const receivedCount = purchaseOrders.filter((po) => po.status === "Received").length;

  const supplierSpend = buildSupplierSpend(purchaseOrders);
  const monthlySummary = buildMonthlySummary(purchaseOrders);
  const topSupplier = supplierSpend[0];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Analytics and insights across inventory and purchasing." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Total Inventory Value" value={`₹${totalInventoryValue.toLocaleString("en-IN")}`} change="Price × current stock, all products" trend="up" theme="blue" />
        <StatCard icon={ShoppingCart} label="Total Purchase Value" value={`₹${totalPurchaseValue.toLocaleString("en-IN")}`} change={`Across ${purchaseOrders.length} purchase orders`} trend="up" theme="green" />
        <StatCard icon={Clock} label="Pending POs" value={pendingCount} change="Awaiting approval or receipt" trend="down" theme="amber" />
        <StatCard icon={CheckCircle2} label="Received POs" value={receivedCount} change="Fully delivered" trend="up" theme="violet" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-semibold text-slate-900">Supplier Spend</h2>
          <p className="mb-4 text-xs text-slate-500">
            {topSupplier ? `${topSupplier.supplier} leads with ₹${topSupplier.total.toLocaleString("en-IN")} across ${topSupplier.count} PO${topSupplier.count === 1 ? "" : "s"}.` : "No purchase orders yet."}
          </p>
          {supplierSpend.length > 0 ? <SupplierSpendChart supplierSpend={supplierSpend} /> : <p className="py-16 text-center text-sm text-slate-400">Nothing to show yet.</p>}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-semibold text-slate-900">Monthly Purchase Summary</h2>
          <p className="mb-4 text-xs text-slate-500">Total PO value grouped by order month.</p>
          {monthlySummary.length > 0 ? <MonthlyPurchaseChart monthlySummary={monthlySummary} /> : <p className="py-16 text-center text-sm text-slate-400">Nothing to show yet.</p>}
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-1 font-semibold text-slate-900">Stock Movement Trend</h2>
        <p className="mb-4 text-xs text-slate-500">Stock in vs. stock out, by month, across all products.</p>
        {summary.stockOverview.length > 0 ? (
          <StockOverviewChart stockOverview={summary.stockOverview} />
        ) : (
          <p className="py-16 text-center text-sm text-slate-400">No stock movements recorded yet.</p>
        )}
      </div>
    </div>
  );
}
