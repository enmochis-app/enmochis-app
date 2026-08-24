import { NextResponse } from "next/server";
import { subirAdjunto } from "@/lib/airtable";

const CAMPOS_VALIDOS = new Set([
  "logo",
  "producto_estrella_foto",
  "galeria_1_foto",
  "galeria_2_foto",
  "galeria_3_foto",
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    console.error("Error subiendo adjunto:", err);
    return NextResponse.json({ error: "No se pudo subir la foto." }, { status: 502 });
  }
}
