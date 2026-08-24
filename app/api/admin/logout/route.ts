import { NextResponse } from "next/server";
import { COOKIE_SESION_ADMIN } from "@/lib/adminAuth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_SESION_ADMIN);
  return res;
}
