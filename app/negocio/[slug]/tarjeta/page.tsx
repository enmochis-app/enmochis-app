import { notFound } from "next/navigation";
import { getNegocioPorSlug } from "@/lib/negocios";
import TarjetaLealtad from "@/components/TarjetaLealtad";
import "@/app/negocio/minisitio.css";

export default async function TarjetaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const negocio = await getNegocioPorSlug(slug);
  if (!negocio || !negocio.addons.some((a) => a.clave === "lealtad")) notFound();

  return <TarjetaLealtad negocio={negocio} />;
}
