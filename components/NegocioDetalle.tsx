"use client";

import { useEffect, useRef, useState } from "react";
import type { Negocio } from "@/lib/negocios";
import { parsearMenu } from "@/lib/negocios";

function telHref(numero: string) {
  return `tel:${numero.replace(/[^\d+]/g, "")}`;
}
function waHref(numero: string, slug: string) {
  const mensaje = `Hola, vengo de ${slug}.enmochis.app 👋`;
  return `https://wa.me/${numero.replace(/[^\d]/g, "")}?text=${encodeURIComponent(mensaje)}`;
}

const SERVICIOS: { addon: keyof Negocio; emoji: string; label: string }[] = [
  { addon: "addonPedidos", emoji: "🛍️", label: "Pedidos por WhatsApp" },
  { addon: "addonQrMesa", emoji: "📱", label: "Pide desde tu mesa (QR)" },
  { addon: "addonLealtad", emoji: "⭐", label: "Programa de lealtad" },
  { addon: "addonMultiSucursal", emoji: "📍", label: "Varias sucursales" },
];

export default function NegocioDetalle({ negocio }: { negocio: Negocio }) {
  const [pantalla, setPantalla] = useState<"inicio" | "menu">("inicio");
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

  const accent = negocio.colorAcento || "#C8FF3D";
  const goMapsUrl = negocio.addonMapas ? negocio.googleMapsUrl || negocio.appleMapsUrl : undefined;
  const galeriaConFoto = negocio.galeria.filter((g) => g.foto);
  const categorias = parsearMenu(negocio.menu);
  const servicios = SERVICIOS.filter((s) => negocio[s.addon] === true);

  return (
    <div className="mini-wrap" style={{ "--accent": accent } as React.CSSProperties}>
      <a className="mini-tag" href="https://enmochis.app" target="_blank" rel="noopener noreferrer">
        enmochis · directorio
      </a>

      {/* ===== PANTALLA: INICIO ===== */}
      <div className={`screen${pantalla === "inicio" ? " activo" : ""}`}>
        <div
          className="hero-bg"
          style={negocio.productoEstrellaFoto ? { backgroundImage: `url(${negocio.productoEstrellaFoto})` } : undefined}
        />
        {!negocio.productoEstrellaFoto && <div className="ph-icon-wrap">🍽️</div>}
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
            {servicios.map((s) => (
              <span className="mini-chip" key={s.addon}>
                {s.emoji} {s.label}
              </span>
            ))}
          </div>
        )}

        <div style={{ height: 240 }} />

        <div className="cta-float">
          {galeriaConFoto.length > 0 && (
            <div className="home-thumbs">
              {galeriaConFoto.map((g, i) => (
                <div key={i} className="home-thumb" style={{ backgroundImage: `url(${g.foto})` }} />
              ))}
            </div>
          )}
          {negocio.telefono && (
            <a className="cta-btn" href={telHref(negocio.telefono)} style={{ background: accent, color: "#0A0A0A" }}>
              ☎ LLAMAR AHORA
            </a>
          )}
          <div className="cta-row-pair">
            {goMapsUrl && (
              <a
                className="cta-btn"
                href={goMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: "rgba(10,10,10,0.75)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)" }}
              >
                📍 CÓMO LLEGAR
              </a>
            )}
            <button
              type="button"
              className="cta-btn"
              onClick={() => setPantalla("menu")}
              style={{ background: "rgba(10,10,10,0.75)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)" }}
            >
              ☰ VER MENÚ
            </button>
          </div>
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

        {galeriaConFoto.length > 0 && (
          <div className="carousel-wrap">
            <div className="land-section-title">Lo más pedido</div>
            <div className="carousel">
              {negocio.galeria.map((g, i) =>
                g.foto ? (
                  <div className="prod-card" key={i}>
                    <div className="prod-photo" style={{ backgroundImage: `url(${g.foto})` }} />
                    <div className="prod-body">
                      {g.nombre && <div className="prod-name">{g.nombre}</div>}
                      {g.precio && <div className="prod-price">{g.precio}</div>}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

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
            {servicios.map((s) => (
              <span className="mini-chip" key={s.addon}>
                {s.emoji} {s.label}
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
        {goMapsUrl && (
          <a href={goMapsUrl} target="_blank" rel="noopener noreferrer">
            <span className="icon-ic">📍</span>MAPA
          </a>
        )}
        {negocio.addonWhatsapp && negocio.whatsapp && (
          <a href={waHref(negocio.whatsapp, negocio.slug)} target="_blank" rel="noopener noreferrer">
            <span className="icon-ic">💬</span>WHATSAPP
          </a>
        )}
        {!negocio.addonWhatsapp && negocio.telefono && (
          <a href={telHref(negocio.telefono)}>
            <span className="icon-ic">☎</span>LLAMAR
          </a>
        )}
        <button type="button" onClick={() => setPantalla("menu")}>
          <span className="icon-ic">☰</span>MENÚ
        </button>
      </div>
    </div>
  );
}
