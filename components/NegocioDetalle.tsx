"use client";

import { useEffect, useRef, useState } from "react";
import type { Negocio } from "@/lib/negocios";
import { parsearMenu } from "@/lib/negocios";

function telHref(numero: string) {
  return `tel:${numero.replace(/[^\d+]/g, "")}`;
}
function waHref(numero: string, slug: string, mensajeBase?: string) {
  const base = mensajeBase?.trim() || "Hola 👋, quiero hacer un pedido.";
  const mensaje = `${base} Vengo de ${slug}.enmochis.app`;
  return `https://wa.me/${numero.replace(/[^\d]/g, "")}?text=${encodeURIComponent(mensaje)}`;
}
function urlGoogleMaps(lat: number, lng: number, nombre: string) {
  return `https://maps.google.com/maps?q=${lat},${lng}(${encodeURIComponent(nombre)})`;
}
function urlAppleMaps(lat: number, lng: number, nombre: string) {
  return `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(nombre)}`;
}

function registrarEvento(negocioId: string, tipo: string) {
  const body = JSON.stringify({ negocioId, tipo });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/eventos", new Blob([body], { type: "application/json" }));
  } else {
    fetch("/api/eventos", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  }
}

function CarruselGaleria({ galeria }: { galeria: Negocio["galeria"] }) {
  const [activo, setActivo] = useState(0);
  const items = galeria.filter((g) => g.foto);

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const track = e.currentTarget;
    const primera = track.firstElementChild as HTMLElement | null;
    const anchoTarjeta = primera ? primera.getBoundingClientRect().width + 16 : 1;
    setActivo(Math.round(track.scrollLeft / anchoTarjeta));
  }

  return (
    <div className="mini-galeria">
      <p className="galeria-eyebrow">Lo más pedido</p>
      <h2 className="galeria-titulo">Galería</h2>
      <div className="carrusel-track" onScroll={onScroll}>
        {items.map((g, i) => (
          <div className="tarjeta" key={i}>
            <div className="foto-wrap">
              <img src={g.foto} alt={g.nombre ?? ""} loading="lazy" />
              {g.precio && (
                <div className="tag-precio">
                  {g.precio}
                  {g.unidad && <small>{g.unidad}</small>}
                </div>
              )}
            </div>
            <div className="info">
              {g.nombre && <p className="nombre">{g.nombre}</p>}
              {g.descripcion && <p className="desc">{g.descripcion}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="dots">
        {items.map((_, i) => (
          <div key={i} className={`dot${i === activo ? " activo" : ""}`} />
        ))}
      </div>
    </div>
  );
}

export default function NegocioDetalle({ negocio }: { negocio: Negocio }) {
  const [pantalla, setPantalla] = useState<"inicio" | "menu">("inicio");
  const [appleRecomendado, setAppleRecomendado] = useState(false);
  const scrimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      if (!scrimRef.current) return;
      const op = Math.max(0, 1 - window.scrollY / 180);
      scrimRef.current.style.opacity = String(op);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pantalla]);

  useEffect(() => {
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- detección de dispositivo, solo posible en el navegador
    setAppleRecomendado(ios);
  }, []);

  useEffect(() => {
    registrarEvento(negocio.id, "visita");
  }, [negocio.id]);

  const accent = negocio.colorAcento || "#C8FF3D";
  const tieneAddon = (clave: string) => negocio.addons.some((a) => a.clave === clave);

  const tieneMapa = tieneAddon("mapas") && negocio.lat !== undefined && negocio.lng !== undefined;
  const urlGoogle = tieneMapa ? urlGoogleMaps(negocio.lat!, negocio.lng!, negocio.nombre) : undefined;
  const urlApple = tieneMapa ? urlAppleMaps(negocio.lat!, negocio.lng!, negocio.nombre) : undefined;
  const urlMapaRecomendado = appleRecomendado ? urlApple : urlGoogle;
  const urlMapaSecundario = appleRecomendado ? urlGoogle : urlApple;
  const nombreMapaSecundario = appleRecomendado ? "Google Maps" : "Apple Maps";

  const addonWhatsapp = tieneAddon("whatsapp");
  const mostrarGaleria = tieneAddon("galeria") && negocio.galeria.some((g) => g.foto);
  const categorias = parsearMenu(negocio.menu);
  const servicios = negocio.addons.filter((a) => a.comportamiento === "chip");

  return (
    <div className="mini-wrap" style={{ "--accent": accent } as React.CSSProperties}>
      <a className="mini-tag" href="https://enmochis.app" target="_blank" rel="noopener noreferrer">
        enmochis · directorio
      </a>

      {/* ===== PANTALLA: INICIO ===== */}
      <div className={`screen${pantalla === "inicio" ? " activo" : ""}`}>
        <div
          className="hero-bg"
          style={negocio.fotoPortada ? { backgroundImage: `url(${negocio.fotoPortada})` } : undefined}
        />
        {!negocio.fotoPortada && <div className="ph-icon-wrap">🍽️</div>}
        <div className="hero-scrim-top" ref={scrimRef} />
        <div className="hero-scrim-bottom" />

        <div className="hero-content">
          <div className="home-title-block">
            <div className="land-cat">{negocio.categoria}</div>
            <div className="land-name">{negocio.nombre.toUpperCase()}</div>
            {negocio.descripcionCorta && <div className="land-sub">{negocio.descripcionCorta}</div>}
          </div>

          <div className={`hero-logo-center shape-${negocio.logoForma}`}>
            {negocio.logoUrl && <img src={negocio.logoUrl} alt={negocio.nombre} />}
          </div>
        </div>

        {negocio.descripcionLarga && <p className="land-desc">{negocio.descripcionLarga}</p>}

        {servicios.length > 0 && (
          <div className="mini-servicios">
            {servicios.map((a) => (
              <span className="mini-chip" key={a.id}>
                {a.icono} {a.nombre}
              </span>
            ))}
          </div>
        )}

        {tieneMapa && (
          <div className="mini-mapas">
            {negocio.direccion && <div className="mapas-direccion">{negocio.direccion}</div>}
            <a
              className="cta-btn mapa-principal"
              href={urlMapaRecomendado}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registrarEvento(negocio.id, "mapa")}
              style={{ background: accent, color: "#0A0A0A" }}
            >
              📍 Cómo llegar
              <span className="chip-recomendado">Recomendado</span>
            </a>
            <a
              className="mapa-secundario"
              href={urlMapaSecundario}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registrarEvento(negocio.id, "mapa")}
            >
              Prefiero {nombreMapaSecundario}
            </a>
          </div>
        )}

        <div style={{ height: 240 }} />

        <div className="cta-float">
          {mostrarGaleria && (
            <div className="home-thumbs">
              {negocio.galeria
                .filter((g) => g.foto)
                .map((g, i) => (
                  <div key={i} className="home-thumb" style={{ backgroundImage: `url(${g.foto})` }} />
                ))}
            </div>
          )}
          {negocio.telefono && (
            <a
              className="cta-btn"
              href={telHref(negocio.telefono)}
              onClick={() => registrarEvento(negocio.id, "llamar")}
              style={{ background: accent, color: "#0A0A0A" }}
            >
              ☎ LLAMAR AHORA
            </a>
          )}
          <button
            type="button"
            className="cta-btn"
            onClick={() => {
              registrarEvento(negocio.id, "ver_menu");
              setPantalla("menu");
            }}
            style={{ background: "rgba(10,10,10,0.75)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)" }}
          >
            ☰ VER MENÚ
          </button>
        </div>
      </div>

      {/* ===== PANTALLA: MENÚ ===== */}
      <div className={`screen${pantalla === "menu" ? " activo" : ""}`}>
        <div className="menu-topbar">
          <button type="button" onClick={() => setPantalla("inicio")}>
            ← Inicio
          </button>
          <span className="mt-title">{negocio.nombre.toUpperCase()}</span>
        </div>

        {mostrarGaleria && <CarruselGaleria galeria={negocio.galeria} />}

        <div className="menu-section">
          <div className="menu-main-title">THE MENU</div>
          {categorias.map((cat, i) => (
            <div className="menu-cat-block" key={cat.categoria + i}>
              <div className="menu-cat-name">{cat.categoria}</div>
              {cat.items.map((item, j) => (
                <div className="menu-line" key={item.nombre + j}>
                  <span className="mname">{item.nombre}</span>
                  <span className="mprice">${item.precio}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {servicios.length > 0 && (
          <div className="mini-servicios">
            {servicios.map((a) => (
              <span className="mini-chip" key={a.id}>
                {a.icono} {a.nombre}
              </span>
            ))}
          </div>
        )}
        <div style={{ height: 40 }} />
      </div>

      {/* ===== BARRA INFERIOR ===== */}
      <div className="sticky-bar">
        <button type="button" className="activo" onClick={() => setPantalla("inicio")}>
          <span className="icon-ic">🏠</span>INICIO
        </button>
        {tieneMapa && (
          <a href={urlMapaRecomendado} target="_blank" rel="noopener noreferrer" onClick={() => registrarEvento(negocio.id, "mapa")}>
            <span className="icon-ic">📍</span>MAPA
          </a>
        )}
        {addonWhatsapp && negocio.whatsapp && (
          <a
            href={waHref(negocio.whatsapp, negocio.slug, negocio.mensajeWhatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registrarEvento(negocio.id, "whatsapp")}
          >
            <span className="icon-ic">💬</span>WHATSAPP
          </a>
        )}
        {!addonWhatsapp && negocio.telefono && (
          <a href={telHref(negocio.telefono)} onClick={() => registrarEvento(negocio.id, "llamar")}>
            <span className="icon-ic">☎</span>LLAMAR
          </a>
        )}
        <button
          type="button"
          onClick={() => {
            registrarEvento(negocio.id, "ver_menu");
            setPantalla("menu");
          }}
        >
          <span className="icon-ic">☰</span>MENÚ
        </button>
      </div>
    </div>
  );
}
