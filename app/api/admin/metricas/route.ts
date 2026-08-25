import { NextResponse } from "next/server";
import { getAllNegocios, getMetricasTodos, inicioDeMes } from "@/lib/negocios";

export async function GET() {
  const [negocios, metricasPorNegocio] = await Promise.all([getAllNegocios(), getMetricasTodos(inicioDeMes())]);
  const filas = negocios.map((n) => ({
    id: n.id,
    nombre: n.nombre,
    slug: n.slug,
    metricas: metricasPorNegocio.get(n.id) ?? {},
  }));
  return NextResponse.json({ filas });
}
