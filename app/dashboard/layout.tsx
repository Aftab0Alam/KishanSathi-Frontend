import { AuthProvider } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import FloatingChat from "@/components/layout/FloatingChat";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "flex-start" }}>
        {/* Desktop sidebar */}
        <div className="desktop-sidebar">
          <Sidebar />
        </div>

        {/* Main content */}
        <main style={{
          flex: 1, minWidth: 0,
          minHeight: "100vh",
          background: "radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.03) 0%, transparent 60%)",
        }}>
          <div className="dashboard-content-inner">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
      <FloatingChat />
    </AuthProvider>
  );
}

