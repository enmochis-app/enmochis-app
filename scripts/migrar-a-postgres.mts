// Migración única: lee los negocios de Airtable, re-aloja sus fotos en
// Vercel Blob (los links de adjuntos de Airtable son temporales), y llena
// la tabla `negocios` de Postgres. Correr con:
//   npx tsx scripts/migrar-a-postgres.mts
// Requiere en .env.local: AIRTABLE_API_KEY, AIRTABLE_BASE_ID (origen) y
// POSTGRES_URL, BLOB_READ_WRITE_TOKEN (destino).
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { put } from "@vercel/blob";
import { negocios } from "../lib/db/schema";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

for (const k of ["AIRTABLE_API_KEY", "AIRTABLE_BASE_ID", "POSTGRES_URL", "BLOB_READ_WRITE_TOKEN"]) {
  if (!env[k]) throw new Error(`Falta ${k} en .env.local`);
}

const db = drizzle(neon(env.POSTGRES_URL));

async function airtableFetch(path) {
  const res = await fetch(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}${path}`, {
    headers: { Authorization: `Bearer ${env.AIRTABLE_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
  return res.json();
}

async function reAlojarFoto(recordId, campo, adjunto) {
  if (!adjunto?.url) return null;
  const res = await fetch(adjunto.url);
  if (!res.ok) {
    console.warn(`  ! no se pudo descargar ${campo} de ${recordId}`);
    return null;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const { url } = await put(
    `negocios/${recordId}/${campo}-${adjunto.filename ?? "foto"}`,
    buffer,
    { access: "public", contentType: adjunto.type, token: env.BLOB_READ_WRITE_TOKEN }
  );
  return url;
}

function menuViejoANuevo(texto) {
  if (typeof texto !== "string" || !texto.includes("|")) return texto ?? "";
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

let registros = [];
let offset;
do {
  const qs = offset ? `?offset=${offset}` : "";
  const pagina = await airtableFetch(`/Negocios${qs}`);
  registros = registros.concat(pagina.records);
  offset = pagina.offset;
} while (offset);

console.log(`Encontrados ${registros.length} negocios en Airtable.`);

for (const record of registros) {
  const f = record.fields;
  console.log(`Migrando: ${f.nombre ?? record.id}`);

  const [logoUrl, productoEstrellaFoto, galeria1Foto, galeria2Foto, galeria3Foto] = await Promise.all([
    reAlojarFoto(record.id, "logo", f.logo?.[0]),
    reAlojarFoto(record.id, "producto_estrella_foto", f.producto_estrella_foto?.[0]),
    reAlojarFoto(record.id, "galeria_1_foto", f.galeria_1_foto?.[0]),
    reAlojarFoto(record.id, "galeria_2_foto", f.galeria_2_foto?.[0]),
    reAlojarFoto(record.id, "galeria_3_foto", f.galeria_3_foto?.[0]),
  ]);

  await db
    .insert(negocios)
    .values({
      id: record.id,
      nombre: f.nombre ?? "",
      slug: f.slug ?? record.id,
      categoria: f.categoria ?? "Restaurantes",
      descripcionCorta: f.descripcion_corta ?? "",
      descripcionLarga: f.descripcion_larga ?? "",
      logoUrl,
      logoForma: f.logo_forma ?? "circular",
      productoEstrellaFoto,
      productoEstrellaNombre: f.producto_estrella_nombre ?? null,
      productoEstrellaPrecio: f.producto_estrella_precio ?? null,
      colorAcento: f.color_acento ?? "#C8FF3D",
      estado: f.estado ?? "solicitud",
      plan: f.plan ?? null,
      fechaProximaRenovacion: f.fecha_proxima_renovacion ?? null,
      fechaAfiliacion: f.fecha_afiliacion ?? null,
      contactoNombre: f.contacto_nombre ?? null,
      telefono: f.telefono ? String(f.telefono) : null,
      whatsapp: f.whatsapp ? String(f.whatsapp) : null,
      direccion: f.direccion ?? null,
      googleMapsUrl: f.google_maps_url ?? null,
      appleMapsUrl: f.apple_maps_url ?? null,
      instagram: f.instagram ?? null,
      facebook: f.facebook ?? null,
      horarios: f.horarios ?? null,
      galeria1Foto,
      galeria1Nombre: f.galeria_1_nombre ?? null,
      galeria1Precio: f.galeria_1_precio ?? null,
      galeria2Foto,
      galeria2Nombre: f.galeria_2_nombre ?? null,
      galeria2Precio: f.galeria_2_precio ?? null,
      galeria3Foto,
      galeria3Nombre: f.galeria_3_nombre ?? null,
      galeria3Precio: f.galeria_3_precio ?? null,
      menu: menuViejoANuevo(f.menu),
      addonWhatsapp: f.addon_whatsapp === true,
      addonMapas: f.addon_mapas === true,
      addonGaleria: f.addon_galeria === true,
      addonPedidos: f.addon_pedidos === true,
      addonQrMesa: f.addon_qr_mesa === true,
      addonLealtad: f.addon_lealtad === true,
      addonMultiSucursal: f.addon_multi_sucursal === true,
    })
    .onConflictDoNothing();
}

console.log("Listo.");
