import Airtable from "airtable";
import { SAMPLE_NEGOCIOS } from "./sample-data";

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

export type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  categoria: Categoria;
  descripcionCorta: string;
  descripcionLarga: string;
  logoUrl?: string;
  fotoPortadaUrl?: string;
  estado: Estado;
  plan?: "top20" | "estandar";
  fechaProximaRenovacion?: string;
  contactoNombre?: string;
  telefono?: string;
  whatsapp?: string;
  direccion?: string;
  instagram?: string;
  facebook?: string;
  horarios?: string;
  galeria: string[];
  menu: { nombre: string; descripcion?: string; precio?: string }[];
  addonWhatsapp: boolean;
  addonMapas: boolean;
  addonGaleria: boolean;
  addonFormularioContacto: boolean;
  addonPedidos: boolean;
  addonReservaciones: boolean;
  addonQrMesa: boolean;
  addonLealtad: boolean;
  addonMultiSucursal: boolean;
};

export function menuATexto(items: { nombre: string; precio?: string }[]): string {
  return items
    .filter((i) => i.nombre.trim())
    .map((i) => (i.precio ? `${i.nombre.trim()} | ${i.precio.trim()}` : i.nombre.trim()))
    .join("\n");
}

function getBase() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!apiKey || !baseId) {
    throw new Error(
      "Faltan AIRTABLE_API_KEY y/o AIRTABLE_BASE_ID. Revisa tu .env.local."
    );
  }
  return new Airtable({ apiKey }).base(baseId);
}

function attachmentUrls(field: unknown): string[] {
  if (!Array.isArray(field)) return [];
  return field
    .map((a) => (a && typeof a === "object" && "url" in a ? String((a as { url: unknown }).url) : ""))
    .filter(Boolean);
}

function mapNegocio(record: Airtable.Record<Airtable.FieldSet>): Negocio {
  const f = record.fields;
  const menuRaw = f["menu"];
  const menu = typeof menuRaw === "string" && menuRaw.trim()
    ? menuRaw
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
          const [nombre, resto] = line.split("|").map((s) => s?.trim());
          return { nombre: nombre ?? line, precio: resto };
        })
    : [];

  return {
    id: record.id,
    nombre: String(f["nombre"] ?? ""),
    slug: String(f["slug"] ?? ""),
    categoria: (f["categoria"] as Categoria) ?? "Restaurantes",
    descripcionCorta: String(f["descripcion_corta"] ?? ""),
    descripcionLarga: String(f["descripcion_larga"] ?? ""),
    logoUrl: attachmentUrls(f["logo"])[0],
    fotoPortadaUrl: attachmentUrls(f["foto_portada"])[0],
    estado: (f["estado"] as Estado) ?? "solicitud",
    plan: f["plan"] ? (f["plan"] as Negocio["plan"]) : undefined,
    fechaProximaRenovacion: f["fecha_proxima_renovacion"]
      ? String(f["fecha_proxima_renovacion"])
      : undefined,
    contactoNombre: f["contacto_nombre"] ? String(f["contacto_nombre"]) : undefined,
    telefono: f["telefono"] ? String(f["telefono"]) : undefined,
    whatsapp: f["whatsapp"] ? String(f["whatsapp"]) : undefined,
    direccion: f["direccion"] ? String(f["direccion"]) : undefined,
    instagram: f["instagram"] ? String(f["instagram"]) : undefined,
    facebook: f["facebook"] ? String(f["facebook"]) : undefined,
    horarios: f["horarios"] ? String(f["horarios"]) : undefined,
    galeria: attachmentUrls(f["galeria"]),
    menu,
    addonWhatsapp: f["addon_whatsapp"] === true,
    addonMapas: f["addon_mapas"] === true,
    addonGaleria: f["addon_galeria"] === true,
    addonFormularioContacto: f["addon_formulario_contacto"] === true,
    addonPedidos: f["addon_pedidos"] === true,
    addonReservaciones: f["addon_reservaciones"] === true,
    addonQrMesa: f["addon_qr_mesa"] === true,
    addonLealtad: f["addon_lealtad"] === true,
    addonMultiSucursal: f["addon_multi_sucursal"] === true,
  };
}

