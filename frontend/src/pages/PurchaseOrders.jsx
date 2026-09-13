import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { LoadingState, ErrorState } from "../components/AsyncState";
import * as poApi from "../api/purchaseOrders";
import * as productsApi from "../api/products";
import * as suppliersApi from "../api/suppliers";

function calcTotal({ quantity, price, gstPercent, freight, packing }) {
  const subtotal = Number(quantity) * Number(price);
  const gst = subtotal * (Number(gstPercent) / 100);
  return subtotal + gst + Number(freight) + Number(packing);
}

export default function PurchaseOrders() {
  const [pos, setPos] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const load = () => {
    setError(null);
    setPos(null);
    Promise.all([poApi.getPurchaseOrders(), suppliersApi.getSuppliers(), productsApi.getProducts()])
      .then(([poList, supplierList, productList]) => {
        setPos(poList);
        setSuppliers(supplierList);
        setProducts(productList);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm({
      supplier: suppliers[0]?.name ?? "",
      productName: products[0]?.name ?? "",
      quantity: 1,
      price: products[0]?.price ?? 0,
      gstPercent: 18,
      freight: 0,
      packing: 0,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const created = await poApi.createPurchaseOrder(form);
      setPos((prev) => [created, ...prev]);
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!pos) return <LoadingState label="Loading purchase orders..." />;

  const total = form ? calcTotal(form) : 0;

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        subtitle="Create and track purchase orders sent to suppliers."
        actionLabel="Create Purchase Order"
        onAction={openCreate}
      />

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400">
              <th className="px-5 py-3 font-medium">PO Number</th>
              <th className="px-5 py-3 font-medium">Supplier</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Total Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {pos.map((po) => (
              <tr key={po.poNumber} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 font-medium text-slate-800">{po.poNumber}</td>
                <td className="px-5 py-3 text-slate-600">{po.supplier}</td>
                <td className="px-5 py-3 text-slate-600">{po.date}</td>
                <td className="px-5 py-3 text-slate-600">₹{po.totalAmount.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3"><StatusBadge status={po.status} /></td>
              </tr>
            ))}
            {pos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">No purchase orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && form && (
        <Modal title="Create Purchase Order" onClose={() => setModalOpen(false)} width="max-w-lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Field label="Supplier">
              <select value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="input">
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Product">
              <select
                value={form.productName}
                onChange={(e) => {
                  const product = products.find((p) => p.name === e.target.value);
                  setForm({ ...form, productName: e.target.value, price: product?.price ?? 0 });
                }}
                className="input"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity">
                <input required type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="input" />
              </Field>
              <Field label="Price per unit (₹)">
                <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="GST (%)">
                <input type="number" min="0" value={form.gstPercent} onChange={(e) => setForm({ ...form, gstPercent: e.target.value })} className="input" />
              </Field>
              <Field label="Freight (₹)">
                <input type="number" min="0" value={form.freight} onChange={(e) => setForm({ ...form, freight: e.target.value })} className="input" />
              </Field>
              <Field label="Packing (₹)">
                <input type="number" min="0" value={form.packing} onChange={(e) => setForm({ ...form, packing: e.target.value })} className="input" />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <span className="text-lg font-bold text-slate-900">₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>

            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <button type="submit" disabled={saving} className="mt-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? "Creating..." : "Create Purchase Order"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
