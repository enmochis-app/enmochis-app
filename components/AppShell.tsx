"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeContext, type Theme } from "./theme-context";

function activeNav(pathname: string): "home" | "explorar" | "weekend" | "unete" | null {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/categoria") || pathname.startsWith("/negocio")) return "explorar";
  if (pathname.startsWith("/weekend")) return "weekend";
  if (pathname.startsWith("/unete")) return "unete";
  return null;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("blue");
  const [menuOpen, setMenuOpen] = useState(false);

  const active = activeNav(pathname);

  return (
    <>
      <div className="switch">
        <button
          id="blue"
          className={theme === "blue" ? "active" : ""}
          onClick={() => setTheme("blue")}
        >
          01 AZUL
        </button>
        <button
          id="orange"
          className={theme === "orange" ? "active" : ""}
          onClick={() => setTheme("orange")}
        >
          02 NARANJA
        </button>
      </div>

      <div className={`menu-panel${menuOpen ? " open" : ""}`}>
        <button className="close" onClick={() => setMenuOpen(false)}>
          ×
        </button>
        <h2>
          EN
          <br />
          MOCHIS
        </h2>
        <Link className="menu-link" href="/" onClick={() => setMenuOpen(false)}>
          Inicio
        </Link>
        <Link className="menu-link" href="/categorias" onClick={() => setMenuOpen(false)}>
          Lugares destacados
        </Link>
        <Link className="menu-link" href="/weekend" onClick={() => setMenuOpen(false)}>
          Este fin de semana
        </Link>
        <Link className="menu-link" href="/unete" onClick={() => setMenuOpen(false)}>
          Únete al directorio
        </Link>
      </div>

      <main className={`app${theme === "orange" ? " orange" : ""}`}>
        <header className="topbar">
          <div className="logo">ENMOCHIS</div>
          <div className="icons">
            <button className="icon">⌕</button>
            <button className="icon" onClick={() => setMenuOpen(true)}>
              ☰
            </button>
          </div>
        </header>

        <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>

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
