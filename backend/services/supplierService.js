import { db } from "../db/connection.js";

function toSupplierDTO(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    status: row.status,
  };
}

export function getAllSuppliers() {
  return db.prepare("SELECT * FROM suppliers ORDER BY id").all().map(toSupplierDTO);
}

export function getSupplierById(id) {
  const row = db.prepare("SELECT * FROM suppliers WHERE id = ?").get(id);
  return row ? toSupplierDTO(row) : null;
}

export function createSupplier(data) {
  if (!data.name) throw new Error("name is required");
  const result = db
    .prepare("INSERT INTO suppliers (name, email, phone, address, status) VALUES (?, ?, ?, ?, ?)")
    .run(data.name, data.email ?? null, data.phone ?? null, data.address ?? null, data.status ?? "Active");
  return getSupplierById(Number(result.lastInsertRowid));
}

export function updateSupplier(id, data) {
  const existing = db.prepare("SELECT * FROM suppliers WHERE id = ?").get(id);
  if (!existing) return null;
  db.prepare("UPDATE suppliers SET name = ?, email = ?, phone = ?, address = ?, status = ? WHERE id = ?").run(
    data.name ?? existing.name,
    data.email ?? existing.email,
    data.phone ?? existing.phone,
    data.address ?? existing.address,
    data.status ?? existing.status,
    id
  );
  return getSupplierById(id);
}

export function deleteSupplier(id) {
  const result = db.prepare("DELETE FROM suppliers WHERE id = ?").run(id);
  return result.changes > 0;
}
