import { NextResponse } from "next/server";
import { getAllNegocios, crearNegocioAdmin, type DatosNegocio } from "@/lib/negocios";

export async function GET() {
  const negocios = await getAllNegocios();
  return NextResponse.json({ negocios });
}

export async function POST(request: Request) {
  const datos = (await request.json()) as Partial<DatosNegocio> & { nombre?: string };
  if (!datos.nombre?.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  }
  try {
    const resultado = await crearNegocioAdmin({ ...datos, nombre: datos.nombre });
    return NextResponse.json(resultado, { status: 201 });
  } catch (err) {
    console.error("Error creando negocio desde el admin:", err);
    return NextResponse.json({ error: "No se pudo crear el negocio." }, { status: 502 });
  }
}
