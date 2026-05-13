"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "50,000+", label: "Farmers Helped", emoji: "👨‍🌾", color: "#4ADE80" },
  { value: "95%", label: "Disease Accuracy", emoji: "🎯", color: "#F87171" },
  { value: "3 Languages", label: "Hindi, English, Punjabi", emoji: "🌐", color: "#22D3EE" },
  { value: "9 AI Tools", label: "Farming Features", emoji: "🤖", color: "#8B5CF6" },
  { value: "28 States", label: "Pan India Coverage", emoji: "🇮🇳", color: "#FBBF24" },
  { value: "24/7", label: "AI Support", emoji: "⚡", color: "#EC4899" },
];

export default function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} style={{
      padding: "100px 24px",
      background: "rgba(255,255,255,0.015)",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      position: "relative",
    }}>
      {/* Subtle background glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "600px", height: "300px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(74,222,128,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            textAlign: "center",
            fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800,
            color: "white", marginBottom: "64px", letterSpacing: "-0.02em",
          }}
        >
          Trusted by <span className="gradient-text">Modern Farmers</span>
        </motion.h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "16px",
        }}>
          {stats.map(({ value, label, emoji, color }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, borderColor: `${color}40` }}
              style={{
                textAlign: "center", padding: "32px 20px",
                background: "rgba(255,255,255,0.04)", borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.07)",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0, right: 0, width: "60px", height: "60px",
                background: `radial-gradient(circle at top right, ${color}08, transparent)`,
                pointerEvents: "none",
              }} />
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>{emoji}</div>
              <div style={{
                fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, letterSpacing: "-0.02em",
                background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {value}
              </div>
              <div style={{ fontSize: "13px", color: "#94A3B8", marginTop: "8px", fontWeight: 500 }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
