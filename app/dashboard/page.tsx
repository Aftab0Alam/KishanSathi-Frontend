"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Camera, Cloud, BarChart3, Leaf,
  TrendingUp, TrendingDown, AlertTriangle, Droplets,
  Bug, ChevronRight, MapPin,
  Globe, Bell, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { weatherAPI, mandiAPI, profileAPI } from "@/services/api";

/* ── helpers ── */
function getGreeting(name: string) {
  const h = new Date().getHours();
  const g = h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  return `${g}, ${name}! 👋`;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { ease: "easeOut" as const, duration: 0.4 } } };

/* ── static mock data (matches screenshot) ── */
const ALERTS = [
  { icon: AlertTriangle, color: "#F59E0B", title: "High Temperature Alert", desc: "Temperature may affect wheat crop.", time: "2h ago" },
  { icon: Droplets,      color: "#22D3EE", title: "Irrigation Recommended", desc: "Irrigate after 6 PM for better results.", time: "3h ago" },
  { icon: Bug,           color: "#4ADE80", title: "Pest Risk Low", desc: "No major pest activity detected.", time: "5h ago" },
];

const RECOMMENDATIONS = [
  { emoji: "🧪", text: "Apply urea to your wheat crop within 2 days for better yield." },
  { emoji: "🌧️", text: "Avoid pesticide spray. Rain expected tomorrow." },
  { emoji: "🌱", text: "Soil nitrogen level is low. Add organic compost." },
];

// Market prices fetched live — no static fallback needed

const QUICK_ACTIONS = [
  { href: "/dashboard/disease",    icon: Camera,        label: "Scan Plant",     desc: "Detect diseases",      color: "#1a2e1a", border: "#2d4d2d", iconColor: "#4ADE80" },
  { href: "/dashboard/soil",       icon: Leaf,          label: "Check Soil",     desc: "Analyze soil health",  color: "#2e2a14", border: "#4d4020", iconColor: "#F59E0B" },
  { href: "/dashboard/weather",    icon: Cloud,         label: "Weather",        desc: "Check forecast",       color: "#142030", border: "#1e3448", iconColor: "#22D3EE" },
  { href: "/dashboard/yield",      icon: BarChart3,     label: "Market Prices",  desc: "Today's mandi rates",  color: "#1e1a10", border: "#3d3420", iconColor: "#F59E0B" },
];

/* ── Circular gauge ── */
function HealthGauge({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
      <svg width={130} height={130} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={65} cy={65} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} />
        <circle cx={65} cy={65} r={r} fill="none"
          stroke="url(#gauge)" strokeWidth={10}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round" />
        <defs>
          <linearGradient id="gauge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: "#4ADE80" }}>{score}</span>
        <span style={{ fontSize: 11, color: "#64748B" }}>/100</span>
      </div>
    </div>
  );
}

/* ── Main ── */
interface MandiRow { crop: string; unit: string; price: string; change: string; up: boolean; }

