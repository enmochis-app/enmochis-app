import { put } from "@vercel/blob";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "./db";
import { negocios, addons, negocioAddons, eventos, type NegocioRow } from "./db/schema";
import { SAMPLE_NEGOCIOS } from "./sample-data";
import { hashearPassword, passwordValido } from "./portalAuth";

export type Categoria = "Restaurantes" | "Cafeterías" | "Snacks" | "Panaderías";

export const CATEGORIAS: { slug: string; nombre: Categoria; emoji: string; color: string }[] = [
  { slug: "restaurantes", nombre: "Restaurantes", emoji: "🍽️", color: "#2f6fed" },
  { slug: "cafeterias", nombre: "Cafeterías", emoji: "☕", color: "#c9852c" },
  { slug: "snacks", nombre: "Snacks", emoji: "🌮", color: "#e0553c" },
  { slug: "panaderias", nombre: "Panaderías", emoji: "🥐", color: "#8a5cd6" },
];

export function categoriaPorSlug(slug: string) {
  return CATEGORIAS.find((c) => c.slug === slug);
}

export function slugPorCategoria(nombre: Categoria) {
  return CATEGORIAS.find((c) => c.nombre === nombre)?.slug ?? "";
}

export type Estado =
  | "solicitud"
  | "revision"
  | "prueba"
  | "activo"
  | "destacado"
  | "archivado";

export type LogoForma = "circular" | "cuadrada" | "rectangular";

export type ItemGaleria = { foto?: string; nombre?: string; precio?: string; unidad?: string; descripcion?: string };

export type ComportamientoAddon = "chip" | "especial";

export type Addon = {
  id: string;
  clave: string;
  nombre: string;
  descripcion: string;
  icono: string;
  precio: number;
  comportamiento: ComportamientoAddon;
  activo: boolean;
  orden: number;
};

export type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  categoria: Categoria;
  descripcionCorta: string;
  descripcionLarga: string;
  logoUrl?: string;
  logoForma: LogoForma;
  fotoPortada?: string;
  colorAcento: string;
  estado: Estado;
  plan?: "top20" | "estandar" | "gratuita";
  fechaProximaRenovacion?: string;
  contactoNombre?: string;
  telefono?: string;
  whatsapp?: string;
  mensajeWhatsapp?: string;
  direccion?: string;
  lat?: number;
  lng?: number;
  instagram?: string;
  facebook?: string;
  horarios?: string;
  galeria: ItemGaleria[];
  addons: Addon[];
  lealtadModo: "visitas" | "puntos";
  lealtadPorcentaje: number;
  lealtadMeta: number;
  tienePortal: boolean;
};

function u(v: string | null | undefined): string | undefined {
  return v ?? undefined;
}

function mapNegocio(row: NegocioRow, addonsDelNegocio: Addon[]): Negocio {
  const galeria: ItemGaleria[] = [
    { foto: u(row.galeria1Foto), nombre: u(row.galeria1Nombre), precio: u(row.galeria1Precio), unidad: u(row.galeria1Unidad), descripcion: u(row.galeria1Descripcion) },
    { foto: u(row.galeria2Foto), nombre: u(row.galeria2Nombre), precio: u(row.galeria2Precio), unidad: u(row.galeria2Unidad), descripcion: u(row.galeria2Descripcion) },
    { foto: u(row.galeria3Foto), nombre: u(row.galeria3Nombre), precio: u(row.galeria3Precio), unidad: u(row.galeria3Unidad), descripcion: u(row.galeria3Descripcion) },
  ].filter((g) => g.foto || g.nombre);

  return {
    id: row.id,
    nombre: row.nombre,
    slug: row.slug,
    categoria: row.categoria as Categoria,
    descripcionCorta: row.descripcionCorta ?? "",
    descripcionLarga: row.descripcionLarga ?? "",
    logoUrl: u(row.logoUrl),
    logoForma: row.logoForma as LogoForma,
    fotoPortada: u(row.fotoPortada),
    colorAcento: row.colorAcento,
    estado: row.estado as Estado,
    plan: (row.plan as Negocio["plan"]) ?? undefined,
    fechaProximaRenovacion: u(row.fechaProximaRenovacion),
    contactoNombre: u(row.contactoNombre),
    telefono: u(row.telefono),
    whatsapp: u(row.whatsapp),
    mensajeWhatsapp: u(row.mensajeWhatsapp),
    direccion: u(row.direccion),
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    instagram: u(row.instagram),
    facebook: u(row.facebook),
    horarios: u(row.horarios),
    galeria,
    addons: addonsDelNegocio,
    lealtadModo: (row.lealtadModo as "visitas" | "puntos" | null) ?? "visitas",
    lealtadPorcentaje: row.lealtadPorcentaje ?? 0,
    lealtadMeta: row.lealtadMeta ?? 10,
    tienePortal: !!row.portalPasswordHash,
  };
}

