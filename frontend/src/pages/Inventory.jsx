import { useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import { LoadingState, ErrorState } from "../components/AsyncState";
import * as inventoryApi from "../api/inventory";

export default function Inventory() {
  const [inventory, setInventory] = useState(null);
  const [error, setError] = useState(null);
  const [movement, setMovement] = useState(null); // { productId, type: "in" | "out" }
  const [amount, setAmount] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const load = () => {
    setError(null);
    setInventory(null);
    inventoryApi
      .getInventory()
      .then(setInventory)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const openMovement = (productId, type) => {
    setMovement({ productId, type });
    setAmount(1);
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const updated =
        movement.type === "in"
          ? await inventoryApi.recordStockIn(movement.productId, Number(amount))
          : await inventoryApi.recordStockOut(movement.productId, Number(amount));
      setInventory((prev) => prev.map((row) => (row.productId === movement.productId ? updated : row)));
      setMovement(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!inventory) return <LoadingState label="Loading inventory..." />;

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Track opening stock, stock movements and current stock levels." />

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Part Code</th>
              <th className="px-5 py-3 font-medium">Opening Stock</th>
              <th className="px-5 py-3 font-medium">Stock In</th>
              <th className="px-5 py-3 font-medium">Stock Out</th>
              <th className="px-5 py-3 font-medium">Current Stock</th>
              <th className="px-5 py-3 font-medium text-right">Record</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((row) => (
              <tr key={row.productId} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 font-medium text-slate-800">{row.productName}</td>
                <td className="px-5 py-3 text-slate-600">{row.partCode}</td>
                <td className="px-5 py-3 text-slate-600">{row.openingStock}</td>
                <td className="px-5 py-3 text-emerald-600">+{row.stockIn}</td>
                <td className="px-5 py-3 text-red-500">-{row.stockOut}</td>
                <td className="px-5 py-3 font-semibold text-slate-900">{row.currentStock}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => openMovement(row.productId, "in")} className="text-slate-400 hover:text-emerald-600" title="Record stock in">
                      <ArrowDownCircle size={18} />
                    </button>
                    <button onClick={() => openMovement(row.productId, "out")} className="text-slate-400 hover:text-red-600" title="Record stock out">
                      <ArrowUpCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {movement && (
        <Modal title={movement.type === "in" ? "Record Stock In" : "Record Stock Out"} onClose={() => setMovement(null)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">Quantity</span>
              <input required type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="input" />
            </label>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <button type="submit" disabled={saving} className="mt-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
