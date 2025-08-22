import  { useMemo } from "react";
import type { InventoryItem, Sale } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


const lastNDates = (n: number) => {
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
};


export default function Dashboard({ inventory, sales }: { inventory: InventoryItem[]; sales: Sale[] }) {
const days = useMemo(() => lastNDates(7), []);
const data = useMemo(() => {
return days.map((d) => {
const qty = sales.filter((s) => s.date === d.key).reduce((sum, s) => sum + s.quantity, 0);
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
<div className="rounded-2xl bg-white p-4 shadow">
<h3 className="mb-2 text-lg font-semibold text-green-700">Weekly Sales</h3>
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
<div className="rounded-2xl bg-white p-4 shadow">
<div className="text-sm text-gray-500">{title}</div>
<div className="mt-1 text-2xl font-semibold">{value}</div>
</div>
);
}