"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Tractor, Calendar,
  Edit3, Save, X, Microscope, FlaskConical,
  MessageCircle, Cloud, BarChart3, CheckCircle,
  AlertCircle, Clock, Leaf, ShieldCheck, RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { api, diseaseAPI, fertilizerAPI } from "@/services/api";

/* ─── Types ─── */
interface Profile {
  name: string;
  phone: string;
  email: string;
  location: string;
  farmSize: string;
  primaryCrop: string;
  joinedAt: string;
  role: string;
  avatarInitials: string;
}

interface HistoryItem {
  id: string;
  type: "disease" | "fertilizer" | "chat" | "weather";
  title: string;
  subtitle: string;
  status?: "success" | "warning" | "info";
  date: string;
}

/* ─── Helpers ─── */
const typeConfig = {
  disease:    { icon: Microscope,   color: "#F87171", label: "Disease Scan",   bg: "rgba(248,113,113,0.1)"  },
  fertilizer: { icon: FlaskConical, color: "#FBBF24", label: "Fertilizer",     bg: "rgba(251,191,36,0.1)"   },
  chat:       { icon: MessageCircle,color: "#4ADE80", label: "AI Chat",        bg: "rgba(74,222,128,0.1)"   },
  weather:    { icon: Cloud,        color: "#22D3EE", label: "Weather Alert",  bg: "rgba(34,211,238,0.1)"   },
};

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px", padding: "20px", textAlign: "center",
      transition: "all 0.25s ease",
    }}>
      <div style={{
        width: "40px", height: "40px", borderRadius: "12px", margin: "0 auto 12px",
        background: `${color}15`, border: `1px solid ${color}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: "26px", fontWeight: 800, color, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function InputField({ label, value, editing, onChange, icon: Icon, type = "text", placeholder }:
  { label: string; value: string; editing: boolean; onChange: (v: string) => void; icon: any; type?: string; placeholder?: string }) {
  return (
    <div>
      <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748B", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
        {label.toUpperCase()}
      </label>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        background: editing ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: editing ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px", padding: "12px 14px",
        transition: "all 0.2s ease",
        boxShadow: editing ? "0 0 0 3px rgba(74,222,128,0.06)" : "none",
      }}>
        <Icon size={16} color={editing ? "#4ADE80" : "#64748B"} style={{ flexShrink: 0 }} />
        {editing ? (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "white", fontSize: "14px", fontFamily: "inherit",
            }}
          />
        ) : (
          <span style={{ fontSize: "14px", color: value ? "white" : "#475569", fontWeight: value ? 500 : 400 }}>
            {value || `Add ${label.toLowerCase()}`}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function ProfilePage() {
  const { user, role, loading: authLoading } = useAuth();

  const [profile, setProfile]   = useState<Profile>({
    name: "", phone: "", email: "", location: "",
    farmSize: "", primaryCrop: "", joinedAt: "", role: "", avatarInitials: "KI",
  });
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState<string | null>(null);
  const [history, setHistory]     = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError]     = useState<string | null>(null);
  const [statsLoading, setStatsLoading]     = useState(true);
  const [stats, setStats]           = useState({ disease: 0, fertilizer: 0, chats: 0 });
  const [activeTab, setActiveTab]   = useState<"profile" | "history" | "stats">("profile");

  /* Load profile from Supabase + history from APIs */
  useEffect(() => {
    // Wait for auth to finish before deciding anything
    if (authLoading) return;
    // Not logged in — nothing to load
    if (!user) return;

    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Kisan";
    const initials = displayName.slice(0, 2).toUpperCase();

    setProfile(p => ({
      ...p,
      name: displayName,
      email: user.email ?? "",
      joinedAt: new Date(user.created_at ?? Date.now()).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
      }),
      role: role ?? "farmer",
      avatarInitials: initials,
    }));

    // Load extra fields from farmer_profiles table
    supabase
      .from("farmer_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(p => ({
            ...p,
            phone:       data.phone        ?? "",
            location:    data.location     ?? "",
            farmSize:    data.farm_size    ?? "",
            primaryCrop: data.primary_crop ?? "",
          }));
        }
      });

    // Load history items
    loadHistory();
    loadStats();
  }, [user, role, authLoading]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    const items: HistoryItem[] = [];
    let anyError = false;

    try {
      const dr = await diseaseAPI.getReports();
      (dr.data?.reports || []).slice(0, 10).forEach((r: any) => {
        items.push({
          id: r.id || Math.random().toString(),
          type: "disease",
          title: r.disease_name || "Disease Analysis",
          subtitle: `Confidence: ${r.confidence ?? "—"}% · ${r.crop_type || ""}`,
          status: r.severity === "high" ? "warning" : "success",
          date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN") : "—",
        });
      });
    } catch (e: any) {
      console.warn("Disease history error:", e?.response?.data || e?.message);
      anyError = true;
    }

    try {
      const fr = await fertilizerAPI.getHistory();
      (fr.data?.history || []).slice(0, 10).forEach((r: any) => {
        items.push({
          id: r.id || Math.random().toString(),
          type: "fertilizer",
          title: `${r.crop_type || "Crop"} Fertilizer Plan`,
          subtitle: `NPK: ${r.n_recommendation ?? "—"}-${r.p_recommendation ?? "—"}-${r.k_recommendation ?? "—"}`,
          status: "info",
          date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN") : "—",
        });
      });
    } catch (e: any) {
      console.warn("Fertilizer history error:", e?.response?.data || e?.message);
      anyError = true;
    }

    // Sort by date desc
    items.sort((a, b) => (a.date < b.date ? 1 : -1));
    setHistory(items);
    if (anyError && items.length === 0) {
      setHistoryError("Could not load history. Make sure the backend server is running.");
    }
    setHistoryLoading(false);
  };

  const loadStats = async () => {
    setStatsLoading(true);
    let disease = 0, fertilizer = 0, chats = 0;
    try {
      const dr = await diseaseAPI.getReports();
      disease = dr.data?.total ?? (dr.data?.reports?.length ?? 0);
    } catch { /* offline */ }
    try {
      const fr = await fertilizerAPI.getHistory();
      fertilizer = fr.data?.total ?? (fr.data?.history?.length ?? 0);
    } catch { /* offline */ }
    setStats({ disease, fertilizer, chats });
    setStatsLoading(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      // Primary save: backend MongoDB via /api/profile/me (PUT)
      // The axios interceptor automatically attaches the Bearer token from localStorage
      await api.put("/api/profile/me", {
        name:         profile.name,
        phone:        profile.phone,
        location:     profile.location,
        farm_size:    profile.farmSize,
        primary_crop: profile.primaryCrop,
      });

      // Secondary save: Supabase farmer_profiles (best-effort, may fail if table doesn't exist)
      try {
        const { error: sbErr } = await supabase.from("farmer_profiles").upsert({
          user_id:      user.id,
          name:         profile.name,
          phone:        profile.phone,
          location:     profile.location,
          farm_size:    profile.farmSize,
          primary_crop: profile.primaryCrop,
          updated_at:   new Date().toISOString(),
        }, { onConflict: "user_id" });
        if (sbErr) console.warn("Supabase upsert warning:", sbErr.message);
      } catch (sbEx) {
        console.warn("Supabase save skipped:", sbEx);
      }

      setSaveMsg("Profile saved successfully!");
      setEditing(false);
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error";
      setSaveMsg(`Failed to save: ${detail}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 4500);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile",  icon: User },
    { id: "history", label: "History",  icon: Clock },
    { id: "stats",   label: "Stats",    icon: BarChart3 },
  ] as const;

  /* ── Auth loading skeleton ── */
  if (authLoading) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "22px",
          padding: "40px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          marginBottom: "24px",
        }}>
          {/* Avatar skeleton */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 75%)",
            flexShrink: 0,
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{
              height: "22px", width: "200px", borderRadius: "8px",
              background: "rgba(255,255,255,0.07)",
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
            <div style={{
              height: "14px", width: "280px", borderRadius: "6px",
              background: "rgba(255,255,255,0.04)",
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
            <div style={{ display: "flex", gap: "8px" }}>
              {[80, 110, 140].map(w => (
                <div key={w} style={{
                  height: "22px", width: `${w}px`, borderRadius: "20px",
                  background: "rgba(255,255,255,0.05)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }} />
              ))}
            </div>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} } @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* ── Page title ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "28px" }}
      >
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
          My Profile
        </h1>
        <p style={{ color: "#64748B", fontSize: "14px", marginTop: "4px" }}>
          Manage your account details, preferences and farming history
        </p>
      </motion.div>

      {/* ── Hero card ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          background: "linear-gradient(135deg, rgba(74,222,128,0.08), rgba(34,211,238,0.04))",
          border: "1px solid rgba(74,222,128,0.16)",
          borderRadius: "22px",
          padding: "28px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          marginBottom: "24px",
          flexWrap: "wrap",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* bg glow */}
        <div style={{
          position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(74,222,128,0.07), transparent)",
          pointerEvents: "none",
        }} />

        {/* Avatar */}
        <div style={{ position: "relative" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px", fontWeight: 800, color: "#050816",
            boxShadow: "0 4px 20px rgba(74,222,128,0.35)",
          }}>
            {profile.avatarInitials}
          </div>
          {role === "admin" && (
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              width: "24px", height: "24px", borderRadius: "50%",
              background: "#FBBF24", display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #050816",
            }}>
              <ShieldCheck size={12} color="#050816" />
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: "180px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
            {profile.name || user?.email?.split("@")[0] || "Kisan"}
          </h2>
          <div style={{ color: "#94A3B8", fontSize: "14px", marginTop: "4px" }}>{profile.email}</div>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
            <span style={{
              fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px",
              background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)",
              color: "#4ADE80", textTransform: "capitalize",
            }}>
              👨‍🌾 {profile.role}
            </span>
            {profile.location && (
              <span style={{
                fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "20px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                color: "#94A3B8", display: "flex", alignItems: "center", gap: "4px",
              }}>
                <MapPin size={10} /> {profile.location}
              </span>
            )}
            {profile.joinedAt && (
              <span style={{
                fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "20px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                color: "#94A3B8", display: "flex", alignItems: "center", gap: "4px",
              }}>
                <Calendar size={10} /> Joined {profile.joinedAt}
              </span>
            )}
          </div>
        </div>

        {/* Edit button */}
        <div style={{ display: "flex", gap: "8px" }}>
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: "9px 16px", borderRadius: "10px", cursor: "pointer",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94A3B8", fontSize: "13px", fontWeight: 600, display: "flex",
                  alignItems: "center", gap: "6px", fontFamily: "inherit",
                }}
              >
                <X size={14} /> Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={saveProfile}
                disabled={saving}
                style={{
                  padding: "9px 20px", borderRadius: "10px", cursor: saving ? "wait" : "pointer",
                  background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                  border: "none", color: "#050816", fontSize: "13px", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: "6px", fontFamily: "inherit",
                  boxShadow: "0 2px 12px rgba(74,222,128,0.28)",
                }}
              >
                <Save size={14} /> {saving ? "Saving…" : "Save"}
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setEditing(true)}
              style={{
                padding: "9px 20px", borderRadius: "10px", cursor: "pointer",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "white", fontSize: "13px", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "6px", fontFamily: "inherit",
              }}
            >
              <Edit3 size={14} /> Edit Profile
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Save success/error toast */}
      <AnimatePresence>
        {saveMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{
              marginBottom: "16px", padding: "12px 16px", borderRadius: "12px",
              background: saveMsg.includes("success") ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
              border: `1px solid ${saveMsg.includes("success") ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
              color: saveMsg.includes("success") ? "#4ADE80" : "#F87171",
              fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            {saveMsg.includes("success") ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {saveMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: "4px", marginBottom: "20px",
        background: "rgba(255,255,255,0.03)", borderRadius: "14px",
        padding: "4px", border: "1px solid rgba(255,255,255,0.07)",
        width: "fit-content",
      }}>
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "8px 18px", borderRadius: "10px", cursor: "pointer",
                background: active ? "rgba(74,222,128,0.12)" : "transparent",
                border: active ? "1px solid rgba(74,222,128,0.22)" : "1px solid transparent",
                color: active ? "#4ADE80" : "#64748B",
                fontSize: "13px", fontWeight: active ? 600 : 400,
                transition: "all 0.2s", fontFamily: "inherit",
              }}
            >
              <Icon size={14} /> {label}
            </button>
          );
        })}
      </div>

      {/* ── Tab: Profile ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "profile" && (
          <motion.div key="profile-tab"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px", padding: "28px",
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px",
            }}
          >
            <InputField label="Full Name"     value={profile.name}        editing={editing} onChange={v => setProfile(p => ({ ...p, name: v }))}        icon={User}     placeholder="Enter your name" />
            <InputField label="Phone Number"  value={profile.phone}       editing={editing} onChange={v => setProfile(p => ({ ...p, phone: v }))}       icon={Phone}    placeholder="+91 XXXXX XXXXX" type="tel" />
            <InputField label="Email Address" value={profile.email}       editing={false}   onChange={() => {}}                                           icon={Mail}     />
            <InputField label="Location"      value={profile.location}    editing={editing} onChange={v => setProfile(p => ({ ...p, location: v }))}    icon={MapPin}   placeholder="Village / District / State" />
            <InputField label="Farm Size"     value={profile.farmSize}    editing={editing} onChange={v => setProfile(p => ({ ...p, farmSize: v }))}    icon={Tractor}  placeholder="e.g. 5 acres" />
            <InputField label="Primary Crop"  value={profile.primaryCrop} editing={editing} onChange={v => setProfile(p => ({ ...p, primaryCrop: v }))} icon={Leaf}     placeholder="e.g. Wheat, Rice, Cotton" />
          </motion.div>
        )}

        {/* ── Tab: History ─────────────────────────────────────── */}
        {activeTab === "history" && (
          <motion.div key="history-tab"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {/* Refresh button row */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
              <button
                onClick={loadHistory}
                disabled={historyLoading}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 14px", borderRadius: "10px", cursor: historyLoading ? "wait" : "pointer",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94A3B8", fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
                }}
              >
                <RefreshCw size={12} style={{ animation: historyLoading ? "spin 1s linear infinite" : "none" }} />
                {historyLoading ? "Loading…" : "Refresh"}
              </button>
            </div>

            {/* Error banner */}
            {historyError && (
              <div style={{
                padding: "12px 16px", borderRadius: "12px",
                background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
                color: "#F87171", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px",
              }}>
                <AlertCircle size={14} />{historyError}
              </div>
            )}

            {/* Loading skeleton */}
            {historyLoading && (
              [1, 2, 3].map(i => (
                <div key={i} style={{
                  height: "74px", borderRadius: "16px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }} />
              ))
            )}

            {/* Empty state */}
            {!historyLoading && history.length === 0 && !historyError && (
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "20px", padding: "60px 20px", textAlign: "center",
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
                <div style={{ color: "#64748B", fontSize: "14px" }}>
                  No history yet. Start using AI tools to see your activity here.
                </div>
              </div>
            )}

            {/* History items */}
            {!historyLoading && history.map((item, i) => {
              const cfg = typeConfig[item.type];
              const Ico = cfg.icon;
              return (
                <motion.div key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "16px", padding: "16px 20px",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "12px",
                    background: cfg.bg, border: `1px solid ${cfg.color}22`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Ico size={18} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "white", marginBottom: "3px" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>{item.subtitle}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{
                      fontSize: "11px", padding: "3px 8px", borderRadius: "6px",
                      background: cfg.bg, color: cfg.color, fontWeight: 600, marginBottom: "4px",
                    }}>
                      {cfg.label}
                    </div>
                    <div style={{ fontSize: "11px", color: "#475569" }}>{item.date}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Tab: Stats ───────────────────────────────────────── */}
        {activeTab === "stats" && (
          <motion.div key="stats-tab"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <StatCard icon={Microscope}   label="Disease Scans"       value={statsLoading ? "…" : stats.disease}    color="#F87171" />
              <StatCard icon={FlaskConical} label="Fertilizer Plans"    value={statsLoading ? "…" : stats.fertilizer} color="#FBBF24" />
              <StatCard icon={MessageCircle}label="AI Conversations"    value={statsLoading ? "…" : stats.chats}      color="#4ADE80" />
              <StatCard icon={Calendar}     label="Days Since Joining"  value={
                profile.joinedAt
                  ? Math.floor((Date.now() - new Date(profile.joinedAt.split(" ").reverse().join("-")).getTime()) / 86400000)
                  : "—"
              } color="#22D3EE" />
            </div>

            {/* Account info */}
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px", padding: "24px",
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "white", marginBottom: "18px" }}>
                Account Information
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {[
                  { label: "Account Type",  value: profile.role || "farmer", color: "#4ADE80" },
                  { label: "Member Since",  value: profile.joinedAt || "—",  color: "#22D3EE" },
                  { label: "Auth Provider", value: user?.app_metadata?.provider || "email", color: "#8B5CF6" },
                  { label: "Account ID",    value: user?.id?.slice(0, 8) + "…" || "—",     color: "#FBBF24" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div style={{ fontSize: "11px", color: "#475569", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "6px" }}>
                      {label.toUpperCase()}
                    </div>
                    <div style={{ fontSize: "14px", color, fontWeight: 600, textTransform: "capitalize" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
