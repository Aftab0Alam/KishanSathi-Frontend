"use client"

export const dynamic = 'force-dynamic'
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Loader2, CheckCircle } from "lucide-react";
import { cropAPI } from "@/services/api";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

const SOILS = ["Clay","Sandy","Loamy","Black Cotton","Red","Alluvial","Laterite"];
const STATES = ["Punjab","Haryana","Uttar Pradesh","Madhya Pradesh","Rajasthan","Maharashtra","Gujarat","Bihar","West Bengal","Karnataka","Andhra Pradesh","Tamil Nadu"];
const SEASONS = ["Kharif (June-Oct)","Rabi (Nov-Mar)","Zaid (Mar-June)","Year Round"];
const SCORE_COLOR = (s: number) => s >= 80 ? "#4ADE80" : s >= 60 ? "#FBBF24" : "#F87171";

const SELECT_STYLE: React.CSSProperties = {
  display: "block", width: "100%", padding: "10px 14px", borderRadius: "10px",
  background: "#0d1117", border: "1px solid rgba(255,255,255,0.18)",
  color: "white", fontSize: "14px", outline: "none", appearance: "none", cursor: "pointer",
};
const LABEL_STYLE: React.CSSProperties = {
  color: "#94A3B8", fontSize: "11px", fontWeight: 600, display: "block",
  marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px",
};
const INPUT_STYLE: React.CSSProperties = {
  display: "block", width: "100%", padding: "10px 14px", borderRadius: "10px",
  background: "#0d1117", border: "1px solid rgba(255,255,255,0.18)",
  color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box",
};

export default function CropsPage() {
  const [form, setForm] = useState({ soil_type:"",state:"",district:"",season:"",rainfall:"",temperature:"",humidity:"",farm_size:"" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const { language } = useLanguage();
  const upd = (k: string, v: string) => setForm(p => ({...p,[k]:v}));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(""); setResult(null);
    try {
      const res = await cropAPI.recommend({...form, language,
        rainfall: parseFloat(form.rainfall)||800, temperature: parseFloat(form.temperature)||25,
        humidity: parseFloat(form.humidity)||65, farm_size: parseFloat(form.farm_size)||5 });
      setResult(res.data.recommendations);
    } catch (e: any) { setError(e.response?.data?.detail||"Request failed."); }
    finally { setLoading(false); }
  };

  const selectFields = [
    { k: "soil_type", label: "Soil Type", opts: SOILS },
    { k: "state",     label: "State",     opts: STATES },
    { k: "season",    label: "Season",    opts: SEASONS },
  ];

  const numberFields = [
    { k: "rainfall",    placeholder: "800",  label: "Rainfall (mm)" },
    { k: "temperature", placeholder: "25",   label: "Temperature (°C)" },
    { k: "humidity",    placeholder: "65",   label: "Humidity (%)" },
    { k: "farm_size",   placeholder: "5",    label: "Farm Size (acres)" },
  ];

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"28px",flexWrap:"wrap",gap:"12px" }}>
        <div>
          <h1 style={{ fontSize:"26px",fontWeight:800,color:"white" }}>🌱 Crop Recommendation</h1>
          <p style={{ color:"#94A3B8",fontSize:"14px",marginTop:"4px" }}>AI crop recommendation based on your conditions</p>
        </div>
        <LanguageSwitcher />
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px" }} className="responsive-grid">
        <form onSubmit={submit}>
          <div style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"20px",padding:"24px",display:"flex",flexDirection:"column",gap:"14px" }}>
            <h2 style={{ color:"white",fontWeight:700,fontSize:"16px" }}>🌾 Farm Conditions</h2>

            {/* Dropdowns */}
            {selectFields.map(({ k, label, opts }) => (
              <div key={k}>
                <label style={LABEL_STYLE}>{label}</label>
                <select value={(form as any)[k]} onChange={e => upd(k, e.target.value)} required style={SELECT_STYLE}>
                  <option value="" style={{ background:"#0d1117", color:"#94A3B8" }}>Select {label}</option>
                  {opts.map(o => <option key={o} value={o} style={{ background:"#0d1117", color:"white" }}>{o}</option>)}
                </select>
              </div>
            ))}

            {/* District */}
            <div>
              <label style={LABEL_STYLE}>District (Optional)</label>
              <input value={form.district} onChange={e => upd("district", e.target.value)} placeholder="e.g. Ludhiana" style={INPUT_STYLE} />
            </div>

            {/* Number inputs */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px" }}>
              {numberFields.map(({ k, placeholder, label }) => (
                <div key={k}>
                  <label style={LABEL_STYLE}>{label}</label>
                  <input type="number" value={(form as any)[k]} onChange={e => upd(k, e.target.value)} placeholder={placeholder} style={INPUT_STYLE} />
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width:"100%",padding:"13px",fontSize:"15px",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",marginTop:"4px" }}>
              {loading ? <><Loader2 size={17} style={{animation:"spin 1s linear infinite"}}/> Analyzing...</> : <><Leaf size={17}/> Get Crop Recommendations</>}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {result?.recommended_crops?.length > 0 ? (
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{ display:"flex",flexDirection:"column",gap:"12px" }}>
              {result.recommended_crops.slice(0,4).map((crop: any, i: number) => (
                <div key={i} style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",padding:"18px" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px" }}>
                    <div style={{ fontSize:"16px",fontWeight:700,color:"white" }}>🌾 {crop.crop}</div>
                    <div style={{ padding:"4px 12px",borderRadius:"20px",fontSize:"13px",fontWeight:700,background:`${SCORE_COLOR(crop.suitability_score)}22`,color:SCORE_COLOR(crop.suitability_score),border:`1px solid ${SCORE_COLOR(crop.suitability_score)}44` }}>
                      {crop.suitability_score}% Match
                    </div>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px" }}>
                    {[
                      ["💧 Water", crop.water_requirement],
                      ["📈 Yield", crop.expected_yield],
                      ["⚙️ Difficulty", crop.farming_difficulty],
                      ["📅 Season", crop.seasonal_fit],
                    ].map(([k, v]) => v && (
                      <div key={k as string} style={{ fontSize:"12px" }}>
                        <span style={{ color:"#64748B" }}>{k}: </span>
                        <span style={{ color:"#CBD5E1",fontWeight:500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {crop.reason && <p style={{ color:"#94A3B8",fontSize:"12px",marginTop:"10px",lineHeight:1.6 }}>{crop.reason}</p>}
                </div>
              ))}
              {result.soil_preparation && (
                <div style={{ padding:"14px",borderRadius:"12px",background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.2)" }}>
                  <div style={{ color:"#4ADE80",fontWeight:600,fontSize:"12px",marginBottom:"6px" }}>🌿 Soil Preparation</div>
                  <p style={{ color:"#94A3B8",fontSize:"13px",lineHeight:1.6 }}>{result.soil_preparation}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"20px",padding:"40px",textAlign:"center" }}>
              <div>
                <div style={{ fontSize:"48px",marginBottom:"12px" }}>🌾</div>
                <p style={{ color:"#64748B",fontSize:"14px" }}>Fill farm details to get AI crop recommendations</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {error && <div style={{ marginTop:"16px",padding:"12px 16px",borderRadius:"10px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",color:"#F87171",fontSize:"13px" }}>{error}</div>}
    </div>
  );
}
