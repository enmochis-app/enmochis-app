"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { CATEGORIAS, type Negocio, type Estado, type Categoria, type LogoForma, type Addon } from "@/lib/negocios";
import ImageUploadField from "@/components/ImageUploadField";

function hoyMasDias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

const ESTADOS: { value: Estado; label: string }[] = [
  { value: "solicitud", label: "Solicitud" },
  { value: "revision", label: "En revisión" },
  { value: "prueba", label: "Prueba" },
  { value: "activo", label: "Activo" },
  { value: "destacado", label: "Destacado" },
  { value: "archivado", label: "Archivado" },
];

const FORMAS_LOGO: { value: LogoForma; label: string }[] = [
  { value: "circular", label: "Circular" },
  { value: "cuadrada", label: "Cuadrada" },
  { value: "rectangular", label: "Rectangular" },
];

const MENU_PLACEHOLDER = `PIEZAS
Ala — $100
Filete — $170

COMPLEMENTOS
Ensalada — $75`;

export default function NegocioForm({
  negocio,
  catalogoAddons,
  onRecargar,
}: {
  negocio: Negocio | null;
  catalogoAddons: Addon[];
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
  const [plan, setPlan] = useState<"top20" | "estandar" | "gratuita" | "">(negocio?.plan ?? "");
  const [fechaProximaRenovacion, setFechaProximaRenovacion] = useState(
    negocio?.fechaProximaRenovacion ?? ""
  );
  const [telefono, setTelefono] = useState(negocio?.telefono ?? "");
  const [whatsapp, setWhatsapp] = useState(negocio?.whatsapp ?? "");
  const [mensajeWhatsapp, setMensajeWhatsapp] = useState(negocio?.mensajeWhatsapp ?? "");
  const [direccion, setDireccion] = useState(negocio?.direccion ?? "");
  const [lat, setLat] = useState(negocio?.lat !== undefined ? String(negocio.lat) : "");
  const [lng, setLng] = useState(negocio?.lng !== undefined ? String(negocio.lng) : "");
  const [instagram, setInstagram] = useState(negocio?.instagram ?? "");
  const [facebook, setFacebook] = useState(negocio?.facebook ?? "");
  const [horarios, setHorarios] = useState(negocio?.horarios ?? "");
  const [menu, setMenu] = useState(negocio?.menu ?? "");

  const [logoForma, setLogoForma] = useState<LogoForma>(negocio?.logoForma ?? "circular");
  const [colorAcento, setColorAcento] = useState(negocio?.colorAcento ?? "#C8FF3D");
  const [galeria1Nombre, setGaleria1Nombre] = useState(negocio?.galeria[0]?.nombre ?? "");
  const [galeria1Precio, setGaleria1Precio] = useState(negocio?.galeria[0]?.precio ?? "");
  const [galeria1Unidad, setGaleria1Unidad] = useState(negocio?.galeria[0]?.unidad ?? "");
  const [galeria1Descripcion, setGaleria1Descripcion] = useState(negocio?.galeria[0]?.descripcion ?? "");
  const [galeria2Nombre, setGaleria2Nombre] = useState(negocio?.galeria[1]?.nombre ?? "");
  const [galeria2Precio, setGaleria2Precio] = useState(negocio?.galeria[1]?.precio ?? "");
  const [galeria2Unidad, setGaleria2Unidad] = useState(negocio?.galeria[1]?.unidad ?? "");
  const [galeria2Descripcion, setGaleria2Descripcion] = useState(negocio?.galeria[1]?.descripcion ?? "");
  const [galeria3Nombre, setGaleria3Nombre] = useState(negocio?.galeria[2]?.nombre ?? "");
  const [galeria3Precio, setGaleria3Precio] = useState(negocio?.galeria[2]?.precio ?? "");
  const [galeria3Unidad, setGaleria3Unidad] = useState(negocio?.galeria[2]?.unidad ?? "");
  const [galeria3Descripcion, setGaleria3Descripcion] = useState(negocio?.galeria[2]?.descripcion ?? "");

  const [addonsSeleccionados, setAddonsSeleccionados] = useState<Record<string, boolean>>(() => {
    const inicial: Record<string, boolean> = {};
    for (const a of negocio?.addons ?? []) inicial[a.clave] = true;
    return inicial;
  });

  const enPrueba = estado === "prueba";
  function activarPrueba() {
    setEstado("prueba");
    setFechaProximaRenovacion(hoyMasDias(45));
  }
  function desactivarPrueba() {
    setEstado("activo");
    setFechaProximaRenovacion("");
  }

  const addonsParaMostrar = catalogoAddons.filter((a) => a.activo || addonsSeleccionados[a.clave]);
  const totalMensualAddons = catalogoAddons
    .filter((a) => addonsSeleccionados[a.clave])
    .reduce((suma, a) => suma + a.precio, 0);
  const cantidadAddonsActivos = Object.values(addonsSeleccionados).filter(Boolean).length;

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
          mensajeWhatsapp,
          direccion,
          lat: lat.trim() === "" ? undefined : Number(lat),
          lng: lng.trim() === "" ? undefined : Number(lng),
          instagram,
          facebook,
          horarios,
          menu,
          logoForma,
          colorAcento,
          galeria_1_nombre: galeria1Nombre,
          galeria_1_precio: galeria1Precio,
          galeria_1_unidad: galeria1Unidad,
          galeria_1_descripcion: galeria1Descripcion,
          galeria_2_nombre: galeria2Nombre,
          galeria_2_precio: galeria2Precio,
          galeria_2_unidad: galeria2Unidad,
          galeria_2_descripcion: galeria2Descripcion,
          galeria_3_nombre: galeria3Nombre,
          galeria_3_precio: galeria3Precio,
          galeria_3_unidad: galeria3Unidad,
          galeria_3_descripcion: galeria3Descripcion,
          addons: Object.keys(addonsSeleccionados).filter((clave) => addonsSeleccionados[clave]),
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
        <div>
          <h1 style={{ fontSize: 20 }}>{negocio.nombre}</h1>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginTop: 6 }}>
            <input
              type="checkbox"
              checked={enPrueba}
              onChange={(e) => (e.target.checked ? activarPrueba() : desactivarPrueba())}
            />
            Periodo de prueba
          </label>
          {enPrueba && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 6 }}>
              {[45, 50, 100].map((dias) => (
                <button
                  key={dias}
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  style={{ padding: "3px 10px", fontSize: 12 }}
                  onClick={() => setFechaProximaRenovacion(hoyMasDias(dias))}
                >
                  {dias} días
                </button>
              ))}
              <input
                type="date"
                value={fechaProximaRenovacion}
                onChange={(e) => setFechaProximaRenovacion(e.target.value)}
                style={{ fontSize: 12, padding: "3px 6px" }}
              />
            </div>
          )}
        </div>
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
          <label>Mensaje de WhatsApp</label>
          <input value={mensajeWhatsapp} onChange={(e) => setMensajeWhatsapp(e.target.value)} placeholder="Hola 👋, quiero hacer un pedido." />
          <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
            Se le agrega solo &quot;Vengo de {negocio.slug}.enmochis.app&quot; al final — nunca hay que escribirlo a mano.
          </div>
        </div>
        <div className="admin-field">
          <label>Dirección</label>
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label>Latitud</label>
            <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="25.7920" inputMode="decimal" />
          </div>
          <div className="admin-field">
            <label>Longitud</label>
            <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-108.9930" inputMode="decimal" />
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#666", marginTop: -8, marginBottom: 8 }}>
          Se sacan una sola vez: compartir ubicación desde Google Maps → copiar coordenadas.
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
        <h2>Marca del minisitio</h2>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label>Forma del logo</label>
            <select value={logoForma} onChange={(e) => setLogoForma(e.target.value as LogoForma)}>
              {FORMAS_LOGO.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Color de acento</label>
            <input
              type="color"
              value={colorAcento}
              onChange={(e) => setColorAcento(e.target.value)}
              style={{ height: 42, padding: 4 }}
            />
          </div>
        </div>
        <ImageUploadField
          label="Logo"
          campo="logo"
          uploadUrl={uploadUrl}
          existentes={negocio.logoUrl ? [negocio.logoUrl] : []}
          onUploaded={() => onRecargar?.()}
        />
      </div>

      <div className="admin-section">
        <h2>Foto de portada</h2>
        <div className="admin-small" style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          Es el fondo principal del minisitio — puede ser una foto de un producto o del lugar.
        </div>
        <ImageUploadField
          label="Foto de portada"
          campo="foto_portada"
          uploadUrl={uploadUrl}
          existentes={negocio.fotoPortada ? [negocio.fotoPortada] : []}
          onUploaded={() => onRecargar?.()}
        />
      </div>

      <div className="admin-section">
        <h2>Galería (3 productos)</h2>
        {[
          { n: 1, campo: "galeria_1_foto", nombre: galeria1Nombre, setNombre: setGaleria1Nombre, precio: galeria1Precio, setPrecio: setGaleria1Precio, unidad: galeria1Unidad, setUnidad: setGaleria1Unidad, descripcion: galeria1Descripcion, setDescripcion: setGaleria1Descripcion, foto: negocio.galeria[0]?.foto },
          { n: 2, campo: "galeria_2_foto", nombre: galeria2Nombre, setNombre: setGaleria2Nombre, precio: galeria2Precio, setPrecio: setGaleria2Precio, unidad: galeria2Unidad, setUnidad: setGaleria2Unidad, descripcion: galeria2Descripcion, setDescripcion: setGaleria2Descripcion, foto: negocio.galeria[1]?.foto },
          { n: 3, campo: "galeria_3_foto", nombre: galeria3Nombre, setNombre: setGaleria3Nombre, precio: galeria3Precio, setPrecio: setGaleria3Precio, unidad: galeria3Unidad, setUnidad: setGaleria3Unidad, descripcion: galeria3Descripcion, setDescripcion: setGaleria3Descripcion, foto: negocio.galeria[2]?.foto },
        ].map((g) => (
          <div key={g.n} style={{ borderTop: g.n > 1 ? "1px solid #eee" : undefined, paddingTop: g.n > 1 ? 14 : 0, marginTop: g.n > 1 ? 14 : 0 }}>
            <ImageUploadField
              label={`Foto ${g.n}`}
              campo={g.campo}
              uploadUrl={uploadUrl}
              existentes={g.foto ? [g.foto] : []}
              onUploaded={() => onRecargar?.()}
            />
            <div className="admin-grid-2">
              <div className="admin-field">
                <label>Nombre</label>
                <input value={g.nombre} onChange={(e) => g.setNombre(e.target.value)} />
              </div>
              <div className="admin-field">
                <label>Precio</label>
                <input value={g.precio} onChange={(e) => g.setPrecio(e.target.value)} />
              </div>
            </div>
            <div className="admin-grid-2">
              <div className="admin-field">
                <label>Unidad</label>
                <input value={g.unidad} onChange={(e) => g.setUnidad(e.target.value)} placeholder="x kilo, c/u, orden..." />
              </div>
              <div className="admin-field">
                <label>Descripción corta</label>
                <input value={g.descripcion} onChange={(e) => g.setDescripcion(e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h2>Menú</h2>
        <div className="admin-field">
          <textarea
            value={menu}
            onChange={(e) => setMenu(e.target.value)}
            placeholder={MENU_PLACEHOLDER}
            style={{ minHeight: 220, fontFamily: "monospace" }}
          />
          <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>
            Formato: CATEGORÍA en su propia línea, luego &quot;Producto — $Precio&quot; por línea.
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h2>Addons</h2>
        <div className="admin-small" style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          El catálogo (nombres, precios, y crear addons nuevos) se administra en{" "}
          <Link href="/admin/addons">Addons</Link>.
        </div>
        <div className="admin-checks">
          {addonsParaMostrar.map((a) => (
            <label key={a.id}>
              <input
                type="checkbox"
                checked={addonsSeleccionados[a.clave] ?? false}
                onChange={(e) =>
                  setAddonsSeleccionados((prev) => ({ ...prev, [a.clave]: e.target.checked }))
                }
              />
              {a.icono} {a.nombre} — ${a.precio}/mes
            </label>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <h2>Pago</h2>
        <div className="admin-field">
          <label>Tipo de suscripción</label>
          <select value={plan} onChange={(e) => setPlan(e.target.value as typeof plan)}>
            <option value="">Sin definir</option>
            <option value="gratuita">Gratuita</option>
            <option value="top20">Top 20</option>
            <option value="estandar">Estándar</option>
          </select>
        </div>
        <div className="admin-field">
          <label>Total mensual por addons</label>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            ${totalMensualAddons}
            <span style={{ fontSize: 12, fontWeight: 400, color: "#666", marginLeft: 8 }}>
              ({cantidadAddonsActivos} addon{cantidadAddonsActivos === 1 ? "" : "s"} activo
              {cantidadAddonsActivos === 1 ? "" : "s"})
            </span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          Información de referencia — el cobro y el envío del recibo se hacen por fuera del sistema.
        </div>
      </div>

      <div className="admin-section">
        <h2>Estado y renovación</h2>
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
