import React, { useState } from "react";
import type { InventoryItem } from "../types";

const uid = () => Math.random().toString(36).slice(2, 9);

export default function InventoryPage({ items, setItems, canEdit }: { items: InventoryItem[]; setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>; canEdit: boolean; }) {
  const [form, setForm] = useState<Partial<InventoryItem>>({ name: "", category: "", stock: 0, unit: "", price: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const resetForm = () => setForm({ name: "", category: "", stock: 0, unit: "", price: 0 });
  const startEdit = (it: InventoryItem) => {
    setEditingId(it.id);
    setForm({ ...it });
  };
  const saveItem = () => {
    if (!canEdit) return;
    if (!form.name || !form.category || !form.unit || form.stock == null || form.price == null) return;
    if (editingId) {
      setItems((prev) => prev.map((p) => (p.id === editingId ? { ...(p as InventoryItem), ...(form as InventoryItem) } : p)));
      setEditingId(null);
    } else {
      setItems((prev) => [
        ...prev,
        { id: uid(), name: form.name!, category: form.category!, stock: Number(form.stock || 0), unit: form.unit!, price: Number(form.price || 0) },
      ]);
    }
    resetForm();
  };
  const deleteItem = (id: string) => {
    if (!canEdit) return;
    setItems((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) { setEditingId(null); resetForm(); }
  };
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-gray-100">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-700">Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-600">
                <th className="p-2">Name</th>
                <th className="p-2">Category</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Unit</th>
                <th className="p-2">Price</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="p-2">{it.name}</td>
                  <td className="p-2">{it.category}</td>
                  <td className="p-2">{it.stock}</td>
                  <td className="p-2">{it.unit}</td>
                  <td className="p-2">${it.price.toFixed(2)}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button disabled={!canEdit} onClick={() => startEdit(it)} className={`rounded-lg px-3 py-1 text-sm ring-1 transition ${canEdit?"bg-green-50 text-green-700 ring-green-100 hover:bg-green-100":"cursor-not-allowed bg-gray-100 text-gray-400 ring-gray-200"}`}>Edit</button>
                      <button disabled={!canEdit} onClick={() => deleteItem(it.id)} className={`rounded-lg px-3 py-1 text-sm ring-1 transition ${canEdit?"bg-white text-red-600 ring-red-200 hover:bg-red-50":"cursor-not-allowed bg-gray-100 text-gray-400 ring-gray-200"}`}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-gray-100">
        <h3 className="mb-3 text-lg font-semibold text-green-700">{editingId ? "Edit Item" : "Add New Item"}</h3>
        <div className="grid gap-3 sm:grid-cols-5">
          <input disabled={!canEdit} value={form.name || ""} onChange={(e)=>setForm((f)=>({ ...f, name: e.target.value }))} placeholder="Name" className={`rounded-xl border px-3 py-2 outline-none focus:ring-2 ${canEdit?"border-gray-200 focus:ring-green-600/30":"border-gray-100 bg-gray-50 text-gray-400"}`} />
          <input disabled={!canEdit} value={form.category || ""} onChange={(e)=>setForm((f)=>({ ...f, category: e.target.value }))} placeholder="Category" className={`rounded-xl border px-3 py-2 outline-none focus:ring-2 ${canEdit?"border-gray-200 focus:ring-green-600/30":"border-gray-100 bg-gray-50 text-gray-400"}`} />
          <input disabled={!canEdit} value={form.stock ?? 0} onChange={(e)=>setForm((f)=>({ ...f, stock: Number(e.target.value) }))} type="number" min={0} placeholder="Stock" className={`rounded-xl border px-3 py-2 outline-none focus:ring-2 ${canEdit?"border-gray-200 focus:ring-green-600/30":"border-gray-100 bg-gray-50 text-gray-400"}`} />
          <input disabled={!canEdit} value={form.unit || ""} onChange={(e)=>setForm((f)=>({ ...f, unit: e.target.value }))} placeholder="Unit" className={`rounded-xl border px-3 py-2 outline-none focus:ring-2 ${canEdit?"border-gray-200 focus:ring-green-600/30":"border-gray-100 bg-gray-50 text-gray-400"}`} />
          <input disabled={!canEdit} value={form.price ?? 0} onChange={(e)=>setForm((f)=>({ ...f, price: Number(e.target.value) }))} type="number" min={0} step="0.01" placeholder="Price" className={`rounded-xl border px-3 py-2 outline-none focus:ring-2 ${canEdit?"border-gray-200 focus:ring-green-600/30":"border-gray-100 bg-gray-50 text-gray-400"}`} />
        </div>
        <div className="mt-3 flex gap-2">
          <button disabled={!canEdit} onClick={saveItem} className={`rounded-xl px-4 py-2 font-medium transition ${canEdit?"bg-green-600 text-white hover:bg-green-700":"cursor-not-allowed bg-gray-200 text-gray-500"}`}>{editingId?"Save Changes":"Add Item"}</button>
          {editingId && (
            <button disabled={!canEdit} onClick={()=>{ setEditingId(null); resetForm(); }} className={`rounded-xl px-4 py-2 font-medium ring-1 transition ${canEdit?"bg-white text-gray-700 ring-gray-200 hover:bg-gray-50":"cursor-not-allowed bg-gray-200 text-gray-500 ring-gray-200"}`}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
}
