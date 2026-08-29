import Link from "next/link";
import type { Categoria, Negocio } from "@/lib/negocios";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=85";

export function FeatureCard({ negocio }: { negocio: Negocio }) {
  return (
    <article className="feature">
      <img src={negocio.fotoPortada || negocio.logoUrl || PLACEHOLDER} alt={negocio.nombre} />
      <div className="feature-body">
        <h3>{negocio.nombre.toUpperCase()}</h3>
        <div className="meta">{negocio.descripcionCorta}</div>
        <div className="rating">{negocio.categoria}</div>
      </div>
    </article>
  );
}

export function NegocioCard({ negocio }: { negocio: Negocio }) {
  return (
    <Link href={`/negocio/${negocio.slug}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
      <img src={negocio.fotoPortada || negocio.logoUrl || PLACEHOLDER} alt={negocio.nombre} />
      <div className="cardbody">
        <h3>{negocio.nombre}</h3>
        <div className="small">{negocio.categoria}</div>
      </div>
    </Link>
  );
}

export function NegocioListItem({ negocio }: { negocio: Negocio }) {
  return (
    <Link href={`/negocio/${negocio.slug}`} className="listitem">
      <img src={negocio.fotoPortada || negocio.logoUrl || PLACEHOLDER} alt={negocio.nombre} />
      <div>
        <h3>{negocio.nombre}</h3>
        <div className="small">{negocio.descripcionCorta}</div>
        {negocio.estado === "destacado" && <span className="tag">DESTACADO</span>}
      </div>
    </Link>
  );
}

/** Tarjeta cuadrada del carrusel de Destacados en el inicio. */
export function FeatCard({ negocio }: { negocio: Negocio }) {
  return (
    <Link href={`/negocio/${negocio.slug}`} className="feat-card">
      <div className="fc-ph">
        <img src={negocio.fotoPortada || negocio.logoUrl || PLACEHOLDER} alt={negocio.nombre} />
        <span className="fc-tag">Destacado</span>
      </div>
      <div className="fc-body">
        <h3>{negocio.nombre}</h3>
        <div className="small">{negocio.categoria}</div>
      </div>
    </Link>
  );
}

/** Tarjeta del directorio por categoría — promueve la categoría, no un negocio en particular. */
export function CategoryPromoCard({
  slug,
  nombre,
  top,
}: {
  slug: string;
  nombre: Categoria;
  top?: Negocio;
}) {
  return (
    <Link href={`/categoria/${slug}`} className="catpromo-card">
      <img src={top?.fotoPortada || top?.logoUrl || PLACEHOLDER} alt={nombre} />
      <div className="catpromo-content">
        <div className="cp-name">{nombre}</div>
        {top && (
          <div className="cp-top">
            <span className="cp-eyebrow">Top</span> {top.nombre}
          </div>
        )}
      </div>
    </Link>
  );
}
