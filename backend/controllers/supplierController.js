import * as supplierService from "../services/supplierService.js";

export function listSuppliers(req, res) {
  res.json(supplierService.getAllSuppliers());
}

export function getSupplier(req, res) {
  const supplier = supplierService.getSupplierById(Number(req.params.id));
  if (!supplier) return res.status(404).json({ error: "Supplier not found" });
  res.json(supplier);
}

export function createSupplier(req, res) {
  try {
    const supplier = supplierService.createSupplier(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function updateSupplier(req, res) {
  const supplier = supplierService.updateSupplier(Number(req.params.id), req.body);
  if (!supplier) return res.status(404).json({ error: "Supplier not found" });
  res.json(supplier);
}

export function deleteSupplier(req, res) {
  const ok = supplierService.deleteSupplier(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: "Supplier not found" });
  res.status(204).end();
}
