export const COOKIE_SESION_PORTAL = "enmochis_portal_session";

const TREINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000;
const encoder = new TextEncoder();

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
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

// --- Sesión (negocioId embebido en el token, a diferencia del admin) ---

export async function crearTokenPortal(negocioId: string, secreto: string): Promise<string> {
  const marca = Date.now().toString();
  const firma = await firmar(`${negocioId}.${marca}`, secreto);
  return `${negocioId}.${marca}.${firma}`;
}

export async function verificarTokenPortal(
  token: string | undefined,
  secreto: string
): Promise<{ negocioId: string } | null> {
  if (!token) return null;
  const [negocioId, marca, firma] = token.split(".");
  if (!negocioId || !marca || !firma) return null;
  const esperada = await firmar(`${negocioId}.${marca}`, secreto);
  if (!compararConstante(esperada, firma)) return null;
  const antiguedad = Date.now() - Number(marca);
  if (antiguedad < 0 || antiguedad >= TREINTA_DIAS_MS) return null;
  return { negocioId };
}

// --- Contraseña del portal (PBKDF2 vía Web Crypto, compatible con el runtime Edge) ---

function generarSal(): string {
  return bufferToHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
}

async function derivarHash(password: string, sal: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: hexToBuffer(sal).slice().buffer, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return bufferToHex(bits);
}

export async function hashearPassword(password: string): Promise<{ hash: string; sal: string }> {
  const sal = generarSal();
  const hash = await derivarHash(password, sal);
  return { hash, sal };
}

export async function passwordValido(password: string, hash: string, sal: string): Promise<boolean> {
  const calculado = await derivarHash(password, sal);
  return compararConstante(calculado, hash);
}
