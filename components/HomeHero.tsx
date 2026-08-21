"use client";

import Link from "next/link";
import { useTheme } from "./theme-context";
import { CATEGORIAS } from "@/lib/airtable";

export default function HomeHero() {
  const theme = useTheme();
  return (
    <div className="hero">
      <div className="eyebrow">Descubre Los Mochis</div>
      <h1 className="title">
        {theme === "orange" ? (
          <>
            DESCUBRE
            <br />
            LO MEJOR
            <br />
            DE LOS MOCHIS.
          </>
        ) : (
          <>
            Buena comida,
            <br />
            cerca de ti.
          </>
        )}
      </h1>
      <div className="search">
        ⌕ <input placeholder="Buscar restaurantes, cafés, antojitos..." />☷
      </div>
      <div className="cat-scroll">
        {CATEGORIAS.map((c) => (
          <Link key={c.slug} href={`/categoria/${c.slug}`} className="cat-chip">
            {c.emoji} {c.nombre}
          </Link>
        ))}
      </div>
    </div>
  );
}
