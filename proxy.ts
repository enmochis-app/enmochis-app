import { NextRequest, NextResponse } from "next/server";
import { CATEGORIAS } from "@/lib/negocios";
import { COOKIE_SESION_ADMIN, tokenSesionValido } from "@/lib/adminAuth";
import { COOKIE_SESION_PORTAL, verificarTokenPortal } from "@/lib/portalAuth";

const CATEGORIA_SLUGS = new Set(CATEGORIAS.map((c) => c.slug));
const APEX = "enmochis.app";

const RUTAS_ADMIN_PUBLICAS = ["/admin/login", "/api/admin/login"];
const RUTAS_PORTAL_PUBLICAS = ["/portal/login", "/api/portal/login"];

async function protegerAdmin(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  const esRutaAdmin = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!esRutaAdmin || RUTAS_ADMIN_PUBLICAS.includes(pathname)) return null;

  const secreto = process.env.ADMIN_SESSION_SECRET ?? "";
  const token = request.cookies.get(COOKIE_SESION_ADMIN)?.value;
  const valido = secreto && (await tokenSesionValido(token, secreto));
  if (valido) return null;

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

async function protegerPortal(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  const esRutaPortal = pathname.startsWith("/portal") || pathname.startsWith("/api/portal");
  if (!esRutaPortal || RUTAS_PORTAL_PUBLICAS.includes(pathname)) return null;

  const secreto = process.env.PORTAL_SESSION_SECRET ?? "";
  const token = request.cookies.get(COOKIE_SESION_PORTAL)?.value;
  const sesion = secreto ? await verificarTokenPortal(token, secreto) : null;
  if (sesion) return null;

  if (pathname.startsWith("/api/portal")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/portal/login";
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const bloqueoAdmin = await protegerAdmin(request);
  if (bloqueoAdmin) return bloqueoAdmin;

  const bloqueoPortal = await protegerPortal(request);
  if (bloqueoPortal) return bloqueoPortal;

  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0].toLowerCase();

  const esSubdominioDelSitio =
    hostname.endsWith(`.${APEX}`) && hostname !== `www.${APEX}`;

  if (!esSubdominioDelSitio) {
    return NextResponse.next();
  }

  const subdominio = hostname.slice(0, hostname.length - APEX.length - 1);

  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = CATEGORIA_SLUGS.has(subdominio)
    ? `/categoria/${subdominio}`
    : `/negocio/${subdominio}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
