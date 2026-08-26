import { and, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { calificaciones, type CalificacionRow } from "./db/schema";

export type Calificacion = {
  id: string;
  estrellas: number;
  comentario?: string;
  visible: boolean;
  createdAt: string;
};

function mapCalificacion(row: CalificacionRow): Calificacion {
  return {
    id: row.id,
    estrellas: row.estrellas,
    comentario: row.comentario ?? undefined,
    visible: row.visible,
    createdAt: row.createdAt.toISOString(),
  };
}

export type ResumenCalificaciones = { promedio: number; total: number };

/** El promedio siempre se calcula sobre TODAS las calificaciones, se muestren o no sus comentarios. */
export async function getResumenCalificaciones(negocioId: string): Promise<ResumenCalificaciones> {
  const filas = await db().select({ estrellas: calificaciones.estrellas }).from(calificaciones).where(eq(calificaciones.negocioId, negocioId));
  if (filas.length === 0) return { promedio: 0, total: 0 };
  const suma = filas.reduce((s, f) => s + f.estrellas, 0);
  return { promedio: suma / filas.length, total: filas.length };
}

/** Comentarios públicos: solo los marcados visibles, más recientes primero. */
export async function getComentariosVisibles(negocioId: string, limite = 20): Promise<Calificacion[]> {
  const filas = await db()
    .select()
    .from(calificaciones)
    .where(and(eq(calificaciones.negocioId, negocioId), eq(calificaciones.visible, true)))
    .orderBy(desc(calificaciones.createdAt))
    .limit(limite);
  return filas.map(mapCalificacion);
}

/** Para el panel de moderación del admin: todas, incluidas las ocultas. */
export async function getCalificacionesAdmin(negocioId: string): Promise<Calificacion[]> {
  const filas = await db().select().from(calificaciones).where(eq(calificaciones.negocioId, negocioId)).orderBy(desc(calificaciones.createdAt));
  return filas.map(mapCalificacion);
}

export async function crearCalificacion(negocioId: string, estrellas: number, comentario?: string): Promise<void> {
  await db()
    .insert(calificaciones)
    .values({ negocioId, estrellas, comentario: comentario?.trim() || null });
}

/** Solo oculta/muestra el comentario — nunca afecta el promedio, que siempre suma todas las filas. */
export async function actualizarVisibilidad(id: string, visible: boolean): Promise<void> {
  await db().update(calificaciones).set({ visible }).where(eq(calificaciones.id, id));
}
