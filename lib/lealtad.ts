import { and, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { lealtadRegistros } from "./db/schema";

const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0, I/1

export function generarCodigoLealtad(): string {
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)];
  }
  return codigo;
}

export type SaldoLealtad = { total: number; meta: number; modo: "visitas" | "puntos"; alcanzoMeta: boolean };

async function calcularTotal(negocioId: string, codigo: string): Promise<number> {
  const filas = await db()
    .select({ suma: sql<number>`coalesce(sum(unidades), 0)::int` })
    .from(lealtadRegistros)
    .where(and(eq(lealtadRegistros.negocioId, negocioId), eq(lealtadRegistros.codigo, codigo)));
  return Math.max(0, filas[0]?.suma ?? 0);
}

export async function consultarLealtad(
  negocioId: string,
  codigo: string,
  meta: number,
  modo: "visitas" | "puntos"
): Promise<SaldoLealtad> {
  const total = await calcularTotal(negocioId, codigo);
  return { total, meta, modo, alcanzoMeta: total >= meta };
}

export async function registrarVisita(
  negocioId: string,
  codigo: string,
  meta: number,
  modo: "visitas" | "puntos",
  porcentaje: number,
  monto?: number
): Promise<SaldoLealtad & { unidadesSumadas: number }> {
  const unidades = modo === "puntos" ? Math.round((monto ?? 0) * (porcentaje / 100)) : 1;
  await db().insert(lealtadRegistros).values({ negocioId, codigo, tipo: "registro", unidades, monto: monto ?? null });
  const total = await calcularTotal(negocioId, codigo);
  return { total, meta, modo, alcanzoMeta: total >= meta, unidadesSumadas: unidades };
}

export async function canjearLealtad(
  negocioId: string,
  codigo: string,
  meta: number,
  modo: "visitas" | "puntos"
): Promise<SaldoLealtad> {
  await db().insert(lealtadRegistros).values({ negocioId, codigo, tipo: "canje", unidades: -meta });
  const total = await calcularTotal(negocioId, codigo);
  return { total, meta, modo, alcanzoMeta: total >= meta };
}
