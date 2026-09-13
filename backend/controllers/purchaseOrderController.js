import * as purchaseOrderService from "../services/purchaseOrderService.js";

export function listPurchaseOrders(req, res) {
  const { supplier, status } = req.query;
  if (supplier) return res.json(purchaseOrderService.getPurchaseOrdersBySupplier(supplier));
  if (status) return res.json(purchaseOrderService.getPurchaseOrdersByStatus(status));
  res.json(purchaseOrderService.getAllPurchaseOrders());
}

export function getPurchaseOrder(req, res) {
  const po = purchaseOrderService.getPurchaseOrderById(Number(req.params.id));
  if (!po) return res.status(404).json({ error: "Purchase order not found" });
  res.json(po);
}

export function createPurchaseOrder(req, res) {
  try {
    const po = purchaseOrderService.createPurchaseOrder(req.body);
    res.status(201).json(po);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function updatePurchaseOrderStatus(req, res) {
  const { status } = req.body;
  if (!["Pending", "Approved", "Received"].includes(status)) {
    return res.status(400).json({ error: "status must be Pending, Approved or Received" });
  }
  const po = purchaseOrderService.updatePurchaseOrderStatus(Number(req.params.id), status);
  if (!po) return res.status(404).json({ error: "Purchase order not found" });
  res.json(po);
}

export function deletePurchaseOrder(req, res) {
  const ok = purchaseOrderService.deletePurchaseOrder(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: "Purchase order not found" });
  res.status(204).end();
}
