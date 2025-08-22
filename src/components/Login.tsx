import { useState } from "react";
import type { Role } from "../types";


export default function Login({ onLogin }: { onLogin: (r: Role) => void }) {
const [role, setRole] = useState<Role>("staff");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");


return (
<div className="min-h-screen grid place-items-center bg-gradient-to-br from-white to-green-50 p-6">
<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow ring-1 ring-gray-100">
<h2 className="mb-1 text-2xl font-semibold text-green-700">Sign in</h2>
<p className="mb-6 text-sm text-gray-600">Choose a panel to continue. (Demo only)</p>


<input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2" />


<input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="••••••••" className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2" />


<div className="mb-6 grid grid-cols-2 gap-3">
<button onClick={()=>setRole("admin")} className={`rounded-xl px-4 py-3 ${role==="admin"?"bg-green-600 text-white":"bg-green-50 text-green-700"}`}>Admin</button>
<button onClick={()=>setRole("staff")} className={`rounded-xl px-4 py-3 ${role==="staff"?"bg-green-600 text-white":"bg-green-50 text-green-700"}`}>Staff</button>
</div>


<button onClick={()=>onLogin(role)} className="w-full rounded-xl bg-green-600 px-4 py-2.5 font-semibold text-white hover:bg-green-700">Continue</button>
</div>
</div>
);
}