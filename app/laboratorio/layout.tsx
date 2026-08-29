export const metadata = {
  title: "Laboratorio de addons — EnMochis",
};

export default function LaboratorioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
