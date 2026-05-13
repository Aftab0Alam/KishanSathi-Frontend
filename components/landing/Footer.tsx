"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sprout, Globe, ExternalLink, Mail, Heart } from "lucide-react";

const footerLinks = {
  Features: [
    { label: "Disease Detection", href: "/dashboard/disease" },
    { label: "Fertilizer AI", href: "/dashboard/fertilizer" },
    { label: "Weather", href: "/dashboard/weather" },
    { label: "AI Chatbot", href: "/dashboard/chat" },
    { label: "Crop Advice", href: "/dashboard/crops" },
    { label: "Yield Prediction", href: "/dashboard/yield" },
  ],
  Platform: [
    { label: "Login", href: "/login" },
    { label: "Sign Up", href: "/signup" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Reports", href: "/dashboard/reports" },
  ],
};

const languages = ["हिंदी (Hindi)", "English", "ਪੰਜਾਬੀ (Punjabi)"];

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "80px 24px 40px",
      background: "rgba(5,8,22,0.5)",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "48px", marginBottom: "56px",
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sprout size={16} color="#050816" />
              </div>
              <span style={{
                fontSize: "20px", fontWeight: 800,
                background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                KisanSathi
              </span>
            </div>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: 1.7, maxWidth: "280px" }}>
              Smart AI Assistant for Modern Farming. Empowering 50,000+ Indian farmers with
              cutting-edge AI technology.
            </p>

            {/* Social links */}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              {[
                { icon: <ExternalLink size={16} />, href: "#" },
                { icon: <Globe size={16} />, href: "#" },
                { icon: <Mail size={16} />, href: "#" },
              ].map(({ icon, href }, i) => (
                <a key={i} href={href} style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#64748B", textDecoration: "none",
                  transition: "all 0.2s",
                }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Feature links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{
                color: "white", fontWeight: 700, marginBottom: "18px",
                fontSize: "14px", letterSpacing: "0.02em",
              }}>
                {title}
              </h4>
              {links.map(({ label, href }) => (
                <div key={label}>
                  <Link href={href} style={{
                    color: "#64748B", fontSize: "13px", textDecoration: "none",
                    display: "block", marginBottom: "10px",
                    transition: "color 0.2s",
                  }}>
                    {label}
                  </Link>
                </div>
              ))}
            </div>
          ))}

          {/* Languages */}
          <div>
            <h4 style={{
              color: "white", fontWeight: 700, marginBottom: "18px",
              fontSize: "14px", letterSpacing: "0.02em",
            }}>
              Languages
            </h4>
            {languages.map(f => (
              <div key={f} style={{
                color: "#64748B", fontSize: "13px", marginBottom: "10px",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#4ADE80", display: "inline-block",
                }} />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "12px",
        }}>
          <p style={{ color: "#475569", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
            © 2026 KisanSathi. Built with <Heart size={12} fill="#F87171" color="#F87171" /> for Indian Farmers 🇮🇳
          </p>
          <p style={{ color: "#475569", fontSize: "13px" }}>
            Powered by Groq AI • Supabase • OpenWeather
          </p>
        </div>
      </div>
    </footer>
  );
}
