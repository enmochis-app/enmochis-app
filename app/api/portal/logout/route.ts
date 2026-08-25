import { NextResponse } from "next/server";
import { COOKIE_SESION_PORTAL } from "@/lib/portalAuth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_SESION_PORTAL);
  return res;
}
