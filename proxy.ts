import { NextRequest, NextResponse } from "next/server";
import { CATEGORIAS } from "@/lib/airtable";

const CATEGORIA_SLUGS = new Set(CATEGORIAS.map((c) => c.slug));
const APEX = "enmochis.app";

export function proxy(request: NextRequest) {
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