export default function DashboardPage() {
  const { user } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mandiPrices, setMandiPrices] = useState<MandiRow[]>([]);
  const [mandiLoading, setMandiLoading] = useState(true);

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Gurpreet Singh";
  const location = "Jalandhar, Punjab";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const loadWeather = async () => {
    try {
      const res = await weatherAPI.getCurrent("Jalandhar", "en");
      setWeather(res.data);
    } catch { /* use static fallback */ }
  };

  const loadMandi = async () => {
    try {
      setMandiLoading(true);
      const crops = ["Wheat", "Paddy", "Maize", "Cotton"];
      const results: MandiRow[] = [];
      for (const crop of crops) {
        try {
          const res = await mandiAPI.getPrices({ state: "Punjab", commodity: crop, limit: 1 });
          const rec = res.data?.records?.[0];
          if (rec) {
            const modal = Math.round(rec.modal_price);
            const min   = Math.round(rec.min_price);
            const diff  = modal - min;
            results.push({
              crop,
              unit: "Qtl",
              price: `₹ ${modal.toLocaleString("en-IN")}`,
              change: `${diff >= 0 ? "+" : ""}${diff}`,
              up: diff >= 0,
            });
          }
        } catch { /* skip this crop */ }
      }
      if (results.length > 0) setMandiPrices(results);
      else setMandiPrices([
        { crop: "Wheat",  unit: "Qtl", price: "₹ 2,275", change: "+35",  up: true  },
        { crop: "Paddy",  unit: "Qtl", price: "₹ 1,960", change: "-20",  up: false },
        { crop: "Maize",  unit: "Qtl", price: "₹ 2,100", change: "+15",  up: true  },
        { crop: "Cotton", unit: "Qtl", price: "₹ 6,720", change: "+60",  up: true  },
      ]);
    } catch {
      setMandiPrices([
        { crop: "Wheat",  unit: "Qtl", price: "₹ 2,275", change: "+35",  up: true  },
        { crop: "Paddy",  unit: "Qtl", price: "₹ 1,960", change: "-20",  up: false },
        { crop: "Maize",  unit: "Qtl", price: "₹ 2,100", change: "+15",  up: true  },
        { crop: "Cotton", unit: "Qtl", price: "₹ 6,720", change: "+60",  up: true  },
      ]);
    } finally { setMandiLoading(false); }
  };

  useEffect(() => { loadWeather(); loadMandi(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadWeather(), loadMandi()]);
    setRefreshing(false);
  };

  const temp      = weather?.temperature ?? 32;
  const condition = weather?.weather?.description ?? "Partly Cloudy";
  const humidity  = weather?.humidity ?? 58;
  const windSpeed = weather?.wind_speed ?? 12;
  const rainChance = 20;

  const weatherEmoji = condition.toLowerCase().includes("rain") ? "🌧️"
    : condition.toLowerCase().includes("cloud") ? "⛅" : "🌤️";

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      style={{ fontFamily: "'Inter', sans-serif", color: "white" }}>

      {/* ── Top bar ── */}
      <motion.div variants={item} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 24, flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={15} color="#4ADE80" />
          <span style={{ fontSize: 15, fontWeight: 600, color: "white" }}>{location}</span>
          <ChevronRight size={14} color="#64748B" />
          <span style={{ fontSize: 12, color: "#64748B" }}>{today}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={handleRefresh} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "7px 12px", borderRadius: 9, cursor: "pointer",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#94A3B8", fontSize: 12, fontFamily: "inherit",
          }}>
            <RefreshCw size={13} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
          <button style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "7px 12px", borderRadius: 9, cursor: "pointer",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#94A3B8", fontSize: 12, fontFamily: "inherit",
          }}>
            <Globe size={13} /> English
          </button>
          <Link href="/dashboard/notifications" style={{ textDecoration: "none" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              position: "relative",
            }}>
              <Bell size={16} color="#F87171" />
              <span style={{
                position: "absolute", top: -3, right: -3, width: 14, height: 14,
                borderRadius: "50%", background: "#F87171", fontSize: 9, fontWeight: 700,
                color: "white", display: "flex", alignItems: "center", justifyContent: "center",
              }}>3</span>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* ── Greeting ── */}
      <motion.div variants={item} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
          {getGreeting(displayName)}
        </h1>
        <p style={{ fontSize: 13, color: "#64748B" }}>Here&apos;s what&apos;s happening in your farm today.</p>
      </motion.div>

      {/* ── Row 1: Weather | Farm Health | Smart Alerts ── */}
      <motion.div variants={item} style={{
        display: "grid", gridTemplateColumns: "1fr 1.3fr 1.2fr", gap: 16, marginBottom: 16,
      }} className="row1-grid">

        {/* Weather Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18, padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 42 }}>{weatherEmoji}</span>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "white" }}>{temp}°C</div>
              <div style={{ fontSize: 13, color: "#94A3B8" }}>{condition}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>
            <span>Humidity</span><span style={{ color: "white", textAlign: "right" }}>{humidity}%</span>
            <span>Wind Speed</span><span style={{ color: "white", textAlign: "right" }}>{windSpeed} km/h</span>
            <span>Rain Chance</span><span style={{ color: "white", textAlign: "right" }}>{rainChance}%</span>
          </div>
          <div style={{
            background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)",
            borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#4ADE80",
          }}>
            🤖 AI Advice: Weather is good for irrigation in the evening.
          </div>
        </div>

        {/* Farm Health Score */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18, padding: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Farm Health Score</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <HealthGauge score={82} />
            <div style={{ flex: 1 }}>
              {[
                { label: "Soil Health", status: "Good",   color: "#4ADE80" },
                { label: "Crop Health", status: "Good",   color: "#4ADE80" },
                { label: "Water Level", status: "Medium", color: "#F59E0B" },
                { label: "Disease Risk",status: "Low",    color: "#4ADE80" },
              ].map(({ label, status, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: "#94A3B8", display: "flex", alignItems: "center", gap: 5 }}>
                    <Leaf size={12} color={color} /> {label}
                  </span>
                  <span style={{ color, fontWeight: 600 }}>{status}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 12, textAlign: "center", fontSize: 12, color: "#4ADE80" }}>
            Your farm is in good condition. Keep it up!
          </div>
        </div>

        {/* Smart Alerts */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18, padding: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Smart Alerts</span>
            <Link href="/dashboard/notifications" style={{ fontSize: 12, color: "#4ADE80", textDecoration: "none" }}>View All</Link>
          </div>
          {ALERTS.map(({ icon: Icon, color, title, desc, time }) => (
            <div key={title} style={{
              display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: `${color}18`, border: `1px solid ${color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={15} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.4 }}>{desc}</div>
              </div>
              <span style={{ fontSize: 10, color: "#475569", whiteSpace: "nowrap" }}>{time}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div variants={item} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }} className="quick-actions-grid">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc, color, border, iconColor }) => (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ y: -3, borderColor: iconColor + "60" }} style={{
                background: color, border: `1px solid ${border}`,
                borderRadius: 16, padding: "16px 14px", cursor: "pointer",
                transition: "all 0.25s ease", textAlign: "center",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${iconColor}18`, border: `1px solid ${iconColor}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 10px",
                }}>
                  <Icon size={20} color={iconColor} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{desc}</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Row 3: AI Recommendations | Active Crop | Market Prices ── */}
      <motion.div variants={item} style={{
        display: "grid", gridTemplateColumns: "1fr 1.3fr 1fr", gap: 16, marginBottom: 16,
      }} className="row3-grid">

        {/* AI Recommendations */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18, padding: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>AI Recommendations</span>
            <Link href="/dashboard/reports" style={{ fontSize: 12, color: "#4ADE80", textDecoration: "none" }}>View All</Link>
          </div>
          {RECOMMENDATIONS.map(({ emoji, text }) => (
            <div key={text} style={{
              display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>{emoji}</div>
              <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Active Crop */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18, padding: 20, position: "relative", overflow: "hidden",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Active Crop</div>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 4 }}>Wheat</div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>Sowing Date: 12 Nov 2025</div>
              <span style={{
                display: "inline-block", padding: "3px 10px", borderRadius: 20,
                background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)",
                fontSize: 11, color: "#4ADE80", fontWeight: 600, marginBottom: 12,
              }}>Healthy</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                <div>
                  <div style={{ color: "#64748B", marginBottom: 2 }}>Growth Stage</div>
                  <div style={{ color: "white", fontWeight: 600 }}>Tillering</div>
                </div>
                <div>
                  <div style={{ color: "#64748B", marginBottom: 2 }}>Expected Harvest</div>
                  <div style={{ color: "white", fontWeight: 600 }}>15 May 2026</div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{
                  height: 6, borderRadius: 4,
                  background: "rgba(255,255,255,0.08)", overflow: "hidden",
                }}>
                  <div style={{
                    width: "68%", height: "100%", borderRadius: 4,
                    background: "linear-gradient(90deg, #4ADE80, #22D3EE)",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, textAlign: "right" }}>68%</div>
              </div>
            </div>
            <div style={{
              width: 110, height: 130, borderRadius: 14, overflow: "hidden", flexShrink: 0,
              background: "linear-gradient(135deg, #1a2e1a, #0d1f0d)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48,
            }}>🌾</div>
          </div>
        </div>

        {/* Market Prices */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18, padding: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Market Prices (Today)</span>
            <Link href="/dashboard/yield" style={{ fontSize: 12, color: "#4ADE80", textDecoration: "none" }}>View All</Link>
          </div>
          {mandiLoading ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#64748B", fontSize: 12 }}>Loading live prices…</div>
          ) : mandiPrices.map(({ crop, unit, price, change, up }) => (
            <div key={crop} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <span style={{ fontSize: 13, color: "white" }}>{crop} <span style={{ color: "#64748B", fontSize: 11 }}>({unit})</span></span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{price}</span>
                <span style={{
                  display: "flex", alignItems: "center", gap: 2,
                  fontSize: 11, fontWeight: 600, color: up ? "#4ADE80" : "#F87171",
                }}>
                  {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>




      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1100px) {
          .row1-grid { grid-template-columns: 1fr 1fr !important; }
          .row3-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .row1-grid, .row3-grid, .row4-grid { grid-template-columns: 1fr !important; }
          .quick-actions-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .quick-actions-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </motion.div>
  );
}
