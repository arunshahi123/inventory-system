// pages/Sales.tsx
import React from "react";
import { useState } from "react";

import type { InventoryItem, Sale } from "../types";

interface Props {
  role: "admin" | "staff";
  data: Sale[];
  inventory: InventoryItem[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

export default function SalesPage({ role, data, inventory, setSales, setInventory }: Props) {
  const [showAddTable, setShowAddTable] = React.useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Sale>("itemName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Add sale state
  const [newSale, setNewSale] = useState<Partial<Sale>>({
    itemId: inventory[0]?.id ?? "",
    itemName: inventory[0]?.name ?? "",
    quantity: 1,
    date: new Date().toISOString().slice(0, 10),
  });
  const handleAddSale = () => {
    if (!newSale.itemId || !newSale.itemName || !newSale.quantity || !newSale.date) return;
    setSales((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        itemId: newSale.itemId!,
        itemName: newSale.itemName!,
        quantity: newSale.quantity!,
        date: newSale.date!,
      },
    ]);
    // Reduce inventory stock
    setInventory((prev) => prev.map(item =>
      item.id === newSale.itemId
        ? { ...item, stock: Math.max(0, item.stock - Number(newSale.quantity)) }
        : item
    ));
    setNewSale({
      itemId: inventory[0]?.id ?? "",
      itemName: inventory[0]?.name ?? "",
      quantity: 1,
      date: new Date().toISOString().slice(0, 10),
    });
  };

  const filtered = (data ?? []).filter((s) =>
    (s.itemName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const exportCSV = () => {
    const headers = ["ID", "Item", "Qty", "Date"];
    const rows = (data ?? []).map((s) => [s.id, s.itemName, s.quantity, s.date]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales.csv";
    a.click();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sales</h1>

      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search sales..."
          className="border p-2 rounded w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-row items-end gap-4">
          <button
            onClick={exportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded shadow"
          >
            Export CSV
          </button>
          {role === "admin" && (
            <button
              onClick={() => setShowAddTable((prev) => !prev)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {showAddTable ? "Hide Add Table" : "Add Sale"}
            </button>
          )}
        </div>
      </div>


      {/* Add Sale Table (Admin only, toggled) */}
      {role === "admin" && showAddTable && (
        <div className="mb-6 p-4">
          <table className="w-full text-left bg-white rounded shadow mt-2">
            <thead>
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Quantity</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2">
                  <select value={newSale.itemId} onChange={e => {
                    const item = inventory.find(i => i.id === e.target.value);
                    setNewSale(s => ({ ...s, itemId: e.target.value, itemName: item?.name ?? "" }));
                  }} className="border p-2 rounded w-full">
                    {inventory.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input type="number" placeholder="Quantity" value={newSale.quantity ?? 1} onChange={e => setNewSale(s => ({ ...s, quantity: Number(e.target.value) }))} className="border p-2 rounded w-full" />
                </td>
                <td className="px-3 py-2">
                  <input type="date" value={newSale.date ?? ""} onChange={e => setNewSale(s => ({ ...s, date: e.target.value }))} className="border p-2 rounded w-full" />
                </td>
                <td className="px-3 py-2">
                  <button onClick={handleAddSale} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Main Sales Table */}
      <div className="mb-6 p-4">
        <table className="w-full text-left bg-white rounded shadow mt-2">
          <thead>
            <tr>
              {["id", "itemName", "quantity", "date"].map((field) => (
                <th
                  key={field}
                  className="cursor-pointer px-3 py-2"
                  onClick={() => {
                    setSortField(field as keyof Sale);
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  {field.toUpperCase()} {sortField === field ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
              {role === "admin" && <th className="px-3 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.map((sale, idx) => {
              const [editIdx, setEditIdx] = useState<number | null>(null);
              const [editSale, setEditSale] = useState<Sale | null>(null);
              return editIdx === idx ? (
                <tr key={sale.id} className="bg-yellow-50">
                  <td className="px-3 py-2">{sale.id}</td>
                  <td className="px-3 py-2"><input value={editSale?.itemName ?? ""} onChange={e => setEditSale(s => s ? { ...s, itemName: e.target.value } : s)} className="border p-1 rounded w-full" /></td>
                  <td className="px-3 py-2"><input type="number" value={editSale?.quantity ?? 1} onChange={e => setEditSale(s => s ? { ...s, quantity: Number(e.target.value) } : s)} className="border p-1 rounded w-full" /></td>
                  <td className="px-3 py-2"><input type="date" value={editSale?.date ?? ""} onChange={e => setEditSale(s => s ? { ...s, date: e.target.value } : s)} className="border p-1 rounded w-full" /></td>
                  <td className="px-3 py-2">
                    <button className="text-green-600 mr-2" onClick={() => {
                      setSales(sales => sales.map((s, i) => i === idx ? (editSale as Sale) : s));
                      setEditIdx(null);
                      setEditSale(null);
                    }}>Save</button>
                    <button className="text-gray-600" onClick={() => { setEditIdx(null); setEditSale(null); }}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{sale.id}</td>
                  <td className="px-3 py-2">{sale.itemName}</td>
                  <td className="px-3 py-2">{sale.quantity}</td>
                  <td className="px-3 py-2">{sale.date}</td>
                  {role === "admin" && (
                    <td className="px-3 py-2">
                      <button className="text-blue-600 mr-2" onClick={() => { setEditIdx(idx); setEditSale(sale); }}>Edit</button>
                      <button className="text-red-600" onClick={() => { setSales(sales => sales.filter((_, i) => i !== idx)); }}>Delete</button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
