import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// -------------------------------------------------------------
// Types
// -------------------------------------------------------------

type Role = "admin" | "staff";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string; // e.g., box, vial, strip
  price: number; // per unit
};

type Sale = {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  date: string; // ISO date
};

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------

const uid = () => Math.random().toString(36).slice(2, 9);

const todayISO = () => new Date().toISOString().slice(0, 10);

function lastNDates(n: number) {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    out.push({ key, label });
  }
  return out;
}

// Tailwind utility (white & green theme accents)
const theme = {
  brand: "text-green-700",
  brandBg: "bg-green-600",
  brandRing: "ring-green-600/30",
  brandMuted: "text-green-600",
};

// -------------------------------------------------------------
// Seed Data (demo)
// -------------------------------------------------------------

const seedInventory: InventoryItem[] = [
  { id: uid(), name: "Paracetamol 500mg", category: "Analgesic", stock: 120, unit: "strip", price: 1.2 },
  { id: uid(), name: "Amoxicillin 250mg", category: "Antibiotic", stock: 80, unit: "box", price: 3.5 },
  { id: uid(), name: "ORS Sachet", category: "Electrolyte", stock: 200, unit: "sachet", price: 0.4 },
  { id: uid(), name: "Insulin 10ml", category: "Endocrine", stock: 35, unit: "vial", price: 12.9 },
];

const seedSales: Sale[] = [
  { id: uid(), itemId: "seed-1", itemName: "Paracetamol 500mg", quantity: 8, date: new Date(Date.now()-6*86400000).toISOString().slice(0,10) },
  { id: uid(), itemId: "seed-2", itemName: "Amoxicillin 250mg", quantity: 5, date: new Date(Date.now()-4*86400000).toISOString().slice(0,10) },
  { id: uid(), itemId: "seed-3", itemName: "ORS Sachet", quantity: 20, date: new Date(Date.now()-2*86400000).toISOString().slice(0,10) },
  { id: uid(), itemId: "seed-4", itemName: "Insulin 10ml", quantity: 2, date: todayISO() },
];

// -------------------------------------------------------------
// App
// -------------------------------------------------------------

