// Migración única: copia foto_portada -> producto_estrella_foto, las 3 fotos
// de la galería vieja -> galeria_1/2/3_foto, y reformatea el menú de
// "Nombre | Precio" a "CATEGORÍA" + "Producto — $Precio".
// Correr con: node scripts/migrar-brutal-food.mjs
import { readFileSync } from "node:fs";
import Airtable from "airtable";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const base = new Airtable({ apiKey: env.AIRTABLE_API_KEY }).base(env.AIRTABLE_BASE_ID);

function menuViejoANuevo(textoViejo) {
  const lineas = textoViejo
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const items = lineas.map((l) => {
    const [nombre, precio] = l.split("|").map((s) => s?.trim());
    return `${nombre} — ${precio ?? ""}`.trim();
  });
  return `MENÚ\n${items.join("\n")}`;
}

const records = await base("Negocios").select().all();
for (const record of records) {
  const f = record.fields;
  const cambios = {};

  if (f["foto_portada"]?.length) {
    cambios["producto_estrella_foto"] = f["foto_portada"];
  }
  if (Array.isArray(f["galeria"])) {
    f["galeria"].slice(0, 3).forEach((att, i) => {
      cambios[`galeria_${i + 1}_foto`] = [att];
    });
  }
  if (typeof f["menu"] === "string" && f["menu"].includes("|")) {
    cambios["menu"] = menuViejoANuevo(f["menu"]);
  }

  if (Object.keys(cambios).length > 0) {
    await base("Negocios").update([{ id: record.id, fields: cambios }]);
    console.log(`Migrado: ${f["nombre"] ?? record.id}`);
  }
}
console.log("Listo.");
