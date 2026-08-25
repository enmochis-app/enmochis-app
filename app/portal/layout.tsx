import "../admin/admin.css";

export const metadata = {
  title: "Portal — EnMochis",
};

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="admin-body">{children}</body>
    </html>
  );
}
