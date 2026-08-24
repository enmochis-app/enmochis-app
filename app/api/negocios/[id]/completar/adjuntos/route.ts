import { NextResponse } from "next/server";
import { getNegocioPorId, subirAdjunto } from "@/lib/negocios";

const CAMPOS_VALIDOS = new Set([
  "logo",
  "foto_portada",
  "galeria_1_foto",
  "galeria_2_foto",
  "galeria_3_foto",
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const negocio = await getNegocioPorId(id);
  if (!negocio) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }
  if (negocio.estado !== "solicitud") {
    return NextResponse.json(
      { error: "Esta información ya fue enviada anteriormente." },
      { status: 409 }
    );
  }

  const { campo, filename, contentType, base64 } = await request.json();
  if (!CAMPOS_VALIDOS.has(campo)) {
    return NextResponse.json({ error: "Campo de foto inválido." }, { status: 400 });
  }
  if (!filename || !contentType || !base64) {
    return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  }

  try {
    await subirAdjunto(id, campo, { filename, contentType, base64 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error subiendo adjunto (completar):", err);
    return NextResponse.json({ error: "No se pudo subir la foto." }, { status: 502 });
  }
}
