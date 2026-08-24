import "./minisitio.css";

export const metadata = {
  title: "EnMochis",
};

export default function NegocioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
