import PortalTopbar from "@/components/portal/PortalTopbar";

export default function PortalPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PortalTopbar />
      <main className="admin-main">{children}</main>
    </>
  );
}
