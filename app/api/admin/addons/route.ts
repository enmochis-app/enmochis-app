import { NextResponse } from "next/server";
import { getCatalogoAddons, crearAddon, type DatosAddon } from "@/lib/negocios";

export async function GET() {
  const addons = await getCatalogoAddons();
  return NextResponse.json({ addons });
}

export async function POST(request: Request) {
  const datos = (await request.json()) as Partial<DatosAddon>;
  if (!datos.nombre?.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  }
  if (typeof datos.precio !== "number" || Number.isNaN(datos.precio)) {
    return NextResponse.json({ error: "El precio es obligatorio." }, { status: 400 });
  }
  try {
    const resultado = await crearAddon({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      icono: datos.icono,
      precio: datos.precio,
    });
    return NextResponse.json(resultado, { status: 201 });
  } catch (err) {
    console.error("Error creando addon:", err);
    return NextResponse.json({ error: "No se pudo crear el addon." }, { status: 502 });
  }
}
