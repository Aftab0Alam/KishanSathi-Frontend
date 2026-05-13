"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Menu, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function Navbar() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? "rgba(5,8,22,0.92)" : "rgba(5,8,22,0.6)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
          padding: "0 24px", height: "64px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <motion.div
            whileHover={{ rotate: 15, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 12px rgba(74,222,128,0.3)",
            }}
          >
            <Leaf size={17} color="#050816" />
          </motion.div>
          <span style={{
            fontSize: "19px", fontWeight: 800, letterSpacing: "-0.02em",
            background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            KisanSathi
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }} className="desktop-only">
          <Link href="/login" style={{
            color: "#CBD5E1", textDecoration: "none", fontSize: "14px", fontWeight: 500,
            padding: "8px 18px", borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
            transition: "all 0.25s ease",
          }}>
            {t("login")}
          </Link>
          <Link href="/signup" style={{
            background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
            color: "#050816", textDecoration: "none", fontSize: "14px", fontWeight: 700,
            padding: "8px 22px", borderRadius: "10px",
            boxShadow: "0 2px 12px rgba(74,222,128,0.25)",
            transition: "all 0.25s ease",
          }}>
            {t("start_free")}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-only"
          aria-label="Toggle menu"
          style={{
            display: "none", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
            padding: "8px", cursor: "pointer", color: "white",
          }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mobile-only"
            style={{
              position: "fixed", top: "64px", left: 0, right: 0, zIndex: 99,
              background: "rgba(5,8,22,0.97)", backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              padding: "20px 24px", display: "none",
              flexDirection: "column", gap: "12px",
            }}
          >
            <Link href="/login" onClick={() => setMobileOpen(false)}
              style={{ color: "#CBD5E1", textDecoration: "none", fontSize: "15px", fontWeight: 500, padding: "12px 0" }}>
              {t("login")}
            </Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)}
              style={{
                background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                color: "#050816", textDecoration: "none", fontSize: "15px", fontWeight: 700,
                padding: "12px 20px", borderRadius: "12px", textAlign: "center",
              }}>
              {t("start_free")}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </>
  );
}
