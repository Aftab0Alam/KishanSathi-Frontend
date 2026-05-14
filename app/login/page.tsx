"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Leaf, AlertCircle, Info, ArrowRight } from "lucide-react";
import ParticleBackground from "@/components/common/ParticleBackground";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.8 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2 14-5.3l-6.5-5.5C29.6 35 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.1v5.7C9.4 39.7 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5C37.5 36.1 44 30.7 44 24c0-1.3-.1-2.7-.4-3.9z"/>
    </svg>
  );
}

export default function LoginPage() {
  const [mounted, setMounted]   = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]       = useState("");
  const [googleError, setGoogleError] = useState(false);

  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  // Prevent SSR/client hydration mismatch
  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {
    const {data, error } = await signIn(email, password);

    if (error) {
      setError(
        error.toLowerCase().includes("invalid")
          ? "Invalid email or password. Please try again."
          : error
      );

      setLoading(false);
      return;
    }

    // SAVE TOKEN
    if (data?.session?.access_token) {
      localStorage.setItem(
        "kisansathi_token",
        data.session.access_token
      );
    }

    router.push("/dashboard");

  } catch (err) {
    setError("Login failed");
    setLoading(false);
  }
};




  const handleGoogle = async () => {
    setGoogleLoading(true);
    setGoogleError(false);
    setError("");
    const { error } = await signInWithGoogle();
    if (error) {
      if (
        error.toLowerCase().includes("provider") ||
        error.toLowerCase().includes("not enabled") ||
        error.toLowerCase().includes("validation_failed") ||
        error.toLowerCase().includes("400")
      ) {
        setGoogleError(true);
      } else {
        setError(error);
      }
      setGoogleLoading(false);
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
        <p style={{ color: "#64748B", marginTop: "8px", fontSize: "14px" }}>Welcome back, Kisan 🌾</p>
      </div>

      <div className="glass-card" style={{ padding: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "white", marginBottom: "6px", letterSpacing: "-0.02em" }}>Sign In</h1>
        <p style={{ color: "#64748B", fontSize: "13px", marginBottom: "24px" }}>Access your AI farming dashboard</p>

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

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email */}
          <div>
            <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px", letterSpacing: "0.04em" }}>EMAIL ADDRESS</label>
            <div style={{ position: "relative" }}>
              <Mail size={15} color="#64748B" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="farmer@example.com" className="input-field" style={{ paddingLeft: "40px" }} />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em" }}>PASSWORD</label>
              <Link href="/forgot-password" style={{ fontSize: "12px", color: "#4ADE80", textDecoration: "none" }}>Forgot password?</Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={15} color="#64748B" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" className="input-field" style={{ paddingLeft: "40px", paddingRight: "44px" }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "2px" }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", fontSize: "15px", padding: "14px", marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.75 : 1 }}>
            {loading ? "Signing in…" : <><span>Sign In</span><ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          <span style={{ color: "#475569", fontSize: "12px" }}>or continue with</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Google */}
        <button onClick={handleGoogle} disabled={googleLoading} style={{ width: "100%", padding: "13px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "14px", fontWeight: 600, cursor: googleLoading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.22s ease", fontFamily: "inherit", opacity: googleLoading ? 0.7 : 1 }}>
          <GoogleIcon />
          {googleLoading ? "Connecting to Google…" : "Continue with Google"}
        </button>

        {/* Google not configured notice */}
        <AnimatePresence>
          {googleError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: "12px" }}>
              <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.22)", fontSize: "13px", lineHeight: 1.65 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FBBF24", fontWeight: 700, marginBottom: "8px" }}>
                  <Info size={15} /> Google Sign-In Not Configured Yet
                </div>
                <p style={{ color: "#94A3B8", margin: "0 0 10px" }}>Enable Google OAuth in your Supabase project:</p>
                <ol style={{ color: "#94A3B8", paddingLeft: "18px", margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <li>Go to <strong style={{ color: "#FBBF24" }}>supabase.com/dashboard</strong></li>
                  <li>Navigate to <strong style={{ color: "white" }}>Authentication → Providers → Google</strong></li>
                  <li>Toggle <strong style={{ color: "white" }}>Enable Google provider</strong> ON</li>
                  <li>Paste your <strong style={{ color: "white" }}>Client ID &amp; Secret</strong> from Google Cloud Console</li>
                </ol>
                <p style={{ color: "#64748B", marginTop: "10px", marginBottom: 0, fontSize: "12px" }}>
                  Until then, use <strong style={{ color: "#4ADE80" }}>Email + Password</strong> login above.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p style={{ textAlign: "center", color: "#64748B", fontSize: "13px", marginTop: "24px" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#4ADE80", textDecoration: "none", fontWeight: 600 }}>Sign up free</Link>
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
