"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminTopbar() {
  const router = useRouter();

  async function salir() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-topbar">
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Link href="/admin">Admin EnMochis</Link>
        <Link href="/admin/addons">Addons</Link>
      </div>
      <button onClick={salir}>Salir</button>
    </div>
  );
}
