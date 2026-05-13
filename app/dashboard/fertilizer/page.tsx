"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, Loader2, CheckCircle, AlertTriangle,
  Leaf, Scale, Calendar, Microscope, IndianRupee, Sprout,
  ChevronDown, Thermometer, Droplets, Sparkles, ArrowRight,
} from "lucide-react";
import { fertilizerAPI } from "@/services/api";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { saveReport } from "@/utils/reportStore";

const CROPS = [
  "Wheat — Gehu","Rice — Dhan","Cotton — Kapas","Sugarcane — Ganna",
  "Tomato — Tamatar","Potato — Aloo","Onion — Pyaaz","Maize — Makka",
  "Soybean","Mustard — Sarson","Groundnut — Moongfali","Chilli — Mirch",
  "Bajra — Pearl Millet","Jowar — Sorghum","Arhar — Tur Dal","Moong — Green Gram",
];
const SOILS = [
  "Clay — Chikni Mitti","Sandy — Retili Mitti","Loamy — Domat Mitti",
  "Black Cotton Soil","Red Soil","Alluvial — Jalodh Mitti","Laterite","Saline — Namkeen",
];
const STATES = [
  "Punjab","Haryana","Uttar Pradesh","Madhya Pradesh","Rajasthan",
  "Maharashtra","Gujarat","Bihar","West Bengal","Karnataka",
  "Andhra Pradesh","Tamil Nadu","Telangana","Odisha","Chhattisgarh",
  "Himachal Pradesh","Uttarakhand","Jharkhand","Assam",
];
const SEASONS = [
  "Kharif — June to October","Rabi — November to March",
  "Zaid — March to June","Year Round",
];
const IRRIGATIONS = ["Canal","Borewell","Rain-fed","Drip Irrigation","Sprinkler"];

