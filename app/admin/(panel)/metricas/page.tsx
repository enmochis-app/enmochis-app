"use client";

import { useEffect, useState, useCallback } from "react";
import { TIPOS_EVENTO } from "@/lib/negocios";

type FilaMetrica = {
  id: string;
  nombre: string;
  slug: string;
  metricas: Record<string, number>;
};

export default function MetricasPage() {
  const [filas, setFilas] = useState<FilaMetrica[] | null>(null);

  const cargar = useCallback(async () => {
    const res = await fetch("/api/admin/metricas");
    const body = await res.json();
    setFilas(body.filas);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargar();
  }, [cargar]);

  if (!filas) return <p>Cargando...</p>;

  const nombreMes = new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  return (
    <>
      <div className="admin-head-row">
        <h1 style={{ fontSize: 20 }}>Métricas — {nombreMes}</h1>
      </div>

      <div className="admin-section">
        <div className="admin-small" style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          Contadores del mes calendario actual, por negocio.
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Negocio</th>
              {TIPOS_EVENTO.map((t) => (
                <th key={t.tipo}>{t.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id}>
                <td>{f.nombre}</td>
                {TIPOS_EVENTO.map((t) => (
                  <td key={t.tipo}>{f.metricas[t.tipo] ?? 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