function mapAddon(row: {
  id: string;
  clave: string;
  nombre: string;
  descripcion: string;
  icono: string;
  precio: number;
  comportamiento: string;
  activo: boolean;
  orden: number;
}): Addon {
  return {
    id: row.id,
    clave: row.clave,
    nombre: row.nombre,
    descripcion: row.descripcion,
    icono: row.icono,
    precio: row.precio,
    comportamiento: row.comportamiento as ComportamientoAddon,
    activo: row.activo,
    orden: row.orden,
  };
}

/** Junta cada negocio con la lista de addons que tiene activos, en una sola consulta de más. */
async function mapNegociosConAddons(filas: NegocioRow[]): Promise<Negocio[]> {
  if (filas.length === 0) return [];
  const ids = filas.map((f) => f.id);
  const filasAddons = await db()
    .select({
      negocioId: negocioAddons.negocioId,
      id: addons.id,
      clave: addons.clave,
      nombre: addons.nombre,
      descripcion: addons.descripcion,
      icono: addons.icono,
      precio: addons.precio,
      comportamiento: addons.comportamiento,
      activo: addons.activo,
      orden: addons.orden,
    })
    .from(negocioAddons)
    .innerJoin(addons, eq(negocioAddons.addonId, addons.id))
    .where(inArray(negocioAddons.negocioId, ids))
    .orderBy(addons.orden);

  const porNegocio = new Map<string, Addon[]>();
  for (const fa of filasAddons) {
    const lista = porNegocio.get(fa.negocioId) ?? [];
    lista.push(mapAddon(fa));
    porNegocio.set(fa.negocioId, lista);
  }
  return filas.map((f) => mapNegocio(f, porNegocio.get(f.id) ?? []));
}

const ESTADOS_PUBLICOS = ["activo", "destacado", "prueba"] as const;

export async function getDestacados(): Promise<Negocio[]> {
  try {
    const filas = await db().select().from(negocios).where(eq(negocios.estado, "destacado")).limit(10);
    return await mapNegociosConAddons(filas);
  } catch {
    return SAMPLE_NEGOCIOS.filter((n) => n.estado === "destacado");
  }
}

export async function getRecomendados(): Promise<Negocio[]> {
  try {
    const filas = await db()
      .select()
      .from(negocios)
      .where(inArray(negocios.estado, ESTADOS_PUBLICOS))
      .limit(12);
    return await mapNegociosConAddons(filas);
  } catch {
    return SAMPLE_NEGOCIOS;
  }
}

export async function getNegociosPorCategoria(categoriaSlug: string): Promise<Negocio[]> {
  const cat = categoriaPorSlug(categoriaSlug);
  if (!cat) return [];
  try {
    const filas = await db()
      .select()
      .from(negocios)
      .where(and(eq(negocios.categoria, cat.nombre), inArray(negocios.estado, ESTADOS_PUBLICOS)));
    return await mapNegociosConAddons(filas);
  } catch {
    return SAMPLE_NEGOCIOS.filter((n) => n.categoria === cat.nombre);
  }
}

export async function getNegocioPorSlug(slug: string): Promise<Negocio | null> {
  try {
    const filas = await db()
      .select()
      .from(negocios)
      .where(and(eq(negocios.slug, slug), inArray(negocios.estado, ESTADOS_PUBLICOS)))
      .limit(1);
    const resultado = await mapNegociosConAddons(filas);
    return resultado[0] ?? null;
  } catch {
    return SAMPLE_NEGOCIOS.find((n) => n.slug === slug) ?? null;
  }
}

