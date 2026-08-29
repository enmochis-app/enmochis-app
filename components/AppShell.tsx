"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function activeNav(pathname: string): "home" | "explorar" | "weekend" | "unete" | null {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/categoria") || pathname.startsWith("/negocio")) return "explorar";
  if (pathname.startsWith("/weekend")) return "weekend";
  if (pathname.startsWith("/unete")) return "unete";
  return null;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const active = activeNav(pathname);

  return (
    <>
      <div className={`menu-panel${menuOpen ? " open" : ""}`}>
        <button className="close" onClick={() => setMenuOpen(false)}>
          ×
        </button>
        <h2>
          <span style={{ color: "var(--paper)" }}>En</span>
          <span style={{ color: "var(--lime)" }}>Mochis</span>
        </h2>
        <Link className="menu-link" href="/" onClick={() => setMenuOpen(false)}>
          Inicio
        </Link>
        <Link className="menu-link" href="/categorias" onClick={() => setMenuOpen(false)}>
          El directorio
        </Link>
        <Link className="menu-link" href="/weekend" onClick={() => setMenuOpen(false)}>
          Recomendaciones
        </Link>
        <Link className="menu-link" href="/unete" onClick={() => setMenuOpen(false)}>
          Afíliate
        </Link>
      </div>

      <main className="app">
        <header className="topbar">
          <Link href="/" className="logo">
            <span className="lg-en">En</span>
            <span className="lg-mochis">Mochis</span>
          </Link>
          <div className="icons">
            <button className="icon" onClick={() => setMenuOpen(true)}>
              ☰
            </button>
          </div>
        </header>

        {children}

        <nav className="bottom">
          <Link href="/" className={`nav${active === "home" ? " active" : ""}`}>
            <span>⌂</span>Inicio
          </Link>
          <Link href="/categorias" className={`nav${active === "explorar" ? " active" : ""}`}>
            <span>⌕</span>Explorar
          </Link>
          <Link href="/weekend" className={`nav${active === "weekend" ? " active" : ""}`}>
            <span>✦</span>Weekend
          </Link>
          <Link href="/unete" className={`nav${active === "unete" ? " active" : ""}`}>
            <span>＋</span>Únete
          </Link>
        </nav>
      </main>
    </>
  );
}
