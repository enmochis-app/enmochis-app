"use client";

import { use, useCallback, useEffect, useState } from "react";
import type { Negocio, LogoForma } from "@/lib/negocios";
import type { MenuItemInput } from "@/lib/menuItems";
import ImageUploadField from "@/components/ImageUploadField";
import MenuEditor from "@/components/MenuEditor";

export default function CompletarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const [descripcionCorta, setDescripcionCorta] = useState("");
  const [descripcionLarga, setDescripcionLarga] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mensajeWhatsapp, setMensajeWhatsapp] = useState("");
  const [direccion, setDireccion] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [horarios, setHorarios] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItemInput[]>([]);

  const [logoForma, setLogoForma] = useState<LogoForma>("circular");
  const [colorAcento, setColorAcento] = useState("#C8FF3D");
  const [galeria1Nombre, setGaleria1Nombre] = useState("");
  const [galeria1Precio, setGaleria1Precio] = useState("");
  const [galeria1Unidad, setGaleria1Unidad] = useState("");
  const [galeria1Descripcion, setGaleria1Descripcion] = useState("");
  const [galeria2Nombre, setGaleria2Nombre] = useState("");
  const [galeria2Precio, setGaleria2Precio] = useState("");
  const [galeria2Unidad, setGaleria2Unidad] = useState("");
  const [galeria2Descripcion, setGaleria2Descripcion] = useState("");
  const [galeria3Nombre, setGaleria3Nombre] = useState("");
  const [galeria3Precio, setGaleria3Precio] = useState("");
  const [galeria3Unidad, setGaleria3Unidad] = useState("");
  const [galeria3Descripcion, setGaleria3Descripcion] = useState("");

  const cargar = useCallback(async () => {
    const res = await fetch(`/api/negocios/${id}/completar`);
    if (!res.ok) {
      setNoEncontrado(true);
      setCargando(false);
      return;
    }
    const body = await res.json();
    const n: Negocio = body.negocio;
    setNegocio(n);
    setDescripcionCorta(n.descripcionCorta ?? "");
    setDescripcionLarga(n.descripcionLarga ?? "");
    setTelefono(n.telefono ?? "");
    setWhatsapp(n.whatsapp ?? "");
    setMensajeWhatsapp(n.mensajeWhatsapp ?? "");
    setDireccion(n.direccion ?? "");
    setInstagram(n.instagram ?? "");
    setFacebook(n.facebook ?? "");
    setHorarios(n.horarios ?? "");
    setLogoForma(n.logoForma ?? "circular");
    setColorAcento(n.colorAcento ?? "#C8FF3D");
    setGaleria1Nombre(n.galeria[0]?.nombre ?? "");
    setGaleria1Precio(n.galeria[0]?.precio ?? "");
    setGaleria1Unidad(n.galeria[0]?.unidad ?? "");
    setGaleria1Descripcion(n.galeria[0]?.descripcion ?? "");
    setGaleria2Nombre(n.galeria[1]?.nombre ?? "");
    setGaleria2Precio(n.galeria[1]?.precio ?? "");
    setGaleria2Unidad(n.galeria[1]?.unidad ?? "");
    setGaleria2Descripcion(n.galeria[1]?.descripcion ?? "");
    setGaleria3Nombre(n.galeria[2]?.nombre ?? "");
    setGaleria3Precio(n.galeria[2]?.precio ?? "");
    setGaleria3Unidad(n.galeria[2]?.unidad ?? "");
    setGaleria3Descripcion(n.galeria[2]?.descripcion ?? "");
    const resMenu = await fetch(`/api/negocios/${id}/completar/menu`);
    if (resMenu.ok) {
      const bodyMenu = await resMenu.json();
      setMenuItems(bodyMenu.items ?? []);
    }
    setCargando(false);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargar();
  }, [cargar]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    try {
      const res = await fetch(`/api/negocios/${id}/completar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcionCorta,
          descripcionLarga,
          telefono,
          whatsapp,
          mensajeWhatsapp,
          direccion,
          instagram,
          facebook,
          horarios,
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
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "No se pudo enviar la información.");

      const resMenu = await fetch(`/api/negocios/${id}/completar/menu`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: menuItems }),
      });
      if (!resMenu.ok) throw new Error("No se pudo guardar el menú.");

      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la información.");
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return (
      <div className="hero">
        <p className="intro">Cargando...</p>
      </div>
    );
  }

  if (noEncontrado || !negocio) {
    return (
      <div className="hero">
        <div className="eyebrow">EnMochis</div>
        <h1 className="title">No encontramos esta solicitud.</h1>
        <p className="intro">Revisa que el link esté completo, o pide uno nuevo.</p>
      </div>
    );
  }

  if (negocio.estado !== "solicitud" || enviado) {
    return (
      <div className="hero">
        <div className="eyebrow">{negocio.nombre}</div>
        <h1 className="title">¡Gracias!</h1>
        <p className="intro">
          Ya recibimos tu información. La estamos revisando y en cuanto esté todo listo, tu
          negocio aparecerá en EnMochis.
        </p>
      </div>
    );
  }

  const uploadUrl = `/api/negocios/${id}/completar/adjuntos`;

  return (
    <>
      <div className="hero">
        <div className="eyebrow">COMPLETA TU PERFIL</div>
        <h1 className="title">{negocio.nombre}</h1>
        <p className="intro">
          Sube tus fotos, tu menú y la información de tu negocio. Solo se envía una vez —
          cuando la revisemos, tu negocio aparecerá en EnMochis.
        </p>
      </div>

      <form className="form" onSubmit={enviar}>
        <div className="field">
          <label>Descripción corta</label>
          <input value={descripcionCorta} onChange={(e) => setDescripcionCorta(e.target.value)} />
        </div>
        <div className="field">
          <label>Cuéntanos de tu negocio</label>
          <textarea
            className="textarea"
            value={descripcionLarga}
            onChange={(e) => setDescripcionLarga(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Teléfono</label>
          <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div className="field">
          <label>WhatsApp</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>
        <div className="field">
          <label>Mensaje de WhatsApp (opcional)</label>
          <input
            value={mensajeWhatsapp}
            onChange={(e) => setMensajeWhatsapp(e.target.value)}
            placeholder="Hola 👋, quiero hacer un pedido."
          />
        </div>
        <div className="field">
          <label>Dirección</label>
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </div>
        <div className="field">
          <label>Instagram</label>
          <input value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        </div>
        <div className="field">
          <label>Facebook</label>
          <input value={facebook} onChange={(e) => setFacebook(e.target.value)} />
        </div>
        <div className="field">
          <label>Horarios</label>
          <input value={horarios} onChange={(e) => setHorarios(e.target.value)} />
        </div>

        <section className="section" style={{ padding: "12px 0" }}>
          <div className="head">
            <h2>Marca de tu minisitio</h2>
          </div>
          <div className="field">
            <label>Forma del logo</label>
            <select
              value={logoForma}
              onChange={(e) => setLogoForma(e.target.value as LogoForma)}
              style={{ width: "100%", padding: 14, border: "1px solid #0002", borderRadius: 12 }}
            >
              <option value="circular">Circular</option>
              <option value="cuadrada">Cuadrada</option>
              <option value="rectangular">Rectangular</option>
            </select>
          </div>
          <div className="field">
            <label>Color de acento</label>
            <input type="color" value={colorAcento} onChange={(e) => setColorAcento(e.target.value)} style={{ height: 46 }} />
          </div>
          <ImageUploadField
            label="Logo"
            campo="logo"
            uploadUrl={uploadUrl}
            existentes={negocio.logoUrl ? [negocio.logoUrl] : []}
            onUploaded={cargar}
          />
        </section>

        <section className="section" style={{ padding: "12px 0" }}>
          <div className="head">
            <h2>Foto de portada</h2>
          </div>
          <p className="small">Es el fondo principal de tu minisitio — puede ser una foto de un producto o del lugar.</p>
          <ImageUploadField
            label="Foto de portada"
            campo="foto_portada"
            uploadUrl={uploadUrl}
            existentes={negocio.fotoPortada ? [negocio.fotoPortada] : []}
            onUploaded={cargar}
          />
        </section>

        <section className="section" style={{ padding: "12px 0" }}>
          <div className="head">
            <h2>Galería (3 productos)</h2>
          </div>
          {[
            { n: 1, campo: "galeria_1_foto", nombre: galeria1Nombre, setNombre: setGaleria1Nombre, precio: galeria1Precio, setPrecio: setGaleria1Precio, unidad: galeria1Unidad, setUnidad: setGaleria1Unidad, descripcion: galeria1Descripcion, setDescripcion: setGaleria1Descripcion, foto: negocio.galeria[0]?.foto },
            { n: 2, campo: "galeria_2_foto", nombre: galeria2Nombre, setNombre: setGaleria2Nombre, precio: galeria2Precio, setPrecio: setGaleria2Precio, unidad: galeria2Unidad, setUnidad: setGaleria2Unidad, descripcion: galeria2Descripcion, setDescripcion: setGaleria2Descripcion, foto: negocio.galeria[1]?.foto },
            { n: 3, campo: "galeria_3_foto", nombre: galeria3Nombre, setNombre: setGaleria3Nombre, precio: galeria3Precio, setPrecio: setGaleria3Precio, unidad: galeria3Unidad, setUnidad: setGaleria3Unidad, descripcion: galeria3Descripcion, setDescripcion: setGaleria3Descripcion, foto: negocio.galeria[2]?.foto },
          ].map((g) => (
            <div key={g.n} style={{ marginBottom: 16 }}>
              <ImageUploadField
                label={`Foto ${g.n}`}
                campo={g.campo}
                uploadUrl={uploadUrl}
                existentes={g.foto ? [g.foto] : []}
                onUploaded={cargar}
              />
              <div className="field">
                <label>Nombre</label>
                <input value={g.nombre} onChange={(e) => g.setNombre(e.target.value)} />
              </div>
              <div className="field">
                <label>Precio</label>
                <input value={g.precio} onChange={(e) => g.setPrecio(e.target.value)} />
              </div>
              <div className="field">
                <label>Unidad (ej. &quot;x kilo&quot;, &quot;c/u&quot;)</label>
                <input value={g.unidad} onChange={(e) => g.setUnidad(e.target.value)} />
              </div>
              <div className="field">
                <label>Descripción corta</label>
                <input value={g.descripcion} onChange={(e) => g.setDescripcion(e.target.value)} />
              </div>
            </div>
          ))}
        </section>

        <section className="section" style={{ padding: "12px 0" }}>
          <div className="head">
            <h2>Menú</h2>
          </div>
          <MenuEditor items={menuItems} onChange={setMenuItems} />
        </section>

        <button className="btn" type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar información"}
        </button>
        {error && (
          <p className="small" style={{ marginTop: 10, color: "#c0392b" }}>
            {error}
          </p>
        )}
      </form>
    </>
  );
}
