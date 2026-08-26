import { NextResponse } from "next/server";
import { getNegocioPorId } from "@/lib/negocios";
import { crearCalificacion } from "@/lib/calificaciones";

export async function POST(request: Request) {
  const datos = (await request.json()) as { negocioId?: string; estrellas?: number; comentario?: string };
  const { negocioId, estrellas, comentario } = datos;

  if (!negocioId || !Number.isInteger(estrellas) || (estrellas as number) < 1 || (estrellas as number) > 5) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const negocio = await getNegocioPorId(negocioId);
  if (!negocio) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }
  const tieneAddon = negocio.addons.some((a) => a.clave === "calificaciones");
  if (!tieneAddon || negocio.calificacionModo !== "interno") {
    return NextResponse.json({ error: "Este negocio no acepta calificaciones internas." }, { status: 403 });
  }

  try {
    await crearCalificacion(negocioId, estrellas as number, comentario);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error guardando calificación:", err);
    return NextResponse.json({ error: "No se pudo guardar la calificación." }, { status: 502 });
  }
}
