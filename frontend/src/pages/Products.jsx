import { useEffect, useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { LoadingState, ErrorState } from "../components/AsyncState";
import * as productsApi from "../api/products";
import * as suppliersApi from "../api/suppliers";

const emptyForm = { name: "", partCode: "", category: "", price: "", quantity: "", threshold: "", supplier: "" };

export default function Products() {
  const [products, setProducts] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const load = () => {
    setError(null);
    setProducts(null);
    Promise.all([productsApi.getProducts(), suppliersApi.getSuppliers()])
      .then(([p, s]) => {
        setProducts(p);
        setSuppliers(s);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const filtered = (products ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.partCode.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, supplier: suppliers[0]?.name ?? "" });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({ ...product, supplier: product.supplier ?? "" });
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const previous = products;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await productsApi.deleteProduct(id);
    } catch (err) {
      setProducts(previous);
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        const updated = await productsApi.updateProduct(editingId, form);
        setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const created = await productsApi.createProduct(form);
        setProducts((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!products) return <LoadingState label="Loading products..." />;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog, pricing and stock levels."
        actionLabel="Add Product"
        onAction={openCreate}
      />

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:max-w-sm">
        <Search size={16} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, part code, category..."
          className="w-full text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Part Code</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Supplier</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 font-medium text-slate-800">{p.name}</td>
                <td className="px-5 py-3 text-slate-600">{p.partCode}</td>
                <td className="px-5 py-3 text-slate-600">{p.category}</td>
                <td className="px-5 py-3 text-slate-600">₹{Number(p.price).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-slate-600">{p.quantity}</td>
                <td className="px-5 py-3 text-slate-600">{p.supplier}</td>
                <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-blue-600">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editingId ? "Edit Product" : "Add Product"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Field label="Name">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </Field>
            <Field label="Part Code">
              <input required value={form.partCode} onChange={(e) => setForm({ ...form, partCode: e.target.value })} className="input" />
            </Field>
            <Field label="Category">
              <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (₹)">
                <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" />
              </Field>
              <Field label="Quantity">
                <input required type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="input" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Low Stock Threshold">
                <input required type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} className="input" />
              </Field>
              <Field label="Supplier">
                <select value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="input">
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </Field>
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <button type="submit" disabled={saving} className="mt-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Product"}
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
