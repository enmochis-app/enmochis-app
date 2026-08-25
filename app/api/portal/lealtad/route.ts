import { NextResponse } from "next/server";
import { getNegocioPorId } from "@/lib/negocios";
import { registrarVisita, canjearLealtad } from "@/lib/lealtad";
import { sesionPortal } from "@/lib/portalSession";

export async function POST(request: Request) {
  const sesion = await sesionPortal();
  if (!sesion) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { codigo, accion, monto } = (await request.json()) as {
    codigo?: string;
    accion?: "registrar" | "canjear";
    monto?: number;
  };
  if (!codigo) return NextResponse.json({ error: "Falta el código." }, { status: 400 });

  const negocio = await getNegocioPorId(sesion.negocioId);
  if (!negocio) return NextResponse.json({ error: "Negocio no encontrado." }, { status: 404 });

  const codigoNormalizado = codigo.trim().toUpperCase();

  try {
    if (accion === "registrar") {
      if (negocio.lealtadModo === "puntos" && !monto) {
        return NextResponse.json({ error: "Falta el monto de la compra." }, { status: 400 });
      }
      const resultado = await registrarVisita(
        negocio.id,
        codigoNormalizado,
        negocio.lealtadMeta,
        negocio.lealtadModo,
        negocio.lealtadPorcentaje,
        monto
      );
      return NextResponse.json(resultado);
    }
    if (accion === "canjear") {
      const resultado = await canjearLealtad(negocio.id, codigoNormalizado, negocio.lealtadMeta, negocio.lealtadModo);
      return NextResponse.json(resultado);
    }
    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (err) {
    console.error("Error en lealtad (portal):", err);
    return NextResponse.json({ error: "No se pudo procesar." }, { status: 502 });
  }
}
