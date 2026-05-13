"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Cloud, FlaskConical, AlertTriangle,
  Droplets, CheckCircle2, Sprout, BellOff, BellRing,
  Clock, ChevronRight,
} from "lucide-react";

/* ─── Data ─── */
type NotifType = "weather" | "fertilizer" | "disease" | "irrigation" | "general" | "crop";

interface Notif {
  id: number;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
}

const INITIAL: Notif[] = [
  {
    id: 1, type: "weather", read: false,
    title: "Heavy Rain Alert",
    body: "Heavy rain (25 mm) expected tomorrow in your area. Avoid pesticide spraying — it will wash off and harm beneficial insects.",
    time: "2 hours ago", actionLabel: "View Weather Forecast", actionHref: "/dashboard/weather",
  },
  {
    id: 2, type: "fertilizer", read: false,
    title: "Fertilizer Reminder",
    body: "Time to apply DAP (Di-Ammonium Phosphate) to your wheat crop this week. Optimal growth window is 21–25 days after sowing.",
    time: "5 hours ago", actionLabel: "View Fertilizer Plan", actionHref: "/dashboard/fertilizer",
  },
  {
    id: 3, type: "disease", read: true,
    title: "High Disease Risk Detected",
    body: "High humidity (87%) and warm temperatures increase the risk of fungal disease in rice crops. Check your field for early signs of brown leaf spot.",
    time: "1 day ago", actionLabel: "Scan Your Crop", actionHref: "/dashboard/disease",
  },
  {
    id: 4, type: "irrigation", read: true,
    title: "Irrigation Reminder",
    body: "Your sugarcane field soil moisture is at 34% — below the optimal 55–70% threshold. Irrigate today for 2–3 hours to restore moisture levels.",
    time: "1 day ago",
  },
  {
    id: 5, type: "general", read: true,
    title: "AI Disease Scan Complete",
    body: "Your plant image scan has been fully analyzed. Results show early-stage Wheat Rust — treatment recommendations have been saved to your Disease Reports.",
    time: "2 days ago", actionLabel: "View Results", actionHref: "/dashboard/disease",
  },
  {
    id: 6, type: "crop", read: true,
    title: "Kharif Season Starting Soon",
    body: "Kharif season begins in approximately 2 weeks. Prepare your soil with deep ploughing and add organic compost. Best crops for your region: Rice, Cotton, Soybean.",
    time: "3 days ago", actionLabel: "Get Crop Advice", actionHref: "/dashboard/crops",
  },
];

/* ─── Config per type ─── */
const TYPE_CONFIG: Record<NotifType, { icon: any; color: string; bg: string; label: string }> = {
  weather:    { icon: Cloud,          color: "#22D3EE", bg: "rgba(34,211,238,0.1)",  label: "Weather"    },
  fertilizer: { icon: FlaskConical,   color: "#FBBF24", bg: "rgba(251,191,36,0.1)",  label: "Fertilizer" },
  disease:    { icon: AlertTriangle,  color: "#F87171", bg: "rgba(248,113,113,0.1)", label: "Disease"    },
  irrigation: { icon: Droplets,       color: "#4ADE80", bg: "rgba(74,222,128,0.1)",  label: "Irrigation" },
  general:    { icon: CheckCircle2,   color: "#A78BFA", bg: "rgba(167,139,250,0.1)", label: "General"    },
  crop:       { icon: Sprout,         color: "#4ADE80", bg: "rgba(74,222,128,0.1)",  label: "Crop"       },
};

