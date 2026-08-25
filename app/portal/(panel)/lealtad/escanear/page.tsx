"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";

type Saldo = { total: number; meta: number; modo: "visitas" | "puntos"; alcanzoMeta: boolean; unidadesSumadas?: number };

export default function EscanearLealtadPage() {
  const [modo, setModo] = useState<"visitas" | "puntos">("visitas");
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [codigoDetectado, setCodigoDetectado] = useState("");
  const [pidiendoMonto, setPidiendoMonto] = useState(false);
  const [monto, setMonto] = useState("");
  const [resultado, setResultado] = useState<Saldo | null>(null);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const escaneandoRef = useRef(false);
  const inputLectorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/portal/negocio")
      .then((r) => r.json())
      .then((body) => setModo(body.negocio?.lealtadModo ?? "visitas"));
  }, []);

  const detener = useCallback(() => {
    escaneandoRef.current = false;
    setCamaraActiva(false);
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => detener(), [detener]);

  function procesarCodigo(codigo: string) {
    escaneandoRef.current = false;
    setCodigoDetectado(codigo.trim().toUpperCase());
    setResultado(null);
    setError("");
    if (modo === "puntos") {
      setPidiendoMonto(true);
    } else {
      registrar(codigo.trim().toUpperCase());
    }
  }

  async function iniciarCamara() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamaraActiva(true);
      escaneandoRef.current = true;
      requestAnimationFrame(tick);
    } catch {
      setError("No se pudo acceder a la cámara. Puedes usar el lector físico o escribir el código a mano.");
    }
  }

  function tick() {
    if (!escaneandoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const detectado = jsQR(imageData.data, imageData.width, imageData.height);
        if (detectado?.data) {
          detener();
          procesarCodigo(detectado.data);
          return;
        }
      }
    }
    requestAnimationFrame(tick);
  }

  function manejarEnterLector(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const valor = e.currentTarget.value.trim();
    if (!valor) return;
    e.currentTarget.value = "";
    procesarCodigo(valor);
  }

  async function registrar(codigo: string, montoConfirmado?: number) {
    setProcesando(true);
    setError("");
    try {
      const res = await fetch("/api/portal/lealtad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo, accion: "registrar", monto: montoConfirmado }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "No se pudo registrar.");
      setResultado(body);
      setPidiendoMonto(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar.");
    } finally {
      setProcesando(false);
    }
  }

  async function canjear() {
    if (!codigoDetectado) return;
    setProcesando(true);
    setError("");
    try {
      const res = await fetch("/api/portal/lealtad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigoDetectado, accion: "canjear" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "No se pudo canjear.");
      setResultado(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo canjear.");
    } finally {
      setProcesando(false);
    }
  }

  function otraVez() {
    setCodigoDetectado("");
    setResultado(null);
    setPidiendoMonto(false);
    setMonto("");
    setError("");
    inputLectorRef.current?.focus();
  }

  return (
    <>
      <div className="admin-head-row">
        <h1 style={{ fontSize: 20 }}>Escanear código</h1>
      </div>

      <div className="admin-section">
        <div className="admin-field">
          <label>Lector físico USB/Bluetooth (o escribe el código y presiona Enter)</label>
          <input ref={inputLectorRef} type="text" onKeyDown={manejarEnterLector} placeholder="Código de 6 caracteres" autoFocus />
        </div>

        {!camaraActiva ? (
          <button type="button" className="admin-btn admin-btn-secondary" onClick={iniciarCamara}>
            📷 Usar la cámara
          </button>
        ) : (
          <button type="button" className="admin-btn admin-btn-secondary" onClick={detener}>
            Detener cámara
          </button>
        )}

        <div style={{ marginTop: 12, display: camaraActiva ? "block" : "none" }}>
          <video ref={videoRef} muted playsInline style={{ width: "100%", maxWidth: 320, borderRadius: 8 }} />
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {pidiendoMonto && (
          <div className="admin-section" style={{ marginTop: 14 }}>
            <h2>Código: {codigoDetectado}</h2>
            <div className="admin-field">
              <label>Monto de la compra</label>
              <input value={monto} onChange={(e) => setMonto(e.target.value)} inputMode="decimal" autoFocus />
            </div>
            <button
              type="button"
              className="admin-btn"
              disabled={procesando || !monto}
              onClick={() => registrar(codigoDetectado, Number(monto))}
            >
              {procesando ? "Registrando..." : "Confirmar"}
            </button>
          </div>
        )}

        {resultado && (
          <div className="admin-section" style={{ marginTop: 14 }}>
            <h2>{resultado.alcanzoMeta ? "🎉 ¡Meta alcanzada!" : "✅ Registrado"}</h2>
            <p>
              Código <strong>{codigoDetectado}</strong> — {resultado.total} / {resultado.meta}{" "}
              {resultado.modo === "puntos" ? "puntos" : "visitas"}
            </p>
            {resultado.alcanzoMeta && (
              <button type="button" className="admin-btn" onClick={canjear} disabled={procesando} style={{ marginRight: 10 }}>
                🎁 Canjear
              </button>
            )}
            <button type="button" className="admin-btn admin-btn-secondary" onClick={otraVez}>
              Escanear otro
            </button>
          </div>
        )}

        {error && <div className="admin-error">{error}</div>}
      </div>
    </>
  );
}
