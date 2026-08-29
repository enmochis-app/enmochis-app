import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { negocios, addons, negocioAddons, menuItems } from "@/lib/db/schema";
import { SAMPLE_NEGOCIOS, SAMPLE_MENU_ITEMS, CATALOGO_ADDONS_DEMO } from "@/lib/sample-data";

/**
 * Siembra el catálogo de addons y los negocios de ejemplo (los mismos que se ven
 * cuando la base de datos no está conectada) directo en la base real, para poder
 * probar el sitio completo sin escribir cada negocio a mano desde el admin.
 * Es seguro llamarlo varias veces: nunca duplica un addon ni un negocio que ya exista.
 */
export async function POST() {
  try {
    const catalogoActual = await db().select().from(addons);
    const clavesExistentes = new Set(catalogoActual.map((a) => a.clave));

    const faltantes = Object.values(CATALOGO_ADDONS_DEMO)
      .filter((a) => !clavesExistentes.has(a.clave))
      .map(({ id: _id, ...resto }) => resto);
    if (faltantes.length > 0) {
      await db().insert(addons).values(faltantes);
    }

    const catalogo = faltantes.length > 0 ? await db().select().from(addons) : catalogoActual;
    const idAddonPorClave = new Map(catalogo.map((a) => [a.clave, a.id]));

    let creados = 0;
    let yaExistian = 0;

    for (const n of SAMPLE_NEGOCIOS) {
      const existente = await db().select({ id: negocios.id }).from(negocios).where(eq(negocios.slug, n.slug)).limit(1);
      if (existente.length > 0) {
        yaExistian++;
        continue;
      }

      const [fila] = await db()
        .insert(negocios)
        .values({
          nombre: n.nombre,
          slug: n.slug,
          categoria: n.categoria,
          descripcionCorta: n.descripcionCorta,
          descripcionLarga: n.descripcionLarga,
          logoUrl: n.logoUrl,
          logoForma: n.logoForma,
          fotoPortada: n.fotoPortada,
          colorAcento: n.colorAcento,
          degradadoInferior: n.degradadoInferior,
          estado: n.estado,
          telefono: n.telefono,
          whatsapp: n.whatsapp,
          mensajeWhatsapp: n.mensajeWhatsapp,
          mensajeCitas: n.mensajeCitas,
          direccion: n.direccion,
          lat: n.lat,
          lng: n.lng,
          instagram: n.instagram,
          facebook: n.facebook,
          horarios: n.horarios,
          galeria1Foto: n.galeria[0]?.foto,
          galeria1Nombre: n.galeria[0]?.nombre,
          galeria1Precio: n.galeria[0]?.precio,
          galeria1Unidad: n.galeria[0]?.unidad,
          galeria1Descripcion: n.galeria[0]?.descripcion,
          galeria2Foto: n.galeria[1]?.foto,
          galeria2Nombre: n.galeria[1]?.nombre,
          galeria2Precio: n.galeria[1]?.precio,
          galeria2Unidad: n.galeria[1]?.unidad,
          galeria2Descripcion: n.galeria[1]?.descripcion,
          galeria3Foto: n.galeria[2]?.foto,
          galeria3Nombre: n.galeria[2]?.nombre,
          galeria3Precio: n.galeria[2]?.precio,
          galeria3Unidad: n.galeria[2]?.unidad,
          galeria3Descripcion: n.galeria[2]?.descripcion,
          lealtadModo: n.lealtadModo,
          lealtadPorcentaje: n.lealtadPorcentaje,
          lealtadMeta: n.lealtadMeta,
          fechaAfiliacion: new Date().toISOString().slice(0, 10),
        })
        .returning({ id: negocios.id });

      const addonIds = n.addons.map((a) => idAddonPorClave.get(a.clave)).filter((id): id is string => !!id);
      if (addonIds.length > 0) {
        await db()
          .insert(negocioAddons)
          .values(addonIds.map((addonId) => ({ negocioId: fila.id, addonId })));
      }

      const items = SAMPLE_MENU_ITEMS[n.id] ?? [];
      if (items.length > 0) {
        await db()
          .insert(menuItems)
          .values(items.map((it, i) => ({ negocioId: fila.id, categoria: it.categoria, nombre: it.nombre, precio: it.precio, ordenable: it.ordenable, orden: i })));
      }

      creados++;
    }

    return NextResponse.json({ ok: true, creados, yaExistian, total: SAMPLE_NEGOCIOS.length });
  } catch (err) {
    console.error("Error sembrando datos de prueba:", err);
    return NextResponse.json(
      { error: "No se pudo sembrar. Revisa que POSTGRES_URL esté configurado y que las tablas ya existan (npm run db:push)." },
      { status: 502 }
    );
  }
}
