"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Negocio } from "@/lib/negocios";

const ETIQUETAS_ESTADO: Record<string, string> = {
  solicitud: "Solicitud",
  revision: "En revisión",
  prueba: "Prueba",
  activo: "Activo",
  destacado: "Destacado",
  archivado: "Archivado",
};

function estadoRenovacion(fecha?: string): "rojo" | "amarillo" | "verde" | null {
  if (!fecha) return null;
  const dias = (new Date(fecha).getTime() - Date.now()) / 86400000;
  if (dias < 0) return "rojo";
  if (dias < 15) return "amarillo";
  return "verde";
}

function EstadoBadge({ estado }: { estado: string }) {
  return <span className={`admin-badge admin-badge-${estado}`}>{ETIQUETAS_ESTADO[estado] ?? estado}</span>;
}

function CopiarLink({ href }: { href: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      className="admin-link"
      onClick={async () => {
        await navigator.clipboard.writeText(href);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1500);
      }}
    >
      {copiado ? "¡Copiado!" : "Copiar link para completar"}
    </button>
  );
}

export default function AdminDashboard() {
  const [negocios, setNegocios] = useState<Negocio[] | null>(null);
  const [origin, setOrigin] = useState("");

  const cargar = useCallback(async () => {
    const res = await fetch("/api/admin/negocios");
    const body = await res.json();
    setNegocios(body.negocios);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargar();
    setOrigin(window.location.origin);
  }, [cargar]);

  async function publicar(id: string) {
    await fetch(`/api/admin/negocios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "activo" }),
    });
    cargar();
  }

  if (!negocios) return <p>Cargando...</p>;

  const solicitudes = negocios.filter((n) => n.estado === "solicitud");
  const enRevision = negocios.filter((n) => n.estado === "revision");
  const resto = negocios.filter((n) => n.estado !== "solicitud" && n.estado !== "revision");

  return (
    <>
      <div className="admin-head-row">
        <h1 style={{ fontSize: 20 }}>Negocios</h1>
        <Link href="/admin/negocios/nuevo" className="admin-btn">
          + Nuevo negocio
        </Link>
      </div>

      {solicitudes.length > 0 && (
        <div className="admin-section">
          <h2>Bandeja de entrada — Solicitudes nuevas ({solicitudes.length})</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Negocio</th>
                <th>Categoría</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((n) => (
                <tr key={n.id}>
                  <td>{n.nombre}</td>
                  <td>{n.categoria}</td>
                  <td>{n.contactoNombre ?? "—"}</td>
                  <td>{n.telefono ?? "—"}</td>
                  <td style={{ display: "flex", gap: 12 }}>
                    <CopiarLink href={`${origin}/completar/${n.id}`} />
                    <Link className="admin-link" href={`/admin/negocios/${n.id}/editar`}>
                      Editar yo mismo
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {enRevision.length > 0 && (
        <div className="admin-section">
          <h2>En revisión — Esperando tu aprobación ({enRevision.length})</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Negocio</th>
                <th>Categoría</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {enRevision.map((n) => (
                <tr key={n.id}>
                  <td>{n.nombre}</td>
                  <td>{n.categoria}</td>
                  <td style={{ display: "flex", gap: 12 }}>
                    <Link className="admin-link" href={`/admin/vista-previa/${n.id}`} target="_blank">
                      Ver vista previa
                    </Link>
                    <Link className="admin-link" href={`/admin/negocios/${n.id}/editar`}>
                      Editar
                    </Link>
                    <button className="admin-link" onClick={() => publicar(n.id)}>
                      Publicar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="admin-section">
        <h2>Todos los negocios ({resto.length})</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Negocio</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Plan</th>
              <th>Renovación</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {resto.map((n) => {
              const renovacion = estadoRenovacion(n.fechaProximaRenovacion);
              return (
                <tr key={n.id}>
                  <td>{n.nombre}</td>
                  <td>{n.categoria}</td>
                  <td>
                    <EstadoBadge estado={n.estado} />
                  </td>
                  <td>{n.plan ?? "—"}</td>
                  <td>
                    {n.fechaProximaRenovacion ? (
                      <span className={renovacion ? `admin-warn-${renovacion}` : ""}>
                        {n.fechaProximaRenovacion}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ display: "flex", gap: 12 }}>
                    <Link className="admin-link" href={`/admin/vista-previa/${n.id}`} target="_blank">
                      Ver
                    </Link>
                    <Link className="admin-link" href={`/admin/negocios/${n.id}/editar`}>
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
