"use client";

import { useState } from "react";
import { CATEGORIAS } from "@/lib/negocios";
import { telHref, waHref, urlGoogleMaps, urlAppleMaps } from "@/lib/addonLinks";
import "./laboratorio.css";

type AddonKey = "mapas" | "whatsapp" | "galeria" | "pedidos" | "lealtad" | "citas" | "calificaciones";

const ADDON_LABELS: { clave: AddonKey; nombre: string; icono: string }[] = [
  { clave: "mapas", nombre: "Mapas (cómo llegar)", icono: "📍" },
  { clave: "whatsapp", nombre: "WhatsApp para pedidos", icono: "💬" },
  { clave: "pedidos", nombre: "Pedidos con carrito", icono: "🛒" },
  { clave: "citas", nombre: "Agendar citas", icono: "📅" },
  { clave: "galeria", nombre: "Galería de fotos", icono: "🖼️" },
  { clave: "lealtad", nombre: "Tarjeta de lealtad", icono: "🎁" },
  { clave: "calificaciones", nombre: "Reseñas / calificaciones", icono: "⭐" },
];

type MenuRow = { nombre: string; precio: string; ordenable: boolean };
type GaleriaRow = { nombre: string; precio: string; foto: string };

type LabForm = {
  nombre: string;
  slug: string;
  categoria: string;
  telefono: string;
  whatsapp: string;
  mensajeWhatsapp: string;
  mensajeCitas: string;
  direccion: string;
  lat: string;
  lng: string;
  instagram: string;
  facebook: string;
  calificacionModo: "" | "google" | "interno";
  googleResenasUrl: string;
  lealtadModo: "visitas" | "puntos";
  lealtadPorcentaje: string;
  lealtadMeta: string;
  servicios: string;
  menu: MenuRow[];
  galeria: GaleriaRow[];
  addons: Record<AddonKey, boolean>;
};

const DEFAULT_FORM: LabForm = {
  nombre: "Tacos El Compa",
  slug: "tacos-el-compa",
  categoria: "Restaurantes",
  telefono: "6681234567",
  whatsapp: "6681234567",
  mensajeWhatsapp: "Hola 👋, quiero hacer este pedido:",
  mensajeCitas: "Hola 👋, quiero agendar una cita.",
  direccion: "Blvd. Antonio Rosales 123, Centro, Los Mochis",
  lat: "25.7953",
  lng: "-108.9994",
  instagram: "tacoselcompa",
  facebook: "tacoselcompa",
  calificacionModo: "google",
  googleResenasUrl: "https://g.page/r/example/review",
  lealtadModo: "visitas",
  lealtadPorcentaje: "0",
  lealtadMeta: "10",
  servicios: "🅿️ Estacionamiento, 🐶 Pet friendly, 💳 Acepta tarjeta",
  menu: [
    { nombre: "Tacos de asada (orden)", precio: "65", ordenable: true },
    { nombre: "Agua fresca", precio: "20", ordenable: true },
    { nombre: "Orden de papas", precio: "35", ordenable: true },
    { nombre: "Refresco de lata", precio: "18", ordenable: false },
  ],
  galeria: [
    { nombre: "Tacos de asada", precio: "65", foto: "" },
    { nombre: "Volcán especial", precio: "85", foto: "" },
    { nombre: "Agua fresca del día", precio: "20", foto: "" },
  ],
  addons: {
    mapas: true,
    whatsapp: true,
    pedidos: true,
    citas: true,
    galeria: true,
    lealtad: true,
    calificaciones: true,
  },
};

