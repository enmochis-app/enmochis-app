// Migración única: lee los negocios de Airtable, re-aloja sus fotos en
// Vercel Blob (los links de adjuntos de Airtable son temporales — algunos
// ya habían expirado, en ese caso se usa como respaldo la misma foto
// original de lib/sample-data.ts), y llena la tabla `negocios` de Postgres.
// Correr con:
//   npx tsx scripts/migrar-a-postgres.mts
// Requiere en .env.local: AIRTABLE_API_KEY, AIRTABLE_BASE_ID (origen) y
// POSTGRES_URL, BLOB_READ_WRITE_TOKEN (destino).
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { put } from "@vercel/blob";
import { negocios } from "../lib/db/schema";
import { SAMPLE_NEGOCIOS } from "../lib/sample-data";

const env: Record<string, string> = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

for (const k of ["AIRTABLE_API_KEY", "AIRTABLE_BASE_ID", "POSTGRES_URL", "BLOB_READ_WRITE_TOKEN"]) {
  if (!env[k]) throw new Error(`Falta ${k} en .env.local`);
}

const sampleBySlug = new Map(SAMPLE_NEGOCIOS.map((n) => [n.slug, n]));

const db = drizzle(neon(env.POSTGRES_URL));

async function airtableFetch(path: string) {
  const res = await fetch(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}${path}`, {
    headers: { Authorization: `Bearer ${env.AIRTABLE_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Re-aloja una foto en Blob. Usa el adjunto de Airtable si existe y responde; si no, cae al link de respaldo. */
async function reAlojarFoto(recordId: string, campo: string, urlAirtable: string | undefined, urlRespaldo: string | undefined) {
  const filename = `${campo}.jpg`;
  let origen = urlAirtable;
  if (origen) {
    const prueba = await fetch(origen, { method: "HEAD" }).catch(() => null);
    if (!prueba?.ok) {
      console.warn(`  ! el adjunto de Airtable para ${campo} de ${recordId} ya no responde, uso el de respaldo`);
      origen = undefined;
    }
  }
  if (!origen) origen = urlRespaldo;
  if (!origen) return null;

  try {
    const res = await fetch(origen);
    if (!res.ok) {
      console.warn(`  ! no se pudo descargar ${campo} de ${recordId} (HTTP ${res.status})`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const { url } = await put(`negocios/${recordId}/${campo}-${Date.now()}-${filename}`, buffer, {
      access: "public",
      contentType: res.headers.get("content-type") ?? "image/jpeg",
      token: env.BLOB_READ_WRITE_TOKEN,
    });
    console.log(`  - subido ${campo} de ${recordId}`);
    return url;
  } catch (err) {
    console.warn(`  ! fallo subiendo ${campo} de ${recordId}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

function menuViejoANuevo(texto: unknown, respaldo: string): string {
  if (typeof texto !== "string" || !texto.trim()) return respaldo ?? "";
  if (!texto.includes("|")) return texto;
  const items = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [nombre, precio] = l.split("|").map((s) => s?.trim());
      return `${nombre} — ${precio ?? ""}`.trim();
    });
  return `MENÚ\n${items.join("\n")}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- estructura dinámica de Airtable, script único
let registros: Array<{ id: string; fields: Record<string, any> }> = [];
let offset: string | undefined;
do {
  const qs = offset ? `?offset=${offset}` : "";
  const pagina = await airtableFetch(`/Negocios${qs}`);
  registros = registros.concat(pagina.records);
  offset = pagina.offset;
} while (offset);

console.log(`Encontrados ${registros.length} negocios en Airtable.`);

for (const record of registros) {
  const f = record.fields;
  const slug = f.slug ?? record.id;
  const muestra = sampleBySlug.get(slug);
  console.log(`Migrando: ${f.nombre ?? record.id}${muestra ? " (con respaldo disponible)" : ""}`);

  const [logoUrl, productoEstrellaFoto, galeria1Foto, galeria2Foto, galeria3Foto] = await Promise.all([
    reAlojarFoto(record.id, "logo", f.logo?.[0]?.url, muestra?.logoUrl),
    reAlojarFoto(record.id, "producto_estrella_foto", f.producto_estrella_foto?.[0]?.url ?? f.foto_portada?.[0]?.url, muestra?.productoEstrellaFoto),
    reAlojarFoto(record.id, "galeria_1_foto", f.galeria_1_foto?.[0]?.url ?? f.galeria?.[0]?.url, muestra?.galeria[0]?.foto),
    reAlojarFoto(record.id, "galeria_2_foto", f.galeria_2_foto?.[0]?.url ?? f.galeria?.[1]?.url, muestra?.galeria[1]?.foto),
    reAlojarFoto(record.id, "galeria_3_foto", f.galeria_3_foto?.[0]?.url ?? f.galeria?.[2]?.url, muestra?.galeria[2]?.foto),
  ]);

  const valores = {
    nombre: f.nombre ?? "",
    slug,
    categoria: f.categoria ?? muestra?.categoria ?? "Restaurantes",
    descripcionCorta: f.descripcion_corta ?? muestra?.descripcionCorta ?? "",
    descripcionLarga: f.descripcion_larga ?? muestra?.descripcionLarga ?? "",
    logoUrl,
    logoForma: f.logo_forma ?? muestra?.logoForma ?? "circular",
    productoEstrellaFoto,
    productoEstrellaNombre: f.producto_estrella_nombre ?? muestra?.productoEstrellaNombre ?? null,
    productoEstrellaPrecio: f.producto_estrella_precio ?? muestra?.productoEstrellaPrecio ?? null,
    colorAcento: f.color_acento ?? muestra?.colorAcento ?? "#C8FF3D",
    estado: f.estado ?? "solicitud",
    plan: f.plan ?? null,
    fechaProximaRenovacion: f.fecha_proxima_renovacion ?? null,
    fechaAfiliacion: f.fecha_afiliacion ?? null,
    contactoNombre: f.contacto_nombre ?? null,
    telefono: f.telefono ? String(f.telefono) : (muestra?.telefono ?? null),
    whatsapp: f.whatsapp ? String(f.whatsapp) : (muestra?.whatsapp ?? null),
    direccion: f.direccion ?? muestra?.direccion ?? null,
    googleMapsUrl: f.google_maps_url ?? null,
    appleMapsUrl: f.apple_maps_url ?? null,
    instagram: f.instagram ?? muestra?.instagram ?? null,
    facebook: f.facebook ?? muestra?.facebook ?? null,
    horarios: f.horarios ?? muestra?.horarios ?? null,
    galeria1Foto,
    galeria1Nombre: f.galeria_1_nombre ?? muestra?.galeria[0]?.nombre ?? null,
    galeria1Precio: f.galeria_1_precio ?? muestra?.galeria[0]?.precio ?? null,
    galeria2Foto,
    galeria2Nombre: f.galeria_2_nombre ?? muestra?.galeria[1]?.nombre ?? null,
    galeria2Precio: f.galeria_2_precio ?? muestra?.galeria[1]?.precio ?? null,
    galeria3Foto,
    galeria3Nombre: f.galeria_3_nombre ?? muestra?.galeria[2]?.nombre ?? null,
    galeria3Precio: f.galeria_3_precio ?? muestra?.galeria[2]?.precio ?? null,
    menu: menuViejoANuevo(f.menu, muestra?.menu ?? ""),
    addonWhatsapp: f.addon_whatsapp === true || muestra?.addonWhatsapp === true,
    addonMapas: f.addon_mapas === true || muestra?.addonMapas === true,
    addonGaleria: f.addon_galeria === true || muestra?.addonGaleria === true,
    addonPedidos: f.addon_pedidos === true || muestra?.addonPedidos === true,
    addonQrMesa: f.addon_qr_mesa === true || muestra?.addonQrMesa === true,
    addonLealtad: f.addon_lealtad === true || muestra?.addonLealtad === true,
    addonMultiSucursal: f.addon_multi_sucursal === true || muestra?.addonMultiSucursal === true,
  };

  await db
    .insert(negocios)
    .values({ id: record.id, ...valores })
    .onConflictDoUpdate({
      target: negocios.id,
      set: { ...valores, updatedAt: new Date() },
    });
}

console.log("Listo.");
