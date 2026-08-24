import { NextResponse } from "next/server";
import { getNegocioPorId, actualizarNegocio, type DatosNegocio } from "@/lib/airtable";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const negocio = await getNegocioPorId(id);
  if (!negocio) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  return NextResponse.json({ negocio });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const negocio = await getNegocioPorId(id);
  if (!negocio) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }
  if (negocio.estado !== "solicitud") {
    return NextResponse.json(
      { error: "Esta información ya fue enviada anteriormente." },
      { status: 409 }
    );
  }

  const datos = (await request.json()) as Partial<DatosNegocio>;

  try {
    await actualizarNegocio(id, {
      descripcionCorta: datos.descripcionCorta,
      descripcionLarga: datos.descripcionLarga,
      telefono: datos.telefono,
      whatsapp: datos.whatsapp,
      direccion: datos.direccion,
      instagram: datos.instagram,
      facebook: datos.facebook,
      horarios: datos.horarios,
      menu: datos.menu,
      estado: "revision",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en auto-completado:", err);
    return NextResponse.json({ error: "No se pudo enviar la información." }, { status: 502 });
  }
}
