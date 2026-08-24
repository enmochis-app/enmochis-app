import { NextResponse } from "next/server";
import { actualizarAddon, type CambiosAddon } from "@/lib/negocios";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cambios = (await request.json()) as CambiosAddon;
  try {
    await actualizarAddon(id, cambios);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error actualizando addon:", err);
    return NextResponse.json({ error: "No se pudo guardar el cambio." }, { status: 502 });
  }
}
