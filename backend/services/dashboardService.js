import { db } from "../db/connection.js";
import { getAllProducts } from "./productService.js";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CATEGORY_COLORS = {
  "IT Equipment": "#3b82f6",
  Accessories: "#f5b544",
  Electrical: "#22c55e",
  Mechanical: "#ec4899",
  Others: "#6366f1",
};
const FALLBACK_COLORS = ["#0ea5e9", "#f97316", "#84cc16", "#a855f7", "#14b8a6"];

export function getStats() {
  const totalProducts = db.prepare("SELECT COUNT(*) AS c FROM products").get().c;
  const totalSuppliers = db.prepare("SELECT COUNT(*) AS c FROM suppliers").get().c;
  const totalPurchaseOrders = db.prepare("SELECT COUNT(*) AS c FROM purchase_orders").get().c;
  const lowStockItems = getAllProducts().filter((p) => p.status === "Low Stock").length;
  return { totalProducts, totalSuppliers, totalPurchaseOrders, lowStockItems };
}

export function getCategoryDistribution() {
  const rows = db.prepare("SELECT category, COUNT(*) AS count FROM products GROUP BY category").all();
  const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
  return rows.map((r, i) => ({
    category: r.category,
    percent: Math.round((r.count / total) * 100),
    color: CATEGORY_COLORS[r.category] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));
}

export function getStockOverview() {
  const rows = db
    .prepare(
      `SELECT strftime('%Y-%m', created_at) AS month,
              SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END) AS stockIn,
              SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END) AS stockOut
       FROM stock_movements
       GROUP BY month
       ORDER BY month`
    )
    .all();
  return rows.map((r) => ({
    month: MONTH_NAMES[Number(r.month.split("-")[1]) - 1],
    stockIn: r.stockIn,
    stockOut: r.stockOut,
  }));
}
