import * as dashboardService from "../services/dashboardService.js";
import { getLowStockProducts } from "../services/productService.js";
import { getAllPurchaseOrders } from "../services/purchaseOrderService.js";

export function getSummary(req, res) {
  res.json({
    stats: dashboardService.getStats(),
    categoryDistribution: dashboardService.getCategoryDistribution(),
    stockOverview: dashboardService.getStockOverview(),
    recentPurchaseOrders: getAllPurchaseOrders().slice(0, 5),
    lowStockProducts: getLowStockProducts(),
  });
}
