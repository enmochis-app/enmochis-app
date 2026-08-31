import { NextResponse } from "next/server";
import { getCategorias, crearCategoria } from "@/lib/negocios";

export async function GET() {
  const categorias = await getCategorias();
  return NextResponse.json({ categorias });
}

export async function POST(request: Request) {
  const datos = (await request.json()) as { nombre?: string; emoji?: string; color?: string };
  if (!datos.nombre?.trim()) {
    return NextResponse.json({ error: "El nombre de la categoría es obligatorio." }, { status: 400 });
  }
  try {
    const categoria = await crearCategoria({ nombre: datos.nombre.trim(), emoji: datos.emoji, color: datos.color });
    return NextResponse.json({ categoria }, { status: 201 });
  } catch (err) {
    console.error("Error creando categoría:", err);
    return NextResponse.json({ error: "No se pudo crear la categoría." }, { status: 502 });
  }
}
