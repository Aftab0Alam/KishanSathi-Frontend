"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Mail, Leaf, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import ParticleBackground from "@/components/common/ParticleBackground";

export default function ForgotPasswordPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const { resetPassword } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await resetPassword(email);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  const cardContent = (
    <div style={{ width: "100%", maxWidth: "460px" }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#4ADE80,#22D3EE)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 14px rgba(74,222,128,0.35)" }}>
            <Leaf size={19} color="#050816" />
          </div>
          <span style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em", background: "linear-gradient(135deg,#4ADE80,#22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            KisanSathi
          </span>
        </Link>
        <p style={{ color: "#64748B", marginTop: "8px", fontSize: "14px" }}>Password Recovery 🔐</p>
      </div>

      <div className="glass-card" style={{ padding: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "white", marginBottom: "6px", letterSpacing: "-0.02em" }}>
          {sent ? "Email Sent!" : "Forgot Password?"}
        </h1>
        <p style={{ color: "#64748B", fontSize: "13px", marginBottom: "24px" }}>
          {sent
            ? "Check your inbox for the password reset link."
            : "Enter your email and we'll send you a reset link."}
        </p>

        {/* Success state */}
        <AnimatePresence>
          {sent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ padding: "20px 16px", borderRadius: "12px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", color: "#4ADE80", fontSize: "14px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}
            >
              <CheckCircle size={36} />
              <div>
                <p style={{ margin: 0, fontWeight: 700 }}>Reset link sent to:</p>
                <p style={{ margin: "4px 0 0", color: "#94A3B8", wordBreak: "break-all" }}>{email}</p>
              </div>
              <p style={{ margin: 0, color: "#64748B", fontSize: "12px" }}>
                Didn't receive it? Check your spam folder or{" "}
                <button
                  onClick={() => { setSent(false); }}
                  style={{ background: "none", border: "none", color: "#4ADE80", cursor: "pointer", fontSize: "12px", padding: 0, textDecoration: "underline" }}
                >
                  try again
                </button>.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        {!sent && (
          <>
            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderRadius: "12px", marginBottom: "16px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#F87171", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px", letterSpacing: "0.04em" }}>EMAIL ADDRESS</label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} color="#64748B" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="farmer@example.com"
                    className="input-field"
                    style={{ paddingLeft: "40px" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: "100%", fontSize: "15px", padding: "14px", marginTop: "4px", opacity: loading ? 0.75 : 1 }}
              >
                {loading ? "Sending reset link…" : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: "center", color: "#64748B", fontSize: "13px", marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <ArrowLeft size={13} />
          <Link href="/login" style={{ color: "#4ADE80", textDecoration: "none", fontWeight: 600 }}>Back to Sign In</Link>
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative" }}>
      <ParticleBackground />
      <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center" }}>
        {mounted ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            {cardContent}
          </motion.div>
        ) : (
          cardContent
        )}
      </div>
    </div>
  );
}
