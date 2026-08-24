import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function conexion() {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    throw new Error("Falta POSTGRES_URL. Revisa tu .env.local.");
  }
  return drizzle(neon(url), { schema });
}

let instancia: ReturnType<typeof conexion> | null = null;

export function db() {
  if (!instancia) instancia = conexion();
  return instancia;
}
