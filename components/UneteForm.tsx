"use client";

import { useState } from "react";

export default function UneteForm({ categorias }: { categorias: { slug: string; nombre: string }[] }) {
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
          colonia: data.get("colonia"),
          instagram: data.get("instagram"),
          facebook: data.get("facebook"),
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
    <form className="form" id="joinForm" onSubmit={submitJoin} lang="es">
      <div className="head">
        <h2>Empieza aquí.</h2>
      </div>
      <div className="field">
        <label>Nombre del negocio</label>
        <input name="nombreNegocio" required placeholder="Ej. Casa Verde" spellCheck />
      </div>
      <div className="field">
        <label>Categoría</label>
        <select name="categoria" required defaultValue="">
          <option value="" disabled>
            Selecciona una categoría
          </option>
          {categorias.map((c) => (
            <option key={c.slug} value={c.nombre}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Colonia / zona</label>
        <input name="colonia" placeholder="Ej. Centro, Las Fuentes..." spellCheck />
      </div>
      <div className="field">
        <label>Tu nombre</label>
        <input name="contactoNombre" required placeholder="Nombre y apellido" spellCheck />
      </div>
      <div className="field">
        <label>Teléfono / WhatsApp</label>
        <input name="telefono" required placeholder="+52..." />
      </div>
      <div className="field">
        <label>Instagram (opcional)</label>
        <input name="instagram" placeholder="@tunegocio" />
      </div>
      <div className="field">
        <label>Facebook (opcional)</label>
        <input name="facebook" placeholder="facebook.com/tunegocio" />
      </div>
      <div className="field">
        <label>Cuéntanos sobre tu negocio</label>
        <textarea
          name="descripcion"
          className="textarea"
          placeholder="Tipo de negocio, qué vendes, qué te hace especial..."
          spellCheck
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
        <p className="small" style={{ marginTop: 10, color: "var(--coral)" }}>
          {errorMsg}
        </p>
      )}
    </form>
  );
}
