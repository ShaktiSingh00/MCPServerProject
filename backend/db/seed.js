import { db } from "./connection.js";

const suppliers = [
  { name: "ABC Supplier", email: "contact@abcsupplier.com", phone: "+91 98765 43210", address: "Mumbai, MH", status: "Active" },
  { name: "XYZ Traders", email: "sales@xyztraders.com", phone: "+91 91234 56789", address: "Delhi, DL", status: "Active" },
  { name: "Global Tech", email: "info@globaltech.com", phone: "+91 99887 76655", address: "Bengaluru, KA", status: "Active" },
  { name: "Mega Supplies", email: "hello@megasupplies.com", phone: "+91 90123 45678", address: "Pune, MH", status: "Inactive" },
];

// [name, partCode, category, price, openingStock, threshold, supplierName]
const products = [
  ["Keyboard", "KEY001", "Accessories", 1200, 12, 20, "ABC Supplier"],
  ["Mouse", "MSE001", "Accessories", 650, 8, 15, "ABC Supplier"],
  ["USB Cable", "USB001", "Electrical", 150, 5, 10, "XYZ Traders"],
  ["Laptop Charger", "CHG001", "Electrical", 1800, 10, 20, "Global Tech"],
  ["Monitor", "MON001", "IT Equipment", 9500, 18, 25, "Mega Supplies"],
  ["Mechanical Keyboard", "MEC001", "Mechanical", 3499, 40, 10, "ABC Supplier"],
  ["Cable Ties (Pack)", "CTP001", "Others", 99, 200, 50, "XYZ Traders"],
  ["Label Printer", "LBP001", "Others", 4200, 20, 5, "Mega Supplies"],
  ["Network Switch", "NSW001", "IT Equipment", 3200, 25, 10, "Global Tech"],
  ["Power Strip", "PWS001", "Electrical", 450, 30, 10, "XYZ Traders"],
];

// Monthly totals shaped like the original dashboard mock, logged against
// the non-low-stock products (id 6-10) so the low-stock demo rows above
// stay untouched. Only the SUM per month matters for the dashboard chart.
const monthlyMovements = [
  { month: "01", stockIn: 48, stockOut: 32 },
  { month: "02", stockIn: 55, stockOut: 40 },
  { month: "03", stockIn: 48, stockOut: 45 },
  { month: "04", stockIn: 68, stockOut: 48 },
  { month: "05", stockIn: 65, stockOut: 30 },
  { month: "06", stockIn: 55, stockOut: 50 },
  { month: "07", stockIn: 62, stockOut: 45 },
  { month: "08", stockIn: 70, stockOut: 48 },
  { month: "09", stockIn: 82, stockOut: 65 },
];

const purchaseOrders = [
  { poNumber: "PO-2026-0008", supplier: "ABC Supplier", product: "Keyboard", quantity: 40, price: 1200, gstPercent: 18, freight: 500, packing: 200, status: "Pending", orderDate: "2026-09-01" },
  { poNumber: "PO-2026-0009", supplier: "Mega Supplies", product: "Monitor", quantity: 3, price: 9500, gstPercent: 18, freight: 300, packing: 100, status: "Approved", orderDate: "2026-09-05" },
  { poNumber: "PO-2026-0010", supplier: "Global Tech", product: "Laptop Charger", quantity: 35, price: 1800, gstPercent: 18, freight: 400, packing: 150, status: "Received", orderDate: "2026-09-08" },
  { poNumber: "PO-2026-0011", supplier: "XYZ Traders", product: "USB Cable", quantity: 500, price: 150, gstPercent: 18, freight: 800, packing: 300, status: "Pending", orderDate: "2026-09-10" },
  { poNumber: "PO-2026-0012", supplier: "ABC Supplier", product: "Mechanical Keyboard", quantity: 10, price: 3499, gstPercent: 18, freight: 500, packing: 200, status: "Approved", orderDate: "2026-09-12" },
];

function computeTotal({ quantity, price, gstPercent, freight, packing }) {
  const subtotal = quantity * price;
  const gst = subtotal * (gstPercent / 100);
  return Math.round(subtotal + gst + freight + packing);
}

export function seedIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) as count FROM suppliers").get();
  if (count > 0) return;

  const insertSupplier = db.prepare(
    "INSERT INTO suppliers (name, email, phone, address, status) VALUES (?, ?, ?, ?, ?)"
  );
  const supplierIds = {};
  for (const s of suppliers) {
    const result = insertSupplier.run(s.name, s.email, s.phone, s.address, s.status);
    supplierIds[s.name] = Number(result.lastInsertRowid);
  }

  const insertProduct = db.prepare(
    "INSERT INTO products (name, part_code, category, price, opening_stock, threshold, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const productIds = {};
  for (const [name, partCode, category, price, openingStock, threshold, supplierName] of products) {
    const result = insertProduct.run(name, partCode, category, price, openingStock, threshold, supplierIds[supplierName]);
    productIds[name] = Number(result.lastInsertRowid);
  }

  const bulkProductIds = [6, 7, 8, 9, 10].map((i) => productIds[products[i - 1][0]]);
  const insertMovement = db.prepare(
    "INSERT INTO stock_movements (product_id, type, quantity, note, created_at) VALUES (?, ?, ?, ?, ?)"
  );
  monthlyMovements.forEach(({ month, stockIn, stockOut }, i) => {
    const productId = bulkProductIds[i % bulkProductIds.length];
    const year = new Date().getFullYear();
    insertMovement.run(productId, "in", stockIn, "seed data for dashboard chart", `${year}-${month}-15T09:00:00`);
    insertMovement.run(productId, "out", stockOut, "seed data for dashboard chart", `${year}-${month}-20T09:00:00`);
  });

  const insertPO = db.prepare(`
    INSERT INTO purchase_orders (po_number, supplier_id, product_id, quantity, price, gst_percent, freight, packing, total, status, order_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const po of purchaseOrders) {
    const total = computeTotal(po);
    insertPO.run(
      po.poNumber,
      supplierIds[po.supplier],
      productIds[po.product],
      po.quantity,
      po.price,
      po.gstPercent,
      po.freight,
      po.packing,
      total,
      po.status,
      po.orderDate
    );
  }

  console.log("Seeded database with sample suppliers, products, stock movements and purchase orders.");
}
