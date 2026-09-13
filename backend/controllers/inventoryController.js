import * as inventoryService from "../services/inventoryService.js";

export function listInventory(req, res) {
  res.json(inventoryService.getInventory());
}

export function getInventoryForProduct(req, res) {
  const row = inventoryService.getInventoryForProduct(Number(req.params.productId));
  if (!row) return res.status(404).json({ error: "Product not found" });
  res.json(row);
}

export function recordStockIn(req, res) {
  recordMovement(req, res, "in");
}

export function recordStockOut(req, res) {
  recordMovement(req, res, "out");
}

function recordMovement(req, res, type) {
  try {
    const row = inventoryService.recordStockMovement(
      Number(req.params.productId),
      type,
      Number(req.body.quantity),
      req.body.note
    );
    if (!row) return res.status(404).json({ error: "Product not found" });
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function listStockMovements(req, res) {
  const { productId } = req.query;
  res.json(inventoryService.getStockMovements(productId ? Number(productId) : undefined));
}
