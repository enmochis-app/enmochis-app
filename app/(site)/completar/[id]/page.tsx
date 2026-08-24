"use client";

import { use, useCallback, useEffect, useState } from "react";
import type { Negocio, LogoForma } from "@/lib/negocios";
import ImageUploadField from "@/components/ImageUploadField";

const MENU_PLACEHOLDER = `PIEZAS
Ala — $100
Filete — $170

COMPLEMENTOS
Ensalada — $75`;

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
  const [direccion, setDireccion] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [appleMapsUrl, setAppleMapsUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [horarios, setHorarios] = useState("");
  const [menu, setMenu] = useState("");

  const [logoForma, setLogoForma] = useState<LogoForma>("circular");
  const [colorAcento, setColorAcento] = useState("#C8FF3D");
  const [productoEstrellaNombre, setProductoEstrellaNombre] = useState("");
  const [productoEstrellaPrecio, setProductoEstrellaPrecio] = useState("");
  const [galeria1Nombre, setGaleria1Nombre] = useState("");
  const [galeria1Precio, setGaleria1Precio] = useState("");
  const [galeria2Nombre, setGaleria2Nombre] = useState("");
  const [galeria2Precio, setGaleria2Precio] = useState("");
  const [galeria3Nombre, setGaleria3Nombre] = useState("");
  const [galeria3Precio, setGaleria3Precio] = useState("");

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
    setDireccion(n.direccion ?? "");
    setGoogleMapsUrl(n.googleMapsUrl ?? "");
    setAppleMapsUrl(n.appleMapsUrl ?? "");
    setInstagram(n.instagram ?? "");
    setFacebook(n.facebook ?? "");
    setHorarios(n.horarios ?? "");
    setMenu(n.menu ?? "");
    setLogoForma(n.logoForma ?? "circular");
    setColorAcento(n.colorAcento ?? "#C8FF3D");
    setProductoEstrellaNombre(n.productoEstrellaNombre ?? "");
    setProductoEstrellaPrecio(n.productoEstrellaPrecio ?? "");
    setGaleria1Nombre(n.galeria[0]?.nombre ?? "");
    setGaleria1Precio(n.galeria[0]?.precio ?? "");
    setGaleria2Nombre(n.galeria[1]?.nombre ?? "");
    setGaleria2Precio(n.galeria[1]?.precio ?? "");
    setGaleria3Nombre(n.galeria[2]?.nombre ?? "");
    setGaleria3Precio(n.galeria[2]?.precio ?? "");
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
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "No se pudo enviar la información.");
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
          <label>Dirección</label>
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </div>
        <div className="field">
          <label>Link de Google Maps</label>
          <input value={googleMapsUrl} onChange={(e) => setGoogleMapsUrl(e.target.value)} placeholder="https://maps.google.com/?q=..." />
        </div>
        <div className="field">
          <label>Link de Apple Maps (opcional)</label>
          <input value={appleMapsUrl} onChange={(e) => setAppleMapsUrl(e.target.value)} placeholder="https://maps.apple.com/?q=..." />
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
            <h2>Producto estrella</h2>
          </div>
          <p className="small">Su foto será el fondo principal de tu minisitio.</p>
          <ImageUploadField
            label="Foto"
            campo="producto_estrella_foto"
            uploadUrl={uploadUrl}
            existentes={negocio.productoEstrellaFoto ? [negocio.productoEstrellaFoto] : []}
            onUploaded={cargar}
          />
          <div className="field">
            <label>Nombre del producto</label>
            <input value={productoEstrellaNombre} onChange={(e) => setProductoEstrellaNombre(e.target.value)} />
          </div>
          <div className="field">
            <label>Precio</label>
            <input value={productoEstrellaPrecio} onChange={(e) => setProductoEstrellaPrecio(e.target.value)} />
          </div>
        </section>

        <section className="section" style={{ padding: "12px 0" }}>
          <div className="head">
            <h2>Galería (3 productos)</h2>
          </div>
          {[
            { n: 1, campo: "galeria_1_foto", nombre: galeria1Nombre, setNombre: setGaleria1Nombre, precio: galeria1Precio, setPrecio: setGaleria1Precio, foto: negocio.galeria[0]?.foto },
            { n: 2, campo: "galeria_2_foto", nombre: galeria2Nombre, setNombre: setGaleria2Nombre, precio: galeria2Precio, setPrecio: setGaleria2Precio, foto: negocio.galeria[1]?.foto },
            { n: 3, campo: "galeria_3_foto", nombre: galeria3Nombre, setNombre: setGaleria3Nombre, precio: galeria3Precio, setPrecio: setGaleria3Precio, foto: negocio.galeria[2]?.foto },
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
            </div>
          ))}
        </section>

        <section className="section" style={{ padding: "12px 0" }}>
          <div className="head">
            <h2>Menú</h2>
          </div>
          <div className="field">
            <textarea
              className="textarea"
              value={menu}
              onChange={(e) => setMenu(e.target.value)}
              placeholder={MENU_PLACEHOLDER}
              style={{ minHeight: 200 }}
            />
            <div className="small" style={{ marginTop: 6 }}>
              Escribe la CATEGORÍA en su propia línea, luego cada platillo como &quot;Producto — $Precio&quot;.
            </div>
          </div>
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
