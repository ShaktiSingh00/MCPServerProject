import { db } from "../db/connection.js";

const baseSelect = `
  SELECT
    p.*,
    s.name AS supplier_name,
    COALESCE(SUM(CASE WHEN m.type = 'in' THEN m.quantity ELSE 0 END), 0) AS stock_in,
    COALESCE(SUM(CASE WHEN m.type = 'out' THEN m.quantity ELSE 0 END), 0) AS stock_out
  FROM products p
  LEFT JOIN suppliers s ON s.id = p.supplier_id
  LEFT JOIN stock_movements m ON m.product_id = p.id
`;

function toProductDTO(row) {
  const quantity = row.opening_stock + row.stock_in - row.stock_out;
  return {
    id: row.id,
    name: row.name,
    partCode: row.part_code,
    category: row.category,
    price: row.price,
    quantity,
    threshold: row.threshold,
    supplier: row.supplier_name ?? null,
    status: quantity <= row.threshold ? "Low Stock" : "In Stock",
  };
}

export function getAllProducts() {
  const rows = db.prepare(`${baseSelect} GROUP BY p.id ORDER BY p.id`).all();
  return rows.map(toProductDTO);
}

export function getProductById(id) {
  const row = db.prepare(`${baseSelect} WHERE p.id = ? GROUP BY p.id`).get(id);
  return row ? toProductDTO(row) : null;
}

export function searchProducts(query) {
  const like = `%${query}%`;
  const rows = db
    .prepare(`${baseSelect} WHERE p.name LIKE ? OR p.part_code LIKE ? OR p.category LIKE ? GROUP BY p.id ORDER BY p.id`)
    .all(like, like, like);
  return rows.map(toProductDTO);
}

export function getLowStockProducts() {
  return getAllProducts().filter((p) => p.status === "Low Stock");
}

function resolveSupplierId(supplierName) {
  if (!supplierName) return null;
  const row = db.prepare("SELECT id FROM suppliers WHERE name = ?").get(supplierName);
  if (!row) throw new Error(`Unknown supplier: ${supplierName}`);
  return row.id;
}

export function createProduct(data) {
  if (!data.name || !data.partCode || !data.category) {
    throw new Error("name, partCode and category are required");
  }
  const supplierId = resolveSupplierId(data.supplier);
  const result = db
    .prepare(
      `INSERT INTO products (name, part_code, category, price, opening_stock, threshold, supplier_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.name,
      data.partCode,
      data.category,
      Number(data.price) || 0,
      Number(data.quantity) || 0,
      Number(data.threshold) || 0,
      supplierId
    );
  return getProductById(Number(result.lastInsertRowid));
}

export function updateProduct(id, data) {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  if (!existing) return null;

  const supplierId = data.supplier !== undefined ? resolveSupplierId(data.supplier) : existing.supplier_id;

  let openingStock = existing.opening_stock;
  if (data.quantity !== undefined) {
    // Editing "quantity" directly is a manual override of current stock;
    // re-derive opening_stock so opening + in - out lands on the new value,
    // without touching the stock_movements history.
    const current = getProductById(id);
    const delta = Number(data.quantity) - current.quantity;
    openingStock = existing.opening_stock + delta;
  }

  db.prepare(
    `UPDATE products SET name = ?, part_code = ?, category = ?, price = ?, opening_stock = ?, threshold = ?, supplier_id = ?
     WHERE id = ?`
  ).run(
    data.name ?? existing.name,
    data.partCode ?? existing.part_code,
    data.category ?? existing.category,
    data.price !== undefined ? Number(data.price) : existing.price,
    openingStock,
    data.threshold !== undefined ? Number(data.threshold) : existing.threshold,
    supplierId,
    id
  );
  return getProductById(id);
}

export function deleteProduct(id) {
  const result = db.prepare("DELETE FROM products WHERE id = ?").run(id);
  return result.changes > 0;
}
