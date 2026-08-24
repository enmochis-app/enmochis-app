"use client";

import { useEffect, useState, useCallback } from "react";
import type { Addon } from "@/lib/negocios";

function FilaAddon({ addon, onGuardado }: { addon: Addon; onGuardado: () => void }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(addon.nombre);
  const [descripcion, setDescripcion] = useState(addon.descripcion);
  const [icono, setIcono] = useState(addon.icono);
  const [precio, setPrecio] = useState(String(addon.precio));
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    try {
      await fetch(`/api/admin/addons/${addon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion, icono, precio: Number(precio) || 0 }),
      });
      setEditando(false);
      onGuardado();
    } finally {
      setGuardando(false);
    }
  }

  async function alternarActivo() {
    await fetch(`/api/admin/addons/${addon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !addon.activo }),
    });
    onGuardado();
  }

  if (editando) {
    return (
      <tr>
        <td>
          <input value={icono} onChange={(e) => setIcono(e.target.value)} style={{ width: 44 }} />
        </td>
        <td>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: "100%" }} />
        </td>
        <td>
          <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={{ width: "100%" }} />
        </td>
        <td>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            style={{ width: 80 }}
          />
        </td>
        <td>{addon.activo ? "Activo" : "Inactivo"}</td>
        <td style={{ display: "flex", gap: 10 }}>
          <button className="admin-link" onClick={guardar} disabled={guardando}>
            Guardar
          </button>
          <button className="admin-link" onClick={() => setEditando(false)} disabled={guardando}>
            Cancelar
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{addon.icono}</td>
      <td>{addon.nombre}</td>
      <td>{addon.descripcion || "—"}</td>
      <td>${addon.precio}/mes</td>
      <td>{addon.activo ? "Activo" : "Inactivo"}</td>
      <td style={{ display: "flex", gap: 10 }}>
        <button className="admin-link" onClick={() => setEditando(true)}>
          Editar
        </button>
        <button className="admin-link" onClick={alternarActivo}>
          {addon.activo ? "Desactivar" : "Activar"}
        </button>
      </td>
    </tr>
  );
}

export default function AddonsPage() {
  const [addons, setAddons] = useState<Addon[] | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [icono, setIcono] = useState("✨");
  const [precio, setPrecio] = useState("100");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    const res = await fetch("/api/admin/addons");
    const body = await res.json();
    setAddons(body.addons);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargar();
  }, [cargar]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setCreando(true);
    setError("");
    try {
      const res = await fetch("/api/admin/addons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion, icono, precio: Number(precio) || 0 }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "No se pudo crear el addon.");
      setNombre("");
      setDescripcion("");
      setIcono("✨");
      setPrecio("100");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el addon.");
    } finally {
      setCreando(false);
    }
  }

  if (!addons) return <p>Cargando...</p>;

  return (
    <>
      <div className="admin-head-row">
        <h1 style={{ fontSize: 20 }}>Addons</h1>
      </div>

      <div className="admin-section">
        <h2>Nuevo addon</h2>
        <div className="admin-small" style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          Un addon nuevo queda disponible de inmediato para activarse en cualquier negocio, y
          aparece como una píldora de servicio en su minisitio — sin que se necesite tocar código.
        </div>
        <form onSubmit={crear} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="admin-field" style={{ width: 60 }}>
            <label>Ícono</label>
            <input value={icono} onChange={(e) => setIcono(e.target.value)} />
          </div>
          <div className="admin-field" style={{ flex: 1, minWidth: 160 }}>
            <label>Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="admin-field" style={{ flex: 2, minWidth: 220 }}>
            <label>Características (descripción corta)</label>
            <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <div className="admin-field" style={{ width: 100 }}>
            <label>Precio/mes</label>
            <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
          </div>
          <button className="admin-btn" type="submit" disabled={creando}>
            {creando ? "Creando..." : "+ Crear addon"}
          </button>
        </form>
        {error && <div className="admin-error">{error}</div>}
      </div>

      <div className="admin-section">
        <h2>Catálogo ({addons.length})</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Nombre</th>
              <th>Características</th>
              <th>Precio</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {addons.map((a) => (
              <FilaAddon key={a.id} addon={a} onGuardado={cargar} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