const ESTADOS_PUBLICOS = ["activo", "destacado", "prueba"] as const;

export async function getDestacados(): Promise<Negocio[]> {
  try {
    const base = getBase();
    const records = await base("Negocios")
      .select({
        filterByFormula: `{estado} = "destacado"`,
        maxRecords: 10,
      })
      .all();
    return records.map(mapNegocio);
  } catch {
    return SAMPLE_NEGOCIOS.filter((n) => n.estado === "destacado");
  }
}

export async function getRecomendados(): Promise<Negocio[]> {
  try {
    const base = getBase();
    const records = await base("Negocios")
      .select({
        filterByFormula: `OR(${ESTADOS_PUBLICOS.map((e) => `{estado} = "${e}"`).join(", ")})`,
        maxRecords: 12,
      })
      .all();
    return records.map(mapNegocio);
  } catch {
    return SAMPLE_NEGOCIOS;
  }
}

export async function getNegociosPorCategoria(categoriaSlug: string): Promise<Negocio[]> {
  const cat = categoriaPorSlug(categoriaSlug);
  if (!cat) return [];
  try {
    const base = getBase();
    const records = await base("Negocios")
      .select({
        filterByFormula: `AND({categoria} = "${cat.nombre}", OR(${ESTADOS_PUBLICOS.map((e) => `{estado} = "${e}"`).join(", ")}))`,
      })
      .all();
    return records.map(mapNegocio);
  } catch {
    return SAMPLE_NEGOCIOS.filter((n) => n.categoria === cat.nombre);
  }
}

