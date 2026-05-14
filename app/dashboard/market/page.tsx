"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Search, RefreshCw, MapPin,
  Filter, AlertTriangle, ArrowUpDown, ChevronDown,
  ExternalLink, Star, StarOff, BarChart2, List,
} from "lucide-react";
import Link from "next/link";
import { mandiAPI } from "@/services/api";

// ── Types ──────────────────────────────────────────────────────────────────
interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  date: string;
}

// ── Constants ──────────────────────────────────────────────────────────────
const COMMODITY_ICON: Record<string, string> = {
  Wheat: "🌾", Rice: "🍚", Maize: "🌽", Bajra: "🌾", Jowar: "🌾",
  Cotton: "🌿", Tomato: "🍅", Potato: "🥔", Onion: "🧅", Garlic: "🧄",
  Banana: "🍌", Mango: "🥭", Orange: "🍊", Lemon: "🍋", Sugarcane: "🎋",
  Soyabean: "🌱", Mustard: "🌻", Groundnut: "🥜", Paddy: "🌾",
  Sunflower: "🌻", Chilli: "🌶️",
};

function getIcon(commodity: string): string {
  for (const [key, icon] of Object.entries(COMMODITY_ICON)) {
    if (commodity.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "🌿";
}

const S = {
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "20px",
  } as React.CSSProperties,
  select: {
    display: "block", width: "100%", padding: "10px 14px",
    borderRadius: "10px", background: "#0d1117",
    border: "1px solid rgba(255,255,255,0.15)", color: "white",
    fontSize: "14px", outline: "none", appearance: "none" as const,
    cursor: "pointer", fontFamily: "inherit",
  } as React.CSSProperties,
  input: {
    display: "block", width: "100%", padding: "10px 14px",
    borderRadius: "10px", background: "#0d1117",
    border: "1px solid rgba(255,255,255,0.15)", color: "white",
    fontSize: "14px", outline: "none", boxSizing: "border-box" as const,
    fontFamily: "inherit",
  } as React.CSSProperties,
  label: {
    color: "#94A3B8", fontSize: "11px", fontWeight: 600 as const,
    display: "block" as const, marginBottom: "6px",
    textTransform: "uppercase" as const, letterSpacing: "0.5px",
  } as React.CSSProperties,
};

// ── Price bar ──────────────────────────────────────────────────────────────
function PriceBar({ min, max, modal }: { min: number; max: number; modal: number }) {
  const pct = max > min ? ((modal - min) / (max - min)) * 100 : 50;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569", marginBottom: 4 }}>
        <span>₹{min.toLocaleString("en-IN")}</span>
        <span style={{ color: "#4ADE80", fontWeight: 700 }}>₹{modal.toLocaleString("en-IN")}</span>
        <span>₹{max.toLocaleString("en-IN")}</span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 4, position: "relative" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${Math.min(pct, 100)}%`,
          background: "linear-gradient(90deg,#4ADE80,#22D3EE)",
          borderRadius: 4, transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{ ...S.card, textAlign: "center" }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#64748B" }}>{label}</div>
    </div>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ ...S.card, height: 155 }}>
      {[40, 20, 14, 14].map((w, i) => (
        <div key={i} style={{
          height: 12, marginBottom: 10,
          width: `${w + Math.random() * 30}%`,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 6, animation: "shimmer 1.4s ease-in-out infinite",
        }} />
      ))}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function MarketPricePage() {
  const [records, setRecords] = useState<MandiRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [states, setStates] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);
  const [filters, setFilters] = useState({ state: "Punjab", commodity: "", district: "", limit: 50 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<"modal_price" | "commodity" | "market">("modal_price");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"grid" | "table">("grid");

const FALLBACK_STATES = [
  "Punjab", "Haryana", "Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu",
];
const FALLBACK_COMMODITIES = [
  "Wheat", "Rice", "Maize", "Onion", "Tomato", "Potato", "Garlic", "Mustard",
];
const SAMPLE_MANDI_RECORDS: MandiRecord[] = [
  { state: "Punjab", district: "Ludhiana", market: "Ludhiana", commodity: "Wheat", variety: "Dara", min_price: 2150, max_price: 2400, modal_price: 2275, date: "14/05/2025" },
  { state: "Punjab", district: "Amritsar", market: "Amritsar", commodity: "Maize", variety: "Yellow", min_price: 2000, max_price: 2200, modal_price: 2100, date: "14/05/2025" },
  { state: "Maharashtra", district: "Nashik", market: "Lasalgaon", commodity: "Onion", variety: "Red", min_price: 1200, max_price: 2100, modal_price: 1700, date: "14/05/2025" },
  { state: "Karnataka", district: "Tumkur", market: "Tumkur", commodity: "Groundnut", variety: "Bold", min_price: 4800, max_price: 5500, modal_price: 5200, date: "14/05/2025" },
];

  useEffect(() => {
    mandiAPI.getStates()
      .then(r => setStates(r.data.states))
      .catch(() => setStates(FALLBACK_STATES));

    mandiAPI.getCommodities()
      .then(r => setCommodities(r.data.commodities))
      .catch(() => setCommodities(FALLBACK_COMMODITIES));

    fetchPrices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPrices = useCallback(async (overrides?: Partial<typeof filters>) => {
    setLoading(true);
    setError("");
    try {
      const p = { ...filters, ...overrides };
      const res = await mandiAPI.getPrices(p);
      setRecords(res.data.records || []);
      setTotal(res.data.total || 0);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError("Unable to fetch mandi prices from backend. Showing fallback sample data.");
      setRecords(SAMPLE_MANDI_RECORDS);
      setTotal(SAMPLE_MANDI_RECORDS.length);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const upd = (k: keyof typeof filters, v: string | number) =>
    setFilters(p => ({ ...p, [k]: v }));

  const toggleFav = (key: string) =>
    setFavorites(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const displayed = records
    .filter(r => {
      if (!search) return true;
      const s = search.toLowerCase();
      return r.commodity.toLowerCase().includes(s) ||
        r.market.toLowerCase().includes(s) ||
        r.district.toLowerCase().includes(s) ||
        r.state.toLowerCase().includes(s);
    })
    .sort((a, b) => {
      const av = a[sortBy], bv = b[sortBy];
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  const avgModal = displayed.length
    ? Math.round(displayed.reduce((s, r) => s + r.modal_price, 0) / displayed.length) : 0;
  const maxRec = displayed.reduce((m, r) => r.modal_price > (m?.modal_price ?? 0) ? r : m, displayed[0]);
  const minRec = displayed.reduce((m, r) => r.modal_price < (m?.modal_price ?? Infinity) ? r : m, displayed[0]);
  const uniqueMarkets = new Set(displayed.map(r => r.market)).size;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "white" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
            <span style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg,#F59E0B,#FBBF24)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>🏪</span>
            Mandi Market Prices
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 13, marginTop: 6 }}>
            Live rates from AGMARKNET • data.gov.in
            {lastUpdated && (
              <span style={{ color: "#4ADE80", marginLeft: 10, fontSize: 12 }}>
                ✓ Updated {lastUpdated.toLocaleTimeString("en-IN")}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setView(v => v === "grid" ? "table" : "grid")}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 14px",
              borderRadius: 10, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)", color: "#94A3B8",
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {view === "grid" ? <List size={14} /> : <BarChart2 size={14} />}
            {view === "grid" ? "Table View" : "Card View"}
          </button>
          <button
            onClick={() => fetchPrices()}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
              borderRadius: 10, background: "rgba(74,222,128,0.1)",
              border: "1px solid rgba(74,222,128,0.25)", color: "#4ADE80",
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...S.card, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Filter size={14} color="#F59E0B" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Filter Prices</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 12, alignItems: "flex-end" }} className="mkt-filters">
          <div>
            <label style={S.label}>State</label>
            <div style={{ position: "relative" }}>
              <select value={filters.state} onChange={e => upd("state", e.target.value)} style={S.select}>
                <option value="">All States</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} color="#64748B" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>
          <div>
            <label style={S.label}>Commodity</label>
            <div style={{ position: "relative" }}>
              <select value={filters.commodity} onChange={e => upd("commodity", e.target.value)} style={S.select}>
                <option value="">All Crops</option>
                {commodities.map(c => <option key={c} value={c}>{getIcon(c)} {c}</option>)}
              </select>
              <ChevronDown size={13} color="#64748B" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>
          <div>
            <label style={S.label}>District</label>
            <input type="text" placeholder="e.g. Ludhiana" value={filters.district}
              onChange={e => upd("district", e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchPrices()}
              style={S.input} />
          </div>
          <div>
            <label style={S.label}>Records</label>
            <div style={{ position: "relative" }}>
              <select value={filters.limit} onChange={e => upd("limit", parseInt(e.target.value))} style={S.select}>
                {[20, 50, 100].map(n => <option key={n} value={n}>{n} records</option>)}
              </select>
              <ChevronDown size={13} color="#64748B" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>
          <button onClick={() => fetchPrices()} disabled={loading} className="btn-primary"
            style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: 8, fontSize: 14, whiteSpace: "nowrap", borderRadius: 10 }}>
            <Search size={14} /> Search
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#F87171", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Stats */}
      {!loading && displayed.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}
          className="mkt-stats">
          <StatCard icon="📊" label="Total (India)" value={total.toLocaleString("en-IN")} color="#94A3B8" />
          <StatCard icon="📈" label="Avg Modal Price" value={`₹${avgModal.toLocaleString("en-IN")}/qtl`} color="#22D3EE" />
          <StatCard icon="⬆️" label="Highest Today" value={maxRec ? `₹${maxRec.modal_price.toLocaleString("en-IN")}` : "—"} color="#4ADE80" />
          <StatCard icon="🏪" label="Markets" value={uniqueMarkets.toString()} color="#F59E0B" />
        </motion.div>
      )}

      {/* Search + Sort bar */}
      {!loading && displayed.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
            <Search size={14} color="#64748B" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input type="text" placeholder="Filter results..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...S.input, paddingLeft: 36 }} />
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ color: "#64748B", fontSize: 12 }}>Sort:</span>
            {(["modal_price", "commodity", "market"] as const).map(col => (
              <button key={col} onClick={() => toggleSort(col)} style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: sortBy === col ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.04)",
                border: sortBy === col ? "1px solid rgba(74,222,128,0.35)" : "1px solid rgba(255,255,255,0.08)",
                color: sortBy === col ? "#4ADE80" : "#94A3B8",
                display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit",
              }}>
                {col === "modal_price" ? "Price" : col.charAt(0).toUpperCase() + col.slice(1)}
                <ArrowUpDown size={10} />
              </button>
            ))}
          </div>
          <span style={{ color: "#64748B", fontSize: 12 }}>
            Showing {displayed.length} of {records.length}
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* GRID VIEW */}
      {!loading && view === "grid" && (
        <AnimatePresence mode="wait">
          {displayed.length > 0 ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
              {displayed.map((r, i) => {
                const favKey = `${r.commodity}-${r.market}`;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.025, 0.35) }}
                    whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.18)" }}
                    style={{ ...S.card, cursor: "default", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 26 }}>{getIcon(r.commodity)}</span>
                        <div>
                          <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{r.commodity}</div>
                          {r.variety && r.variety !== r.commodity && (
                            <div style={{ color: "#64748B", fontSize: 11 }}>{r.variety}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                          padding: "4px 10px", borderRadius: 20,
                          background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)",
                          color: "#4ADE80", fontSize: 15, fontWeight: 800,
                        }}>
                          ₹{r.modal_price.toLocaleString("en-IN")}
                        </div>
                        <button onClick={() => toggleFav(favKey)} style={{
                          background: "none", border: "none", cursor: "pointer", color: favorites.has(favKey) ? "#FBBF24" : "#475569", padding: 2,
                        }}>
                          {favorites.has(favKey) ? <Star size={14} fill="#FBBF24" /> : <StarOff size={14} />}
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748B", fontSize: 11, marginBottom: 8 }}>
                      <MapPin size={10} />
                      <span>{r.market}{r.district ? ` • ${r.district}` : ""}</span>
                    </div>
                    <PriceBar min={r.min_price} max={r.max_price} modal={r.modal_price} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11 }}>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ color: "#F87171", display: "flex", alignItems: "center", gap: 2 }}>
                          <TrendingDown size={10} /> ₹{r.min_price.toLocaleString("en-IN")}
                        </span>
                        <span style={{ color: "#4ADE80", display: "flex", alignItems: "center", gap: 2 }}>
                          <TrendingUp size={10} /> ₹{r.max_price.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span style={{ color: "#475569" }}>{r.date || "Today"}</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            !error && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🏪</div>
                <p style={{ color: "#64748B", fontSize: 15 }}>
                  No records found. Try different filters or click <strong style={{ color: "#4ADE80" }}>Search</strong>.
                </p>
              </motion.div>
            )
          )}
        </AnimatePresence>
      )}

      {/* TABLE VIEW */}
      {!loading && view === "table" && displayed.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...S.card, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Commodity", "Market", "District", "State", "Min ₹", "Modal ₹", "Max ₹", "Date"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#64748B", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                    {getIcon(r.commodity)} {r.commodity}
                    {r.variety && r.variety !== r.commodity && (
                      <span style={{ color: "#64748B", fontWeight: 400, marginLeft: 6, fontSize: 11 }}>({r.variety})</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px", color: "#94A3B8" }}>{r.market}</td>
                  <td style={{ padding: "10px 12px", color: "#64748B" }}>{r.district}</td>
                  <td style={{ padding: "10px 12px", color: "#64748B" }}>{r.state}</td>
                  <td style={{ padding: "10px 12px", color: "#F87171" }}>₹{r.min_price.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "10px 12px", color: "#4ADE80", fontWeight: 700 }}>₹{r.modal_price.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "10px 12px", color: "#22D3EE" }}>₹{r.max_price.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "10px 12px", color: "#475569" }}>{r.date || "Today"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 28, padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
        <ExternalLink size={12} color="#475569" />
        <span style={{ color: "#475569", fontSize: 12 }}>
          Prices sourced from{" "}
          <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#4ADE80" }}>AGMARKNET</a>
          {" "}via{" "}
          <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#4ADE80" }}>data.gov.in</a>
          . Prices in ₹/quintal. Data may be 1–24 hrs delayed.
        </span>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0%,100% { opacity:0.4; } 50% { opacity:0.9; }
        }
        @media (max-width: 900px) {
          .mkt-filters { grid-template-columns: 1fr 1fr !important; }
          .mkt-stats   { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .mkt-filters { grid-template-columns: 1fr !important; }
          .mkt-stats   { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