function slugifyBase(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function existeSlug(slug: string): Promise<boolean> {
  const filas = await db().select({ id: negocios.id }).from(negocios).where(eq(negocios.slug, slug)).limit(1);
  return filas.length > 0;
}

export async function generarSlugUnico(nombre: string): Promise<string> {
  const base = slugifyBase(nombre) || "negocio";
  let candidato = base;
  let contador = 2;
  while (await existeSlug(candidato)) {
    candidato = `${base}-${contador}`;
    contador += 1;
  }
  return candidato;
}

export type NuevaSolicitud = {
  nombreNegocio: string;
  categoria: Categoria;
  contactoNombre: string;
  telefono: string;
  descripcion: string;
};

export async function crearSolicitud(datos: NuevaSolicitud): Promise<{ id: string; slug: string }> {
  const slug = await generarSlugUnico(datos.nombreNegocio);
  const [fila] = await db()
    .insert(negocios)
    .values({
      nombre: datos.nombreNegocio,
      slug,
      categoria: datos.categoria,
      descripcionCorta: datos.descripcion,
      estado: "solicitud",
      telefono: datos.telefono,
      contactoNombre: datos.contactoNombre,
      fechaAfiliacion: new Date().toISOString().slice(0, 10),
    })
    .returning({ id: negocios.id });
  return { id: fila.id, slug };
}

// --- A partir de aquí: funciones para el panel de administración ---

export type DatosNegocio = {
  nombre: string;
  categoria: Categoria;
  descripcionCorta: string;
  descripcionLarga: string;
  logoForma?: LogoForma;
  colorAcento?: string;
  estado: Estado;
  plan?: "top20" | "estandar" | "gratuita";
  fechaProximaRenovacion?: string;
  telefono?: string;
  whatsapp?: string;
  mensajeWhatsapp?: string;
  direccion?: string;
  lat?: number;
  lng?: number;
  instagram?: string;
  facebook?: string;
  horarios?: string;
  galeria_1_nombre?: string;
  galeria_1_precio?: string;
  galeria_1_unidad?: string;
  galeria_1_descripcion?: string;
  galeria_2_nombre?: string;
  galeria_2_precio?: string;
  galeria_2_unidad?: string;
  galeria_2_descripcion?: string;
  galeria_3_nombre?: string;
  galeria_3_precio?: string;
  galeria_3_unidad?: string;
  galeria_3_descripcion?: string;
  lealtadModo?: "visitas" | "puntos";
  lealtadPorcentaje?: number;
  lealtadMeta?: number;
  /** Claves del catálogo de addons (ver getCatalogoAddons) que debe tener activos este negocio. */
  addons?: string[];
};

function filaParaGuardar(datos: Partial<DatosNegocio>) {
  const fila: Record<string, unknown> = {};
  if (datos.nombre !== undefined) fila.nombre = datos.nombre;
  if (datos.categoria !== undefined) fila.categoria = datos.categoria;
  if (datos.descripcionCorta !== undefined) fila.descripcionCorta = datos.descripcionCorta;
  if (datos.descripcionLarga !== undefined) fila.descripcionLarga = datos.descripcionLarga;
  if (datos.logoForma !== undefined) fila.logoForma = datos.logoForma;
  if (datos.colorAcento !== undefined) fila.colorAcento = datos.colorAcento;
  if (datos.estado !== undefined) fila.estado = datos.estado;
  if (datos.plan !== undefined) fila.plan = datos.plan;
  if (datos.fechaProximaRenovacion !== undefined) fila.fechaProximaRenovacion = datos.fechaProximaRenovacion || null;
  if (datos.telefono !== undefined) fila.telefono = datos.telefono;
  if (datos.whatsapp !== undefined) fila.whatsapp = datos.whatsapp;
  if (datos.mensajeWhatsapp !== undefined) fila.mensajeWhatsapp = datos.mensajeWhatsapp;
  if (datos.direccion !== undefined) fila.direccion = datos.direccion;
  if (datos.lat !== undefined) fila.lat = datos.lat;
  if (datos.lng !== undefined) fila.lng = datos.lng;
  if (datos.instagram !== undefined) fila.instagram = datos.instagram;
  if (datos.facebook !== undefined) fila.facebook = datos.facebook;
  if (datos.horarios !== undefined) fila.horarios = datos.horarios;
  if (datos.galeria_1_nombre !== undefined) fila.galeria1Nombre = datos.galeria_1_nombre;
  if (datos.galeria_1_precio !== undefined) fila.galeria1Precio = datos.galeria_1_precio;
  if (datos.galeria_1_unidad !== undefined) fila.galeria1Unidad = datos.galeria_1_unidad;
  if (datos.galeria_1_descripcion !== undefined) fila.galeria1Descripcion = datos.galeria_1_descripcion;
  if (datos.galeria_2_nombre !== undefined) fila.galeria2Nombre = datos.galeria_2_nombre;
  if (datos.galeria_2_precio !== undefined) fila.galeria2Precio = datos.galeria_2_precio;
  if (datos.galeria_2_unidad !== undefined) fila.galeria2Unidad = datos.galeria_2_unidad;
  if (datos.galeria_2_descripcion !== undefined) fila.galeria2Descripcion = datos.galeria_2_descripcion;
  if (datos.galeria_3_nombre !== undefined) fila.galeria3Nombre = datos.galeria_3_nombre;
  if (datos.galeria_3_precio !== undefined) fila.galeria3Precio = datos.galeria_3_precio;
  if (datos.galeria_3_unidad !== undefined) fila.galeria3Unidad = datos.galeria_3_unidad;
  if (datos.galeria_3_descripcion !== undefined) fila.galeria3Descripcion = datos.galeria_3_descripcion;
  if (datos.lealtadModo !== undefined) fila.lealtadModo = datos.lealtadModo;
  if (datos.lealtadPorcentaje !== undefined) fila.lealtadPorcentaje = datos.lealtadPorcentaje;
  if (datos.lealtadMeta !== undefined) fila.lealtadMeta = datos.lealtadMeta;
  return fila;
}

/** Reemplaza los addons activos de un negocio por los que corresponden a estas claves del catálogo. */
async function sincronizarAddonsNegocio(negocioId: string, claves: string[]): Promise<void> {
  await db().delete(negocioAddons).where(eq(negocioAddons.negocioId, negocioId));
  if (claves.length === 0) return;
  const catalogo = await db().select({ id: addons.id, clave: addons.clave }).from(addons).where(inArray(addons.clave, claves));
  if (catalogo.length === 0) return;
  await db()
    .insert(negocioAddons)
    .values(catalogo.map((a) => ({ negocioId, addonId: a.id })));
}

export async function getAllNegocios(): Promise<Negocio[]> {
  const filas = await db().select().from(negocios).orderBy(negocios.nombre);
  return mapNegociosConAddons(filas);
}

export async function getNegocioPorId(id: string): Promise<Negocio | null> {
  try {
    const filas = await db().select().from(negocios).where(eq(negocios.id, id)).limit(1);
    const resultado = await mapNegociosConAddons(filas);
    return resultado[0] ?? null;
  } catch {
    return null;
  }
}

export async function crearNegocioAdmin(
  datos: Partial<DatosNegocio> & { nombre: string }
): Promise<{ id: string; slug: string }> {
  const slug = await generarSlugUnico(datos.nombre);
  const [fila] = await db()
    .insert(negocios)
    .values({
      ...filaParaGuardar(datos),
      nombre: datos.nombre,
      slug,
      estado: datos.estado ?? "solicitud",
      fechaAfiliacion: new Date().toISOString().slice(0, 10),
    })
    .returning({ id: negocios.id });
  if (datos.addons !== undefined) {
    await sincronizarAddonsNegocio(fila.id, datos.addons);
  }
  return { id: fila.id, slug };
}

export async function actualizarNegocio(id: string, cambios: Partial<DatosNegocio>): Promise<void> {
  const fila = filaParaGuardar(cambios);
  if (Object.keys(fila).length > 0) {
    await db()
      .update(negocios)
      .set({ ...fila, updatedAt: new Date() })
      .where(eq(negocios.id, id));
  }
  if (cambios.addons !== undefined) {
    await sincronizarAddonsNegocio(id, cambios.addons);
  }
}

export async function archivarNegocio(id: string): Promise<void> {
  await actualizarNegocio(id, { estado: "archivado" });
}

const CAMPO_A_COLUMNA: Record<string, "logoUrl" | "fotoPortada" | "galeria1Foto" | "galeria2Foto" | "galeria3Foto"> = {
  logo: "logoUrl",
  foto_portada: "fotoPortada",
  galeria_1_foto: "galeria1Foto",
  galeria_2_foto: "galeria2Foto",
  galeria_3_foto: "galeria3Foto",
};

export async function subirAdjunto(
  recordId: string,
  campo: string,
  archivo: { filename: string; contentType: string; base64: string }
): Promise<void> {
  const columna = CAMPO_A_COLUMNA[campo];
  if (!columna) {
    throw new Error(`Campo de foto desconocido: ${campo}`);
  }
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("Falta BLOB_READ_WRITE_TOKEN. Revisa tu .env.local.");
  }
  const buffer = Buffer.from(archivo.base64, "base64");
  const { url } = await put(`negocios/${recordId}/${campo}-${Date.now()}-${archivo.filename}`, buffer, {
    access: "public",
    contentType: archivo.contentType,
    token,
  });
  await db()
    .update(negocios)
    .set({ [columna]: url, updatedAt: new Date() })
    .where(eq(negocios.id, recordId));
}