export async function getNegocioPorSlug(slug: string): Promise<Negocio | null> {
  try {
    const base = getBase();
    const records = await base("Negocios")
      .select({
        filterByFormula: `AND({slug} = "${slug}", OR(${ESTADOS_PUBLICOS.map((e) => `{estado} = "${e}"`).join(", ")}))`,
        maxRecords: 1,
      })
      .all();
    const record = records[0];
    return record ? mapNegocio(record) : null;
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
  const base = getBase();
  const records = await base("Negocios")
    .select({ filterByFormula: `{slug} = "${slug}"`, maxRecords: 1 })
    .all();
  return records.length > 0;
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
  const base = getBase();
  const [record] = await base("Negocios").create([
    {
      fields: {
        nombre: datos.nombreNegocio,
        slug,
        categoria: datos.categoria,
        descripcion_corta: datos.descripcion,
        estado: "solicitud",
        telefono: datos.telefono,
        contacto_nombre: datos.contactoNombre,
        fecha_afiliacion: new Date().toISOString().slice(0, 10),
      },
    },
  ]);
  return { id: record.id, slug };
}

// --- A partir de aquí: funciones para el panel de administración ---

export type DatosNegocio = {
  nombre: string;
  categoria: Categoria;
  descripcionCorta: string;
  descripcionLarga: string;
  estado: Estado;
  plan?: "top20" | "estandar";
  fechaProximaRenovacion?: string;
  telefono?: string;
  whatsapp?: string;
  direccion?: string;
  instagram?: string;
  facebook?: string;
  horarios?: string;
  menu: { nombre: string; precio?: string }[];
  addonWhatsapp: boolean;
  addonMapas: boolean;
  addonGaleria: boolean;
  addonFormularioContacto: boolean;
  addonPedidos: boolean;
  addonReservaciones: boolean;
  addonQrMesa: boolean;
  addonLealtad: boolean;
  addonMultiSucursal: boolean;
};

function camposParaAirtable(datos: Partial<DatosNegocio>): Airtable.FieldSet {
  const campos: Airtable.FieldSet = {};
  if (datos.nombre !== undefined) campos["nombre"] = datos.nombre;
  if (datos.categoria !== undefined) campos["categoria"] = datos.categoria;
  if (datos.descripcionCorta !== undefined) campos["descripcion_corta"] = datos.descripcionCorta;
  if (datos.descripcionLarga !== undefined) campos["descripcion_larga"] = datos.descripcionLarga;
  if (datos.estado !== undefined) campos["estado"] = datos.estado;
  if (datos.plan !== undefined) campos["plan"] = datos.plan;
  if (datos.fechaProximaRenovacion !== undefined) campos["fecha_proxima_renovacion"] = datos.fechaProximaRenovacion;
  if (datos.telefono !== undefined) campos["telefono"] = datos.telefono;
  if (datos.whatsapp !== undefined) campos["whatsapp"] = datos.whatsapp;
  if (datos.direccion !== undefined) campos["direccion"] = datos.direccion;
  if (datos.instagram !== undefined) campos["instagram"] = datos.instagram;
  if (datos.facebook !== undefined) campos["facebook"] = datos.facebook;
  if (datos.horarios !== undefined) campos["horarios"] = datos.horarios;
  if (datos.menu !== undefined) campos["menu"] = menuATexto(datos.menu);
  if (datos.addonWhatsapp !== undefined) campos["addon_whatsapp"] = datos.addonWhatsapp;
  if (datos.addonMapas !== undefined) campos["addon_mapas"] = datos.addonMapas;
  if (datos.addonGaleria !== undefined) campos["addon_galeria"] = datos.addonGaleria;
  if (datos.addonFormularioContacto !== undefined) campos["addon_formulario_contacto"] = datos.addonFormularioContacto;
  if (datos.addonPedidos !== undefined) campos["addon_pedidos"] = datos.addonPedidos;
  if (datos.addonReservaciones !== undefined) campos["addon_reservaciones"] = datos.addonReservaciones;
  if (datos.addonQrMesa !== undefined) campos["addon_qr_mesa"] = datos.addonQrMesa;
  if (datos.addonLealtad !== undefined) campos["addon_lealtad"] = datos.addonLealtad;
  if (datos.addonMultiSucursal !== undefined) campos["addon_multi_sucursal"] = datos.addonMultiSucursal;
  return campos;
}

export async function getAllNegocios(): Promise<Negocio[]> {
  const base = getBase();
  const records = await base("Negocios").select({ sort: [{ field: "nombre" }] }).all();
  return records.map(mapNegocio);
}

export async function getNegocioPorId(id: string): Promise<Negocio | null> {
  try {
    const base = getBase();
    const record = await base("Negocios").find(id);
    return mapNegocio(record);
  } catch {
    return null;
  }
}

export async function crearNegocioAdmin(
  datos: Partial<DatosNegocio> & { nombre: string }
): Promise<{ id: string; slug: string }> {
  const slug = await generarSlugUnico(datos.nombre);
  const base = getBase();
  const [record] = await base("Negocios").create([
    {
      fields: {
        ...camposParaAirtable(datos),
        slug,
        estado: datos.estado ?? "solicitud",
        fecha_afiliacion: new Date().toISOString().slice(0, 10),
      },
    },
  ]);
  return { id: record.id, slug };
}

export async function actualizarNegocio(id: string, cambios: Partial<DatosNegocio>): Promise<void> {
  const base = getBase();
  await base("Negocios").update([{ id, fields: camposParaAirtable(cambios) }]);
}

export async function archivarNegocio(id: string): Promise<void> {
  await actualizarNegocio(id, { estado: "archivado" });
}

export async function subirAdjunto(
  recordId: string,
  campo: string,
  archivo: { filename: string; contentType: string; base64: string }
): Promise<void> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!apiKey || !baseId) {
    throw new Error("Faltan AIRTABLE_API_KEY y/o AIRTABLE_BASE_ID. Revisa tu .env.local.");
  }
  const url = `https://content.airtable.com/v0/${baseId}/${recordId}/${encodeURIComponent(campo)}/uploadAttachment`;
  const res = await fetch(
    url,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentType: archivo.contentType,
        filename: archivo.filename,
        file: archivo.base64,
      }),
    }
  );
  if (!res.ok) {
    const texto = await res.text().catch(() => "");
    throw new Error(`No se pudo subir el archivo a Airtable (${res.status}): ${texto}`);
  }
}
