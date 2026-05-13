"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  { q: "Is KisanSathi free to use?", a: "Yes! The basic plan is completely free for farmers. Sign up and start using AI disease detection, chatbot, and weather features immediately. No credit card required.", icon: "💰" },
  { q: "Which languages are supported?", a: "KisanSathi supports Hindi (हिंदी), English, and Punjabi (ਪੰਜਾਬੀ). The AI chatbot responds in your preferred language automatically.", icon: "🌐" },
  { q: "How accurate is the disease detection?", a: "Our AI achieves 95%+ accuracy on common Indian crop diseases like blast, blight, rust, and mosaic. We continuously train our models with new data. Always verify severe cases with a local expert.", icon: "🎯" },
  { q: "Does it work offline?", a: "The app is PWA-enabled and caches key resources for offline access. AI features require internet, but cached data and previous reports remain accessible.", icon: "📱" },
  { q: "Can I install it on my phone?", a: "Yes! Open the website in your browser and tap 'Add to Home Screen' for a native app-like experience. Android APK support is coming soon.", icon: "📲" },
  { q: "Is my farm data secure?", a: "Absolutely. All data is encrypted and stored securely in Supabase with Row Level Security. We never sell or share your farming data with third parties.", icon: "🔒" },
  { q: "Which crops are supported?", a: "All major Indian crops: wheat, rice, cotton, sugarcane, tomato, potato, onion, maize, soybean, mustard, and 200+ more varieties.", icon: "🌾" },
  { q: "How does fertilizer recommendation work?", a: "You input your crop, soil type, season, and location. Our Groq AI analyzes this and provides NPK ratios, quantities, timing, and organic alternatives.", icon: "🧪" },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section style={{ padding: "100px 24px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "64px" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "7px 18px", borderRadius: "100px", marginBottom: "20px",
            background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
            color: "#A78BFA", fontSize: "12px", fontWeight: 600,
          }}
        >
          <HelpCircle size={14} /> FREQUENTLY ASKED
        </motion.div>
        <h2 style={{
          fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800,
          color: "white", letterSpacing: "-0.02em",
        }}>
          Questions & <span className="gradient-text">Answers</span>
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {faqs.map(({ q, a, icon }, i) => {
          const isOpen = open === i;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              style={{
                background: isOpen ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isOpen ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "16px", overflow: "hidden",
                transition: "all 0.3s ease",
              }}
            >
              <button onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "20px 24px", background: "transparent", border: "none",
                  cursor: "pointer", color: "white", textAlign: "left",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "18px" }}>{icon}</span>
                  <span style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em" }}>{q}</span>
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ flexShrink: 0, marginLeft: "16px" }}
                >
                  <ChevronDown size={18} color={isOpen ? "#4ADE80" : "#64748B"} />
                </motion.div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <p style={{
                      padding: "0 24px 22px 56px", color: "#94A3B8",
                      fontSize: "14px", lineHeight: 1.75,
                    }}>
                      {a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
