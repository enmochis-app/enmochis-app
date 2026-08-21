import Link from "next/link";
import { CATEGORIAS } from "@/lib/airtable";

export default function CategoriasPage() {
  return (
    <>
      <div className="hero">
        <div className="eyebrow">DIRECTORIO</div>
        <h1 className="title">
          Elige una
          <br />
          categoría.
        </h1>
        <p className="intro">
          Cada categoría tiene sus propios destacados y su directorio completo — así
          funcionará también por subdominio (ej. cafeterias.enmochis.app).
        </p>
      </div>
      <section className="section">
        <div className="catgrid">
          {CATEGORIAS.map((c) => (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className="catcard"
              style={{ background: c.color }}
            >
              <div className="cc-emoji">{c.emoji}</div>
              <div>
                <div className="cc-label">{c.nombre}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
