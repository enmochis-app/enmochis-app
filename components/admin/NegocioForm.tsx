"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { CATEGORIAS, type Negocio, type Estado, type Categoria } from "@/lib/airtable";
import ImageUploadField from "@/components/ImageUploadField";

const ADDONS: { key: keyof Negocio; label: string }[] = [
  { key: "addonWhatsapp", label: "WhatsApp" },
  { key: "addonMapas", label: "Mapas" },
  { key: "addonGaleria", label: "Galería" },
  { key: "addonFormularioContacto", label: "Formulario de contacto" },
  { key: "addonPedidos", label: "Pedidos" },
  { key: "addonReservaciones", label: "Reservaciones" },
  { key: "addonQrMesa", label: "QR en mesa" },
  { key: "addonLealtad", label: "Lealtad" },
  { key: "addonMultiSucursal", label: "Multi-sucursal" },
];

const ESTADOS: { value: Estado; label: string }[] = [
  { value: "solicitud", label: "Solicitud" },
  { value: "revision", label: "En revisión" },
  { value: "prueba", label: "Prueba" },
  { value: "activo", label: "Activo" },
  { value: "destacado", label: "Destacado" },
  { value: "archivado", label: "Archivado" },
];

type MenuItem = { nombre: string; precio: string };

export default function NegocioForm({
  negocio,
  onRecargar,
}: {
  negocio: Negocio | null;
  onRecargar?: () => void;
}) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  // Datos básicos (usados tanto para crear como editar)
  const [nombre, setNombre] = useState(negocio?.nombre ?? "");
  const [categoria, setCategoria] = useState<Categoria>(negocio?.categoria ?? "Restaurantes");
  const [descripcionCorta, setDescripcionCorta] = useState(negocio?.descripcionCorta ?? "");

  // Solo aplican una vez que el negocio ya existe (modo editar)
  const [descripcionLarga, setDescripcionLarga] = useState(negocio?.descripcionLarga ?? "");
  const [estado, setEstado] = useState<Estado>(negocio?.estado ?? "solicitud");
  const [plan, setPlan] = useState(negocio?.plan ?? "");
  const [fechaProximaRenovacion, setFechaProximaRenovacion] = useState(
    negocio?.fechaProximaRenovacion ?? ""
  );
  const [telefono, setTelefono] = useState(negocio?.telefono ?? "");
  const [whatsapp, setWhatsapp] = useState(negocio?.whatsapp ?? "");
  const [direccion, setDireccion] = useState(negocio?.direccion ?? "");
  const [instagram, setInstagram] = useState(negocio?.instagram ?? "");
  const [facebook, setFacebook] = useState(negocio?.facebook ?? "");
  const [horarios, setHorarios] = useState(negocio?.horarios ?? "");
  const [menu, setMenu] = useState<MenuItem[]>(
    negocio && negocio.menu.length > 0
      ? negocio.menu.map((m) => ({ nombre: m.nombre, precio: m.precio ?? "" }))
      : [{ nombre: "", precio: "" }]
  );
  const [addons, setAddons] = useState<Record<string, boolean>>(() => {
    const inicial: Record<string, boolean> = {};
    for (const a of ADDONS) inicial[a.key as string] = negocio ? Boolean(negocio[a.key]) : false;
    return inicial;
  });

  function actualizarMenuFila(i: number, campo: "nombre" | "precio", valor: string) {
    setMenu((prev) => prev.map((fila, idx) => (idx === i ? { ...fila, [campo]: valor } : fila)));
  }
  function agregarFilaMenu() {
    setMenu((prev) => [...prev, { nombre: "", precio: "" }]);
  }
  function quitarFilaMenu(i: number) {
    setMenu((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const res = await fetch("/api/admin/negocios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, categoria, descripcionCorta, estado: "prueba" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "No se pudo crear el negocio.");
      router.push(`/admin/negocios/${body.id}/editar`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el negocio.");
      setGuardando(false);
    }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!negocio) return;
    setGuardando(true);
    setError("");
    setOk(false);
    try {
      const res = await fetch(`/api/admin/negocios/${negocio.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          categoria,
          descripcionCorta,
          descripcionLarga,
          estado,
          plan: plan || undefined,
          fechaProximaRenovacion: fechaProximaRenovacion || undefined,
          telefono,
          whatsapp,
          direccion,
          instagram,
          facebook,
          horarios,
          menu: menu.filter((m) => m.nombre.trim()),
          addonWhatsapp: addons.addonWhatsapp,
          addonMapas: addons.addonMapas,
          addonGaleria: addons.addonGaleria,
          addonFormularioContacto: addons.addonFormularioContacto,
          addonPedidos: addons.addonPedidos,
          addonReservaciones: addons.addonReservaciones,
          addonQrMesa: addons.addonQrMesa,
          addonLealtad: addons.addonLealtad,
          addonMultiSucursal: addons.addonMultiSucursal,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "No se pudo guardar.");
      setOk(true);
      onRecargar?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function archivar() {
    if (!negocio) return;
    if (!confirm(`¿Quitar "${negocio.nombre}" del directorio? (se puede reactivar después)`)) return;
    setGuardando(true);
    try {
      await fetch(`/api/admin/negocios/${negocio.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivar: true }),
      });
      router.push("/admin");
    } finally {
      setGuardando(false);
    }
  }

  // --- Modo crear: formulario mínimo ---
  if (!negocio) {
    return (
      <form className="admin-section" onSubmit={crear}>
        <h2>Nuevo negocio</h2>
        <div className="admin-field">
          <label>Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="admin-field">
          <label>Categoría</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)}>
            {CATEGORIAS.map((c) => (
              <option key={c.slug} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label>Descripción corta</label>
          <input value={descripcionCorta} onChange={(e) => setDescripcionCorta(e.target.value)} />
        </div>
        <button className="admin-btn" type="submit" disabled={guardando}>
          {guardando ? "Creando..." : "Crear y continuar →"}
        </button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    );
  }

  // --- Modo editar: formulario completo ---
  const uploadUrl = `/api/admin/negocios/${negocio.id}/adjuntos`;

  return (
    <form onSubmit={guardar}>
      <div className="admin-head-row">
        <h1 style={{ fontSize: 20 }}>{negocio.nombre}</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="admin-btn admin-btn-secondary" href={`/admin/vista-previa/${negocio.id}`} target="_blank">
            Ver vista previa
          </Link>
          <button type="button" className="admin-btn admin-btn-danger" onClick={archivar} disabled={guardando}>
            Archivar
          </button>
        </div>
      </div>

      <div className="admin-section">
        <h2>Datos básicos</h2>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label>Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="admin-field">
            <label>Categoría</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)}>
              {CATEGORIAS.map((c) => (
                <option key={c.slug} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="admin-field">
          <label>Descripción corta</label>
          <input value={descripcionCorta} onChange={(e) => setDescripcionCorta(e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Descripción larga</label>
          <textarea value={descripcionLarga} onChange={(e) => setDescripcionLarga(e.target.value)} />
        </div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label>Teléfono</label>
            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>
          <div className="admin-field">
            <label>WhatsApp</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
        </div>
        <div className="admin-field">
          <label>Dirección</label>
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label>Instagram</label>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Facebook</label>
            <input value={facebook} onChange={(e) => setFacebook(e.target.value)} />
          </div>
        </div>
        <div className="admin-field">
          <label>Horarios</label>
          <input value={horarios} onChange={(e) => setHorarios(e.target.value)} />
        </div>
      </div>

      <div className="admin-section">
        <h2>Fotos</h2>
        <ImageUploadField
          label="Logo"
          campo="logo"
          uploadUrl={uploadUrl}
          existentes={negocio.logoUrl ? [negocio.logoUrl] : []}
          onUploaded={() => onRecargar?.()}
        />
        <ImageUploadField
          label="Foto de portada"
          campo="foto_portada"
          uploadUrl={uploadUrl}
          existentes={negocio.fotoPortadaUrl ? [negocio.fotoPortadaUrl] : []}
          onUploaded={() => onRecargar?.()}
        />
        <ImageUploadField
          label="Galería"
          campo="galeria"
          uploadUrl={uploadUrl}
          existentes={negocio.galeria}
          multiple
          onUploaded={() => onRecargar?.()}
        />
      </div>

      <div className="admin-section">
        <h2>Menú</h2>
        {menu.map((fila, i) => (
          <div className="admin-menu-row" key={i}>
            <input
              placeholder="Nombre del platillo"
              value={fila.nombre}
              onChange={(e) => actualizarMenuFila(i, "nombre", e.target.value)}
            />
            <input
              placeholder="Precio (ej. $45)"
              value={fila.precio}
              onChange={(e) => actualizarMenuFila(i, "precio", e.target.value)}
              style={{ maxWidth: 120 }}
            />
            <button type="button" className="admin-link" onClick={() => quitarFilaMenu(i)}>
              Quitar
            </button>
          </div>
        ))}
        <button type="button" className="admin-link" onClick={agregarFilaMenu}>
          + Agregar platillo
        </button>
      </div>

      <div className="admin-section">
        <h2>Addons</h2>
        <div className="admin-checks">
          {ADDONS.map((a) => (
            <label key={a.key as string}>
              <input
                type="checkbox"
                checked={addons[a.key as string] ?? false}
                onChange={(e) =>
                  setAddons((prev) => ({ ...prev, [a.key as string]: e.target.checked }))
                }
              />
              {a.label}
            </label>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <h2>Estado y renovación</h2>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label>Estado</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value as Estado)}>
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Plan</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value as "top20" | "estandar" | "")}>
              <option value="">Sin definir</option>
              <option value="top20">Top 20</option>
              <option value="estandar">Estándar</option>
            </select>
          </div>
        </div>
        <div className="admin-field">
          <label>Próxima renovación</label>
          <input
            type="date"
            value={fechaProximaRenovacion}
            onChange={(e) => setFechaProximaRenovacion(e.target.value)}
          />
        </div>
      </div>

      <button className="admin-btn" type="submit" disabled={guardando}>
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>
      {ok && <span style={{ marginLeft: 10, color: "#14532d" }}>Guardado ✓</span>}
      {error && <div className="admin-error">{error}</div>}
    </form>
  );
}
