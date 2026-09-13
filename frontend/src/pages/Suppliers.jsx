import { useEffect, useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { LoadingState, ErrorState } from "../components/AsyncState";
import * as suppliersApi from "../api/suppliers";

const emptyForm = { name: "", email: "", phone: "", address: "", status: "Active" };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const load = () => {
    setError(null);
    setSuppliers(null);
    suppliersApi
      .getSuppliers()
      .then(setSuppliers)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const filtered = (suppliers ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.email?.toLowerCase().includes(query.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (supplier) => {
    setEditingId(supplier.id);
    setForm({ ...supplier });
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const previous = suppliers;
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    try {
      await suppliersApi.deleteSupplier(id);
    } catch (err) {
      setSuppliers(previous);
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        const updated = await suppliersApi.updateSupplier(editingId, form);
        setSuppliers((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const created = await suppliersApi.createSupplier(form);
        setSuppliers((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!suppliers) return <LoadingState label="Loading suppliers..." />;

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle="Manage supplier contacts and details."
        actionLabel="Add Supplier"
        onAction={openCreate}
      />

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:max-w-sm">
        <Search size={16} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Address</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 font-medium text-slate-800">{s.name}</td>
                <td className="px-5 py-3 text-slate-600">{s.email}</td>
                <td className="px-5 py-3 text-slate-600">{s.phone}</td>
                <td className="px-5 py-3 text-slate-600">{s.address}</td>
                <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => openEdit(s)} className="text-slate-400 hover:text-blue-600">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">No suppliers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editingId ? "Edit Supplier" : "Add Supplier"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Field label="Name">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </Field>
            <Field label="Email">
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
            </Field>
            <Field label="Phone">
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
            </Field>
            <Field label="Address">
              <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <button type="submit" disabled={saving} className="mt-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Supplier"}
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
