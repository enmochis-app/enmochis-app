"use client";

import { useState } from "react";
import { CATEGORIAS } from "@/lib/negocios";

export default function UnetePage() {
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submitJoin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setEstado("enviando");
    setErrorMsg("");
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreNegocio: data.get("nombreNegocio"),
          categoria: data.get("categoria"),
          contactoNombre: data.get("contactoNombre"),
          telefono: data.get("telefono"),
          descripcion: data.get("descripcion"),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo enviar la solicitud.");
      }
      setEstado("ok");
      form.reset();
    } catch (err) {
      setEstado("error");
      setErrorMsg(err instanceof Error ? err.message : "No se pudo enviar la solicitud.");
    }
  }

  return (
    <>
      <div className="hero">
        <div className="eyebrow">PARA NEGOCIOS LOCALES</div>
        <h1 className="title">
          Tu negocio.
          <br />
          Tu lugar
          <br />
          en EnMochis.
        </h1>
        <p className="intro">
          Crea un minisitio para que tus clientes encuentren tu menú, ubicación, teléfono
          y todo lo que necesitan para visitarte.
        </p>
      </div>
      <div className="cta">
        <h2>Haz que te encuentren.</h2>
        <p>Tu página, tu identidad y tu información. Sin competir con menús de otros negocios.</p>
        <a className="btn" href="#joinForm">
          QUIERO UNIRME →
        </a>
      </div>
      <section className="section">
        <div className="head">
          <h2>¿Qué incluye?</h2>
        </div>
        <div className="list">
          <div className="listitem" style={{ cursor: "default" }}>
            <div className="number" style={{ fontSize: 28 }}>
              01
            </div>
            <div>
              <h3>MiniSitio</h3>
              <div className="small">Una página diseñada para tu negocio.</div>
            </div>
          </div>
          <div className="listitem" style={{ cursor: "default" }}>
            <div className="number" style={{ fontSize: 28 }}>
              02
            </div>
            <div>
              <h3>Menú digital</h3>
              <div className="small">Tus productos siempre visibles y actualizados.</div>
            </div>
          </div>
          <div className="listitem" style={{ cursor: "default" }}>
            <div className="number" style={{ fontSize: 28 }}>
              03
            </div>
            <div>
              <h3>Descubrimiento</h3>
              <div className="small">Aparece en búsquedas, categorías y recomendaciones.</div>
            </div>
          </div>
        </div>
      </section>
      <form className="form" id="joinForm" onSubmit={submitJoin}>
        <div className="head">
          <h2>Empieza aquí.</h2>
        </div>
        <div className="field">
          <label>Nombre del negocio</label>
          <input name="nombreNegocio" required placeholder="Ej. Casa Verde" />
        </div>
        <div className="field">
          <label>Categoría</label>
          <select name="categoria" required defaultValue="">
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {CATEGORIAS.map((c) => (
              <option key={c.slug} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Tu nombre</label>
          <input name="contactoNombre" required placeholder="Nombre y apellido" />
        </div>
        <div className="field">
          <label>Teléfono / WhatsApp</label>
          <input name="telefono" required placeholder="+52..." />
        </div>
        <div className="field">
          <label>Cuéntanos sobre tu negocio</label>
          <textarea
            name="descripcion"
            className="textarea"
            placeholder="Tipo de negocio, categoría, qué quieres mostrar..."
          />
        </div>
        <button className="btn" type="submit" disabled={estado === "enviando"}>
          {estado === "enviando" ? "ENVIANDO..." : "ENVIAR SOLICITUD"}
        </button>
        {estado === "ok" && (
          <p className="small" style={{ marginTop: 10 }}>
            ¡Solicitud enviada! Te contactaremos pronto.
          </p>
        )}
        {estado === "error" && (
          <p className="small" style={{ marginTop: 10, color: "#c0392b" }}>
            {errorMsg}
          </p>
        )}
      </form>
    </>
  );
}
