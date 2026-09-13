import { get, post } from "./client";

export const getInventory = () => get("/inventory");
export const getStockMovements = (productId) => get(`/inventory/movements?productId=${productId}`);
export const recordStockIn = (productId, quantity, note) =>
  post(`/inventory/${productId}/stock-in`, { quantity, note });
export const recordStockOut = (productId, quantity, note) =>
  post(`/inventory/${productId}/stock-out`, { quantity, note });
