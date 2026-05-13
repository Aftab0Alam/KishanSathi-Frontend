"use client";
import ParticleBackground from "@/components/common/ParticleBackground";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <main style={{ position: "relative", minHeight: "100vh" }}>
      <ParticleBackground />
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Testimonials />

      {/* CTA Banner */}
      <section style={{ padding: "100px 24px", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: "720px", margin: "0 auto", padding: "64px 44px",
            borderRadius: "28px",
            background: "linear-gradient(135deg, rgba(74,222,128,0.08), rgba(34,211,238,0.05))",
            border: "1px solid rgba(74,222,128,0.15)",
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Background decoration */}
          <div style={{
            position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px",
            borderRadius: "50%", background: "radial-gradient(circle, rgba(74,222,128,0.08), transparent)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-40px", left: "-40px", width: "180px", height: "180px",
            borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.06), transparent)",
            pointerEvents: "none",
          }} />

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            style={{
              width: "56px", height: "56px", borderRadius: "16px", margin: "0 auto 24px",
              background: "linear-gradient(135deg, rgba(74,222,128,0.2), rgba(34,211,238,0.15))",
              border: "1px solid rgba(74,222,128,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Sparkles size={24} color="#4ADE80" />
          </motion.div>

          <h2 style={{
            fontSize: "clamp(28px,4vw,44px)", fontWeight: 800,
            color: "white", marginBottom: "16px", letterSpacing: "-0.02em",
            position: "relative",
          }}>
            Ready to Transform Your Farm? 🌾
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "16px", marginBottom: "36px", lineHeight: 1.6 }}>
            Join 50,000+ Indian farmers using AI to grow smarter. Free forever.
          </p>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  padding: "15px 36px", borderRadius: "14px",
                  background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                  color: "#050816", fontWeight: 700, fontSize: "16px",
                  boxShadow: "0 8px 32px rgba(74,222,128,0.3)",
                  cursor: "pointer",
                }}
              >
                🚀 Get Started Free <ArrowRight size={18} />
              </motion.div>
            </Link>
            <Link href="/dashboard/chat" style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ y: -3, borderColor: "rgba(255,255,255,0.25)" }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  padding: "15px 36px", borderRadius: "14px",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                  color: "white", fontWeight: 600, fontSize: "16px",
                  backdropFilter: "blur(8px)", cursor: "pointer",
                }}
              >
                💬 Try AI Chat
              </motion.div>
            </Link>
          </div>

          {/* Social proof */}
          <div style={{
            marginTop: "32px", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "10px",
          }}>
            <div style={{ display: "flex" }}>
              {["👨‍🌾", "👩‍🌾", "👨‍🌾", "👩‍💼"].map((e, i) => (
                <div key={i} style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", marginLeft: i > 0 ? "-8px" : "0",
                  border: "2px solid #050816",
                }}>
                  {e}
                </div>
              ))}
            </div>
            <span style={{ color: "#64748B", fontSize: "13px" }}>
              <span style={{ color: "#4ADE80", fontWeight: 700 }}>50,000+</span> farmers already joined
            </span>
          </div>
        </motion.div>
      </section>

      <FAQ />
      <Footer />
    </main>
  );
}
