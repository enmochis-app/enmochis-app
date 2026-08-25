"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PortalTopbar() {
  const router = useRouter();

  async function salir() {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <div className="admin-topbar">
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Link href="/portal">Tu portal</Link>
        <Link href="/portal/menu">Menú</Link>
        <Link href="/portal/lealtad">Lealtad</Link>
      </div>
      <button onClick={salir}>Salir</button>
    </div>
  );
}
