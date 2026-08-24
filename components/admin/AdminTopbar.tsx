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
      <Link href="/admin">Admin EnMochis</Link>
      <button onClick={salir}>Salir</button>
    </div>
  );
}
