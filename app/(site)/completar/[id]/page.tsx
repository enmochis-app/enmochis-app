"use client";

import { use, useCallback, useEffect, useState } from "react";
import type { Negocio } from "@/lib/airtable";
import ImageUploadField from "@/components/ImageUploadField";

type MenuItem = { nombre: string; precio: string };

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
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [horarios, setHorarios] = useState("");
  const [menu, setMenu] = useState<MenuItem[]>([{ nombre: "", precio: "" }]);

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
    setInstagram(n.instagram ?? "");
    setFacebook(n.facebook ?? "");
    setHorarios(n.horarios ?? "");
    setMenu(
      n.menu.length > 0
        ? n.menu.map((m) => ({ nombre: m.nombre, precio: m.precio ?? "" }))
        : [{ nombre: "", precio: "" }]
    );
    setCargando(false);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargar();
  }, [cargar]);

  function actualizarMenuFila(i: number, campo: "nombre" | "precio", valor: string) {
    setMenu((prev) => prev.map((fila, idx) => (idx === i ? { ...fila, [campo]: valor } : fila)));
  }
  function agregarFilaMenu() {
    setMenu((prev) => [...prev, { nombre: "", precio: "" }]);
  }
  function quitarFilaMenu(i: number) {
    setMenu((prev) => prev.filter((_, idx) => idx !== i));
  }

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
          instagram,
          facebook,
          horarios,
          menu: menu.filter((m) => m.nombre.trim()),
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
            <h2>Fotos</h2>
          </div>
          <ImageUploadField
            label="Logo"
            campo="logo"
            uploadUrl={uploadUrl}
            existentes={negocio.logoUrl ? [negocio.logoUrl] : []}
            onUploaded={cargar}
          />
          <ImageUploadField
            label="Foto de portada"
            campo="foto_portada"
            uploadUrl={uploadUrl}
            existentes={negocio.fotoPortadaUrl ? [negocio.fotoPortadaUrl] : []}
            onUploaded={cargar}
          />
          <ImageUploadField
            label="Galería (varias fotos)"
            campo="galeria"
            uploadUrl={uploadUrl}
            existentes={negocio.galeria}
            multiple
            onUploaded={cargar}
          />
        </section>

        <section className="section" style={{ padding: "12px 0" }}>
          <div className="head">
            <h2>Menú</h2>
          </div>
          {menu.map((fila, i) => (
            <div className="admin-menu-row" key={i}>
              <input
                placeholder="Platillo"
                value={fila.nombre}
                onChange={(e) => actualizarMenuFila(i, "nombre", e.target.value)}
              />
              <input
                placeholder="Precio"
                value={fila.precio}
                onChange={(e) => actualizarMenuFila(i, "precio", e.target.value)}
                style={{ maxWidth: 100 }}
              />
              <button type="button" className="backlink" onClick={() => quitarFilaMenu(i)}>
                Quitar
              </button>
            </div>
          ))}
          <button type="button" className="backlink" onClick={agregarFilaMenu}>
            + Agregar platillo
          </button>
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
