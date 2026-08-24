import AdminTopbar from "@/components/admin/AdminTopbar";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminTopbar />
      <main className="admin-main">{children}</main>
    </>
  );
}
