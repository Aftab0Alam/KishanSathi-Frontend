"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Camera, MessageCircle, Zap, Shield, Globe, Sparkles } from "lucide-react";

const floatingIcons = [
  { emoji: "🌾", x: "8%", y: "20%", delay: 0, size: 32 },
  { emoji: "🌱", x: "85%", y: "25%", delay: 1.2, size: 28 },
  { emoji: "🌿", x: "12%", y: "75%", delay: 2.4, size: 26 },
  { emoji: "🌻", x: "90%", y: "70%", delay: 0.8, size: 30 },
  { emoji: "🍅", x: "5%", y: "50%", delay: 1.6, size: 24 },
  { emoji: "🌽", x: "92%", y: "45%", delay: 2, size: 28 },
];

export default function Hero() {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "120px 24px 80px", position: "relative", overflow: "hidden", textAlign: "center",
    }}>
      {/* Glow orbs */}
      <div style={{
        position: "absolute", top: "15%", left: "5%", width: "500px", height: "500px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 65%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "5%", width: "450px", height: "450px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 65%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "60%", left: "40%", width: "300px", height: "300px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)",
        filter: "blur(50px)", pointerEvents: "none",
      }} />

      {/* Floating farm icons */}
      {floatingIcons.map(({ emoji, x, y, delay, size }, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ delay: delay + 0.5, duration: 0.8 }}
          style={{
            position: "absolute", left: x, top: y,
            fontSize: `${size}px`, pointerEvents: "none",
            filter: "blur(0.5px)",
          }}
        >
          <motion.span
            animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-block" }}
          >
            {emoji}
          </motion.span>
        </motion.div>
      ))}

      <div style={{ maxWidth: "900px", position: "relative", zIndex: 1 }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "7px 18px", borderRadius: "100px",
            background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)",
            color: "#4ADE80", fontSize: "13px", fontWeight: 600, marginBottom: "28px",
            backdropFilter: "blur(8px)",
          }}>
            <Sparkles size={14} style={{ color: "#FBBF24" }} />
            India&apos;s #1 AI Agriculture Platform
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 900, lineHeight: 1.05,
            marginBottom: "24px", fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "-0.03em",
          }}
        >
          <span className="gradient-text" style={{ position: "relative", display: "inline-block" }}>
            KisanSathi
            <motion.span
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute", top: "-20px", right: "-40px",
                fontSize: "28px", display: "inline-block",
              }}
            >
              ✨
            </motion.span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)", color: "#94A3B8",
            maxWidth: "700px", margin: "0 auto 44px", lineHeight: 1.75,
            letterSpacing: "-0.01em",
          }}
        >
          AI-powered crop intelligence, disease detection, fertilizer recommendations,
          weather forecasting, and smart farming automation for modern farmers.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "64px" }}
        >
          <Link href="/signup" style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                padding: "15px 34px", borderRadius: "14px",
                background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                color: "#050816", fontWeight: 700, fontSize: "16px",
                boxShadow: "0 8px 32px rgba(74,222,128,0.35), 0 2px 8px rgba(74,222,128,0.15)",
                cursor: "pointer",
              }}
            >
              🚀 Start Free <ArrowRight size={18} />
            </motion.div>
          </Link>
          <Link href="/dashboard/disease" style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ y: -3, borderColor: "rgba(74,222,128,0.4)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                padding: "15px 34px", borderRadius: "14px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "white", fontWeight: 600, fontSize: "16px", cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}
            >
              <Camera size={18} color="#4ADE80" /> Upload Plant Image
            </motion.div>
          </Link>
          <Link href="/dashboard/chat" style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ y: -3, borderColor: "rgba(34,211,238,0.4)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                padding: "15px 34px", borderRadius: "14px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "white", fontWeight: 600, fontSize: "16px", cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}
            >
              <MessageCircle size={18} color="#22D3EE" /> Talk to AI
            </motion.div>
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{
            display: "flex", gap: "28px", justifyContent: "center", flexWrap: "wrap",
          }}
        >
          {[
            { icon: <Shield size={14} />, text: "Secure & Private" },
            { icon: <Globe size={14} />, text: "Hindi • English • Punjabi" },
            { icon: <Zap size={14} />, text: "Groq AI Powered" },
          ].map(({ icon, text }) => (
            <span key={text} style={{
              display: "flex", alignItems: "center", gap: "7px",
              color: "#64748B", fontSize: "13px", fontWeight: 500,
            }}>
              <span style={{ color: "#4ADE80", display: "flex" }}>{icon}</span> {text}
            </span>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          style={{ position: "absolute", bottom: "-60px", left: "50%", transform: "translateX(-50%)" }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: "24px", height: "38px", borderRadius: "12px",
              border: "2px solid rgba(255,255,255,0.15)",
              display: "flex", justifyContent: "center", paddingTop: "8px",
            }}
          >
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: "3px", height: "8px", borderRadius: "2px",
                background: "linear-gradient(180deg, #4ADE80, transparent)",
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
