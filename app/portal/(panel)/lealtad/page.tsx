"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Negocio } from "@/lib/negocios";

export default function PortalLealtadPage() {
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [modo, setModo] = useState<"visitas" | "puntos">("visitas");
  const [porcentaje, setPorcentaje] = useState("0");
  const [meta, setMeta] = useState("10");
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetch("/api/portal/negocio");
    if (!res.ok) return;
    const body = await res.json();
    const n: Negocio = body.negocio;
    setNegocio(n);
    setModo(n.lealtadModo);
    setPorcentaje(String(n.lealtadPorcentaje));
    setMeta(String(n.lealtadMeta));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargar();
  }, [cargar]);

  async function guardar() {
    setGuardando(true);
    setOk(false);
    try {
      await fetch("/api/portal/negocio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lealtadModo: modo,
          lealtadPorcentaje: Number(porcentaje) || 0,
          lealtadMeta: Number(meta) || 10,
        }),
      });
      setOk(true);
    } finally {
      setGuardando(false);
    }
  }

  if (!negocio) return <p>Cargando...</p>;

  return (
    <>
      <div className="admin-head-row">
        <h1 style={{ fontSize: 20 }}>Programa de lealtad</h1>
        <Link href="/portal/lealtad/escanear" className="admin-btn">
          Escanear código de cliente
        </Link>
      </div>
      <div className="admin-section">
        <div className="admin-small" style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          No guardamos ningún dato personal del cliente — solo un código anónimo y su contador de
          visitas o puntos.
        </div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label>Modo</label>
            <select value={modo} onChange={(e) => setModo(e.target.value as "visitas" | "puntos")}>
              <option value="visitas">Por visitas</option>
              <option value="puntos">Por puntos (% de la compra)</option>
            </select>
          </div>
          <div className="admin-field">
            <label>Meta para canjear</label>
            <input value={meta} onChange={(e) => setMeta(e.target.value)} inputMode="numeric" />
          </div>
        </div>
        {modo === "puntos" && (
          <div className="admin-field">
            <label>Porcentaje de la compra en puntos</label>
            <input value={porcentaje} onChange={(e) => setPorcentaje(e.target.value)} inputMode="numeric" placeholder="Ej. 6" />
          </div>
        )}
        <button className="admin-btn" type="button" onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
        {ok && <span style={{ marginLeft: 10, color: "#14532d" }}>Guardado ✓</span>}
      </div>
    </>
  );
}
