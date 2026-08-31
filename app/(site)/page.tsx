import { getDestacados, getTodosPublicos, getNegociosPorCategoria, getCategorias } from "@/lib/negocios";
import HomeExperience from "@/components/HomeExperience";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const listaCategorias = await getCategorias();
  const [destacados, todos, porCategoria] = await Promise.all([
    getDestacados(),
    getTodosPublicos(),
    Promise.all(listaCategorias.map((c) => getNegociosPorCategoria(c.slug))),
  ]);

  const categorias = listaCategorias.map((c, i) => {
    const negocios = porCategoria[i];
    const top = negocios.find((n) => n.estado === "destacado") ?? negocios[0];
    return { slug: c.slug, nombre: c.nombre, emoji: c.emoji, color: c.color, top };
  });

  return (
    <>
      <HomeExperience destacados={destacados} categorias={categorias} todos={todos} />

      <section className="section">
        <div className="head">
          <h2>Recomendaciones</h2>
          <Link href="/weekend">Ver más →</Link>
        </div>
        <Link href="/weekend" className="feature">
          <img
            src="https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=85"
            alt="Recomendaciones de la semana"
          />
          <div className="feature-body">
            <h3>TU PLAN PARA EL WEEKEND</h3>
            <div className="meta">Brunch, postres y cafés que valen la salida.</div>
          </div>
        </Link>
      </section>
    </>
  );
}
