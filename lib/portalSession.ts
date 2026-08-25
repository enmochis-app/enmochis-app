import { cookies } from "next/headers";
import { COOKIE_SESION_PORTAL, verificarTokenPortal } from "./portalAuth";

/** Lee y verifica la sesión del portal desde las cookies de la petición actual. Solo para rutas API/páginas del portal, no para proxy.ts. */
export async function sesionPortal(): Promise<{ negocioId: string } | null> {
  const secreto = process.env.PORTAL_SESSION_SECRET;
  if (!secreto) return null;
  const jar = await cookies();
  const token = jar.get(COOKIE_SESION_PORTAL)?.value;
  return verificarTokenPortal(token, secreto);
}
