import { NextResponse } from "next/server";
import { buscarNegocioPorSlug } from "@/lib/negocios";
import { consultarLealtad } from "@/lib/lealtad";

export async function POST(request: Request) {
  const { slug, codigo } = (await request.json()) as { slug?: string; codigo?: string };
  if (!slug || !codigo) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }

  const negocio = await buscarNegocioPorSlug(slug);
  if (!negocio) return NextResponse.json({ error: "Negocio no encontrado." }, { status: 404 });

  try {
    const resultado = await consultarLealtad(
      negocio.id,
      codigo.trim().toUpperCase(),
      negocio.lealtadMeta,
      negocio.lealtadModo
    );
    return NextResponse.json(resultado);
  } catch (err) {
    console.error("Error consultando lealtad:", err);
    return NextResponse.json({ total: 0, meta: negocio.lealtadMeta, modo: negocio.lealtadModo, alcanzoMeta: false });
  }
}
