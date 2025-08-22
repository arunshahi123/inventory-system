import React, { useState, useEffect } from "react";
import type { InventoryItem, Sale } from "../types";

const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);

export default function SellItem({ items, setItems, sales, setSales, canEdit }: { items: InventoryItem[]; setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>; sales: Sale[]; setSales: React.Dispatch<React.SetStateAction<Sale[]>>; canEdit: boolean; }) {
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id || "");
  const [qty, setQty] = useState<number>(1);
  const [date, setDate] = useState<string>(todayISO());
  useEffect(()=>{
    if (!items.find(i=>i.id===selectedId) && items.length) setSelectedId(items[0].id);
  }, [items, selectedId]);
  const addSale = () => {
    if (!canEdit) return;
    const item = items.find((i) => i.id === selectedId);
    if (!item) return;
    if (qty <= 0) return;
    if (item.stock < qty) { alert("Not enough stock"); return; }
    setSales((prev) => [
      ...prev,
      { id: uid(), itemId: item.id, itemName: item.name, quantity: qty, date },
    ]);
    setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, stock: p.stock - qty } : p)));
    setQty(1);
    setDate(todayISO());
  };
  const totalSales = sales.length;
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-gray-100">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-700">Sell Item</h3>
          <div className="text-sm text-gray-500">Records: {totalSales}</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <select disabled={!canEdit} value={selectedId} onChange={(e)=>setSelectedId(e.target.value)} className={`rounded-xl border px-3 py-2 outline-none focus:ring-2 ${canEdit?"border-gray-200 focus:ring-green-600/30":"border-gray-100 bg-gray-50 text-gray-400"}`}>
            {items.map((it) => (
              <option key={it.id} value={it.id}>{it.name} (stock {it.stock})</option>
            ))}
          </select>
          <input disabled={!canEdit} value={qty} onChange={(e)=>setQty(Number(e.target.value))} type="number" min={1} placeholder="Quantity" className={`rounded-xl border px-3 py-2 outline-none focus:ring-2 ${canEdit?"border-gray-200 focus:ring-green-600/30":"border-gray-100 bg-gray-50 text-gray-400"}`} />
          <input disabled={!canEdit} value={date} onChange={(e)=>setDate(e.target.value)} type="date" className={`rounded-xl border px-3 py-2 outline-none focus:ring-2 ${canEdit?"border-gray-200 focus:ring-green-600/30":"border-gray-100 bg-gray-50 text-gray-400"}`} />
          <button disabled={!canEdit} onClick={addSale} className={`rounded-xl px-4 py-2 font-medium transition ${canEdit?"bg-green-600 text-white hover:bg-green-700":"cursor-not-allowed bg-gray-200 text-gray-500"}`}>Add Sale</button>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-gray-100">
        <h3 className="mb-3 text-lg font-semibold text-green-700">Sales Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-600">
                <th className="p-2">Date</th>
                <th className="p-2">Item</th>
                <th className="p-2">Qty</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.date}</td>
                  <td className="p-2">{s.itemName}</td>
                  <td className="p-2">{s.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
