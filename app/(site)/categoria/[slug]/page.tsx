import { notFound } from "next/navigation";
import Link from "next/link";
import { categoriaPorSlug, getNegociosPorCategoria } from "@/lib/negocios";
import { NegocioCard, NegocioListItem } from "@/components/NegocioCards";

export const revalidate = 60;

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoria = categoriaPorSlug(slug);
  if (!categoria) notFound();

  const negocios = await getNegociosPorCategoria(slug);
  const destacados = negocios.filter((n) => n.estado === "destacado");

  return (
    <>
      <Link href="/categorias" className="backlink">
        ← Todas las categorías
      </Link>
      <div className="hero">
        <div className="eyebrow">CATEGORÍA / {categoria.nombre.toUpperCase()}</div>
        <h1 className="title">{categoria.nombre}</h1>
      </div>

      <section className="section">
        <div className="head">
          <h2>Destacados</h2>
          <span className="small">Espacio patrocinado</span>
        </div>
        {destacados.length > 0 ? (
          <div className="row">
            {destacados.map((n) => (
              <NegocioCard key={n.id} negocio={n} />
            ))}
          </div>
        ) : (
          <div className="small">Todavía no hay destacados en esta categoría.</div>
        )}
      </section>

      <section className="section">
        <div className="head">
          <h2>Directorio completo</h2>
        </div>
        {negocios.length > 0 ? (
          <div className="list">
            {negocios.map((n) => (
              <NegocioListItem key={n.id} negocio={n} />
            ))}
          </div>
        ) : (
          <div className="small">Todavía no hay negocios en esta categoría.</div>
        )}
      </section>
    </>
  );
}
