import { getDestacados, getRecomendados } from "@/lib/airtable";
import HomeHero from "@/components/HomeHero";
import { FeatureCard, NegocioCard } from "@/components/NegocioCards";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const [destacados, recomendados] = await Promise.all([
    getDestacados().catch(() => []),
    getRecomendados().catch(() => []),
  ]);

  return (
    <>
      <HomeHero />

      <section className="section">
        <div className="head">
          <h2>Destacados</h2>
          <Link href="/categorias">Ver todos →</Link>
        </div>
        {destacados.length > 0 ? (
          <FeatureCard negocio={destacados[0]} />
        ) : (
          <div className="small">Todavía no hay negocios destacados.</div>
        )}
      </section>

      <section className="section">
        <div className="head">
          <h2>Recomendados para ti</h2>
          <Link href="/categorias">Ver todos →</Link>
        </div>
        {recomendados.length > 0 ? (
          <div className="row">
            {recomendados.map((n) => (
              <NegocioCard key={n.id} negocio={n} />
            ))}
          </div>
        ) : (
          <div className="small">Todavía no hay negocios activos en el directorio.</div>
        )}
      </section>
    </>
  );
}
