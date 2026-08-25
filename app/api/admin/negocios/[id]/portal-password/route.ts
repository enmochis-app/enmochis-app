import { NextResponse } from "next/server";
import { asignarPasswordPortal } from "@/lib/negocios";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { password } = (await request.json()) as { password?: string };
  if (!password || password.length < 4) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 4 caracteres." }, { status: 400 });
  }
  try {
    await asignarPasswordPortal(id, password);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error asignando contraseña de portal:", err);
    return NextResponse.json({ error: "No se pudo guardar la contraseña." }, { status: 502 });
  }
}
