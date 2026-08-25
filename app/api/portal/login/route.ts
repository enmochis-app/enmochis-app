import { NextResponse } from "next/server";
import { verificarLoginPortal } from "@/lib/negocios";
import { COOKIE_SESION_PORTAL, crearTokenPortal } from "@/lib/portalAuth";

export async function POST(request: Request) {
  const { usuario, password } = await request.json().catch(() => ({ usuario: "", password: "" }));
  const secreto = process.env.PORTAL_SESSION_SECRET;

  if (!secreto) {
    return NextResponse.json(
      { error: "El portal no está configurado todavía (falta PORTAL_SESSION_SECRET)." },
      { status: 500 }
    );
  }
  if (!usuario || !password) {
    return NextResponse.json({ error: "Usuario y contraseña son obligatorios." }, { status: 400 });
  }

  const negocioId = await verificarLoginPortal(usuario, password);
  if (!negocioId) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  const token = await crearTokenPortal(negocioId, secreto);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SESION_PORTAL, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
