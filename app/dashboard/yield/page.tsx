"use client"

export const dynamic = 'force-dynamic'
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Loader2, AlertTriangle } from "lucide-react";
import { cropAPI } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

const CROPS = ["Wheat","Rice","Cotton","Sugarcane","Tomato","Potato","Onion","Maize","Soybean","Mustard"];
const SOILS = ["Clay","Sandy","Loamy","Black Cotton","Red","Alluvial"];
const STATES = ["Punjab","Haryana","UP","MP","Rajasthan","Maharashtra","Gujarat","Bihar"];
const RISK_COLOR: Record<string,string> = { Low:"#4ADE80", Medium:"#FBBF24", High:"#F87171" };

const SELECT_STYLE: React.CSSProperties = {
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

const LABEL_STYLE: React.CSSProperties = {
  color: "#94A3B8",
  fontSize: "11px",
  fontWeight: 600,
  display: "block",
  marginBottom: "5px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const INPUT_STYLE: React.CSSProperties = {
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

export default function YieldPage() {
  const [form, setForm] = useState({
    crop_type: "", land_area: "", soil_type: "",
    rainfall: "", temperature: "", fertilizer_usage: "",
    irrigation_level: "", state: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const { language } = useLanguage();

  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await cropAPI.predictYield({
        ...form,
        language,
        land_area: parseFloat(form.land_area) || 5,
        rainfall: parseFloat(form.rainfall) || 800,
        temperature: parseFloat(form.temperature) || 25,
      });
      setResult(res.data.prediction);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? [
    { name: "Revenue",    value: result.estimated_profit_inr, fill: "#4ADE80" },
    { name: "Cost",       value: result.farming_cost_inr,     fill: "#F87171" },
    { name: "Net Profit", value: result.net_profit_inr,       fill: "#22D3EE" },
  ] : [];

  const selectFields = [
    { k: "crop_type",        label: "Crop",          opts: CROPS },
    { k: "soil_type",        label: "Soil Type",     opts: SOILS },
    { k: "state",            label: "State",         opts: STATES },
    { k: "irrigation_level", label: "Irrigation",    opts: ["High","Medium","Low","Rain-fed"] },
    { k: "fertilizer_usage", label: "Fertilizer Use",opts: ["Heavy","Moderate","Low","Organic Only"] },
  ];

  const numberFields = [
    { k: "land_area",    placeholder: "5",   label: "Land (Acres)" },
    { k: "rainfall",     placeholder: "800", label: "Rainfall (mm)" },
    { k: "temperature",  placeholder: "25",  label: "Temperature (°C)" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"28px", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <h1 style={{ fontSize:"26px", fontWeight:800, color:"white" }}>
            📊 Yield Prediction
          </h1>
          <p style={{ color:"#94A3B8", fontSize:"14px", marginTop:"4px" }}>
            AI-powered crop yield &amp; profit prediction
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:"24px" }} className="responsive-grid">
        {/* ── Form ── */}
        <form onSubmit={submit}>
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}>
            <h2 style={{ color:"white", fontWeight:700, fontSize:"16px" }}>🌾 Farm Data</h2>

            {/* Dropdowns */}
            {selectFields.map(({ k, label, opts }) => (
              <div key={k}>
                <label style={LABEL_STYLE}>{label}</label>
                <select
                  value={(form as any)[k]}
                  onChange={e => upd(k, e.target.value)}
                  required
                  style={SELECT_STYLE}
                >
                  <option value="" style={{ background:"#0d1117", color:"#94A3B8" }}>
                    Select {label}
                  </option>
                  {opts.map(o => (
                    <option key={o} value={o} style={{ background:"#0d1117", color:"white" }}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Number inputs */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
              {numberFields.map(({ k, placeholder, label }) => (
                <div key={k}>
                  <label style={LABEL_STYLE}>{label}</label>
                  <input
                    type="number"
                    value={(form as any)[k]}
                    onChange={e => upd(k, e.target.value)}
                    placeholder={placeholder}
                    style={INPUT_STYLE}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width:"100%", padding:"13px", fontSize:"15px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginTop:"4px" }}
            >
              {loading
                ? <><Loader2 size={17} style={{ animation:"spin 1s linear infinite" }} /> Predicting…</>
                : <><BarChart3 size={17} /> Predict Yield</>
              }
            </button>
          </div>
        </form>

        {/* ── Results ── */}
        <AnimatePresence>
          {result ? (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {/* Key metrics */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                {[
                  { label:"Yield per Acre",     value:`${result.expected_yield_kg_per_acre?.toLocaleString()} kg`, color:"#4ADE80" },
                  { label:"Total Production",   value:`${result.total_production_kg?.toLocaleString()} kg`,        color:"#22D3EE" },
                  { label:"Estimated Revenue",  value:`₹${result.estimated_profit_inr?.toLocaleString()}`,          color:"#FBBF24" },
                  { label:"Net Profit",         value:`₹${result.net_profit_inr?.toLocaleString()}`,               color:"#4ADE80" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"14px", padding:"16px", textAlign:"center" }}>
                    <div style={{ fontSize:"20px", fontWeight:800, color }}>{value}</div>
                    <div style={{ fontSize:"11px", color:"#64748B", marginTop:"4px" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"20px" }}>
                  <div style={{ fontWeight:600, color:"white", fontSize:"13px", marginBottom:"16px" }}>📊 Financial Overview (₹)</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip contentStyle={{ background:"#0a0f1e", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"white" }} />
                      <Bar dataKey="value" radius={[6,6,0,0]}>
                        {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Risk */}
              {result.risk_level && (
                <div style={{ padding:"14px 18px", borderRadius:"12px", background:`${RISK_COLOR[result.risk_level]||"#94A3B8"}22`, border:`1px solid ${RISK_COLOR[result.risk_level]||"#94A3B8"}44` }}>
                  <div style={{ fontWeight:600, color:RISK_COLOR[result.risk_level]||"#94A3B8", fontSize:"13px", marginBottom:"8px" }}>
                    <AlertTriangle size={14} style={{ display:"inline", marginRight:"6px" }} />
                    Risk Level: {result.risk_level}
                  </div>
                  {result.risk_factors?.map((r: string, i: number) => (
                    <div key={i} style={{ color:"#94A3B8", fontSize:"12px", marginBottom:"4px" }}>• {r}</div>
                  ))}
                </div>
              )}

              {/* Tips */}
              {result.improvement_tips?.length > 0 && (
                <div style={{ background:"rgba(74,222,128,0.06)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:"12px", padding:"14px" }}>
                  <div style={{ color:"#4ADE80", fontWeight:600, fontSize:"13px", marginBottom:"8px" }}>💡 Improvement Tips</div>
                  {result.improvement_tips.map((tip: string, i: number) => (
                    <div key={i} style={{ color:"#94A3B8", fontSize:"12px", marginBottom:"4px" }}>• {tip}</div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"20px", padding:"40px", textAlign:"center" }}>
              <div>
                <div style={{ fontSize:"48px", marginBottom:"12px" }}>📊</div>
                <p style={{ color:"#64748B", fontSize:"14px" }}>Enter farm details to predict yield and profit</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop:"16px", padding:"12px 16px", borderRadius:"10px", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:"#F87171", fontSize:"13px" }}>
          {error}
        </div>
      )}
    </div>
  );
}