const RESULT_ITEMS = [
  { key: "primary_fertilizer", label: "Primary Fertilizer", Icon: FlaskConical, color: "#FBBF24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
  { key: "npk_ratio",          label: "NPK Ratio",          Icon: Microscope,   color: "#A78BFA", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
  { key: "quantity_per_acre",  label: "Qty per Acre",       Icon: Scale,        color: "#22D3EE", bg: "rgba(34,211,238,0.08)",  border: "rgba(34,211,238,0.2)"  },
  { key: "application_timing", label: "Apply Timing",       Icon: Calendar,     color: "#4ADE80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)"  },
  { key: "application_method", label: "Method",             Icon: Sprout,       color: "#4ADE80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)"  },
  { key: "cost_estimate",      label: "Est. Cost",          Icon: IndianRupee,  color: "#FBBF24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
];

function SelectField({ label, hint, icon: Icon, color, name, value, options, onChange, required }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {Icon && <Icon size={12} color={color || "#FBBF24"} />}
        <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.8px" }}>
          {label}
        </label>
      </div>
      {hint && <p style={{ fontSize: "11px", color: "#475569", marginTop: "-2px" }}>{hint}</p>}
      <div style={{ position: "relative" }}>
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="input-field"
          style={{ paddingRight: "38px", cursor: "pointer" }}
        >
          <option value="" style={{background:"#0d1117",color:"#94A3B8"}}>Select {label}</option>
          {options.map((o: string) => <option key={o} value={o} style={{background:"#0d1117",color:"white"}}>{o}</option>)}
        </select>
        <ChevronDown size={14} color="#64748B" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

export default function FertilizerPage() {
  const [form, setForm] = useState({
    crop_type: "", soil_type: "", state: "", season: "",
    irrigation: "", disease: "None", temperature: "", humidity: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<any>(null);
  const [error, setError]     = useState("");
  const { language, t } = useLanguage();

  const upd = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fertilizerAPI.recommend({ ...form, language });
      const rec = res.data.recommendation;
      setResult(rec);
      // Save to local report store so Reports page shows it immediately
      saveReport({
        type: "fertilizer",
        crop: form.crop_type || "Unknown Crop",
        finding: `${rec.primary_fertilizer || "Fertilizer"} — NPK ${rec.npk_ratio || "—"} — ${rec.quantity_per_acre || "—"}/Acre`,
        detail: `Season: ${form.season}. Soil: ${form.soil_type}. Method: ${rec.application_method || "—"}. ${rec.application_timing || ""}`,
        status: "Applied",
        statusColor: "#FBBF24",
        raw: rec,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Request failed. Please try again.");
    } finally { setLoading(false); }
  };

  const filled = [form.crop_type, form.soil_type, form.state, form.season].filter(Boolean).length;
  const progress = (filled / 4) * 100;

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "16px",
            background: "linear-gradient(135deg,rgba(251,191,36,0.2),rgba(251,191,36,0.05))",
            border: "1px solid rgba(251,191,36,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(251,191,36,0.15)",
          }}>
            <FlaskConical size={24} color="#FBBF24" />
          </div>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "white", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              {t("fertilizer")}
            </h1>
            <p style={{ color: "#64748B", fontSize: "13px", marginTop: "4px", display: "flex", alignItems: "center", gap: "5px" }}>
              <Sparkles size={12} color="#FBBF24" />
              AI-powered NPK &amp; fertilizer recommendations
            </p>
          </div>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="responsive-grid">

        {/* ── Left: Form ── */}
        <form onSubmit={submit}>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            overflow: "hidden",
          }}>
            {/* Card header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(251,191,36,0.04)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Leaf size={15} color="#FBBF24" />
                <span style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>Farm Details</span>
              </div>
              {/* Progress pills */}
              <div style={{ display: "flex", gap: "4px" }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{
                    width: "28px", height: "4px", borderRadius: "2px",
                    background: i < filled ? "#FBBF24" : "rgba(255,255,255,0.1)",
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <SelectField label="Crop Type"    hint="What are you growing?"     icon={Leaf}        color="#4ADE80" name="crop_type" value={form.crop_type} options={CROPS}      onChange={upd} required />
              <SelectField label="Soil Type"    hint="Your field's soil type"    icon={Microscope}  color="#22D3EE" name="soil_type" value={form.soil_type} options={SOILS}      onChange={upd} required />
              <SelectField label="State"        hint="Your farming state"        icon={null}                        name="state"     value={form.state}     options={STATES}     onChange={upd} required />
              <SelectField label="Season"       hint="Current farming season"    icon={Calendar}    color="#A78BFA" name="season"    value={form.season}    options={SEASONS}    onChange={upd} required />
              <SelectField label="Irrigation"   hint=""                          icon={Droplets}    color="#22D3EE" name="irrigation" value={form.irrigation} options={IRRIGATIONS} onChange={upd} />

              {/* Temp + Humidity row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Thermometer size={12} color="#F87171" />
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.8px" }}>Temp °C</label>
                  </div>
                  <input type="number" name="temperature" value={form.temperature} onChange={upd}
                    placeholder="e.g. 28" className="input-field" style={{ fontSize: "14px" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Droplets size={12} color="#22D3EE" />
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.8px" }}>Humidity %</label>
                  </div>
                  <input type="number" name="humidity" value={form.humidity} onChange={upd}
                    placeholder="e.g. 65" className="input-field" style={{ fontSize: "14px" }} />
                </div>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="btn-primary"
                style={{
                  width: "100%", padding: "15px", fontSize: "15px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  marginTop: "4px", opacity: loading ? 0.75 : 1,
                  background: "linear-gradient(135deg,#FBBF24,#F59E0B)",
                  boxShadow: loading ? "none" : "0 8px 24px rgba(251,191,36,0.3)",
                }}
              >
                {loading
                  ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Generating AI Plan…</>
                  : <><FlaskConical size={17} /> Get AI Fertilizer Plan <ArrowRight size={15} /></>}
              </motion.button>

              {error && (
                <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#F87171", fontSize: "13px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: "1px" }} /> {error}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* ── Right: Results ── */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}>
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px", overflow: "hidden",
              }}>
                {/* Result header */}
                <div style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: "linear-gradient(135deg,rgba(74,222,128,0.08),rgba(34,211,238,0.04))",
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle size={16} color="#4ADE80" />
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>Fertilizer Plan Ready</div>
                    <div style={{ color: "#64748B", fontSize: "11px" }}>AI-generated for your crop &amp; soil</div>
                  </div>
                  <div style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: "20px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", color: "#4ADE80", fontSize: "11px", fontWeight: 700 }}>
                    ✓ Done
                  </div>
                </div>

                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {RESULT_ITEMS.map(({ key, label, Icon, color, bg, border }) => result[key] && (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * RESULT_ITEMS.findIndex(r => r.key === key) }}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 14px", borderRadius: "12px",
                        background: bg, border: `1px solid ${border}`,
                      }}
                    >
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={15} color={color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 700 }}>{label}</div>
                        <div style={{ fontSize: "13px", color: "white", fontWeight: 600, marginTop: "2px", lineHeight: 1.4 }}>{result[key]}</div>
                      </div>
                    </motion.div>
                  ))}

                  {result.organic_alternatives?.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                      style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", marginTop: "4px" }}>
                      <div style={{ color: "#4ADE80", fontWeight: 700, fontSize: "12px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Leaf size={12} /> Organic Alternatives
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        {result.organic_alternatives.map((o: string) => (
                          <div key={o} style={{ color: "#94A3B8", fontSize: "13px", display: "flex", gap: "8px" }}>
                            <span style={{ color: "#4ADE80" }}>→</span> {o}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {result.weather_warnings && (
                    <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <AlertTriangle size={14} color="#FBBF24" style={{ flexShrink: 0, marginTop: "1px" }} />
                      <p style={{ color: "#FBBF24", fontSize: "12px", lineHeight: 1.5 }}>{result.weather_warnings}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{
                minHeight: "420px", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.02)",
                border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: "24px", padding: "40px 32px", textAlign: "center",
              }}>
                {loading ? (
                  <>
                    <div style={{ position: "relative", marginBottom: "24px" }}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Loader2 size={34} color="#FBBF24" style={{ animation: "spin 1s linear infinite" }} />
                      </div>
                      <div style={{ position: "absolute", inset: "-4px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#FBBF24", animation: "spin 2s linear infinite" }} />
                    </div>
                    <p style={{ color: "white", fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>Calculating Your Plan…</p>
                    <p style={{ color: "#64748B", fontSize: "13px", lineHeight: 1.6 }}>AI is analyzing soil, season &amp; crop data</p>
                  </>
                ) : (
                  <>
                    {/* Steps */}
                    <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "linear-gradient(135deg,rgba(251,191,36,0.15),rgba(251,191,36,0.05))", border: "1px solid rgba(251,191,36,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: "0 0 32px rgba(251,191,36,0.1)" }}>
                      <FlaskConical size={28} color="#FBBF24" strokeWidth={1.5} />
                    </div>
                    <p style={{ color: "white", fontWeight: 800, fontSize: "16px", marginBottom: "8px", letterSpacing: "-0.02em" }}>AI Plan Appears Here</p>
                    <p style={{ color: "#64748B", fontSize: "13px", lineHeight: 1.7, marginBottom: "28px", maxWidth: "280px" }}>
                      Fill crop, soil &amp; state details — then tap <strong style={{ color: "#FBBF24" }}>Get AI Fertilizer Plan</strong>
                    </p>

                    {/* Mini step indicators */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "240px" }}>
                      {[
                        { label: "Crop Type", done: !!form.crop_type },
                        { label: "Soil Type", done: !!form.soil_type },
                        { label: "State",     done: !!form.state     },
                        { label: "Season",    done: !!form.season    },
                      ].map(({ label, done }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: done ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${done ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {done && <CheckCircle size={10} color="#4ADE80" />}
                          </div>
                          <span style={{ fontSize: "12px", color: done ? "#4ADE80" : "#475569", fontWeight: done ? 600 : 400 }}>{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginTop: "20px", width: "100%", maxWidth: "240px", height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                      <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}
                        style={{ height: "100%", background: "linear-gradient(90deg,#FBBF24,#4ADE80)", borderRadius: "2px" }} />
                    </div>
                    <p style={{ color: "#475569", fontSize: "11px", marginTop: "8px" }}>{filled} of 4 required fields filled</p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:768px){.responsive-grid{grid-template-columns:1fr!important;}}
        select option{background:#0f172a;color:white;}
        .input-field:focus{border-color:#FBBF24!important;box-shadow:0 0 0 3px rgba(251,191,36,0.12)!important;}
      `}</style>
    </div>
  );
}
