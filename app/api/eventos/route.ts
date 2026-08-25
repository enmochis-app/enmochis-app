import { NextResponse } from "next/server";
import { esTipoEventoValido, registrarEventoServidor } from "@/lib/negocios";

export async function POST(request: Request) {
  try {
    const datos = (await request.json()) as { negocioId?: string; tipo?: string };
    if (!datos.negocioId || !datos.tipo || !esTipoEventoValido(datos.tipo)) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }
    await registrarEventoServidor(datos.negocioId, datos.tipo);
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
