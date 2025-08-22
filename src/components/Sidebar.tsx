
import type { Role } from "../types";


export default function Sidebar({ current, onNavigate, role, onLogout }: { current: string; onNavigate: (p: any) => void; role: Role; onLogout: () => void; }) {
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