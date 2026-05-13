"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Camera, Leaf, Cloud, MessageCircle, BarChart3,
  FlaskConical, FileText, Bell, LogOut, ShieldCheck,
  ChevronLeft, ChevronRight, Sprout, Layers,
  User, Settings, ChevronDown, Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/dashboard",              icon: Home,          label: "Dashboard",           color: "#4ADE80" },
  { href: "/dashboard/disease",      icon: Camera,        label: "Plant Doctor",         color: "#F87171" },
  { href: "/dashboard/soil",         icon: Layers,        label: "Soil Check",           color: "#10B981" },
  { href: "/dashboard/fertilizer",   icon: FlaskConical,  label: "Fertilizer Advisor",   color: "#FBBF24" },
  { href: "/dashboard/weather",      icon: Cloud,         label: "Weather",              color: "#22D3EE" },
  { href: "/dashboard/yield",        icon: BarChart3,     label: "Yield Prediction",     color: "#F59E0B" },
  { href: "/dashboard/chat",         icon: MessageCircle, label: "AI Chat Assistant",    color: "#4ADE80" },
  { href: "/dashboard/reports",      icon: FileText,      label: "Reports & History",    color: "#6EE7B7" },
  { href: "/dashboard/crops",        icon: Leaf,          label: "Crop Recommendation",  color: "#8B5CF6" },
  { href: "/dashboard/notifications",icon: Bell,          label: "Notifications",        color: "#EC4899" },
  { href: "/dashboard/profile",      icon: Settings,      label: "Settings",             color: "#A78BFA" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Inline accordion profile section (avoids overflow-clipping issues)
───────────────────────────────────────────────────────────────────────────── */
function UserProfile({
  user,
  role,
  collapsed,
  signOut,
}: {
  user: any;
  role: string | null;
  collapsed: boolean;
  signOut: () => Promise<void>;
}) {
  const [open, setOpen]           = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Kisan";
  const email    = user?.email ?? "";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div style={{ marginTop: "12px" }}>
      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => !collapsed && setOpen((v) => !v)}
        aria-label="User profile"
        aria-expanded={open}
        title={collapsed ? displayName : undefined}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: collapsed ? "10px 0" : "10px 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: "12px",
          background: open
            ? "rgba(74,222,128,0.09)"
            : "rgba(255,255,255,0.04)",
          border: open
            ? "1px solid rgba(74,222,128,0.22)"
            : "1px solid rgba(255,255,255,0.07)",
          cursor: "pointer",
          transition: "all 0.22s ease",
          fontFamily: "inherit",
        }}
      >
        {/* Avatar bubble */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 700,
            color: "#050816",
            flexShrink: 0,
            boxShadow: "0 0 10px rgba(74,222,128,0.25)",
          }}
        >
          {initials}
        </div>

        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "white",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: role === "admin" ? "#FBBF24" : "#4ADE80",
                  fontWeight: 500,
                  textTransform: "capitalize",
                  marginTop: "1px",
                }}
              >
                {role ?? "farmer"}
              </div>
            </div>

            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.22 }}
              style={{ flexShrink: 0 }}
            >
              <ChevronDown size={14} color="#64748B" />
            </motion.div>
          </>
        )}
      </button>

      {/* ── Inline accordion panel (no absolute positioning → no clipping) ─ */}
      <AnimatePresence initial={false}>
        {open && !collapsed && (
          <motion.div
            key="profile-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                marginTop: "6px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "8px",
              }}
            >
              {/* User info */}
              <div
                style={{
                  padding: "8px 10px 10px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "white",
                    marginBottom: "2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayName}
                </div>
                {email && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#475569",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {email}
                  </div>
                )}
              </div>

              {/* Profile & Settings */}
              {[
                { icon: User,     label: "My Profile", href: "/dashboard/profile" },
                { icon: Settings, label: "Settings",   href: "/dashboard/profile" },
              ].map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    color: "#94A3B8",
                    fontSize: "13px",
                    textDecoration: "none",
                    transition: "all 0.18s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(255,255,255,0.07)";
                    el.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.color = "#94A3B8";
                  }}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              ))}

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "rgba(255,255,255,0.06)",
                  margin: "6px 0",
                }}
              />

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "none",
                  color: "#F87171",
                  fontSize: "13px",
                  cursor: loggingOut ? "wait" : "pointer",
                  transition: "all 0.18s",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (!loggingOut)
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(248,113,113,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {loggingOut ? (
                  <Loader2
                    size={14}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                ) : (
                  <LogOut size={14} />
                )}
                {loggingOut ? "Signing out…" : "Sign Out"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Sidebar
───────────────────────────────────────────────────────────────────────────── */
export default function Sidebar() {
  const pathname  = usePathname();
  const { signOut, role, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width:    collapsed ? "72px"  : "260px",
        minWidth: collapsed ? "72px"  : "260px",
        minHeight: "100vh",
        background: "rgba(5,8,22,0.98)",
        backdropFilter: "blur(20px) saturate(180%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        padding: collapsed ? "20px 8px" : "20px 14px",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        flexShrink: 0,
        zIndex: 50,
        transition: "all 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* ── Logo + collapse toggle ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
          paddingLeft: collapsed ? "4px" : "6px",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <motion.div
            whileHover={{ rotate: 12 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              flexShrink: 0,
              background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 12px rgba(74,222,128,0.28)",
            }}
          >
            <Sprout size={17} color="#050816" />
          </motion.div>

          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                KisanSathi
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#4ADE80",
                  opacity: 0.6,
                  fontWeight: 500,
                }}
              >
                Smart Farming Assistant
              </div>
            </motion.div>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            title="Collapse"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "5px",
              cursor: "pointer",
              color: "#64748B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          title="Expand"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            padding: "6px",
            cursor: "pointer",
            color: "#64748B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
            width: "100%",
          }}
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* ── Nav items ───────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems.map(({ href, icon: Icon, label, color }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: collapsed ? "11px 0" : "10px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: "10px",
                textDecoration: "none",
                background: active ? `${color}15` : "transparent",
                border: active
                  ? `1px solid ${color}28`
                  : "1px solid transparent",
                transition: "all 0.2s ease",
                position: "relative",
              }}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-indicator"
                  style={{
                    position: "absolute",
                    left: collapsed ? "50%" : "-14px",
                    top: collapsed ? "auto" : "50%",
                    bottom: collapsed ? "-2px" : "auto",
                    transform: collapsed
                      ? "translateX(-50%)"
                      : "translateY(-50%)",
                    width: collapsed ? "20px" : "3px",
                    height: collapsed ? "3px" : "20px",
                    borderRadius: "2px",
                    background: color,
                    boxShadow: `0 0 8px ${color}88`,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
              <Icon size={18} color={active ? color : "#64748B"} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span
                  style={{
                    fontSize: "13px",
                    color: active ? color : "#94A3B8",
                    fontWeight: active ? 600 : 400,
                    whiteSpace: "nowrap",
                    transition: "color 0.2s",
                  }}
                >
                  {label}
                </span>
              )}
            </Link>
          );
        })}

        {role === "admin" && (
          <Link
            href="/admin"
            title={collapsed ? "Admin Panel" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: collapsed ? "11px 0" : "10px 12px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: "10px",
              textDecoration: "none",
              color: "#FBBF24",
              fontSize: "13px",
              fontWeight: 600,
              marginTop: "8px",
              border: "1px solid transparent",
            }}
          >
            <ShieldCheck size={18} color="#FBBF24" />
            {!collapsed && "Admin Panel"}
          </Link>
        )}
      </nav>

      {/* ── User profile (inline accordion, no overflow clipping) ─────── */}
      <UserProfile
        user={user}
        role={role}
        collapsed={collapsed}
        signOut={signOut}
      />

      {/* ── Standalone Logout button ─────────────────────────────────── */}
      <LogoutButton collapsed={collapsed} signOut={signOut} />
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Standalone always-visible Logout Button
───────────────────────────────────────────────────────────────────────────── */
function LogoutButton({
  collapsed,
  signOut,
}: {
  collapsed: boolean;
  signOut: () => Promise<void>;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <motion.button
      onClick={handleLogout}
      disabled={loggingOut}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      title={collapsed ? "Sign Out" : undefined}
      aria-label="Sign Out"
      style={{
        width: "100%",
        marginTop: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: "9px",
        padding: collapsed ? "11px 0" : "11px 14px",
        borderRadius: "12px",
        background: "rgba(248,113,113,0.07)",
        border: "1px solid rgba(248,113,113,0.18)",
        color: "#F87171",
        fontSize: "13px",
        fontWeight: 600,
        cursor: loggingOut ? "wait" : "pointer",
        fontFamily: "inherit",
        transition: "all 0.22s ease",
      }}
      onMouseEnter={(e) => {
        if (!loggingOut) {
          (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.14)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,0.35)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.07)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,0.18)";
      }}
    >
      {loggingOut ? (
        <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
      ) : (
        <LogOut size={16} style={{ flexShrink: 0 }} />
      )}
      {!collapsed && (
        <span>{loggingOut ? "Signing out…" : "Sign Out"}</span>
      )}
    </motion.button>
  );
}
