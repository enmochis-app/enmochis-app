import { notFound } from "next/navigation";
import { getNegocioPorSlug } from "@/lib/airtable";
import NegocioDetalle from "@/components/NegocioDetalle";

export const revalidate = 60;

export default async function NegocioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const negocio = await getNegocioPorSlug(slug);
  if (!negocio) notFound();

  return <NegocioDetalle negocio={negocio} />;
}
