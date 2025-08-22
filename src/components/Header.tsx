
import type { Role } from "../types";


export default function Header({ role }: { role: Role }) {
return (
<div className="mb-6 flex items-center justify-between">
<h1 className="text-2xl font-semibold text-green-700">Medical Inventory</h1>
<span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
Role: {role.toUpperCase()}
</span>
</div>
);
}