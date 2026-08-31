"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TIPOS_EVENTO, type Negocio, type Estado, type Categoria, type LogoForma, type Addon } from "@/lib/negocios";
import type { MenuItemInput } from "@/lib/menuItems";
import ImageUploadField from "@/components/ImageUploadField";
import MenuEditor from "@/components/MenuEditor";

type CategoriaOpcion = { slug: string; nombre: string; emoji: string; color: string };

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

const DEGRADADOS_INFERIORES: { value: "negro" | "blanco" | "beige"; label: string }[] = [
  { value: "negro", label: "Negro" },
  { value: "blanco", label: "Blanco" },
  { value: "beige", label: "Beige" },
];

const CREAR_NUEVA = "__crear_nueva__";

/** Selector de categoría con la opción de crear una nueva sin salir del formulario. */
function SelectorCategoria({
  categorias,
  valor,
  onChange,
  onCategoriaCreada,
}: {
  categorias: CategoriaOpcion[];
  valor: string;
  onChange: (nombre: string) => void;
  onCategoriaCreada: (categoria: CategoriaOpcion) => void;
}) {
  const [creando, setCreando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoEmoji, setNuevoEmoji] = useState("🏷️");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function crearCategoria() {
    if (!nuevoNombre.trim()) return;
    setGuardando(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoNombre.trim(), emoji: nuevoEmoji.trim() || undefined }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "No se pudo crear la categoría.");
      onCategoriaCreada(body.categoria);
      onChange(body.categoria.nombre);
      setCreando(false);
      setNuevoNombre("");
      setNuevoEmoji("🏷️");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la categoría.");
    } finally {
      setGuardando(false);
    }
  }

  if (creando) {
    return (
      <div className="admin-field">
        <label>Nueva categoría</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={nuevoEmoji}
            onChange={(e) => setNuevoEmoji(e.target.value)}
            style={{ width: 54 }}
            placeholder="🏷️"
            aria-label="Ícono de la categoría"
          />
          <input
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Nombre de la categoría"
            style={{ flex: 1 }}
            spellCheck
            lang="es"
            autoFocus
          />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
          <button type="button" className="admin-btn" onClick={crearCategoria} disabled={guardando || !nuevoNombre.trim()}>
            {guardando ? "Creando..." : "Crear categoría"}
          </button>
          <button type="button" className="admin-link" onClick={() => setCreando(false)}>
            Cancelar
          </button>
        </div>
        {error && <div className="admin-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="admin-field">
      <label>Categoría</label>
      <select
        value={valor}
        onChange={(e) => {
          if (e.target.value === CREAR_NUEVA) {
            setCreando(true);
            return;
          }
          onChange(e.target.value);
        }}
      >
        {categorias.map((c) => (
          <option key={c.slug} value={c.nombre}>
            {c.emoji} {c.nombre}
          </option>
        ))}
        <option value={CREAR_NUEVA}>+ Crear nueva categoría...</option>
      </select>
    </div>
  );
}

export default function NegocioForm({
  negocio,
  catalogoAddons,
  categorias: categoriasIniciales,
  onRecargar,
}: {
  negocio: Negocio | null;
  catalogoAddons: Addon[];
  categorias: CategoriaOpcion[];
  onRecargar?: () => void;
}) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaOpcion[]>(categoriasIniciales);

  // Datos básicos (usados tanto para crear como editar)
  const [nombre, setNombre] = useState(negocio?.nombre ?? "");
  const [categoria, setCategoria] = useState<Categoria>(negocio?.categoria ?? categoriasIniciales[0]?.nombre ?? "");
  const [descripcionCorta, setDescripcionCorta] = useState(negocio?.descripcionCorta ?? "");

  // Solo se piden al crear (opcionales, para no bloquear un alta rápida)
  const [telefonoNuevo, setTelefonoNuevo] = useState("");
  const [whatsappNuevo, setWhatsappNuevo] = useState("");
  const [direccionNueva, setDireccionNueva] = useState("");
  const [latNuevo, setLatNuevo] = useState("");
  const [lngNuevo, setLngNuevo] = useState("");
  const [instagramNuevo, setInstagramNuevo] = useState("");
  const [facebookNuevo, setFacebookNuevo] = useState("");

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
  const [mensajeCitas, setMensajeCitas] = useState(negocio?.mensajeCitas ?? "");
  const [direccion, setDireccion] = useState(negocio?.direccion ?? "");
  const [lat, setLat] = useState(negocio?.lat !== undefined ? String(negocio.lat) : "");
  const [lng, setLng] = useState(negocio?.lng !== undefined ? String(negocio.lng) : "");
  const [instagram, setInstagram] = useState(negocio?.instagram ?? "");
  const [facebook, setFacebook] = useState(negocio?.facebook ?? "");
  const [horarios, setHorarios] = useState(negocio?.horarios ?? "");

  const [lealtadModo, setLealtadModo] = useState<"visitas" | "puntos">(negocio?.lealtadModo ?? "visitas");
  const [lealtadPorcentaje, setLealtadPorcentaje] = useState(negocio ? String(negocio.lealtadPorcentaje) : "0");
  const [lealtadMeta, setLealtadMeta] = useState(negocio ? String(negocio.lealtadMeta) : "10");
  const [calificacionModo, setCalificacionModo] = useState<"" | "google" | "interno">(negocio?.calificacionModo ?? "");
  const [googleResenasUrl, setGoogleResenasUrl] = useState(negocio?.googleResenasUrl ?? "");
  const [portalPassword, setPortalPassword] = useState("");
  const [portalGuardando, setPortalGuardando] = useState(false);
  const [portalOk, setPortalOk] = useState(false);

  const [logoForma, setLogoForma] = useState<LogoForma>(negocio?.logoForma ?? "circular");
  const [colorAcento, setColorAcento] = useState(negocio?.colorAcento ?? "#C8FF3D");
  const [degradadoInferior, setDegradadoInferior] = useState<"negro" | "blanco" | "beige">(
    negocio?.degradadoInferior ?? "negro"
  );
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

  function registrarCategoriaCreada(cat: CategoriaOpcion) {
    setCategorias((prev) => (prev.some((c) => c.slug === cat.slug) ? prev : [...prev, cat]));
  }

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

  const [metricas, setMetricas] = useState<Record<string, number> | null>(null);
  const cargarMetricas = useCallback(async () => {
    if (!negocio) return;
    const res = await fetch(`/api/admin/negocios/${negocio.id}/metricas`);
    const body = await res.json();
    setMetricas(body.metricas ?? {});
  }, [negocio]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarMetricas();
  }, [cargarMetricas]);

  type CalificacionAdmin = { id: string; estrellas: number; comentario?: string; visible: boolean; createdAt: string };
  const [calificacionesLista, setCalificacionesLista] = useState<CalificacionAdmin[] | null>(null);
  const cargarCalificaciones = useCallback(async () => {
    if (!negocio) return;
    const res = await fetch(`/api/admin/negocios/${negocio.id}/calificaciones`);
    const body = await res.json();
    setCalificacionesLista(body.calificaciones ?? []);
  }, [negocio]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarCalificaciones();
  }, [cargarCalificaciones]);

  async function alternarVisibilidadCalificacion(id: string, visible: boolean) {
    await fetch(`/api/admin/negocios/${negocio!.id}/calificaciones`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calificacionId: id, visible }),
    });
    cargarCalificaciones();
  }

  const [menuItems, setMenuItems] = useState<MenuItemInput[]>([]);
  const cargarMenu = useCallback(async () => {
    if (!negocio) return;
    const res = await fetch(`/api/admin/negocios/${negocio.id}/menu`);
    const body = await res.json();
    setMenuItems(body.items ?? []);
  }, [negocio]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarMenu();
  }, [cargarMenu]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const res = await fetch("/api/admin/negocios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          categoria,
          descripcionCorta,
          estado: "prueba",
          telefono: telefonoNuevo || undefined,
          whatsapp: whatsappNuevo || undefined,
          direccion: direccionNueva || undefined,
          lat: latNuevo.trim() === "" ? undefined : Number(latNuevo),
          lng: lngNuevo.trim() === "" ? undefined : Number(lngNuevo),
          instagram: instagramNuevo || undefined,
          facebook: facebookNuevo || undefined,
        }),
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
          mensajeCitas,
          direccion,
          lat: lat.trim() === "" ? undefined : Number(lat),
          lng: lng.trim() === "" ? undefined : Number(lng),
          instagram,
          facebook,
          horarios,
          lealtadModo,
          lealtadPorcentaje: Number(lealtadPorcentaje) || 0,
          lealtadMeta: Number(lealtadMeta) || 10,
          calificacionModo,
          googleResenasUrl,
          logoForma,
          colorAcento,
          degradadoInferior,
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

      const resMenu = await fetch(`/api/admin/negocios/${negocio.id}/menu`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: menuItems }),
      });
      if (!resMenu.ok) throw new Error("No se pudo guardar el menú.");

      setOk(true);
      onRecargar?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarPasswordPortal() {
    if (!negocio || !portalPassword.trim()) return;
    setPortalGuardando(true);
    setPortalOk(false);
    try {
      const res = await fetch(`/api/admin/negocios/${negocio.id}/portal-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: portalPassword }),
      });
      if (!res.ok) throw new Error("No se pudo guardar la contraseña.");
      setPortalPassword("");
      setPortalOk(true);
      onRecargar?.();
    } finally {
      setPortalGuardando(false);
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

  async function eliminar() {
    if (!negocio) return;
    if (
      !confirm(
        `¿Eliminar "${negocio.nombre}" para siempre? Esto borra su menú, galería, calificaciones y toda su información — no se puede deshacer. Si solo quieres ocultarlo, usa "Archivar" en su lugar.`
      )
    )
      return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/admin/negocios/${negocio.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar el negocio.");
      router.push("/admin");
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo eliminar el negocio.");
      setGuardando(false);
    }
  }

  // --- Modo crear: formulario dividido por secciones, con solo lo indispensable requerido ---
  if (!negocio) {
    return (
      <form onSubmit={crear} lang="es">
        <div className="admin-head-row">
          <h1 style={{ fontSize: 20 }}>Nuevo negocio</h1>
        </div>

        <div className="admin-section">
          <h2>Datos básicos</h2>
          <div className="admin-field">
            <label>Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required spellCheck autoFocus />
          </div>
          <SelectorCategoria
            categorias={categorias}
            valor={categoria}
            onChange={setCategoria}
            onCategoriaCreada={registrarCategoriaCreada}
          />
          <div className="admin-field">
            <label>Descripción corta</label>
            <input value={descripcionCorta} onChange={(e) => setDescripcionCorta(e.target.value)} spellCheck />
          </div>
        </div>

        <div className="admin-section">
          <h2>Contacto</h2>
          <div className="admin-small" style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
            Opcional aquí — lo puedes completar después, pero si ya lo tienes a la mano ahorras un paso.
          </div>
          <div className="admin-grid-2">
            <div className="admin-field">
              <label>Teléfono</label>
              <input value={telefonoNuevo} onChange={(e) => setTelefonoNuevo(e.target.value)} />
            </div>
            <div className="admin-field">
              <label>WhatsApp</label>
              <input value={whatsappNuevo} onChange={(e) => setWhatsappNuevo(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="admin-section">
          <h2>Ubicación</h2>
          <div className="admin-field">
            <label>Dirección</label>
            <input value={direccionNueva} onChange={(e) => setDireccionNueva(e.target.value)} spellCheck />
          </div>
          <div className="admin-grid-2">
            <div className="admin-field">
              <label>Latitud</label>
              <input value={latNuevo} onChange={(e) => setLatNuevo(e.target.value)} placeholder="25.7920" inputMode="decimal" />
            </div>
            <div className="admin-field">
              <label>Longitud</label>
              <input value={lngNuevo} onChange={(e) => setLngNuevo(e.target.value)} placeholder="-108.9930" inputMode="decimal" />
            </div>
          </div>
        </div>

        <div className="admin-section">
          <h2>Redes sociales</h2>
          <div className="admin-grid-2">
            <div className="admin-field">
              <label>Instagram</label>
              <input value={instagramNuevo} onChange={(e) => setInstagramNuevo(e.target.value)} placeholder="usuario" />
            </div>
            <div className="admin-field">
              <label>Facebook</label>
              <input value={facebookNuevo} onChange={(e) => setFacebookNuevo(e.target.value)} placeholder="usuario o página" />
            </div>
          </div>
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
    <form onSubmit={guardar} lang="es">
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
          <button type="button" className="admin-btn admin-btn-danger" onClick={eliminar} disabled={guardando}>
            Eliminar
          </button>
        </div>
      </div>

      <div className="admin-section">
        <h2>Datos básicos</h2>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label>Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required spellCheck />
          </div>
          <SelectorCategoria
            categorias={categorias}
            valor={categoria}
            onChange={setCategoria}
            onCategoriaCreada={registrarCategoriaCreada}
          />
        </div>
        <div className="admin-field">
          <label>Descripción corta</label>
          <input value={descripcionCorta} onChange={(e) => setDescripcionCorta(e.target.value)} spellCheck />
        </div>
        <div className="admin-field">
          <label>Descripción larga</label>
          <textarea value={descripcionLarga} onChange={(e) => setDescripcionLarga(e.target.value)} spellCheck />
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
          <input value={mensajeWhatsapp} onChange={(e) => setMensajeWhatsapp(e.target.value)} placeholder="Hola 👋, quiero hacer un pedido." spellCheck />
          <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
            Se le agrega solo &quot;Vengo de {negocio.slug}.enmochis.app&quot; al final — nunca hay que escribirlo a mano.
          </div>
        </div>
        <div className="admin-field">
          <label>Mensaje de citas (addon &quot;Citas por WhatsApp&quot;)</label>
          <input value={mensajeCitas} onChange={(e) => setMensajeCitas(e.target.value)} placeholder="Hola 👋, quiero agendar una cita." spellCheck />
          <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
            Solo se muestra si el negocio tiene activo el addon &quot;Citas por WhatsApp&quot;.
          </div>
        </div>
        <div className="admin-field">
          <label>Dirección</label>
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} spellCheck />
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
          <input value={horarios} onChange={(e) => setHorarios(e.target.value)} spellCheck />
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
          <div className="admin-field">
            <label>Degradado inferior</label>
            <select
              value={degradadoInferior}
              onChange={(e) => setDegradadoInferior(e.target.value as "negro" | "blanco" | "beige")}
            >
              {DEGRADADOS_INFERIORES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="admin-small" style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          El degradado superior se calcula solo a partir del color del logo al subirlo.
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
                <input value={g.nombre} onChange={(e) => g.setNombre(e.target.value)} spellCheck />
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
                <input value={g.descripcion} onChange={(e) => g.setDescripcion(e.target.value)} spellCheck />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h2>Menú</h2>
        <div className="admin-small" style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          Marca &quot;Se puede pedir por WhatsApp&quot; en los productos que quieras que aparezcan
          en el carrito de pedidos del minisitio (addon &quot;Pedidos&quot;).
        </div>
        <MenuEditor items={menuItems} onChange={setMenuItems} />
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
        <h2>Métricas — este mes</h2>
        {metricas === null ? (
          <p className="admin-small" style={{ fontSize: 12, color: "#666" }}>
            Cargando...
          </p>
        ) : (
          <div className="admin-grid-2">
            {TIPOS_EVENTO.map((t) => (
              <div className="admin-field" key={t.tipo}>
                <label>{t.label}</label>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{metricas[t.tipo] ?? 0}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-section">
        <h2>Lealtad</h2>
        <div className="admin-small" style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          Solo aplica si el addon &quot;Programa de lealtad&quot; está activo. No se guarda ningún
          dato personal del cliente — solo un código anónimo y su contador de visitas/puntos.
        </div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label>Modo</label>
            <select value={lealtadModo} onChange={(e) => setLealtadModo(e.target.value as "visitas" | "puntos")}>
              <option value="visitas">Por visitas</option>
              <option value="puntos">Por puntos (% de la compra)</option>
            </select>
          </div>
          <div className="admin-field">
            <label>Meta para canjear</label>
            <input value={lealtadMeta} onChange={(e) => setLealtadMeta(e.target.value)} inputMode="numeric" />
          </div>
        </div>
        {lealtadModo === "puntos" && (
          <div className="admin-field">
            <label>Porcentaje de la compra en puntos</label>
            <input value={lealtadPorcentaje} onChange={(e) => setLealtadPorcentaje(e.target.value)} inputMode="numeric" placeholder="Ej. 6" />
          </div>
        )}
      </div>

      <div className="admin-section">
        <h2>Calificaciones</h2>
        <div className="admin-small" style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          Solo aplica si el addon &quot;Sistema de Calificación&quot; está activo. El promedio que se
          muestra siempre es el promedio real de todas las reseñas — ocultar un comentario nunca
          cambia el promedio.
        </div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label>Modo</label>
            <select
              value={calificacionModo}
              onChange={(e) => setCalificacionModo(e.target.value as "" | "google" | "interno")}
            >
              <option value="">Sin activar</option>
              <option value="interno">Interno (reseñas en EnMochis)</option>
              <option value="google">Google (enlaza a la Ficha de Google)</option>
            </select>
          </div>
          {calificacionModo === "google" && (
            <div className="admin-field">
              <label>Link a reseñas de Google</label>
              <input value={googleResenasUrl} onChange={(e) => setGoogleResenasUrl(e.target.value)} placeholder="https://g.page/r/..." />
            </div>
          )}
        </div>
        {calificacionModo === "interno" && (
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
              Reseñas recibidas
            </label>
            {calificacionesLista === null ? (
              <p style={{ fontSize: 12, color: "#666" }}>Cargando...</p>
            ) : calificacionesLista.length === 0 ? (
              <p style={{ fontSize: 12, color: "#666" }}>Todavía no hay reseñas.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {calificacionesLista.map((c) => (
                  <div
                    key={c.id}
                    style={{ border: "1px solid #eee", borderRadius: 8, padding: 10, fontSize: 12.5, opacity: c.visible ? 1 : 0.5 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>{"★".repeat(c.estrellas)}</strong>
                      <button type="button" onClick={() => alternarVisibilidadCalificacion(c.id, !c.visible)}>
                        {c.visible ? "Ocultar comentario" : "Mostrar comentario"}
                      </button>
                    </div>
                    {c.comentario && <p style={{ margin: "6px 0 0" }}>{c.comentario}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="admin-section">
        <h2>Acceso al portal</h2>
        <div className="admin-small" style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          El negocio entra en <code>enmochis.app/portal/login</code> con su usuario (
          <strong>{negocio.slug}</strong>) y la contraseña que le asignes aquí. Desde ahí puede
          editar su menú y manejar su programa de lealtad.
        </div>
        <div className="admin-field">
          <label>{negocio.tienePortal ? "Nueva contraseña (opcional)" : "Asignar contraseña"}</label>
          <input
            type="text"
            value={portalPassword}
            onChange={(e) => setPortalPassword(e.target.value)}
            placeholder={negocio.tienePortal ? "Dejar en blanco para no cambiarla" : "Contraseña para el portal"}
          />
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={guardarPasswordPortal}
          disabled={portalGuardando || !portalPassword.trim()}
        >
          {portalGuardando ? "Guardando..." : "Guardar contraseña"}
        </button>
        {portalOk && <span style={{ marginLeft: 10, color: "#14532d" }}>Guardada ✓</span>}
        {negocio.tienePortal && (
          <div style={{ fontSize: 12, color: "#14532d", marginTop: 8 }}>Este negocio ya tiene acceso al portal.</div>
        )}
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