export default function LaboratorioAddons() {
  const [form, setForm] = useState<LabForm>(DEFAULT_FORM);
  const [carrito, setCarrito] = useState<Record<number, number>>({});
  const [nota, setNota] = useState("");
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [reseniaEnviada, setReseniaEnviada] = useState(false);

  function set<K extends keyof LabForm>(key: K, value: LabForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function toggleAddon(clave: AddonKey) {
    setForm((f) => ({ ...f, addons: { ...f.addons, [clave]: !f.addons[clave] } }));
  }
  function updateMenuRow(i: number, patch: Partial<MenuRow>) {
    setForm((f) => ({ ...f, menu: f.menu.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) }));
  }
  function updateGaleriaRow(i: number, patch: Partial<GaleriaRow>) {
    setForm((f) => ({ ...f, galeria: f.galeria.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) }));
  }

  const latNum = parseFloat(form.lat);
  const lngNum = parseFloat(form.lng);
  const tieneCoords = !Number.isNaN(latNum) && !Number.isNaN(lngNum);
  const urlGoogle = tieneCoords ? urlGoogleMaps(latNum, lngNum, form.nombre) : undefined;
  const urlApple = tieneCoords ? urlAppleMaps(latNum, lngNum, form.nombre) : undefined;

  const mensajeWaSimple = `${form.mensajeWhatsapp.trim() || "Hola 👋, quiero hacer un pedido."} Vengo de ${form.slug}.enmochis.app`;
  const mensajeCitasSimple = `${form.mensajeCitas.trim() || "Hola 👋, quiero agendar una cita."} Vengo de ${form.slug}.enmochis.app`;

  const lineasCarrito = Object.entries(carrito)
    .filter(([, cant]) => cant > 0)
    .map(([idxStr, cantidad]) => {
      const item = form.menu[Number(idxStr)];
      const subtotal = (parseFloat(item.precio) || 0) * cantidad;
      return { item, cantidad, subtotal };
    });
  const totalCarrito = lineasCarrito.reduce((s, l) => s + l.subtotal, 0);
  const mensajePedido = (() => {
    if (lineasCarrito.length === 0) return "";
    const lineas = lineasCarrito.map((l) => `• ${l.cantidad}x ${l.item.nombre} — $${l.subtotal}`).join("\n");
    const base = form.mensajeWhatsapp.trim() || "Hola 👋, quiero hacer este pedido:";
    let mensaje = `${base}\n\n${lineas}\n\nTotal: $${totalCarrito}`;
    if (nota.trim()) mensaje += `\n\nNota: ${nota.trim()}`;
    mensaje += `\n\nVengo de ${form.slug}.enmochis.app 🙌`;
    return mensaje;
  })();
  const urlPedido = form.whatsapp && mensajePedido ? `https://wa.me/${form.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(mensajePedido)}` : undefined;

  function agregarAlCarrito(i: number) {
    setCarrito((c) => ({ ...c, [i]: (c[i] ?? 0) + 1 }));
  }
  function quitarDelCarrito(i: number) {
    setCarrito((c) => {
      const restante = (c[i] ?? 0) - 1;
      const nuevo = { ...c };
      if (restante <= 0) delete nuevo[i];
      else nuevo[i] = restante;
      return nuevo;
    });
  }

  const servicios = form.servicios
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="lab-wrap">
      <div className="lab-head">
        <h1>🧪 Laboratorio de addons</h1>
        <p>
          Llena el formulario de la izquierda (ya viene con datos de ejemplo) y prueba a la derecha los botones
          reales de cada función. Marca o desmarca los addons activos para ver cómo cambia lo que se muestra.
        </p>
        <div className="lab-note">
          Los botones de Mapas, Llamar y WhatsApp son 100% reales — abren la app de verdad. Reseñas internas y
          Lealtad muestran una vista previa, porque en el sitio real dependen de un negocio guardado en la base
          de datos.
        </div>
      </div>

      <div className="lab-grid">
        {/* ===== COLUMNA IZQUIERDA: FORMULARIO ===== */}
        <div className="lab-col">
          <div className="lab-group">
            <h2>🏪 Identidad</h2>
            <div className="lab-row">
              <div className="lab-field">
                <label>Nombre del negocio</label>
                <input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
              </div>
              <div className="lab-field">
                <label>Slug (para el link de EnMochis)</label>
                <input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
              </div>
            </div>
            <div className="lab-field">
              <label>Categoría</label>
              <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
                {CATEGORIAS.map((c) => (
                  <option key={c.slug} value={c.nombre}>
                    {c.emoji} {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lab-group">
            <h2>☎️ Contacto y mensajes</h2>
            <div className="lab-row">
              <div className="lab-field">
                <label>Teléfono</label>
                <input value={form.telefono} onChange={(e) => set("telefono", e.target.value)} />
              </div>
              <div className="lab-field">
                <label>WhatsApp</label>
                <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
              </div>
            </div>
            <div className="lab-field">
              <label>Mensaje para pedidos</label>
              <textarea value={form.mensajeWhatsapp} onChange={(e) => set("mensajeWhatsapp", e.target.value)} />
            </div>
            <div className="lab-field">
              <label>Mensaje para citas</label>
              <textarea value={form.mensajeCitas} onChange={(e) => set("mensajeCitas", e.target.value)} />
            </div>
          </div>

          <div className="lab-group">
            <h2>📍 Ubicación</h2>
            <div className="lab-field">
              <label>Dirección (texto)</label>
              <input value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
            </div>
            <div className="lab-row">
              <div className="lab-field">
                <label>Latitud</label>
                <input value={form.lat} onChange={(e) => set("lat", e.target.value)} />
              </div>
              <div className="lab-field">
                <label>Longitud</label>
                <input value={form.lng} onChange={(e) => set("lng", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="lab-group">
            <h2>📱 Redes sociales</h2>
            <div className="lab-row">
              <div className="lab-field">
                <label>Instagram (usuario)</label>
                <input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
              </div>
              <div className="lab-field">
                <label>Facebook (usuario/página)</label>
                <input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="lab-group">
            <h2>⭐ Reseñas</h2>
            <div className="lab-row">
              <div className="lab-field">
                <label>Modo</label>
                <select value={form.calificacionModo} onChange={(e) => set("calificacionModo", e.target.value as LabForm["calificacionModo"])}>
                  <option value="">Sin reseñas</option>
                  <option value="google">Enlazar a Google</option>
                  <option value="interno">Reseñas internas (en el minisitio)</option>
                </select>
              </div>
              <div className="lab-field">
                <label>Link de reseñas de Google</label>
                <input value={form.googleResenasUrl} onChange={(e) => set("googleResenasUrl", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="lab-group">
            <h2>🎁 Lealtad</h2>
            <div className="lab-row">
              <div className="lab-field">
                <label>Modo</label>
                <select value={form.lealtadModo} onChange={(e) => set("lealtadModo", e.target.value as LabForm["lealtadModo"])}>
                  <option value="visitas">Por visitas</option>
                  <option value="puntos">Por puntos ($ gastado)</option>
                </select>
              </div>
              <div className="lab-field">
                <label>Meta para canjear</label>
                <input value={form.lealtadMeta} onChange={(e) => set("lealtadMeta", e.target.value)} />
              </div>
            </div>
            {form.lealtadModo === "puntos" && (
              <div className="lab-field">
                <label>% que se convierte en puntos</label>
                <input value={form.lealtadPorcentaje} onChange={(e) => set("lealtadPorcentaje", e.target.value)} />
              </div>
            )}
          </div>

          <div className="lab-group">
            <h2>✅ Addons activos</h2>
            <div className="lab-checks">
              {ADDON_LABELS.map((a) => (
                <label className="lab-check" key={a.clave}>
                  <input type="checkbox" checked={form.addons[a.clave]} onChange={() => toggleAddon(a.clave)} />
                  {a.icono} {a.nombre}
                </label>
              ))}
            </div>
          </div>

          <div className="lab-group">
            <h2>🏷️ Servicios (chips genéricos)</h2>
            <div className="lab-field">
              <label>Separados por coma</label>
              <input value={form.servicios} onChange={(e) => set("servicios", e.target.value)} />
            </div>
          </div>

          <div className="lab-group">
            <h2>🛒 Menú (para probar pedidos)</h2>
            {form.menu.map((row, i) => (
              <div className="lab-menu-row" key={i}>
                <input value={row.nombre} onChange={(e) => updateMenuRow(i, { nombre: e.target.value })} placeholder="Nombre" />
                <input value={row.precio} onChange={(e) => updateMenuRow(i, { precio: e.target.value })} placeholder="Precio" />
                <label className="lab-check">
                  <input type="checkbox" checked={row.ordenable} onChange={(e) => updateMenuRow(i, { ordenable: e.target.checked })} />
                  Ordenable
                </label>
              </div>
            ))}
          </div>

          <div className="lab-group">
            <h2>🖼️ Galería (para probar fotos)</h2>
            {form.galeria.map((row, i) => (
              <div className="lab-gal-row" key={i}>
                <input value={row.nombre} onChange={(e) => updateGaleriaRow(i, { nombre: e.target.value })} placeholder="Nombre" />
                <input value={row.foto} onChange={(e) => updateGaleriaRow(i, { foto: e.target.value })} placeholder="URL de foto (opcional)" />
                <input value={row.precio} onChange={(e) => updateGaleriaRow(i, { precio: e.target.value })} placeholder="Precio" />
              </div>
            ))}
          </div>
        </div>

        {/* ===== COLUMNA DERECHA: BOTONES DE PRUEBA ===== */}
        <div className="lab-col lab-col-sticky">
          {form.addons.mapas && (
            <div className="lab-action">
              <h2>📍 Cómo llegar</h2>
              <p className="lab-sub">{form.direccion || "Sin dirección capturada"}</p>
              {tieneCoords ? (
                <>
                  <div className="lab-btns">
                    <a className="lab-btn" href={urlGoogle} target="_blank" rel="noopener noreferrer">
                      Google Maps
                    </a>
                    <a className="lab-btn secondary" href={urlApple} target="_blank" rel="noopener noreferrer">
                      Apple Maps
                    </a>
                  </div>
                  <div className="lab-url">{urlGoogle}</div>
                </>
              ) : (
                <span className="lab-btn-disabled">Captura latitud y longitud válidas</span>
              )}
            </div>
          )}

          <div className="lab-action">
            <h2>☎️ Llamar</h2>
            {form.telefono ? (
              <a className="lab-btn" href={telHref(form.telefono)}>
                Llamar ahora
              </a>
            ) : (
              <span className="lab-btn-disabled">Captura un teléfono</span>
            )}
          </div>

          {form.addons.whatsapp && (
            <div className="lab-action">
              <h2>💬 WhatsApp — pedido rápido</h2>
              <p className="lab-sub">Este es el botón simple (sin carrito), el mensaje se manda tal cual.</p>
              <div className="lab-preview">{mensajeWaSimple}</div>
              {form.whatsapp ? (
                <a className="lab-btn" href={waHref(form.whatsapp, form.slug, form.mensajeWhatsapp)} target="_blank" rel="noopener noreferrer">
                  Abrir WhatsApp
                </a>
              ) : (
                <span className="lab-btn-disabled">Captura un número de WhatsApp</span>
              )}
            </div>
          )}

          {form.addons.citas && (
            <div className="lab-action">
              <h2>📅 Agendar cita</h2>
              <div className="lab-preview">{mensajeCitasSimple}</div>
              {form.whatsapp ? (
                <a className="lab-btn" href={waHref(form.whatsapp, form.slug, form.mensajeCitas)} target="_blank" rel="noopener noreferrer">
                  Agendar por WhatsApp
                </a>
              ) : (
                <span className="lab-btn-disabled">Captura un número de WhatsApp</span>
              )}
            </div>
          )}

          {form.addons.pedidos && (
            <div className="lab-action">
              <h2>🛒 Pedido con carrito</h2>
              <p className="lab-sub">Solo los productos marcados &quot;Ordenable&quot; muestran el contador +/−.</p>
              {form.menu.map((item, i) => (
                <div className="lab-cart-item" key={i}>
                  <span>
                    {item.nombre} — ${item.precio || 0}
                  </span>
                  {item.ordenable ? (
                    <div className="lab-stepper">
                      <button type="button" onClick={() => quitarDelCarrito(i)}>
                        −
                      </button>
                      <span>{carrito[i] ?? 0}</span>
                      <button type="button" onClick={() => agregarAlCarrito(i)}>
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="lab-hint">no ordenable</span>
                  )}
                </div>
              ))}
              <div className="lab-field" style={{ marginTop: 10 }}>
                <label>Nota del pedido (opcional)</label>
                <input value={nota} onChange={(e) => setNota(e.target.value)} />
              </div>
              {lineasCarrito.length > 0 ? (
                <>
                  <div className="lab-cart-total">
                    <span>Total</span>
                    <span>${totalCarrito}</span>
                  </div>
                  <div className="lab-preview">{mensajePedido}</div>
                  {urlPedido ? (
                    <a className="lab-btn" href={urlPedido} target="_blank" rel="noopener noreferrer">
                      Enviar pedido por WhatsApp
                    </a>
                  ) : (
                    <span className="lab-btn-disabled">Captura un número de WhatsApp</span>
                  )}
                </>
              ) : (
                <p className="lab-empty">Agrega algún producto con + para armar el pedido de prueba.</p>
              )}
            </div>
          )}

          {form.addons.galeria && (
            <div className="lab-action">
              <h2>🖼️ Galería</h2>
              <div className="lab-thumb-grid">
                {form.galeria.map((g, i) => (
                  <div className="lab-thumb" key={i}>
                    {g.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.foto} alt={g.nombre} />
                    ) : (
                      <div className="lab-thumb-ph">🍽️</div>
                    )}
                    <div className="lab-thumb-body">
                      <strong>{g.nombre || "Sin nombre"}</strong>
                      {g.precio && <span>${g.precio}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {form.addons.calificaciones && form.calificacionModo && (
            <div className="lab-action">
              <h2>⭐ Reseñas</h2>
              {form.calificacionModo === "google" ? (
                form.googleResenasUrl ? (
                  <a className="lab-btn" href={form.googleResenasUrl} target="_blank" rel="noopener noreferrer">
                    Ver reseñas en Google
                  </a>
                ) : (
                  <span className="lab-btn-disabled">Captura el link de Google</span>
                )
              ) : (
                <>
                  <p className="lab-sub">Vista previa del formulario interno (no se guarda de verdad).</p>
                  <div className="lab-stars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" className={n <= estrellas ? "activo" : ""} onClick={() => setEstrellas(n)}>
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Comentario (opcional)"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                  />
                  <div className="lab-btns" style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="lab-btn"
                      disabled={estrellas < 1}
                      onClick={() => setReseniaEnviada(true)}
                    >
                      Enviar reseña (simulada)
                    </button>
                  </div>
                  {reseniaEnviada && <div className="lab-ok">✅ Así se vería — en el sitio real quedaría guardada para este negocio.</div>}
                </>
              )}
            </div>
          )}

          {form.addons.lealtad && (
            <div className="lab-action">
              <h2>🎁 Tarjeta de lealtad</h2>
              <p className="lab-sub">Vista previa — el saldo real se calcula cuando el negocio existe en la base de datos.</p>
              <div className="lab-preview">
                {`Modo: ${form.lealtadModo === "puntos" ? "por puntos" : "por visitas"}\nMeta para canjear: ${form.lealtadMeta} ${form.lealtadModo === "puntos" ? "puntos" : "visitas"}${form.lealtadModo === "puntos" ? `\nConversión: ${form.lealtadPorcentaje}% del total gastado` : ""}\n\nEjemplo de progreso: 0 / ${form.lealtadMeta} ${form.lealtadModo === "puntos" ? "puntos" : "visitas"}`}
              </div>
            </div>
          )}

          {servicios.length > 0 && (
            <div className="lab-action">
              <h2>🏷️ Chips de servicios</h2>
              <div>
                {servicios.map((s, i) => (
                  <span className="lab-chip" key={i}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="lab-action">
            <h2>📱 Redes sociales</h2>
            <div className="lab-btns">
              {form.instagram ? (
                <a className="lab-btn secondary" href={`https://instagram.com/${form.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              ) : (
                <span className="lab-btn-disabled">Sin Instagram</span>
              )}
              {form.facebook ? (
                <a className="lab-btn secondary" href={`https://facebook.com/${form.facebook}`} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              ) : (
                <span className="lab-btn-disabled">Sin Facebook</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
