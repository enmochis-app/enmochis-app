import { notFound } from "next/navigation";
import Link from "next/link";
import { getNegocioPorSlug, slugPorCategoria } from "@/lib/airtable";

export const revalidate = 60;

function whatsappHref(numero: string) {
  const limpio = numero.replace(/[^0-9]/g, "");
  return `https://wa.me/${limpio}`;
}

function mapsHref(direccion: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
}

export default async function NegocioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const negocio = await getNegocioPorSlug(slug).catch(() => null);
  if (!negocio) notFound();

  return (
    <>
      <Link href={`/categoria/${slugPorCategoria(negocio.categoria)}`} className="backlink">
        ← Volver al directorio
      </Link>

      <article className="feature" style={{ margin: "16px 18px" }}>
        {negocio.fotoPortadaUrl && <img src={negocio.fotoPortadaUrl} alt={negocio.nombre} />}
        <div className="feature-body">
          <h3>{negocio.nombre.toUpperCase()}</h3>
          <div className="meta">
            {negocio.descripcionCorta} · {negocio.direccion}
          </div>
          {negocio.horarios && <div className="rating">{negocio.horarios}</div>}
        </div>
      </article>

      {negocio.descripcionLarga && (
        <section className="section">
          <p className="intro">{negocio.descripcionLarga}</p>
        </section>
      )}

      {negocio.galeria.length > 0 && (
        <section className="section">
          <div className="head">
            <h2>Galería</h2>
          </div>
          <div className="gallery">
            {negocio.galeria.map((url, i) => (
              <img key={url + i} src={url} alt={`${negocio.nombre} ${i + 1}`} />
            ))}
          </div>
        </section>
      )}

      {negocio.menu.length > 0 && (
        <section className="section">
          <div className="head">
            <h2>Menú</h2>
          </div>
          <div className="menu-list">
            {negocio.menu.map((item, i) => (
              <div className="menu-row" key={item.nombre + i}>
                <div>
                  <div className="mr-name">{item.nombre}</div>
                  {item.descripcion && <div className="mr-desc">{item.descripcion}</div>}
                </div>
                {item.precio && <div className="mr-price">{item.precio}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        {negocio.whatsapp && (
          <a
            className="whatsapp-btn"
            href={whatsappHref(negocio.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 Escribir por WhatsApp
          </a>
        )}
        {negocio.direccion && (
          <a
            className="btn"
            style={{ marginTop: 8 }}
            href={mapsHref(negocio.direccion)}
            target="_blank"
            rel="noopener noreferrer"
          >
            📍 Cómo llegar
          </a>
        )}
      </section>
    </>
  );
}
