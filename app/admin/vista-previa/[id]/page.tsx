import { notFound } from "next/navigation";
import { getNegocioPorId } from "@/lib/negocios";
import { getMenuItems } from "@/lib/menuItems";
import { getResumenCalificaciones, getComentariosVisibles } from "@/lib/calificaciones";
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