// --- Catálogo de addons ---

export type DatosAddon = {
  nombre: string;
  descripcion?: string;
  icono?: string;
  precio: number;
};

export type CambiosAddon = Partial<{
  nombre: string;
  descripcion: string;
  icono: string;
  precio: number;
  activo: boolean;
  orden: number;
}>;

async function existeClaveAddon(clave: string): Promise<boolean> {
  const filas = await db().select({ id: addons.id }).from(addons).where(eq(addons.clave, clave)).limit(1);
  return filas.length > 0;
}

export async function generarClaveUnica(nombre: string): Promise<string> {
  const base = slugifyBase(nombre) || "addon";
  let candidata = base;
  let contador = 2;
  while (await existeClaveAddon(candidata)) {
    candidata = `${base}-${contador}`;
    contador += 1;
  }
  return candidata;
}

export async function getCatalogoAddons(): Promise<Addon[]> {
  const filas = await db().select().from(addons).orderBy(addons.orden, addons.nombre);
  return filas.map(mapAddon);
}

export async function crearAddon(datos: DatosAddon): Promise<{ id: string; clave: string }> {
  const clave = await generarClaveUnica(datos.nombre);
  const [fila] = await db()
    .insert(addons)
    .values({
      clave,
      nombre: datos.nombre,
      descripcion: datos.descripcion ?? "",
      icono: datos.icono?.trim() || "✨",
      precio: datos.precio,
      comportamiento: "chip",
    })
    .returning({ id: addons.id });
  return { id: fila.id, clave };
}

