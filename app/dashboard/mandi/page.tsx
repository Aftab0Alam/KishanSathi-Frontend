"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Search, RefreshCw, MapPin,
  Wheat, Filter, AlertTriangle, ArrowUpDown, ChevronDown, ExternalLink,
} from "lucide-react";
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

// ── Style helpers ──────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
  padding: "20px",
};

const SELECT: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  background: "#0d1117",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "white",
  fontSize: "14px",
  outline: "none",
  appearance: "none",
  cursor: "pointer",
};

const LABEL: React.CSSProperties = {
  color: "#94A3B8",
  fontSize: "11px",
  fontWeight: 600,
  display: "block",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const INPUT: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  background: "#0d1117",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "white",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

// ── Commodity icons ────────────────────────────────────────────────────────
const COMMODITY_ICON: Record<string, string> = {
  Wheat: "🌾", Rice: "🍚", Maize: "🌽", Bajra: "🌾", Cotton: "🌿",
  Tomato: "🍅", Potato: "🥔", Onion: "🧅", Garlic: "🧄",
  Banana: "🍌", Mango: "🥭", Orange: "🍊", Lemon: "🍋",
  Sugarcane: "🎋", Soyabean: "🌱", Mustard: "🌻", Groundnut: "🥜",
};

function getIcon(commodity: string): string {
  for (const [key, icon] of Object.entries(COMMODITY_ICON)) {
    if (commodity.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "🌿";
}

// ── Price spread badge ─────────────────────────────────────────────────────
function PriceSpread({ min, max, modal }: { min: number; max: number; modal: number }) {
  const spread = max - min;
  const pct = max > 0 ? ((modal - min) / (max - min)) * 100 : 50;
  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#64748B", marginBottom: "4px" }}>
        <span>₹{min.toLocaleString("en-IN")}</span>
        <span>₹{max.toLocaleString("en-IN")}</span>
      </div>
      <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", position: "relative" }}>
        <div style={{
          position: "absolute", left: `${Math.min(pct, 95)}%`, top: "-3px",
          width: "10px", height: "10px", borderRadius: "50%",
          background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
          transform: "translateX(-50%)",
          boxShadow: "0 0 6px rgba(74,222,128,0.6)",
        }} />
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function MandiPricePage() {
  const [records, setRecords] = useState<MandiRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [states, setStates] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    state: "", commodity: "", district: "", limit: 30,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<"modal_price" | "commodity" | "market">("modal_price");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Load dropdowns on mount
  useEffect(() => {
    mandiAPI.getStates().then(r => setStates(r.data.states)).catch(() => {});
    mandiAPI.getCommodities().then(r => setCommodities(r.data.commodities)).catch(() => {});
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
      setError(
        e.response?.data?.detail ||
        "Unable to fetch mandi prices. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const upd = (k: keyof typeof filters, v: string | number) => {
    setFilters(p => ({ ...p, [k]: v }));
  };

  const handleSearch = () => fetchPrices();

  // Client-side filter by search term + sort
  const displayed = records
    .filter(r => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        r.commodity.toLowerCase().includes(s) ||
        r.market.toLowerCase().includes(s) ||
        r.district.toLowerCase().includes(s) ||
        r.state.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      let av: string | number = a[sortBy];
      let bv: string | number = b[sortBy];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  // Highlight stats
  const avgModal = displayed.length
    ? Math.round(displayed.reduce((s, r) => s + r.modal_price, 0) / displayed.length)
    : 0;
  const maxRecord = displayed.reduce((m, r) => r.modal_price > (m?.modal_price ?? 0) ? r : m, displayed[0]);
  const minRecord = displayed.reduce((m, r) => r.modal_price < (m?.modal_price ?? Infinity) ? r : m, displayed[0]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "30px" }}>🏪</span> Mandi Prices
          </h1>
          <p style={{ color: "#94A3B8", fontSize: "14px", marginTop: "4px" }}>
            Live market rates from AGMARKNET • data.gov.in
            {lastUpdated && (
              <span style={{ color: "#4ADE80", marginLeft: "10px", fontSize: "12px" }}>
                ✓ Updated {lastUpdated.toLocaleTimeString("en-IN")}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => fetchPrices()}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 18px", borderRadius: "10px",
            background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
            color: "#4ADE80", fontSize: "13px", fontWeight: 600, cursor: "pointer",
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ ...card, marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Filter size={14} color="#4ADE80" />
          <span style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>Filters</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "12px", alignItems: "flex-end" }}
             className="mandi-filters">
          {/* State */}
          <div>
            <label style={LABEL}>State</label>
            <div style={{ position: "relative" }}>
              <select
                value={filters.state}
                onChange={e => upd("state", e.target.value)}
                style={SELECT}
              >
                <option value="" style={{ background: "#0d1117" }}>All States</option>
                {states.map(s => <option key={s} value={s} style={{ background: "#0d1117" }}>{s}</option>)}
              </select>
              <ChevronDown size={14} color="#64748B" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Commodity */}
          <div>
            <label style={LABEL}>Commodity</label>
            <div style={{ position: "relative" }}>
              <select
                value={filters.commodity}
                onChange={e => upd("commodity", e.target.value)}
                style={SELECT}
              >
                <option value="" style={{ background: "#0d1117" }}>All Crops</option>
                {commodities.map(c => <option key={c} value={c} style={{ background: "#0d1117" }}>{getIcon(c)} {c}</option>)}
              </select>
              <ChevronDown size={14} color="#64748B" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* District */}
          <div>
            <label style={LABEL}>District</label>
            <input
              type="text"
              placeholder="e.g. Ludhiana"
              value={filters.district}
              onChange={e => upd("district", e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={INPUT}
            />
          </div>

          {/* Limit */}
          <div>
            <label style={LABEL}>Show</label>
            <div style={{ position: "relative" }}>
              <select
                value={filters.limit}
                onChange={e => upd("limit", parseInt(e.target.value))}
                style={SELECT}
              >
                {[20, 30, 50, 100].map(n => (
                  <option key={n} value={n} style={{ background: "#0d1117" }}>{n} records</option>
                ))}
              </select>
              <ChevronDown size={14} color="#64748B" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary"
            style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", whiteSpace: "nowrap" }}
          >
            <Search size={14} />
            Search
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#F87171", fontSize: "13px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Stats bar */}
      {displayed.length > 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}
          className="stats-grid"
        >
          {[
            { label: "Total Records (India)", value: total.toLocaleString("en-IN"), color: "#94A3B8", icon: "📊" },
            { label: "Avg Modal Price", value: `₹${avgModal.toLocaleString("en-IN")}/qtl`, color: "#22D3EE", icon: "📈" },
            { label: "Highest Today", value: maxRecord ? `₹${maxRecord.modal_price.toLocaleString("en-IN")} — ${maxRecord.commodity}` : "—", color: "#4ADE80", icon: "⬆️" },
            { label: "Lowest Today", value: minRecord ? `₹${minRecord.modal_price.toLocaleString("en-IN")} — ${minRecord.commodity}` : "—", color: "#F87171", icon: "⬇️" },
          ].map(({ label, value, color, icon }) => (
            <div key={label} style={{ ...card, textAlign: "center" }}>
              <div style={{ fontSize: "22px", marginBottom: "4px" }}>{icon}</div>
              <div style={{ fontSize: "15px", fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "3px" }}>{label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ ...card, height: "140px", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      )}

      {/* Search bar (client-side filter) */}
      {!loading && displayed.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "320px" }}>
            <Search size={14} color="#64748B" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Filter results..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...INPUT, paddingLeft: "36px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ color: "#64748B", fontSize: "12px" }}>Sort by:</span>
            {(["modal_price", "commodity", "market"] as const).map(col => (
              <button
                key={col}
                onClick={() => toggleSort(col)}
                style={{
                  padding: "6px 12px", borderRadius: "8px", fontSize: "12px",
                  fontWeight: 600, cursor: "pointer",
                  background: sortBy === col ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)",
                  border: sortBy === col ? "1px solid rgba(74,222,128,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  color: sortBy === col ? "#4ADE80" : "#94A3B8",
                  display: "flex", alignItems: "center", gap: "4px",
                }}
              >
                {col === "modal_price" ? "Price" : col.charAt(0).toUpperCase() + col.slice(1)}
                <ArrowUpDown size={10} />
              </button>
            ))}
          </div>

          <span style={{ color: "#64748B", fontSize: "12px" }}>
            Showing {displayed.length} of {records.length} loaded
          </span>
        </div>
      )}

      {/* Cards grid */}
      {!loading && (
        <AnimatePresence mode="wait">
          {displayed.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}
            >
              {displayed.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  style={{
                    ...card,
                    borderColor: "rgba(255,255,255,0.1)",
                    transition: "border-color 0.2s, transform 0.2s",
                    cursor: "default",
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "24px" }}>{getIcon(r.commodity)}</span>
                      <div>
                        <div style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>{r.commodity}</div>
                        {r.variety && r.variety !== r.commodity && (
                          <div style={{ color: "#64748B", fontSize: "11px" }}>{r.variety}</div>
                        )}
                      </div>
                    </div>
                    <div style={{
                      padding: "4px 10px", borderRadius: "20px",
                      background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)",
                      color: "#4ADE80", fontSize: "16px", fontWeight: 800,
                    }}>
                      ₹{r.modal_price.toLocaleString("en-IN")}
                    </div>
                  </div>

                  {/* Location */}
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748B", fontSize: "12px", marginBottom: "8px" }}>
                    <MapPin size={11} />
                    <span>{r.market}</span>
                    {r.district && <span>• {r.district}</span>}
                  </div>

                  {/* Min / Max spread */}
                  <PriceSpread min={r.min_price} max={r.max_price} modal={r.modal_price} />

                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ color: "#F87171", fontSize: "11px" }}>
                        <TrendingDown size={10} style={{ display: "inline", marginRight: "2px" }} />
                        ₹{r.min_price.toLocaleString("en-IN")}
                      </span>
                      <span style={{ color: "#4ADE80", fontSize: "11px" }}>
                        <TrendingUp size={10} style={{ display: "inline", marginRight: "2px" }} />
                        ₹{r.max_price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <span style={{ color: "#475569", fontSize: "10px" }}>{r.date || "Today"}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: "center", padding: "60px 20px" }}
              >
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>🏪</div>
                <p style={{ color: "#64748B", fontSize: "15px" }}>
                  No records found. Try different filters or click <strong style={{ color: "#4ADE80" }}>Search</strong>.
                </p>
              </motion.div>
            )
          )}
        </AnimatePresence>
      )}

      {/* Source note */}
      <div style={{ marginTop: "28px", padding: "12px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "8px" }}>
        <ExternalLink size={12} color="#475569" />
        <span style={{ color: "#475569", fontSize: "12px" }}>
          Prices sourced from{" "}
          <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#4ADE80" }}>AGMARKNET</a>
          {" "}via{" "}
          <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#4ADE80" }}>data.gov.in</a>
          . Prices in ₹/quintal. Data may be 1–24 hrs delayed.
        </span>
      </div>

      {/* Responsive styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .mandi-filters { grid-template-columns: 1fr 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .mandi-filters { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
