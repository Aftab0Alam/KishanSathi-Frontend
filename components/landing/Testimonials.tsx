"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Rajesh Kumar", role: "Wheat Farmer, Punjab", text: "KisanSathi detected my wheat rust disease in seconds! The treatment suggestion saved my entire 5-acre crop. Amazing technology.", emoji: "👨‍🌾", rating: 5, highlight: "saved my entire 5-acre crop" },
  { name: "Priya Devi", role: "Vegetable Farmer, UP", text: "The fertilizer recommendation was spot-on. My tomato yield increased by 40% this season after following the AI advice.", emoji: "👩‍🌾", rating: 5, highlight: "yield increased by 40%" },
  { name: "Sukhwinder Singh", role: "Rice Farmer, Haryana", text: "ਇਸ app ਨੇ ਮੇਰੀ ਖੇਤੀ ਬਦਲ ਦਿੱਤੀ। Weather alerts ਬਹੁਤ useful ਹਨ। Highly recommend!", emoji: "👨‍🌾", rating: 5, highlight: "ਖੇਤੀ ਬਦਲ ਦਿੱਤੀ" },
  { name: "Anita Patel", role: "Cotton Farmer, Gujarat", text: "The AI chatbot answers in Hindi and explains everything clearly. Even my father who can't read English uses it daily!", emoji: "👩‍🌾", rating: 5, highlight: "uses it daily" },
  { name: "Mohan Reddy", role: "Mango Farmer, Andhra", text: "Crop yield prediction was accurate within 8%. This AI platform has changed how I plan my farming season completely.", emoji: "👨‍🌾", rating: 5, highlight: "accurate within 8%" },
  { name: "Kavita Sharma", role: "Agri-Business Owner, MP", text: "We use KisanSathi for all our 200+ farmer clients. The disease detection saves enormous time and crop losses.", emoji: "👩‍💼", rating: 5, highlight: "200+ farmer clients" },
];

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} style={{ padding: "100px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "64px" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          style={{
            fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800,
            color: "white", letterSpacing: "-0.02em",
          }}
        >
          Farmers Love <span className="gradient-text">KisanSathi</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1 }}
          style={{ color: "#94A3B8", marginTop: "14px", fontSize: "16px" }}
        >
          Real stories from real Indian farmers
        </motion.p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {testimonials.map(({ name, role, text, emoji, rating, highlight }, i) => (
          <motion.div key={name}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "22px", padding: "28px",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              position: "relative",
            }}
          >
            <Quote size={18} color="#4ADE80" style={{ opacity: 0.3, marginBottom: "12px" }} />

            {/* Stars */}
            <div style={{ display: "flex", gap: "3px", marginBottom: "14px" }}>
              {Array.from({ length: rating }).map((_, j) => (
                <Star key={j} size={14} fill="#FBBF24" color="#FBBF24" />
              ))}
            </div>

            <p style={{ color: "#CBD5E1", fontSize: "14px", lineHeight: 1.75, marginBottom: "22px", fontStyle: "italic" }}>
              &ldquo;{text}&rdquo;
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "46px", height: "46px", borderRadius: "50%",
                background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", boxShadow: "0 2px 12px rgba(74,222,128,0.2)",
              }}>
                {emoji}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "white", fontSize: "14px" }}>{name}</div>
                <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>{role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
