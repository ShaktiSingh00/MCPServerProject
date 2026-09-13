import { get, post, put } from "./client";

export const getPurchaseOrders = () => get("/purchase-orders");
export const getPurchaseOrdersBySupplier = (supplier) => get(`/purchase-orders?supplier=${encodeURIComponent(supplier)}`);
export const createPurchaseOrder = (data) => post("/purchase-orders", data);
export const updatePurchaseOrderStatus = (id, status) => put(`/purchase-orders/${id}/status`, { status });
