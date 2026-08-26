import { notFound } from "next/navigation";
import { getNegocioPorSlug } from "@/lib/negocios";
import { getMenuItems } from "@/lib/menuItems";
import { getResumenCalificaciones, getComentariosVisibles } from "@/lib/calificaciones";
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
  const menuItems = await getMenuItems(negocio.id);
  const tieneCalificaciones = negocio.addons.some((a) => a.clave === "calificaciones");
  const [resumenCalificaciones, comentarios] = tieneCalificaciones
    ? await Promise.all([getResumenCalificaciones(negocio.id), getComentariosVisibles(negocio.id)])
    : [undefined, undefined];

  return (
    <NegocioDetalle
      negocio={negocio}
      menuItems={menuItems}
      resumenCalificaciones={resumenCalificaciones}
      comentarios={comentarios}
    />
  );
}
