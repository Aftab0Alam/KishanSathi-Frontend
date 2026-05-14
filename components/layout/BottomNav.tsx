"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Camera, Cloud, MessageCircle, MoreHorizontal,
  FlaskConical, Layers, BarChart3, Bell, FileText,
  Leaf, User, X, LogOut, Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/* Primary 5 always visible */
const PRIMARY = [
  { href: "/dashboard",         icon: Home,          label: "Home",    color: "#4ADE80" },
  { href: "/dashboard/disease", icon: Camera,        label: "Disease", color: "#F87171" },
  { href: "/dashboard/weather", icon: Cloud,         label: "Weather", color: "#22D3EE" },
  { href: "/dashboard/chat",    icon: MessageCircle, label: "AI Chat", color: "#4ADE80" },
];

/* All extra items shown in "More" drawer */
const MORE_ITEMS = [
  { href: "/dashboard/soil",          icon: Layers,      label: "Soil Intelligence", color: "#10B981" },
  { href: "/dashboard/fertilizer",    icon: FlaskConical,label: "Fertilizer",        color: "#FBBF24" },
  { href: "/dashboard/crops",         icon: Leaf,        label: "Crop Advice",       color: "#8B5CF6" },
  { href: "/dashboard/yield",         icon: BarChart3,   label: "Yield Prediction",  color: "#F59E0B" },
  { href: "/dashboard/reports",       icon: FileText,    label: "Reports",           color: "#6EE7B7" },
  { href: "/dashboard/notifications", icon: Bell,        label: "Notifications",     color: "#EC4899" },
  { href: "/dashboard/profile",       icon: User,        label: "My Profile",        color: "#A78BFA" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { signOut } = useAuth();
  const [showMore, setShowMore]     = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isMoreActive = MORE_ITEMS.some(i => pathname.startsWith(i.href));

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setShowMore(false);
    try {
      await signOut();
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* More drawer backdrop */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowMore(false)}
            style={{ position: "fixed", inset: 0, zIndex: 98, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          />
        )}
      </AnimatePresence>

      {/* More drawer */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", bottom: "68px", left: 0, right: 0, zIndex: 99,
              background: "rgba(5,8,22,0.98)", backdropFilter: "blur(24px)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px 20px 0 0",
              padding: "20px 16px 12px",
            }}
          >
            {/* Handle bar */}
            <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.15)", margin: "0 auto 20px" }} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {MORE_ITEMS.map(({ href, icon: Icon, label, color }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link key={href} href={href} onClick={() => setShowMore(false)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                      padding: "14px 8px", borderRadius: "14px", textDecoration: "none",
                      background: active ? `${color}15` : "rgba(255,255,255,0.04)",
                      border: active ? `1px solid ${color}25` : "1px solid rgba(255,255,255,0.06)",
                      transition: "all 0.2s",
                    }}>
                    <Icon size={22} color={active ? color : "#94A3B8"} />
                    <span style={{ fontSize: "10px", color: active ? color : "#64748B", fontWeight: active ? 700 : 400, textAlign: "center", lineHeight: 1.3 }}>
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                display: "flex",  alignItems: "center", gap: "6px",
                padding: "14px 8px", borderRadius: "14px", cursor: loggingOut ? "wait" : "pointer",
                background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.18)",
                color: "#F87171", fontFamily: "inherit", width: "100%",
                gridColumn: "span 4",
                flexDirection: "row", justifyContent: "center",
                fontSize: "13px", fontWeight: 600,
                marginTop: "6px",
                transition: "all 0.2s",
              }}
            >
              {loggingOut
                ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite", marginRight: "8px" }} />
                : <LogOut size={16} style={{ marginRight: "8px" }} />
              }
              {loggingOut ? "Signing out…" : "Sign Out"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <nav
        className="mobile-bottom-nav"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(5,8,22,0.97)", backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex", justifyContent: "space-around", alignItems: "center",
          height: "68px", padding: "0 4px",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.35)",
        }}
      >
        {PRIMARY.map(({ href, icon: Icon, label, color }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                textDecoration: "none", padding: "8px 12px", borderRadius: "14px",
                background: active ? `${color}15` : "transparent",
                transition: "all 0.22s", position: "relative", minWidth: "56px",
              }}>
              {active && (
                <motion.div layoutId="bnav-indicator"
                  style={{ position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)", width: "22px", height: "3px", borderRadius: "2px", background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <Icon size={21} color={active ? color : "#64748B"} />
              <span style={{ fontSize: "10px", color: active ? color : "#64748B", fontWeight: active ? 700 : 400 }}>{label}</span>
            </Link>
          );
        })}

        {/* More button */}
        <button onClick={() => setShowMore(v => !v)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
            padding: "8px 12px", borderRadius: "14px", border: "none", cursor: "pointer",
            background: isMoreActive || showMore ? "rgba(167,139,250,0.12)" : "transparent",
            minWidth: "56px", fontFamily: "inherit",
          }}>
          {showMore
            ? <X size={21} color="#A78BFA" />
            : <MoreHorizontal size={21} color={isMoreActive ? "#A78BFA" : "#64748B"} />}
          <span style={{ fontSize: "10px", color: isMoreActive || showMore ? "#A78BFA" : "#64748B", fontWeight: isMoreActive || showMore ? 700 : 400 }}>
            More
          </span>
        </button>
      </nav>
    </>
  );
}
