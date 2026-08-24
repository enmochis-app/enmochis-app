export const COOKIE_SESION_ADMIN = "enmochis_admin_session";

const TREINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000;
const encoder = new TextEncoder();

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function compararConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function firmar(mensaje: string, secreto: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secreto),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const firma = await crypto.subtle.sign("HMAC", key, encoder.encode(mensaje));
  return bufferToHex(firma);
}

export async function crearTokenSesion(secreto: string): Promise<string> {
  const marca = Date.now().toString();
  const firma = await firmar(marca, secreto);
  return `${marca}.${firma}`;
}

export async function tokenSesionValido(
  token: string | undefined,
  secreto: string
): Promise<boolean> {
  if (!token) return false;
  const [marca, firma] = token.split(".");
  if (!marca || !firma) return false;
  const esperada = await firmar(marca, secreto);
  if (!compararConstante(esperada, firma)) return false;
  const antiguedad = Date.now() - Number(marca);
  return antiguedad >= 0 && antiguedad < TREINTA_DIAS_MS;
}
