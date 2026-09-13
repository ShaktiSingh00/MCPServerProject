import { db } from "../db/connection.js";

function toInventoryDTO(row) {
  return {
    productId: row.id,
    productName: row.name,
    partCode: row.part_code,
    openingStock: row.opening_stock,
    stockIn: row.stock_in,
    stockOut: row.stock_out,
    currentStock: row.opening_stock + row.stock_in - row.stock_out,
  };
}

const baseSelect = `
  SELECT
    p.*,
    COALESCE(SUM(CASE WHEN m.type = 'in' THEN m.quantity ELSE 0 END), 0) AS stock_in,
    COALESCE(SUM(CASE WHEN m.type = 'out' THEN m.quantity ELSE 0 END), 0) AS stock_out
  FROM products p
  LEFT JOIN stock_movements m ON m.product_id = p.id
`;

export function getInventory() {
  return db.prepare(`${baseSelect} GROUP BY p.id ORDER BY p.id`).all().map(toInventoryDTO);
}

export function getInventoryForProduct(productId) {
  const row = db.prepare(`${baseSelect} WHERE p.id = ? GROUP BY p.id`).get(productId);
  return row ? toInventoryDTO(row) : null;
}

export function recordStockMovement(productId, type, quantity, note = "") {
  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(productId);
  if (!product) return null;
  if (!["in", "out"].includes(type)) throw new Error("type must be 'in' or 'out'");
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("quantity must be a positive number");

  db.prepare("INSERT INTO stock_movements (product_id, type, quantity, note) VALUES (?, ?, ?, ?)").run(
    productId,
    type,
    quantity,
    note
  );
  return getInventoryForProduct(productId);
}

export function getStockMovements(productId) {
  if (productId) {
    return db
      .prepare("SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC")
      .all(productId);
  }
  return db.prepare("SELECT * FROM stock_movements ORDER BY created_at DESC").all();
}
