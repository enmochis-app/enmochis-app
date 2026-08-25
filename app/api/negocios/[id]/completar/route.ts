import { NextResponse } from "next/server";
import { getNegocioPorId, actualizarNegocio, type DatosNegocio } from "@/lib/negocios";

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
      mensajeWhatsapp: datos.mensajeWhatsapp,
      direccion: datos.direccion,
      instagram: datos.instagram,
      facebook: datos.facebook,
      horarios: datos.horarios,
      logoForma: datos.logoForma,
      colorAcento: datos.colorAcento,
      galeria_1_nombre: datos.galeria_1_nombre,
      galeria_1_precio: datos.galeria_1_precio,
      galeria_1_unidad: datos.galeria_1_unidad,
      galeria_1_descripcion: datos.galeria_1_descripcion,
      galeria_2_nombre: datos.galeria_2_nombre,
      galeria_2_precio: datos.galeria_2_precio,
      galeria_2_unidad: datos.galeria_2_unidad,
      galeria_2_descripcion: datos.galeria_2_descripcion,
      galeria_3_nombre: datos.galeria_3_nombre,
      galeria_3_precio: datos.galeria_3_precio,
      galeria_3_unidad: datos.galeria_3_unidad,
      galeria_3_descripcion: datos.galeria_3_descripcion,
      estado: "revision",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en auto-completado:", err);
    return NextResponse.json({ error: "No se pudo enviar la información." }, { status: 502 });
  }
}
