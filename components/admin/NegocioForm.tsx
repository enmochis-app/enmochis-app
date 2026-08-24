"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { CATEGORIAS, type Negocio, type Estado, type Categoria, type LogoForma } from "@/lib/negocios";
import ImageUploadField from "@/components/ImageUploadField";

const ADDONS: { key: keyof Negocio; label: string }[] = [
  { key: "addonWhatsapp", label: "WhatsApp" },
  { key: "addonMapas", label: "Mapas" },
  { key: "addonGaleria", label: "Galería" },
  { key: "addonPedidos", label: "Pedidos por WhatsApp" },
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
  const [googleMapsUrl, setGoogleMapsUrl] = useState(negocio?.googleMapsUrl ?? "");
  const [appleMapsUrl, setAppleMapsUrl] = useState(negocio?.appleMapsUrl ?? "");
  const [instagram, setInstagram] = useState(negocio?.instagram ?? "");
  const [facebook, setFacebook] = useState(negocio?.facebook ?? "");
  const [horarios, setHorarios] = useState(negocio?.horarios ?? "");
  const [menu, setMenu] = useState(negocio?.menu ?? "");

  const [logoForma, setLogoForma] = useState<LogoForma>(negocio?.logoForma ?? "circular");
  const [colorAcento, setColorAcento] = useState(negocio?.colorAcento ?? "#C8FF3D");
  const [productoEstrellaNombre, setProductoEstrellaNombre] = useState(negocio?.productoEstrellaNombre ?? "");
  const [productoEstrellaPrecio, setProductoEstrellaPrecio] = useState(negocio?.productoEstrellaPrecio ?? "");
  const [galeria1Nombre, setGaleria1Nombre] = useState(negocio?.galeria[0]?.nombre ?? "");
  const [galeria1Precio, setGaleria1Precio] = useState(negocio?.galeria[0]?.precio ?? "");
  const [galeria2Nombre, setGaleria2Nombre] = useState(negocio?.galeria[1]?.nombre ?? "");
  const [galeria2Precio, setGaleria2Precio] = useState(negocio?.galeria[1]?.precio ?? "");
  const [galeria3Nombre, setGaleria3Nombre] = useState(negocio?.galeria[2]?.nombre ?? "");
  const [galeria3Precio, setGaleria3Precio] = useState(negocio?.galeria[2]?.precio ?? "");

  const [addons, setAddons] = useState<Record<string, boolean>>(() => {
    const inicial: Record<string, boolean> = {};
    for (const a of ADDONS) inicial[a.key as string] = negocio ? Boolean(negocio[a.key]) : false;
    return inicial;
  });

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
          googleMapsUrl,
          appleMapsUrl,
          instagram,
          facebook,
          horarios,
          menu,
          logoForma,
          colorAcento,
          productoEstrellaNombre,
          productoEstrellaPrecio,
          galeria_1_nombre: galeria1Nombre,
          galeria_1_precio: galeria1Precio,
          galeria_2_nombre: galeria2Nombre,
          galeria_2_precio: galeria2Precio,
          galeria_3_nombre: galeria3Nombre,
          galeria_3_precio: galeria3Precio,
          addonWhatsapp: addons.addonWhatsapp,
          addonMapas: addons.addonMapas,
          addonGaleria: addons.addonGaleria,
          addonPedidos: addons.addonPedidos,
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
            <label>Link de Google Maps</label>
            <input value={googleMapsUrl} onChange={(e) => setGoogleMapsUrl(e.target.value)} placeholder="https://maps.google.com/?q=..." />
          </div>
          <div className="admin-field">
            <label>Link de Apple Maps</label>
            <input value={appleMapsUrl} onChange={(e) => setAppleMapsUrl(e.target.value)} placeholder="https://maps.apple.com/?q=..." />
          </div>
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
        <h2>Producto estrella</h2>
        <div className="admin-small" style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          Su foto es el fondo principal del minisitio.
        </div>
        <ImageUploadField
          label="Foto del producto estrella"
          campo="producto_estrella_foto"
          uploadUrl={uploadUrl}
          existentes={negocio.productoEstrellaFoto ? [negocio.productoEstrellaFoto] : []}
          onUploaded={() => onRecargar?.()}
        />
        <div className="admin-grid-2">
          <div className="admin-field">
            <label>Nombre del producto</label>
            <input value={productoEstrellaNombre} onChange={(e) => setProductoEstrellaNombre(e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Precio</label>
            <input value={productoEstrellaPrecio} onChange={(e) => setProductoEstrellaPrecio(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h2>Galería (3 productos)</h2>
        {[
          { n: 1, campo: "galeria_1_foto", nombre: galeria1Nombre, setNombre: setGaleria1Nombre, precio: galeria1Precio, setPrecio: setGaleria1Precio, foto: negocio.galeria[0]?.foto },
          { n: 2, campo: "galeria_2_foto", nombre: galeria2Nombre, setNombre: setGaleria2Nombre, precio: galeria2Precio, setPrecio: setGaleria2Precio, foto: negocio.galeria[1]?.foto },
          { n: 3, campo: "galeria_3_foto", nombre: galeria3Nombre, setNombre: setGaleria3Nombre, precio: galeria3Precio, setPrecio: setGaleria3Precio, foto: negocio.galeria[2]?.foto },
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
