"use client";
export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud, Wind, Droplets, Thermometer, Eye, Loader2,
  MapPin, Search, Sun, CloudRain, CloudSnow, Zap,
  Wheat, AlertTriangle, CheckCircle, ChevronDown, X,
} from "lucide-react";
import { weatherAPI } from "@/services/api";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

/* ─── Indian farming cities ─── */
const CITIES = [
  { name: "Ludhiana",   state: "Punjab",        crop: "Wheat, Rice"     },
  { name: "Amritsar",   state: "Punjab",        crop: "Wheat, Basmati"  },
  { name: "Chandigarh", state: "Punjab/Haryana", crop: "Wheat, Sugarcane"},
  { name: "Delhi",      state: "Delhi",         crop: "Vegetables"      },
  { name: "Jaipur",     state: "Rajasthan",     crop: "Bajra, Jowar"    },
  { name: "Agra",       state: "Uttar Pradesh", crop: "Potato, Wheat"   },
  { name: "Lucknow",    state: "Uttar Pradesh", crop: "Sugarcane, Wheat"},
  { name: "Varanasi",   state: "Uttar Pradesh", crop: "Rice, Vegetables"},
  { name: "Kanpur",     state: "Uttar Pradesh", crop: "Wheat, Cotton"   },
  { name: "Patna",      state: "Bihar",         crop: "Rice, Maize"     },
  { name: "Bhopal",     state: "Madhya Pradesh",crop: "Soybean, Wheat"  },
  { name: "Indore",     state: "Madhya Pradesh",crop: "Soybean, Cotton" },
  { name: "Nagpur",     state: "Maharashtra",   crop: "Orange, Cotton"  },
  { name: "Pune",       state: "Maharashtra",   crop: "Sugarcane, Grapes"},
  { name: "Mumbai",     state: "Maharashtra",   crop: "Rice, Vegetables"},
  { name: "Hyderabad",  state: "Telangana",     crop: "Rice, Cotton"    },
  { name: "Bengaluru",  state: "Karnataka",     crop: "Coffee, Ragi"    },
  { name: "Ahmedabad",  state: "Gujarat",       crop: "Cotton, Groundnut"},
  { name: "Surat",      state: "Gujarat",       crop: "Sugarcane, Rice" },
  { name: "Nashik",     state: "Maharashtra",   crop: "Grapes, Onion"   },
];

