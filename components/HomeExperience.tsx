"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Categoria, Negocio } from "@/lib/negocios";
import { FeatCard, CategoryPromoCard, NegocioListItem } from "./NegocioCards";

const FOTO_HERO =
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=85";

export type CategoriaConTop = {
  slug: string;
  nombre: Categoria;
  emoji: string;
  color: string;
  top?: Negocio;
};

export default function HomeExperience({
  destacados,
  categorias,
  todos,
}: {
  destacados: Negocio[];
  categorias: CategoriaConTop[];
  todos: Negocio[];
}) {
  const [query, setQuery] = useState("");
  const carruselRef = useRef<HTMLDivElement>(null);

  const buscando = query.trim().length > 0;
  const resultados = useMemo(() => {
    if (!buscando) return [];
    const q = query.trim().toLowerCase();
    return todos.filter(
      (n) =>
        n.nombre.toLowerCase().includes(q) ||
        n.categoria.toLowerCase().includes(q) ||
        n.descripcionCorta.toLowerCase().includes(q)
    );
  }, [buscando, query, todos]);

  function desplazarCarrusel(direccion: 1 | -1) {
    carruselRef.current?.scrollBy({ left: direccion * 300, behavior: "smooth" });
  }

  return (
    <>
      <div className="home-hero">
        <div className="hb hb1" />
        <div className="hb hb2" />
        <div className="hb hb3" />
        <div className="hb hb4" />
        <div className="home-hero-grid">
          <div>
            <span className="eyebrow-pill">Descubre Los Mochis</span>
            <div className="home-title">
              <span className="ht-a">Antojo</span>
              <span className="ht-b">Total</span>
            </div>
            <p className="home-lede">
              El directorio de restaurantes, cafeterías, antojitos y panaderías de Los
              Mochis. Encuentra tu próximo lugar favorito en segundos.
            </p>
            <div className="search">
              ⌕{" "}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca por nombre, categoría o antojo..."
              />
            </div>
          </div>
          <div className="home-hero-art">
            <img src={FOTO_HERO} alt="Comida de Los Mochis" />
            <div className="hero-badge">
              <span className="hb-star">★★★★★</span>
              <span className="hb-num">{todos.length}+</span>
              <span className="hb-label">lugares afiliados</span>
            </div>
          </div>
        </div>
      </div>

      {buscando ? (
        <section className="section">
          <div className="head">
            <h2>Resultados</h2>
            <span className="result-count">
              {resultados.length} {resultados.length === 1 ? "encontrado" : "encontrados"}
            </span>
          </div>
          {resultados.length > 0 ? (
            <div className="list">
              {resultados.map((n) => (
                <NegocioListItem key={n.id} negocio={n} />
              ))}
            </div>
          ) : (
            <div className="empty-state">No encontramos nada con &quot;{query}&quot;.</div>
          )}
        </section>
      ) : (
        <>
          <section className="section">
            <div className="head">
              <h2>Destacados</h2>
              <Link href="/categorias">Ver todos →</Link>
            </div>
            {destacados.length > 0 ? (
              <div className="carousel-wrap">
                <div className="carousel" ref={carruselRef}>
                  {destacados.map((n) => (
                    <FeatCard key={n.id} negocio={n} />
                  ))}
                </div>
                <button className="carousel-btn prev" onClick={() => desplazarCarrusel(-1)} aria-label="Anterior">
                  ‹
                </button>
                <button className="carousel-btn next" onClick={() => desplazarCarrusel(1)} aria-label="Siguiente">
                  ›
                </button>
              </div>
            ) : (
              <div className="small">Todavía no hay negocios destacados.</div>
            )}
          </section>

          <section className="section">
            <div className="head">
              <h2>El directorio</h2>
            </div>
            <div className="catpromo-grid">
              {categorias.map((c) => (
                <CategoryPromoCard key={c.slug} slug={c.slug} nombre={c.nombre} top={c.top} />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
