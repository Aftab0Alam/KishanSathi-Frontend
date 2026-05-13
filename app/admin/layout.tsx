// Give Sidebar/BottomNav to admin panel too
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { AuthProvider } from "@/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, paddingBottom: "80px" }} className="md:ml-[240px]">
          <div style={{ padding: "24px 20px", maxWidth: "1200px" }}>{children}</div>
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
