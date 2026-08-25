"use client";

import { useEffect, useState, useCallback } from "react";
import type { MenuItemInput } from "@/lib/menuItems";
import MenuEditor from "@/components/MenuEditor";

export default function PortalMenuPage() {
  const [items, setItems] = useState<MenuItemInput[] | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    const res = await fetch("/api/portal/menu");
    if (!res.ok) return;
    const body = await res.json();
    setItems(body.items ?? []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargar();
  }, [cargar]);

  async function guardar() {
    if (!items) return;
    setGuardando(true);
    setError("");
    setOk(false);
    try {
      const res = await fetch("/api/portal/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("No se pudo guardar.");
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  if (!items) return <p>Cargando...</p>;

  return (
    <>
      <div className="admin-head-row">
        <h1 style={{ fontSize: 20 }}>Mi menú</h1>
      </div>
      <div className="admin-section">
        <div className="admin-small" style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          Marca &quot;Se puede pedir por WhatsApp&quot; en los productos que quieras que tus
          clientes puedan agregar al carrito de pedidos de tu minisitio.
        </div>
        <MenuEditor items={items} onChange={setItems} />
        <button className="admin-btn" type="button" onClick={guardar} disabled={guardando} style={{ marginTop: 14 }}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
        {ok && <span style={{ marginLeft: 10, color: "#14532d" }}>Guardado ✓</span>}
        {error && <div className="admin-error">{error}</div>}
      </div>
    </>
  );
}
