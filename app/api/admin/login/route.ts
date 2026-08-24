import { NextResponse } from "next/server";
import { COOKIE_SESION_ADMIN, crearTokenSesion } from "@/lib/adminAuth";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  const esperada = process.env.ADMIN_PASSWORD;
  const secreto = process.env.ADMIN_SESSION_SECRET;

  if (!esperada || !secreto) {
    return NextResponse.json(
      { error: "El panel de administración no está configurado todavía (faltan variables de entorno)." },
      { status: 500 }
    );
  }
  if (password !== esperada) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const token = await crearTokenSesion(secreto);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SESION_ADMIN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