export default function App() {
  const [role, setRole] = useState<Role | null>(() => {
    const r = sessionStorage.getItem("role");
    return (r as Role) || null;
  });

  const [page, setPage] = useState<"dashboard" | "inventory" | "sales">("dashboard");
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const raw = sessionStorage.getItem("inventory");
    return raw ? (JSON.parse(raw) as InventoryItem[]) : seedInventory;
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const raw = sessionStorage.getItem("sales");
    return raw ? (JSON.parse(raw) as Sale[]) : seedSales;
  });

  useEffect(() => {
    sessionStorage.setItem("inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    sessionStorage.setItem("sales", JSON.stringify(sales));
  }, [sales]);

  const logout = () => {
    sessionStorage.removeItem("role");
    setRole(null);
  };

  if (!role) return <Login onLogin={(r) => { setRole(r); sessionStorage.setItem("role", r); }} />;

  const canEdit = role === "admin";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        <Sidebar current={page} onNavigate={setPage} role={role} onLogout={logout} />
        <main className="flex-1 p-4 sm:p-8">
          <Header role={role} />
          {page === "dashboard" && (
            <Dashboard inventory={inventory} sales={sales} />
          )}
          {page === "inventory" && (
            <InventoryPage
              items={inventory}
              setItems={setInventory}
              canEdit={canEdit}
            />
          )}
          {page === "sales" && (
            <SalesPage
              items={inventory}
              setItems={setInventory}
              sales={sales}
              setSales={setSales}
              canEdit={canEdit}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Layout Components
// -------------------------------------------------------------

function Header({ role }: { role: Role }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className={`text-2xl font-semibold ${theme.brand}`}>Medical Inventory</h1>
      <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
        Role: {role.toUpperCase()}
      </span>
    </div>
  );
}

function Sidebar({ current, onNavigate, role, onLogout }: { current: string; onNavigate: (p: any) => void; role: Role; onLogout: () => void; }) {
  const link = (key: any, label: string) => (
    <button
      onClick={() => onNavigate(key)}
      className={`w-full text-left rounded-xl px-4 py-2 font-medium transition ${current === key ? "bg-green-600 text-white shadow" : "hover:bg-green-50 text-gray-700"}`}
    >
      {label}
    </button>
  );
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-white/70 p-4 backdrop-blur sm:block">
      <div className="mb-6">
        <div className="text-xl font-bold text-green-700">MediCare</div>
        <div className="text-xs text-gray-500">White & Green Theme</div>
      </div>
      <nav className="space-y-2">
        {link("dashboard", "Dashboard")}
        {link("inventory", "Inventory")}
        {link("sales", "Sale Item")}
      </nav>
      <div className="mt-8 rounded-xl bg-green-50 p-3 text-sm text-green-700 ring-1 ring-inset ring-green-100">
        <p className="font-semibold">Access</p>
        <p>{role === "admin" ? "Full permissions" : "Read-only (view)"}</p>
      </div>
      <button onClick={onLogout} className="mt-6 w-full rounded-xl border border-green-200 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50">Log out</button>
    </aside>
  );
}

// -------------------------------------------------------------
// Login
// -------------------------------------------------------------

function Login({ onLogin }: { onLogin: (r: Role) => void }) {
  const [role, setRole] = useState<Role>("staff");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-white to-green-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow ring-1 ring-gray-100">
        <h2 className="mb-1 text-2xl font-semibold text-green-700">Sign in</h2>
        <p className="mb-6 text-sm text-gray-600">Choose a panel to continue. (Demo only — no backend)</p>

        <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-green-600/30" />

        <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="••••••••" className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-green-600/30" />

        <label className="mb-3 block text-sm font-medium text-gray-700">Select Panel</label>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button onClick={()=>setRole("admin")} className={`rounded-xl px-4 py-3 ring-1 transition ${role==="admin"?"bg-green-600 text-white ring-green-600/30":"bg-green-50 text-green-700 ring-green-100 hover:bg-green-100"}`}>Admin</button>
          <button onClick={()=>setRole("staff")} className={`rounded-xl px-4 py-3 ring-1 transition ${role==="staff"?"bg-green-600 text-white ring-green-600/30":"bg-green-50 text-green-700 ring-green-100 hover:bg-green-100"}`}>Staff</button>
        </div>

        <button onClick={()=>onLogin(role)} className="w-full rounded-xl bg-green-600 px-4 py-2.5 font-semibold text-white shadow hover:bg-green-700">Continue</button>
        <p className="mt-3 text-center text-xs text-gray-500">Admin = full access · Staff = view only</p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Dashboard
// -------------------------------------------------------------

function Dashboard({ inventory, sales }: { inventory: InventoryItem[]; sales: Sale[] }) {
  const days = useMemo(() => lastNDates(7), []);

  const data = useMemo(() => {
    return days.map((d) => {
      const qty = sales
        .filter((s) => s.date === d.key)
        .reduce((sum, s) => sum + s.quantity, 0);
      return { date: d.label, quantity: qty };
    });
  }, [sales, days]);

  const totalItems = inventory.length;
  const totalStock = inventory.reduce((sum, it) => sum + it.stock, 0);
  const weekUnits = data.reduce((sum, d) => sum + d.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Items" value={totalItems.toString()} />
        <StatCard title="Total Stock" value={totalStock.toString()} />
        <StatCard title="Units Sold (7d)" value={weekUnits.toString()} />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-gray-100">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-700">Weekly Sales (Last 7 Days)</h3>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="quantity" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-gray-100">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

// -------------------------------------------------------------
// Inventory Page
// -------------------------------------------------------------

function InventoryPage({ items, setItems, canEdit }: { items: InventoryItem[]; setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>; canEdit: boolean; }) {
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

// -------------------------------------------------------------
// Sales Page
// -------------------------------------------------------------

function SalesPage({ items, setItems, sales, setSales, canEdit }: { items: InventoryItem[]; setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>; sales: Sale[]; setSales: React.Dispatch<React.SetStateAction<Sale[]>>; canEdit: boolean; }) {
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

    // reduce stock
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

// -------------------------------------------------------------
// Styles note: Tailwind must be included in your project.
// Minimal tailwind setup (guide):
// 1) npm create vite@latest my-app -- --template react-ts
// 2) cd my-app && npm i && npm i -D tailwindcss postcss autoprefixer recharts
// 3) npx tailwindcss init -p
// 4) tailwind.config.js -> content: ["./index.html", "./src/**/*.{ts,tsx}"], theme: { extend: {} }, plugins: []
// 5) src/index.css -> @tailwind base; @tailwind components; @tailwind utilities;
// 6) Wrap app with this file as src/App.tsx and run: npm run dev
// -------------------------------------------------------------
