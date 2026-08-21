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

export type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  categoria: Categoria;
  descripcionCorta: string;
  descripcionLarga: string;
  logoUrl?: string;
  fotoPortadaUrl?: string;
  estado: "solicitud" | "prueba" | "activo" | "destacado";
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
    estado: (f["estado"] as Negocio["estado"]) ?? "solicitud",
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