export async function actualizarAddon(id: string, cambios: CambiosAddon): Promise<void> {
  if (Object.keys(cambios).length === 0) return;
  await db().update(addons).set(cambios).where(eq(addons.id, id));
}

// --- Métricas ---

export const TIPOS_EVENTO = [
  { tipo: "visita", label: "Visitas al minisitio" },
  { tipo: "ver_menu", label: "Ver menú" },
  { tipo: "llamar", label: "Llamar ahora" },
  { tipo: "whatsapp", label: "WhatsApp" },
  { tipo: "mapa", label: "Cómo llegar / Mapa" },
  { tipo: "pedido", label: "Pedidos enviados" },
] as const;

export type TipoEvento = (typeof TIPOS_EVENTO)[number]["tipo"];

export function esTipoEventoValido(tipo: string): tipo is TipoEvento {
  return TIPOS_EVENTO.some((t) => t.tipo === tipo);
}

export async function registrarEventoServidor(negocioId: string, tipo: TipoEvento): Promise<void> {
  await db().insert(eventos).values({ negocioId, tipo });
}

/** Inicio del mes calendario actual (hora del servidor). */
export function inicioDeMes(): Date {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), 1);
}

export async function getMetricasNegocio(negocioId: string, desde: Date): Promise<Record<string, number>> {
  const filas = await db()
    .select({ tipo: eventos.tipo, total: sql<number>`count(*)::int` })
    .from(eventos)
    .where(and(eq(eventos.negocioId, negocioId), gte(eventos.createdAt, desde)))
    .groupBy(eventos.tipo);
  const resultado: Record<string, number> = {};
  for (const f of filas) resultado[f.tipo] = f.total;
  return resultado;
}

export async function getMetricasTodos(desde: Date): Promise<Map<string, Record<string, number>>> {
  const filas = await db()
    .select({ negocioId: eventos.negocioId, tipo: eventos.tipo, total: sql<number>`count(*)::int` })
    .from(eventos)
    .where(gte(eventos.createdAt, desde))
    .groupBy(eventos.negocioId, eventos.tipo);
  const mapa = new Map<string, Record<string, number>>();
  for (const f of filas) {
    const actual = mapa.get(f.negocioId) ?? {};
    actual[f.tipo] = f.total;
    mapa.set(f.negocioId, actual);
  }
  return mapa;
}

// --- Portal del negocio ---

export async function asignarPasswordPortal(negocioId: string, password: string): Promise<void> {
  const { hash, sal } = await hashearPassword(password);
  await db()
    .update(negocios)
    .set({ portalPasswordHash: hash, portalPasswordSalt: sal, updatedAt: new Date() })
    .where(eq(negocios.id, negocioId));
}

/** Busca un negocio por slug sin filtrar por estado — lo usa el login del portal. */
export async function buscarNegocioPorSlug(slug: string): Promise<Negocio | null> {
  const filas = await db().select().from(negocios).where(eq(negocios.slug, slug)).limit(1);
  const resultado = await mapNegociosConAddons(filas);
  return resultado[0] ?? null;
}

export async function verificarLoginPortal(slug: string, password: string): Promise<string | null> {
  const filas = await db().select().from(negocios).where(eq(negocios.slug, slug)).limit(1);
  const fila = filas[0];
  if (!fila || !fila.portalPasswordHash || !fila.portalPasswordSalt) return null;
  const ok = await passwordValido(password, fila.portalPasswordHash, fila.portalPasswordSalt);
  return ok ? fila.id : null;
}
