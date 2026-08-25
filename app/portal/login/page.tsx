"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PortalLoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo iniciar sesión.");
      }
      router.push("/portal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
      setEnviando(false);
    }
  }

  return (
    <div className="admin-login-wrap">
      <form className="admin-card" onSubmit={onSubmit}>
        <h1>Portal de tu negocio</h1>
        <div className="admin-field">
          <label>Usuario</label>
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoFocus required />
        </div>
        <div className="admin-field">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="admin-btn" type="submit" disabled={enviando} style={{ width: "100%" }}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
}
