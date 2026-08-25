import { NextResponse } from "next/server";
import { getNegocioPorId, actualizarNegocio, type DatosNegocio } from "@/lib/negocios";
import { sesionPortal } from "@/lib/portalSession";

export async function GET() {
  const sesion = await sesionPortal();
  if (!sesion) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const negocio = await getNegocioPorId(sesion.negocioId);
  if (!negocio) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  return NextResponse.json({ negocio });
}

export async function PATCH(request: Request) {
  const sesion = await sesionPortal();
  if (!sesion) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { lealtadModo, lealtadPorcentaje, lealtadMeta } = (await request.json()) as Pick<
    DatosNegocio,
    "lealtadModo" | "lealtadPorcentaje" | "lealtadMeta"
  >;
  try {
    await actualizarNegocio(sesion.negocioId, { lealtadModo, lealtadPorcentaje, lealtadMeta });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error actualizando negocio desde el portal:", err);
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 502 });
  }
}
