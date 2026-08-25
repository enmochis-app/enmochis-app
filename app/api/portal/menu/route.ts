import { NextResponse } from "next/server";
import { getMenuItems, guardarMenuItems, type MenuItemInput } from "@/lib/menuItems";
import { sesionPortal } from "@/lib/portalSession";

export async function GET() {
  const sesion = await sesionPortal();
  if (!sesion) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const items = await getMenuItems(sesion.negocioId);
  return NextResponse.json({ items });
}

export async function PATCH(request: Request) {
  const sesion = await sesionPortal();
  if (!sesion) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { items } = (await request.json()) as { items: MenuItemInput[] };
  try {
    await guardarMenuItems(sesion.negocioId, items ?? []);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error guardando el menú desde el portal:", err);
    return NextResponse.json({ error: "No se pudo guardar el menú." }, { status: 502 });
  }
}
