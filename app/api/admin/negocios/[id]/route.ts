import { NextResponse } from "next/server";
import { getNegocioPorId, actualizarNegocio, archivarNegocio, eliminarNegocio, type DatosNegocio } from "@/lib/negocios";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const negocio = await getNegocioPorId(id);
  if (!negocio) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  return NextResponse.json({ negocio });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await eliminarNegocio(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error eliminando negocio desde el admin:", err);
    return NextResponse.json({ error: "No se pudo eliminar el negocio." }, { status: 502 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cambios = (await request.json()) as Partial<DatosNegocio> & { archivar?: boolean };
  try {
    if (cambios.archivar) {
      await archivarNegocio(id);
    } else {
      await actualizarNegocio(id, cambios);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error actualizando negocio desde el admin:", err);
    return NextResponse.json({ error: "No se pudo guardar el cambio." }, { status: 502 });
  }
}
