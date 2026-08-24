import "./admin.css";

export const metadata = {
  title: "Admin — EnMochis",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="admin-body">{children}</body>
    </html>
  );
}
