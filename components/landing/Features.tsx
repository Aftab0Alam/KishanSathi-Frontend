"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Camera, FlaskConical, Cloud, MessageCircle, Leaf, BarChart3, Bell, FileText, Settings, ArrowRight } from "lucide-react";

const features = [
  { icon: Camera, title: "AI Disease Detection", desc: "Upload any plant photo. Get instant AI diagnosis, severity level, treatment, and medicine recommendations.", color: "#F87171", emoji: "🔬" },
  { icon: FlaskConical, title: "Fertilizer AI", desc: "Smart NPK recommendations based on your soil type, crop, season, and weather conditions.", color: "#FBBF24", emoji: "🧪" },
  { icon: Cloud, title: "Weather Intelligence", desc: "OpenWeather integration with AI-generated farming alerts for rain, drought, and spraying windows.", color: "#22D3EE", emoji: "🌤️" },
  { icon: MessageCircle, title: "AI Farming Chatbot", desc: "ChatGPT-style AI assistant powered by Groq LLaMA 3. Ask anything in Hindi, Punjabi, or English.", color: "#4ADE80", emoji: "💬" },
  { icon: Leaf, title: "Crop Recommendation", desc: "Get best crop suggestions based on soil type, rainfall, temperature, season, and farm location.", color: "#8B5CF6", emoji: "🌱" },
  { icon: BarChart3, title: "Yield Prediction", desc: "Predict expected crop yield, profit, cost analysis, and risk factors with AI-powered analytics.", color: "#F59E0B", emoji: "📊" },
  { icon: Bell, title: "Smart Alerts", desc: "Push notifications for rain alerts, fertilizer reminders, disease risk warnings, and irrigation schedules.", color: "#EC4899", emoji: "🔔" },
  { icon: FileText, title: "Reports & PDF", desc: "Generate downloadable PDF reports for disease, fertilizer, yield, and weather — all shareable.", color: "#6EE7B7", emoji: "📄" },
  { icon: Settings, title: "Farm Automation", desc: "Automated smart workflows: scheduled reminders, disease alerts, and crop care notifications.", color: "#A78BFA", emoji: "⚙️" },
];

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} style={{ padding: "100px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "64px" }}>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          style={{
            display: "inline-block", padding: "7px 18px", borderRadius: "100px",
            background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)",
            color: "#4ADE80", fontSize: "12px", fontWeight: 600, marginBottom: "20px",
            letterSpacing: "0.05em",
          }}
        >
          PLATFORM FEATURES
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800,
            color: "white", marginBottom: "16px", letterSpacing: "-0.02em",
          }}
        >
          Everything a Farmer Needs
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          style={{ color: "#94A3B8", fontSize: "18px", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}
        >
          9 AI-powered tools built specifically for Indian farmers, agribusinesses, and agricultural experts.
        </motion.p>
      </div>

      <div className="features-grid">
        {features.map(({ icon: Icon, title, desc, color, emoji }, i) => (
          <motion.div key={title}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, scale: 1.01 }}
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "22px", padding: "30px",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Corner gradient accent */}
            <div style={{
              position: "absolute", top: 0, right: 0, width: "100px", height: "100px",
              background: `radial-gradient(circle at top right, ${color}0A, transparent)`,
              pointerEvents: "none",
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "14px",
                background: `${color}12`, border: `1px solid ${color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <Icon size={24} color={color} />
                <span style={{
                  position: "absolute", top: "-6px", right: "-6px", fontSize: "14px",
                }}>{emoji}</span>
              </div>
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "white", marginBottom: "8px", letterSpacing: "-0.01em" }}>{title}</h3>
            <p style={{ fontSize: "14px", color: "#94A3B8", lineHeight: 1.65 }}>{desc}</p>

            <div style={{
              marginTop: "18px", display: "flex", alignItems: "center", gap: "6px",
              color, fontSize: "13px", fontWeight: 600, opacity: 0.8,
            }}>
              Learn more <ArrowRight size={14} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
