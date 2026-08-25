import { NextResponse } from "next/server";
import { getNegocioPorId } from "@/lib/negocios";
import { getMenuItems, guardarMenuItems, type MenuItemInput } from "@/lib/menuItems";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const items = await getMenuItems(id);
  return NextResponse.json({ items });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const negocio = await getNegocioPorId(id);
  if (!negocio) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  if (negocio.estado !== "solicitud") {
    return NextResponse.json({ error: "Esta información ya fue enviada anteriormente." }, { status: 409 });
  }

  const { items } = (await request.json()) as { items: MenuItemInput[] };
  try {
    await guardarMenuItems(id, items ?? []);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error guardando menú en completar:", err);
    return NextResponse.json({ error: "No se pudo guardar el menú." }, { status: 502 });
  }
}
