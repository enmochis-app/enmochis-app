import { notFound } from "next/navigation";
import { getNegocioPorId } from "@/lib/airtable";
import NegocioDetalle from "@/components/NegocioDetalle";
import "@/app/negocio/minisitio.css";

export default async function VistaPreviaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const negocio = await getNegocioPorId(id);
  if (!negocio) notFound();

  return <NegocioDetalle negocio={negocio} />;
}
