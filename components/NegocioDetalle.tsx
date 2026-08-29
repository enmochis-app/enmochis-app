"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Negocio } from "@/lib/negocios";
import { agruparPorCategoria, type MenuItem } from "@/lib/menuItems";
import type { Calificacion, ResumenCalificaciones } from "@/lib/calificaciones";
import { telHref, waHref, urlGoogleMaps, urlAppleMaps } from "@/lib/addonLinks";

const DEGRADADO_INFERIOR_RGB: Record<Negocio["degradadoInferior"], string> = {
  negro: "10 10 10",
  blanco: "255 255 255",
  beige: "245 235 220",
};
const DEGRADADO_INFERIOR_TEXTO: Record<Negocio["degradadoInferior"], string> = {
  negro: "#666",
  blanco: "#999",
  beige: "#8a8272",
};

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

function BloqueCalificaciones({
  negocioId,
  modo,
  googleUrl,
  resumen,
  comentariosIniciales,
}: {
  negocioId: string;
  modo?: "google" | "interno";
  googleUrl?: string;
  resumen: ResumenCalificaciones;
  comentariosIniciales: Calificacion[];
}) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  if (modo === "google") {
    if (!googleUrl) return null;
    return (
      <a className="mini-calificaciones-google" href={googleUrl} target="_blank" rel="noopener noreferrer">
        ⭐ Ver reseñas en Google
      </a>
    );
  }

  if (modo !== "interno") return null;

  async function enviar() {
    if (estrellas < 1 || enviando) return;
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/calificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocioId, estrellas, comentario }),
      });
      if (!res.ok) throw new Error();
      setEnviado(true);
      setMostrarForm(false);
    } catch {
      setError("No se pudo enviar tu reseña. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mini-calificaciones">
      <div className="calif-resumen">
        <span className="calif-estrellas">{resumen.total > 0 ? "★".repeat(Math.round(resumen.promedio)) : "☆"}</span>
        <span className="calif-numero">{resumen.total > 0 ? resumen.promedio.toFixed(1) : "Sin reseñas todavía"}</span>
        {resumen.total > 0 && <span className="calif-total">({resumen.total})</span>}
      </div>
      {comentariosIniciales.slice(0, 3).map((c) => (
        <div className="calif-item" key={c.id}>
          <span className="calif-item-estrellas">{"★".repeat(c.estrellas)}</span>
          {c.comentario && <p>{c.comentario}</p>}
        </div>
      ))}
      {enviado ? (
        <div className="calif-gracias">¡Gracias por tu reseña!</div>
      ) : mostrarForm ? (
        <div className="calif-form">
          <div className="calif-picker">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={n <= estrellas ? "activo" : ""}
                onClick={() => setEstrellas(n)}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            placeholder="Comentario (opcional)"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
          {error && <div className="calif-error">{error}</div>}
          <button type="button" onClick={enviar} disabled={enviando || estrellas < 1}>
            {enviando ? "Enviando..." : "Enviar reseña"}
          </button>
        </div>
      ) : (
        <button type="button" className="calif-abrir" onClick={() => setMostrarForm(true)}>
          Dejar una reseña
        </button>
      )}
    </div>
  );
}

