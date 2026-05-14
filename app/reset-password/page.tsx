"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, Leaf, AlertCircle, CheckCircle } from "lucide-react";
import ParticleBackground from "@/components/common/ParticleBackground";

export default function ResetPasswordPage() {
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => router.push("/login"), 3000);
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
        <p style={{ color: "#64748B", marginTop: "8px", fontSize: "14px" }}>Set a New Password 🔑</p>
      </div>

      <div className="glass-card" style={{ padding: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "white", marginBottom: "6px", letterSpacing: "-0.02em" }}>
          {success ? "Password Updated!" : "Create New Password"}
        </h1>
        <p style={{ color: "#64748B", fontSize: "13px", marginBottom: "24px" }}>
          {success
            ? "Redirecting you to the login page…"
            : "Choose a strong password for your account."}
        </p>

        {/* Success state */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ padding: "24px 16px", borderRadius: "12px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", color: "#4ADE80", fontSize: "14px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}
            >
              <CheckCircle size={40} />
              <div>
                <p style={{ margin: 0, fontWeight: 700 }}>Password changed successfully!</p>
                <p style={{ margin: "6px 0 0", color: "#64748B", fontSize: "13px" }}>Redirecting to login in 3 seconds…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        {!success && (
          <>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderRadius: "12px", marginBottom: "16px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#F87171", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* New Password */}
              <div>
                <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px", letterSpacing: "0.04em" }}>NEW PASSWORD</label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} color="#64748B" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    className="input-field"
                    style={{ paddingLeft: "40px", paddingRight: "44px" }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "2px" }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px", letterSpacing: "0.04em" }}>CONFIRM PASSWORD</label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} color="#64748B" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter your password"
                    className="input-field"
                    style={{ paddingLeft: "40px", paddingRight: "44px" }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "2px" }}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: "100%", fontSize: "15px", padding: "14px", marginTop: "4px", opacity: loading ? 0.75 : 1 }}
              >
                {loading ? "Updating password…" : "Update Password"}
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: "center", color: "#64748B", fontSize: "13px", marginTop: "24px" }}>
          <Link href="/login" style={{ color: "#4ADE80", textDecoration: "none", fontWeight: 600 }}>← Back to Sign In</Link>
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
