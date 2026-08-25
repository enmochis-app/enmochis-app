"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Negocio } from "@/lib/negocios";

export default function PortalHomePage() {
  const [negocio, setNegocio] = useState<Negocio | null>(null);

  const cargar = useCallback(async () => {
    const res = await fetch("/api/portal/negocio");
    if (!res.ok) return;
    const body = await res.json();
    setNegocio(body.negocio);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargar();
  }, [cargar]);

  if (!negocio) return <p>Cargando...</p>;

  return (
    <>
      <div className="admin-head-row">
        <h1 style={{ fontSize: 20 }}>{negocio.nombre}</h1>
      </div>
      <div className="admin-section">
        <h2>Bienvenido a tu portal</h2>
        <p className="admin-small" style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
          Desde aquí puedes editar tu menú y manejar tu programa de lealtad.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/portal/menu" className="admin-btn">
            Editar mi menú
          </Link>
          <Link href="/portal/lealtad" className="admin-btn admin-btn-secondary">
            Programa de lealtad
          </Link>
        </div>
      </div>
    </>
  );
}
