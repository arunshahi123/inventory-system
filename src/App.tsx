import  { useState } from "react";
import type { Role, InventoryItem, Sale } from "./types";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import InventoryPage from "./components/InventoryPage";
import SalesPage from "./components/SalesPage";


import { uid, todayISO } from "./types";


const seedInventory: InventoryItem[] = [
{ id: uid(), name: "Paracetamol 500mg", category: "Analgesic", stock: 120, unit: "strip", price: 1.2 },
{ id: uid(), name: "Amoxicillin 250mg", category: "Antibiotic", stock: 80, unit: "box", price: 3.5 },
];


const seedSales: Sale[] = [
{ id: uid(), itemId: "seed-1", itemName: "Paracetamol 500mg", quantity: 8, date: todayISO() },
];


export default function App() {
const [role, setRole] = useState<Role | null>(null);
const [page, setPage] = useState<"dashboard" | "inventory" | "sales">("dashboard");
const [inventory, setInventory] = useState<InventoryItem[]>(seedInventory);
const [sales, setSales] = useState<Sale[]>(seedSales);


const logout = () => setRole(null);
if (!role) return <Login onLogin={(r) => setRole(r)} />;


const canEdit = role === "admin";


return (
<div className="min-h-screen bg-gray-50 text-gray-900">
<div className="flex">
<Sidebar current={page} onNavigate={setPage} role={role} onLogout={logout} />
<main className="flex-1 p-4 sm:p-8">
<Header role={role} />
{page === "dashboard" && <Dashboard inventory={inventory} sales={sales} />}
{page === "inventory" && <InventoryPage items={inventory} setItems={setInventory} canEdit={canEdit} />}
{page === "sales" && <SalesPage items={inventory} setItems={setInventory} sales={sales} setSales={setSales} canEdit={canEdit} />}
</main>
</div>
</div>
);
}