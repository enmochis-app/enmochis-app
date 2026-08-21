import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "EnMochis — Descubre Los Mochis",
  description: "Directorio de restaurantes, cafeterías, snacks y panaderías en Los Mochis, Sinaloa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
