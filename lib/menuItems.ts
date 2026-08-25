import { asc, eq } from "drizzle-orm";
import { db } from "./db";
import { menuItems, type MenuItemRow } from "./db/schema";
import { SAMPLE_MENU_ITEMS } from "./sample-data";

export type MenuItem = {
  id: string;
  categoria: string;
  nombre: string;
  precio: string;
  ordenable: boolean;
  orden: number;
};

export type MenuItemInput = {
  id?: string;
  categoria: string;
  nombre: string;
  precio: string;
  ordenable: boolean;
};

export type CategoriaMenu = { categoria: string; items: MenuItem[] };

function mapMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    categoria: row.categoria,
    nombre: row.nombre,
    precio: row.precio,
    ordenable: row.ordenable,
    orden: row.orden,
  };
}

export async function getMenuItems(negocioId: string): Promise<MenuItem[]> {
  try {
    const filas = await db()
      .select()
      .from(menuItems)
      .where(eq(menuItems.negocioId, negocioId))
      .orderBy(asc(menuItems.orden));
    return filas.map(mapMenuItem);
  } catch {
    return SAMPLE_MENU_ITEMS[negocioId] ?? [];
  }
}

/** Reemplaza todos los productos de un negocio por la lista dada (mismo patrón que sincronizarAddonsNegocio). */
export async function guardarMenuItems(negocioId: string, items: MenuItemInput[]): Promise<void> {
  await db().delete(menuItems).where(eq(menuItems.negocioId, negocioId));
  if (items.length === 0) return;
  await db()
    .insert(menuItems)
    .values(
      items.map((it, i) => ({
        negocioId,
        categoria: it.categoria || "Menú",
        nombre: it.nombre,
        precio: it.precio,
        ordenable: it.ordenable,
        orden: i,
      }))
    );
}

/** Agrupa los productos por categoría, en el orden en que aparecen (reemplaza a parsearMenu). */
export function agruparPorCategoria(items: MenuItem[]): CategoriaMenu[] {
  const categorias: CategoriaMenu[] = [];
  const porNombre = new Map<string, CategoriaMenu>();
  for (const item of items) {
    let cat = porNombre.get(item.categoria);
    if (!cat) {
      cat = { categoria: item.categoria, items: [] };
      porNombre.set(item.categoria, cat);
      categorias.push(cat);
    }
    cat.items.push(item);
  }
  return categorias;
}
