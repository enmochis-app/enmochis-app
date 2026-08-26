import { NextResponse } from "next/server";
import { getCalificacionesAdmin, actualizarVisibilidad } from "@/lib/calificaciones";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const calificaciones = await getCalificacionesAdmin(id);
  return NextResponse.json({ calificaciones });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const { calificacionId, visible } = (await request.json()) as { calificacionId?: string; visible?: boolean };
  if (!calificacionId || typeof visible !== "boolean") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  await actualizarVisibilidad(calificacionId, visible);
  return NextResponse.json({ ok: true });
}
