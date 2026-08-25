import { NextResponse } from "next/server";
import { getMetricasNegocio, inicioDeMes } from "@/lib/negocios";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const metricas = await getMetricasNegocio(id, inicioDeMes());
  return NextResponse.json({ metricas });
}