export default function NegocioDetalle({
  negocio,
  menuItems,
  resumenCalificaciones,
  comentarios,
}: {
  negocio: Negocio;
  menuItems: MenuItem[];
  resumenCalificaciones?: ResumenCalificaciones;
  comentarios?: Calificacion[];
}) {
  const [appleRecomendado, setAppleRecomendado] = useState(false);
  const [modoPedido, setModoPedido] = useState(false);
  const [carrito, setCarrito] = useState<Record<string, number>>({});
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [notaPedido, setNotaPedido] = useState("");
  const scrimRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      if (!scrimRef.current) return;
      const op = Math.max(0, 1 - window.scrollY / 220);
      scrimRef.current.style.opacity = String(op);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  // Anima con un fundido hacia arriba cada sección (.reveal) la primera vez que
  // entra en pantalla al hacer scroll — así el minisitio de una sola página se
  // siente vivo en vez de aparecer todo de golpe.
  useEffect(() => {
    const contenedor = wrapRef.current;
    if (!contenedor) return;
    const elementos = contenedor.querySelectorAll<HTMLElement>(".reveal");
    if (elementos.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elementos.forEach((el) => el.classList.add("in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("in");
            observer.unobserve(entrada.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    elementos.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const accent = negocio.colorAcento || "#C8FF3D";
  const degradadoInferiorRgb = DEGRADADO_INFERIOR_RGB[negocio.degradadoInferior] ?? "10 10 10";
  const degradadoInferiorTexto = DEGRADADO_INFERIOR_TEXTO[negocio.degradadoInferior] ?? "#666";
  const tieneAddon = (clave: string) => negocio.addons.some((a) => a.clave === clave);

  const tieneMapa = tieneAddon("mapas") && negocio.lat !== undefined && negocio.lng !== undefined;
  const urlGoogle = tieneMapa ? urlGoogleMaps(negocio.lat!, negocio.lng!, negocio.nombre) : undefined;
  const urlApple = tieneMapa ? urlAppleMaps(negocio.lat!, negocio.lng!, negocio.nombre) : undefined;
  const urlMapaRecomendado = appleRecomendado ? urlApple : urlGoogle;
  const urlMapaSecundario = appleRecomendado ? urlGoogle : urlApple;
  const nombreMapaSecundario = appleRecomendado ? "Google Maps" : "Apple Maps";

  const addonWhatsapp = tieneAddon("whatsapp");
  const mostrarGaleria = tieneAddon("galeria") && negocio.galeria.some((g) => g.foto);
  const categorias = agruparPorCategoria(menuItems);
  const servicios = negocio.addons.filter((a) => a.comportamiento === "chip");
  const tienePedidos = tieneAddon("pedidos") && menuItems.some((it) => it.ordenable);
  const tieneLealtad = tieneAddon("lealtad");
  const tieneCitas = tieneAddon("citas") && !!negocio.whatsapp;
  const tieneCalificaciones = tieneAddon("calificaciones") && !!negocio.calificacionModo;

  function agendarCita() {
    if (!negocio.whatsapp) return;
    registrarEvento(negocio.id, "cita");
    const base = negocio.mensajeCitas?.trim() || "Hola 👋, quiero agendar una cita.";
    window.open(waHref(negocio.whatsapp, negocio.slug, base), "_blank");
  }

  function agregarAlCarrito(item: MenuItem) {
    setCarrito((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }));
  }
  function quitarDelCarrito(item: MenuItem) {
    setCarrito((prev) => {
      const restante = (prev[item.id] ?? 0) - 1;
      const nuevo = { ...prev };
      if (restante <= 0) delete nuevo[item.id];
      else nuevo[item.id] = restante;
      return nuevo;
    });
  }

  const lineasCarrito = Object.entries(carrito)
    .map(([itemId, cantidad]) => {
      const item = menuItems.find((m) => m.id === itemId);
      if (!item) return null;
      const precioUnitario = parseFloat(item.precio) || 0;
      return { item, cantidad, subtotal: precioUnitario * cantidad };
    })
    .filter((l): l is { item: MenuItem; cantidad: number; subtotal: number } => l !== null);

  const totalCarrito = lineasCarrito.reduce((s, l) => s + l.subtotal, 0);
  const cantidadCarrito = lineasCarrito.reduce((s, l) => s + l.cantidad, 0);

  function enviarPedido() {
    if (!negocio.whatsapp || lineasCarrito.length === 0) return;
    registrarEvento(negocio.id, "pedido");
    const lineas = lineasCarrito.map((l) => `• ${l.cantidad}x ${l.item.nombre} — $${l.subtotal}`).join("\n");
    const base = negocio.mensajeWhatsapp?.trim() || "Hola 👋, quiero hacer este pedido:";
    let mensaje = `${base}\n\n${lineas}\n\nTotal: $${totalCarrito}`;
    if (notaPedido.trim()) mensaje += `\n\nNota: ${notaPedido.trim()}`;
    mensaje += `\n\nVengo de ${negocio.slug}.enmochis.app 🙌`;
    window.open(`https://wa.me/${negocio.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(mensaje)}`, "_blank");
  }

  return (
    <div
      ref={wrapRef}
      className="mini-wrap"
      style={
        {
          "--accent": accent,
          "--degradado-inferior-rgb": degradadoInferiorRgb,
          "--degradado-inferior-texto": degradadoInferiorTexto,
        } as React.CSSProperties
      }
    >
      <a className="mini-tag" href="https://enmochis.app" target="_blank" rel="noopener noreferrer">
        enmochis · directorio
      </a>

      {/* ===== HERO ===== */}
      <div className="hero-content">
        {/* La foto y los degradados van DENTRO de .hero-content (position:absolute + inset:0)
            en vez de fijos a toda la pantalla, así se quedan contenidos en el área del hero. */}
        <div
          className="hero-bg"
          style={negocio.fotoPortada ? { backgroundImage: `url(${negocio.fotoPortada})` } : undefined}
        />
        {!negocio.fotoPortada && <div className="ph-icon-wrap">🍽️</div>}
        <div className="hero-scrim-top" ref={scrimRef} />
        <div className="hero-scrim-bottom" />

        <div className="home-title-block">
          <div className="land-cat">{negocio.categoria}</div>
          <div className="land-name">{negocio.nombre.toUpperCase()}</div>
          {negocio.descripcionCorta && <div className="land-sub">{negocio.descripcionCorta}</div>}
          <div className="hero-acciones">
            {negocio.telefono && (
              <a
                className="hero-llamar"
                href={telHref(negocio.telefono)}
                onClick={() => registrarEvento(negocio.id, "llamar")}
              >
                ☎ Llamar ahora
              </a>
            )}
            {negocio.instagram && (
              <a
                className="hero-social"
                href={`https://instagram.com/${negocio.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                📷
              </a>
            )}
            {negocio.facebook && (
              <a
                className="hero-social"
                href={`https://facebook.com/${negocio.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                f
              </a>
            )}
          </div>
        </div>

        <div className={`hero-logo-center shape-${negocio.logoForma}`}>
          {negocio.logoUrl && <img src={negocio.logoUrl} alt={negocio.nombre} />}
        </div>
      </div>

      {/* Galería corta: se ancla un tramo corto al hacer scroll y se despega
          justo al llegar al degradado inferior del hero, quedando sobre la
          descripción del negocio (ver .thumbs-stick-wrap en el CSS). */}
      {mostrarGaleria && (
        <div className="thumbs-stick-wrap">
          <div className="home-thumbs">
            {negocio.galeria
              .filter((g) => g.foto)
              .map((g, i) => (
                <div key={i} className="home-thumb" style={{ backgroundImage: `url(${g.foto})` }} />
              ))}
          </div>
        </div>
      )}

      {negocio.descripcionLarga && <p className="land-desc reveal">{negocio.descripcionLarga}</p>}

      {servicios.length > 0 && (
        <div className="mini-servicios reveal">
          {servicios.map((a) => (
            <span className="mini-chip" key={a.id}>
              {a.icono} {a.nombre}
            </span>
          ))}
        </div>
      )}

      {tieneLealtad && (
        <Link href={`/negocio/${negocio.slug}/tarjeta`} className="mini-lealtad-banner reveal">
          ⭐ Obtén tu tarjeta de puntos
        </Link>
      )}

      {tieneCalificaciones && (
        <div className="reveal">
          <BloqueCalificaciones
            negocioId={negocio.id}
            modo={negocio.calificacionModo}
            googleUrl={negocio.googleResenasUrl}
            resumen={resumenCalificaciones ?? { promedio: 0, total: 0 }}
            comentariosIniciales={comentarios ?? []}
          />
        </div>
      )}

      {tieneMapa && (
        <div className="mini-mapas reveal">
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

      {tieneCitas && (
        <button
          type="button"
          className="cta-btn cta-cita reveal"
          onClick={agendarCita}
          style={{ background: "transparent", color: accent, border: `1.5px solid ${accent}` }}
        >
          📅 Agendar cita
        </button>
      )}

      {/* ===== MENÚ (parte de la misma página; el ancla #menu es a donde
          saltan "VER MENÚ" y el botón inferior) ===== */}
      <div className="menu-section reveal" id="menu">
        <div className="menu-main-title">THE MENU</div>

        {mostrarGaleria && <CarruselGaleria galeria={negocio.galeria} />}

        {tienePedidos && (
          <div className="pedido-toggle-wrap">
            <button
              type="button"
              className={`btn-pedido-toggle${modoPedido ? " activo" : ""}`}
              onClick={() => setModoPedido((v) => !v)}
            >
              🛒 {modoPedido ? "Modo pedido activado" : "Ordenar en línea"}
            </button>
          </div>
        )}

        {categorias.map((cat, i) => (
          <div className="menu-cat-block" key={cat.categoria + i}>
            <div className="menu-cat-name">{cat.categoria}</div>
            {cat.items.map((item) => (
              <div className="menu-line" key={item.id}>
                <span className="mname">{item.nombre}</span>
                <div className="mprice-group">
                  <span className="mprice">${item.precio}</span>
                  {modoPedido && item.ordenable && (
                    <div className="item-stepper">
                      {carrito[item.id] ? (
                        <>
                          <button type="button" onClick={() => quitarDelCarrito(item)}>
                            −
                          </button>
                          <span>{carrito[item.id]}</span>
                          <button type="button" onClick={() => agregarAlCarrito(item)}>
                            +
                          </button>
                        </>
                      ) : (
                        <button type="button" className="btn-agregar" onClick={() => agregarAlCarrito(item)}>
                          +
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <a className="mini-footer" href="https://enmochis.app" target="_blank" rel="noopener noreferrer">
        {negocio.logoUrl && <img className="mini-footer-logo" src={negocio.logoUrl} alt="" />}
        <span>
          Este sitio fue creado en <strong>EnMochis.app</strong> — únete ahora
        </span>
      </a>
      <div style={{ height: 40 }} />

      {modoPedido && cantidadCarrito > 0 && (
        <button
          type="button"
          className="btn-carrito-flotante"
          onClick={() => setCarritoAbierto(true)}
          style={{ background: accent, color: "#0A0A0A" }}
        >
          <span>
            🛒 {cantidadCarrito} producto{cantidadCarrito === 1 ? "" : "s"}
          </span>
          <span>${totalCarrito}</span>
        </button>
      )}

      {carritoAbierto && (
        <div className="overlay-carrito" onClick={() => setCarritoAbierto(false)}>
          <div className="hoja-carrito" onClick={(e) => e.stopPropagation()}>
            <div className="hoja-carrito-header">
              <h3>Tu pedido</h3>
              <button type="button" onClick={() => setCarritoAbierto(false)}>
                ✕
              </button>
            </div>
            <div className="hoja-carrito-lineas">
              {lineasCarrito.map((l) => (
                <div className="linea-carrito" key={l.item.id}>
                  <div className="linea-nombre">
                    {l.cantidad}x {l.item.nombre}
                  </div>
                  <div className="linea-derecha">
                    <span>${l.subtotal}</span>
                    <button type="button" onClick={() => quitarDelCarrito(l.item)}>
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <textarea
              className="nota-pedido"
              placeholder="Nota para tu pedido (opcional)"
              value={notaPedido}
              onChange={(e) => setNotaPedido(e.target.value)}
            />
            <div className="hoja-carrito-total">Total: ${totalCarrito}</div>
            <button
              type="button"
              className="btn-enviar-pedido"
              onClick={enviarPedido}
              style={{ background: accent, color: "#0A0A0A" }}
            >
              Enviar pedido por WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* ===== BARRA INFERIOR — dirige al directorio y a este negocio, ya
          que todo el minisitio es un solo scroll. ===== */}
      <div className="sticky-bar">
        <a href="https://enmochis.app" target="_blank" rel="noopener noreferrer">
          <span className="icon-ic">🏠</span>INICIO
        </a>
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
        <a href="#menu" onClick={() => registrarEvento(negocio.id, "ver_menu")}>
          <span className="icon-ic">☰</span>MENÚ
        </a>
      </div>
    </div>
  );
}