/* ─── Component ─── */
export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [pushEnabled, setPushEnabled] = useState(false);

  const unread = notifs.filter(n => !n.read).length;
  const shown  = filter === "unread" ? notifs.filter(n => !n.read) : notifs;

  const markAllRead   = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(74,222,128,0.15), rgba(34,211,238,0.08))",
              border: "1px solid rgba(74,222,128,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bell size={20} color="#4ADE80" />
            </div>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>Notifications</h1>
              <p style={{ color: "#64748B", fontSize: "13px", marginTop: "2px" }}>
                {unread > 0 ? (
                  <span style={{ color: "#4ADE80", fontWeight: 600 }}>{unread} unread alert{unread > 1 ? "s" : ""}</span>
                ) : "All caught up!"}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {/* Filter tabs */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "3px", border: "1px solid rgba(255,255,255,0.07)" }}>
            {(["all", "unread"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "6px 14px", borderRadius: "8px", cursor: "pointer",
                background: filter === f ? "rgba(74,222,128,0.12)" : "transparent",
                border: filter === f ? "1px solid rgba(74,222,128,0.22)" : "1px solid transparent",
                color: filter === f ? "#4ADE80" : "#64748B",
                fontSize: "12px", fontWeight: filter === f ? 600 : 400,
                transition: "all 0.18s", fontFamily: "inherit", textTransform: "capitalize",
              }}>
                {f} {f === "unread" && unread > 0 && (
                  <span style={{ background: "#4ADE80", color: "#050816", borderRadius: "10px", padding: "0 5px", fontSize: "10px", fontWeight: 700, marginLeft: "3px" }}>
                    {unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          {unread > 0 && (
            <button onClick={markAllRead} style={{
              padding: "8px 14px", borderRadius: "10px", cursor: "pointer",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
              color: "#94A3B8", fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
              transition: "all 0.18s",
            }}>
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "24px" }}>
        {[
          { label: "Total Alerts",   value: notifs.length,                      color: "#94A3B8" },
          { label: "Unread",         value: unread,                              color: "#4ADE80" },
          { label: "Weather Alerts", value: notifs.filter(n=>n.type==="weather").length, color: "#22D3EE" },
          { label: "Disease Risks",  value: notifs.filter(n=>n.type==="disease").length, color: "#F87171" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px", padding: "14px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color, letterSpacing: "-0.02em" }}>{value}</div>
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "3px", fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Notification list ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <AnimatePresence>
          {shown.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.03)", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <BellOff size={36} color="#475569" style={{ marginBottom: "12px" }} />
              <div style={{ color: "#64748B", fontSize: "14px" }}>No unread notifications</div>
            </motion.div>
          ) : (
            shown.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type];
              const Icon = cfg.icon;
              return (
                <motion.div key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => markRead(n.id)}
                  style={{
                    display: "flex", gap: "16px", alignItems: "flex-start",
                    padding: "18px 20px",
                    background: n.read ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${n.read ? "rgba(255,255,255,0.07)" : cfg.color + "28"}`,
                    borderLeft: `3px solid ${n.read ? "rgba(255,255,255,0.1)" : cfg.color}`,
                    borderRadius: "14px",
                    cursor: n.read ? "default" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Icon bubble */}
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "12px",
                    background: cfg.bg, border: `1px solid ${cfg.color}22`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon size={19} color={cfg.color} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "5px" }}>
                      <span style={{ fontWeight: n.read ? 500 : 700, color: n.read ? "#94A3B8" : "white", fontSize: "14px" }}>
                        {n.title}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#475569", whiteSpace: "nowrap", flexShrink: 0 }}>
                        <Clock size={10} /> {n.time}
                      </span>
                    </div>
                    <p style={{ color: "#64748B", fontSize: "13px", lineHeight: 1.65, margin: "0 0 10px" }}>
                      {n.body}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      {/* Type badge */}
                      <span style={{
                        padding: "2px 10px", borderRadius: "20px", fontSize: "10px",
                        background: cfg.bg, color: cfg.color, fontWeight: 700,
                        border: `1px solid ${cfg.color}22`, letterSpacing: "0.03em",
                      }}>
                        {cfg.label.toUpperCase()}
                      </span>
                      {/* Action link */}
                      {n.actionLabel && (
                        <a href={n.actionHref} style={{
                          fontSize: "12px", color: cfg.color, fontWeight: 600,
                          display: "flex", alignItems: "center", gap: "3px", textDecoration: "none",
                          opacity: 0.85,
                        }}>
                          {n.actionLabel} <ChevronRight size={12} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div style={{
                      width: "9px", height: "9px", borderRadius: "50%",
                      background: cfg.color, flexShrink: 0, marginTop: "6px",
                      boxShadow: `0 0 8px ${cfg.color}66`,
                    }} />
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* ── Push notification banner ── */}
      <div style={{
        marginTop: "28px", padding: "20px 24px",
        background: pushEnabled ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${pushEnabled ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: pushEnabled ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {pushEnabled ? <BellRing size={19} color="#4ADE80" /> : <BellOff size={19} color="#64748B" />}
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "white", marginBottom: "2px" }}>
              {pushEnabled ? "Push Notifications On" : "Enable Push Notifications"}
            </div>
            <div style={{ fontSize: "12px", color: "#64748B" }}>
              {pushEnabled
                ? "You will receive real-time farming alerts on this device"
                : "Get real-time weather, disease & fertilizer alerts instantly"}
            </div>
          </div>
        </div>
        <button
          onClick={() => setPushEnabled(v => !v)}
          className={pushEnabled ? "" : "btn-primary"}
          style={{
            padding: "10px 20px", borderRadius: "10px", cursor: "pointer",
            background: pushEnabled ? "rgba(248,113,113,0.1)" : undefined,
            border: pushEnabled ? "1px solid rgba(248,113,113,0.25)" : undefined,
            color: pushEnabled ? "#F87171" : undefined,
            fontSize: "13px", fontWeight: 600, fontFamily: "inherit",
          }}
        >
          {pushEnabled ? "Disable Alerts" : "Enable Alerts"}
        </button>
      </div>
    </div>
  );
}
