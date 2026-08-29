"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { Negocio } from "@/lib/negocios";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0, I/1

function generarCodigo(): string {
  let codigo = "";
  for (let i = 0; i < 6; i++) codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  return codigo;
}

type Saldo = { total: number; meta: number; modo: "visitas" | "puntos"; alcanzoMeta: boolean };

export default function TarjetaLealtad({ negocio }: { negocio: Negocio }) {
  const claveLocal = `enmochis_codigo_lealtad_${negocio.slug}`;
  const [codigo, setCodigo] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [saldo, setSaldo] = useState<Saldo | null>(null);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [codigoRecuperar, setCodigoRecuperar] = useState("");
  const [descargando, setDescargando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const tarjetaRef = useRef<HTMLDivElement>(null);

  // Personalización de la tarjeta — solo visual, nunca se guarda ni se envía
  // a ningún lado (ni base de datos ni localStorage): vive solo en esta vista.
  const [formListo, setFormListo] = useState(false);
  const [nombreCliente, setNombreCliente] = useState("");
  const [apellidoCliente, setApellidoCliente] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  useEffect(() => {
    const existente = localStorage.getItem(claveLocal);
    const activo = existente || generarCodigo();
    if (!existente) localStorage.setItem(claveLocal, activo);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lee/crea el código guardado en este dispositivo al montar
    setCodigo(activo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!codigo) return;
    QRCode.toDataURL(codigo, { width: 160, margin: 1, color: { dark: "#1A1A1A", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => {});
    fetch("/api/lealtad/consultar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: negocio.slug, codigo }),
    })
      .then((r) => r.json())
      .then(setSaldo)
      .catch(() => {});
  }, [codigo, negocio.slug]);

  function usarCodigoRecuperado() {
    const nuevo = codigoRecuperar.trim().toUpperCase();
    if (!nuevo) return;
    localStorage.setItem(claveLocal, nuevo);
    setCodigo(nuevo);
    setMostrarRecuperar(false);
    setCodigoRecuperar("");
  }

  async function descargarTarjeta() {
    if (!tarjetaRef.current) return;
    setDescargando(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(tarjetaRef.current, { scale: 4, backgroundColor: "#0A0A0A" });
      const link = document.createElement("a");
      link.download = `tarjeta-puntos-${negocio.slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setGuardado(true);
    } finally {
      setDescargando(false);
    }
  }

  const accent = negocio.colorAcento || "#C8FF3D";
  const iniciales = negocio.nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mini-wrap" style={{ "--accent": accent, padding: "28px 20px 60px" } as React.CSSProperties}>
      <div className="tl-header">
        <p className="tl-eyebrow">Tarjeta de puntos</p>
        <h1 className="tl-titulo">{negocio.nombre}</h1>
      </div>

      {!formListo ? (
        <div className="tl-form">
          <p>
            Cuéntanos cómo se llama tu tarjeta — es solo para personalizarla en esta pantalla, no se guarda en
            ningún lado.
          </p>
          <div className="tl-form-field">
            <label>Nombre</label>
            <input value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div className="tl-form-field">
            <label>Apellido</label>
            <input value={apellidoCliente} onChange={(e) => setApellidoCliente(e.target.value)} placeholder="Tu apellido" />
          </div>
          <div className="tl-form-field">
            <label>Fecha de nacimiento (opcional)</label>
            <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
          </div>
          <button type="button" style={{ background: accent, color: "#0A0A0A" }} onClick={() => setFormListo(true)}>
            Ver mi tarjeta
          </button>
          <button type="button" className="tl-form-omitir" onClick={() => setFormListo(true)}>
            Omitir, ver mi tarjeta sin personalizar
          </button>
        </div>
      ) : (
        <>
          <div className="tarjeta-lealtad" ref={tarjetaRef}>
            <div
              className="tl-foto"
              style={negocio.fotoPortada ? { backgroundImage: `url(${negocio.fotoPortada})` } : undefined}
            >
              <div className="tl-marca">
                <div className="tl-logo">{iniciales}</div>
                <span>{negocio.nombre}</span>
              </div>
            </div>
            <div className="tl-cuerpo">
              {qrDataUrl && <img className="tl-qr" src={qrDataUrl} alt="Código QR" />}
              <div className="tl-codigo">{codigo}</div>
              {(nombreCliente || apellidoCliente) && (
                <div className="tl-para">Para: {[nombreCliente, apellidoCliente].filter(Boolean).join(" ")}</div>
              )}
              {saldo && (
                <div className="tl-progreso">
                  {saldo.total} / {saldo.meta} {saldo.modo === "puntos" ? "puntos" : "visitas"}
                  {saldo.alcanzoMeta && " · ¡Ya puedes canjear! 🎉"}
                </div>
              )}
              <p className="tl-leyenda">
                Presenta este código QR en tu próxima visita a {negocio.nombre} para sumar {saldo?.modo === "puntos" ? "puntos" : "una visita"} a tu tarjeta de lealtad.
              </p>
            </div>
          </div>

          <div className="tl-nota">El negocio solo escanea el QR — no ve tu nombre, queda solo en tu tarjeta.</div>

          <button type="button" className="cta-btn tl-descargar" style={{ background: accent, color: "#0A0A0A" }} onClick={descargarTarjeta} disabled={descargando}>
            {descargando ? "Generando..." : "⬇ Descargar a mi galería"}
          </button>
          {guardado && <p className="tl-confirmacion">Guardada. Búscala en tu galería.</p>}

          {!mostrarRecuperar ? (
            <button type="button" className="tl-link" onClick={() => setMostrarRecuperar(true)}>
              ¿Ya tienes un código?
            </button>
          ) : (
            <div className="tl-recuperar">
              <input
                value={codigoRecuperar}
                onChange={(e) => setCodigoRecuperar(e.target.value)}
                maxLength={6}
                placeholder="Tu código de 6 caracteres"
              />
              <button type="button" onClick={usarCodigoRecuperado}>
                Usar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
