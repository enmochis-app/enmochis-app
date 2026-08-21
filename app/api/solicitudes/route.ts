import { NextResponse } from "next/server";
import { crearSolicitud, CATEGORIAS, type Categoria } from "@/lib/airtable";

const CATEGORIAS_VALIDAS = new Set<string>(CATEGORIAS.map((c) => c.nombre));

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const nombreNegocio = String(body.nombreNegocio ?? "").trim();
  const categoria = String(body.categoria ?? "").trim();
  const contactoNombre = String(body.contactoNombre ?? "").trim();
  const telefono = String(body.telefono ?? "").trim();
  const descripcion = String(body.descripcion ?? "").trim();

  if (!nombreNegocio || !contactoNombre || !telefono) {
    return NextResponse.json(
      { error: "Nombre del negocio, tu nombre y teléfono son obligatorios." },
      { status: 400 }
    );
  }
  if (!CATEGORIAS_VALIDAS.has(categoria)) {
    return NextResponse.json({ error: "Selecciona una categoría válida." }, { status: 400 });
  }

  try {
    const { slug } = await crearSolicitud({
      nombreNegocio,
      categoria: categoria as Categoria,
      contactoNombre,
      telefono,
      descripcion,
    });
    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch (err) {
    console.error("Error creando solicitud en Airtable:", err);
    return NextResponse.json(
      { error: "No se pudo guardar la solicitud. Intenta de nuevo más tarde." },
      { status: 502 }
    );
  }
}
