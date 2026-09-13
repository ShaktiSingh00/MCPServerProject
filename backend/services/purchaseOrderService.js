import { db } from "../db/connection.js";

const baseSelect = `
  SELECT po.*, s.name AS supplier_name, p.name AS product_name
  FROM purchase_orders po
  LEFT JOIN suppliers s ON s.id = po.supplier_id
  LEFT JOIN products p ON p.id = po.product_id
`;

function toPurchaseOrderDTO(row) {
  return {
    id: row.id,
    poNumber: row.po_number,
    supplier: row.supplier_name,
    date: row.order_date,
    productName: row.product_name,
    quantity: row.quantity,
    price: row.price,
    gstPercent: row.gst_percent,
    freight: row.freight,
    packing: row.packing,
    totalAmount: row.total,
    status: row.status,
  };
}

export function getAllPurchaseOrders() {
  return db.prepare(`${baseSelect} ORDER BY po.id DESC`).all().map(toPurchaseOrderDTO);
}

export function getPurchaseOrderById(id) {
  const row = db.prepare(`${baseSelect} WHERE po.id = ?`).get(id);
  return row ? toPurchaseOrderDTO(row) : null;
}

export function getPurchaseOrdersBySupplier(supplierName) {
  const rows = db.prepare(`${baseSelect} WHERE s.name LIKE ? ORDER BY po.id DESC`).all(`%${supplierName}%`);
  return rows.map(toPurchaseOrderDTO);
}

export function getPurchaseOrdersByStatus(status) {
  const rows = db.prepare(`${baseSelect} WHERE po.status = ? ORDER BY po.id DESC`).all(status);
  return rows.map(toPurchaseOrderDTO);
}

function nextPoNumber() {
  const year = new Date().getFullYear();
  const row = db
    .prepare("SELECT po_number FROM purchase_orders WHERE po_number LIKE ? ORDER BY id DESC LIMIT 1")
    .get(`PO-${year}-%`);
  let next = 1;
  if (row) {
    const n = Number(row.po_number.split("-").pop());
    if (Number.isFinite(n)) next = n + 1;
  }
  return `PO-${year}-${String(next).padStart(4, "0")}`;
}

function resolveSupplierId(name) {
  const row = db.prepare("SELECT id FROM suppliers WHERE name = ?").get(name);
  if (!row) throw new Error(`Unknown supplier: ${name}`);
  return row.id;
}

function resolveProductId(name) {
  const row = db.prepare("SELECT id FROM products WHERE name = ?").get(name);
  if (!row) throw new Error(`Unknown product: ${name}`);
  return row.id;
}

export function calculateTotal({ quantity, price, gstPercent = 0, freight = 0, packing = 0 }) {
  const subtotal = Number(quantity) * Number(price);
  const gst = subtotal * (Number(gstPercent) / 100);
  return subtotal + gst + Number(freight) + Number(packing);
}

export function createPurchaseOrder(data) {
  if (!data.supplier || !data.productName || !data.quantity || !data.price) {
    throw new Error("supplier, productName, quantity and price are required");
  }
  const supplierId = resolveSupplierId(data.supplier);
  const productId = resolveProductId(data.productName);
  const total = calculateTotal(data);
  const poNumber = nextPoNumber();

  const result = db
    .prepare(
      `INSERT INTO purchase_orders (po_number, supplier_id, product_id, quantity, price, gst_percent, freight, packing, total, status, order_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', date('now'))`
    )
    .run(
      poNumber,
      supplierId,
      productId,
      Number(data.quantity),
      Number(data.price),
      Number(data.gstPercent ?? 0),
      Number(data.freight ?? 0),
      Number(data.packing ?? 0),
      total
    );
  return getPurchaseOrderById(Number(result.lastInsertRowid));
}

export function updatePurchaseOrderStatus(id, status) {
  const result = db.prepare("UPDATE purchase_orders SET status = ? WHERE id = ?").run(status, id);
  return result.changes > 0 ? getPurchaseOrderById(id) : null;
}

export function deletePurchaseOrder(id) {
  return db.prepare("DELETE FROM purchase_orders WHERE id = ?").run(id).changes > 0;
}