/* ─── Weather icon component ─── */
function WeatherIcon({ desc, size = 64 }: { desc: string; size?: number }) {
  const d = (desc || "").toLowerCase();
  const color = d.includes("rain") ? "#22D3EE"
    : d.includes("storm") ? "#FBBF24"
    : d.includes("snow")  ? "#E0F2FE"
    : d.includes("cloud") ? "#94A3B8"
    : "#FBBF24";
  const Icon = d.includes("rain") ? CloudRain
    : d.includes("storm") ? Zap
    : d.includes("snow")  ? CloudSnow
    : d.includes("cloud") ? Cloud
    : Sun;
  return (
    <div style={{
      width: size + 24, height: size + 24, borderRadius: "50%",
      background: `radial-gradient(circle, ${color}22, transparent)`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={size} color={color} strokeWidth={1.5} />
    </div>
  );
}

/* ─── Custom city dropdown ─── */
function CityPicker({ selected, onSelect }: { selected: string; onSelect: (c: string) => void }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = CITIES.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.state.toLowerCase().includes(query.toLowerCase()) ||
    c.crop.toLowerCase().includes(query.toLowerCase())
  );

  const selectedCity = CITIES.find(c => c.name === selected);

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, minWidth: "220px" }}>
      {/* Trigger */}
      <button onClick={() => setOpen(v => !v)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: "10px",
        padding: "14px 16px", borderRadius: "14px",
        background: open ? "rgba(34,211,238,0.08)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${open ? "rgba(34,211,238,0.3)" : "rgba(255,255,255,0.1)"}`,
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        transition: "all 0.2s",
      }}>
        <MapPin size={16} color="#22D3EE" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>{selected}</div>
          {selectedCity && (
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "1px" }}>
              {selectedCity.state} — {selectedCity.crop}
            </div>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} color="#64748B" />
        </motion.div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
              zIndex: 100, borderRadius: "16px",
              background: "rgba(8,12,28,0.98)", backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              overflow: "hidden",
            }}
          >
            {/* Search inside dropdown */}
            <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "8px 12px" }}>
                <Search size={13} color="#64748B" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search city, state, or crop..."
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: "13px", fontFamily: "inherit" }}
                />
                {query && (
                  <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", display: "flex" }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* City list */}
            <div style={{ maxHeight: "280px", overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#475569", fontSize: "13px" }}>
                  No cities found
                </div>
              ) : (
                filtered.map(c => (
                  <button key={c.name}
                    onClick={() => { onSelect(c.name); setOpen(false); setQuery(""); }}
                    style={{
                      width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px",
                      background: c.name === selected ? "rgba(34,211,238,0.08)" : "transparent",
                      border: "none", borderLeft: c.name === selected ? "3px solid #22D3EE" : "3px solid transparent",
                      cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (c.name !== selected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { if (c.name !== selected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <MapPin size={14} color={c.name === selected ? "#22D3EE" : "#475569"} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: c.name === selected ? 700 : 500, color: c.name === selected ? "#22D3EE" : "white" }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#475569", marginTop: "1px" }}>
                        {c.state} &nbsp;·&nbsp; {c.crop}
                      </div>
                    </div>
                    {c.name === selected && <CheckCircle size={13} color="#22D3EE" />}
                  </button>
                ))
              )}
            </div>

            {/* Custom city footer */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: "11px", color: "#475569", textAlign: "center" }}>
                Your city not listed? Type it in the search box above
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main page ─── */
export default function WeatherPage() {
  const [city, setCity]     = useState("Ludhiana");
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData]     = useState<any>(null);
  const [error, setError]   = useState("");
  const { language, t }     = useLanguage();

  const fetchWeather = async () => {
    const target = custom.trim() || city;
    setLoading(true); setError("");
    try {
      const res = await weatherAPI.getCurrent(target, language);
      setData(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Weather fetch failed. Check your OpenWeatherMap API key.");
    } finally { setLoading(false); }
  };

  const w      = data?.weather;
  const alerts = data?.ai_alerts;

  /* Farming advice based on weather */
  const farmingTips = w ? [
    {
      label: "Irrigation",
      icon: Droplets,
      color: "#22D3EE",
      advice: w.humidity > 80
        ? "Humidity is HIGH — skip irrigation today to avoid waterlogging."
        : w.humidity < 40
        ? "Humidity is LOW — irrigate your crops early morning or evening."
        : "Humidity is moderate — check soil moisture before irrigating.",
    },
    {
      label: "Spraying",
      icon: Wind,
      color: "#FBBF24",
      advice: w.wind_speed > 5
        ? `Wind speed ${w.wind_speed} m/s is HIGH — avoid pesticide spraying to prevent drift.`
        : "Low wind — ideal conditions for pesticide and fertilizer spraying.",
    },
    {
      label: "Temperature",
      icon: Thermometer,
      color: "#F87171",
      advice: w.temperature > 38
        ? "Temperature is VERY HIGH — water your crops twice a day to reduce heat stress."
        : w.temperature < 10
        ? "Cold weather — cover sensitive seedlings and protect from frost."
        : `Temperature ${w.temperature}°C is optimal for most crops.`,
    },
  ] : [];

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Cloud size={20} color="#22D3EE" />
            </div>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>Weather Forecast</h1>
              <p style={{ color: "#64748B", fontSize: "13px", marginTop: "2px" }}>Real-time weather + AI farming advice</p>
            </div>
          </div>
        </div>
        <LanguageSwitcher />
      </div>

      {/* City selector + custom input + button */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>
        <CityPicker selected={city} onSelect={c => { setCity(c); setCustom(""); }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} color="#64748B" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchWeather()}
              placeholder="Or type any city..."
              style={{
                padding: "14px 14px 14px 36px", borderRadius: "14px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "white", fontSize: "13px", fontFamily: "inherit", outline: "none",
                width: "180px",
              }}
            />
          </div>
          <div style={{ fontSize: "10px", color: "#475569", paddingLeft: "4px" }}>Press Enter or click Get Weather</div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={fetchWeather} disabled={loading}
          className="btn-primary"
          style={{ padding: "14px 28px", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap", opacity: loading ? 0.75 : 1 }}
        >
          {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Cloud size={16} />}
          {loading ? "Fetching…" : "Get Weather"}
        </motion.button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#F87171", fontSize: "13px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertTriangle size={15} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Loader2 size={32} color="#22D3EE" style={{ animation: "spin 1s linear infinite", marginBottom: "12px" }} />
            <div style={{ color: "#64748B", fontSize: "14px" }}>Fetching weather for {custom || city}…</div>
          </motion.div>
        )}

        {/* Weather result */}
        {w && !loading && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            {/* Main card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(34,211,238,0.12), rgba(74,222,128,0.06))",
              border: "1px solid rgba(34,211,238,0.25)", borderRadius: "22px",
              padding: "28px", marginBottom: "16px", position: "relative", overflow: "hidden",
            }}>
              {/* bg glow */}
              <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "220px", height: "220px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.08), transparent)", pointerEvents: "none" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748B", fontSize: "13px", marginBottom: "8px" }}>
                    <MapPin size={13} color="#22D3EE" /> {w.city}, {w.country}
                  </div>
                  <div style={{ fontSize: "68px", fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: "-0.03em" }}>
                    {w.temperature}<span style={{ fontSize: "32px", color: "#22D3EE", fontWeight: 600 }}>°C</span>
                  </div>
                  <div style={{ fontSize: "16px", color: "#22D3EE", textTransform: "capitalize", marginTop: "6px", fontWeight: 500 }}>{w.description}</div>
                  <div style={{ fontSize: "13px", color: "#475569", marginTop: "4px" }}>Feels like {w.feels_like}°C</div>
                </div>
                <WeatherIcon desc={w.description} size={72} />
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px", marginTop: "24px" }}>
                {[
                  { icon: Droplets,    label: "Humidity",    value: `${w.humidity}%`,        color: "#22D3EE" },
                  { icon: Wind,        label: "Wind Speed",  value: `${w.wind_speed} m/s`,   color: "#4ADE80" },
                  { icon: Eye,         label: "Visibility",  value: `${w.visibility} km`,    color: "#A78BFA" },
                  { icon: Thermometer, label: "Pressure",    value: `${w.pressure} hPa`,     color: "#FBBF24" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.07)", borderRadius: "14px", padding: "14px 12px", textAlign: "center" }}>
                    <Icon size={18} color={color} style={{ marginBottom: "6px" }} />
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>{value}</div>
                    <div style={{ fontSize: "11px", color: "#64748B", marginTop: "3px" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Farming advice cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginBottom: "16px" }}>
              {farmingTips.map(({ label, icon: Icon, color, advice }) => (
                <div key={label} style={{
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${color}20`,
                  borderLeft: `3px solid ${color}`, borderRadius: "14px", padding: "16px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={15} color={color} />
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color }}>{label} Advice</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: 1.65, margin: 0 }}>{advice}</p>
                </div>
              ))}
            </div>

            {/* AI Farming Alerts */}
            {alerts && (
              <div style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.18)", borderRadius: "16px", padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <Wheat size={16} color="#4ADE80" />
                  <span style={{ fontWeight: 700, color: "#4ADE80", fontSize: "14px" }}>AI Farming Alerts for {w.city}</span>
                </div>
                <p style={{ color: "#CBD5E1", fontSize: "13px", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{alerts}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!w && !loading && !error && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Cloud size={32} color="#22D3EE" strokeWidth={1.5} />
            </div>
            <h3 style={{ color: "white", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Select Your City</h3>
            <p style={{ color: "#64748B", fontSize: "13px", maxWidth: "360px", margin: "0 auto" }}>
              Choose your city from the dropdown above, then click <strong style={{ color: "#22D3EE" }}>Get Weather</strong> to see real-time conditions and AI farming advice for your crops.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
