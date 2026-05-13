"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Download, Share2, Microscope, FlaskConical,
  BarChart3, Leaf, AlertTriangle, CheckCircle2,
  Clock, RefreshCw, Loader2, FileDown, Trash2,
  Sparkles, TrendingUp,
} from "lucide-react";
import { getReports, clearReports, LocalReport } from "@/utils/reportStore";

type FilterType = "all" | "disease" | "fertilizer" | "yield";

const TYPE_CFG = {
  disease:    { icon: Microscope,   color: "#F87171", bg: "rgba(248,113,113,0.08)",  border: "rgba(248,113,113,0.2)",  label: "Disease Report"    },
  fertilizer: { icon: FlaskConical, color: "#FBBF24", bg: "rgba(251,191,36,0.08)",   border: "rgba(251,191,36,0.2)",   label: "Fertilizer Report" },
  yield:      { icon: BarChart3,    color: "#4ADE80", bg: "rgba(74,222,128,0.08)",   border: "rgba(74,222,128,0.2)",   label: "Yield Prediction"  },
};

const FILTERS: { type: FilterType; icon: any; label: string }[] = [
  { type: "all",        icon: FileText,    label: "All"        },
  { type: "disease",    icon: Microscope,  label: "Disease"    },
  { type: "fertilizer", icon: FlaskConical,label: "Fertilizer" },
  { type: "yield",      icon: BarChart3,   label: "Yield"      },
];

async function generatePDF(r: LocalReport) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const cfg = TYPE_CFG[r.type];
  const dark: [number,number,number]  = [5, 8, 22];
  const gray: [number,number,number]  = [100, 116, 139];
  const green: [number,number,number] = [74, 222, 128];

  // ── Header bar ──
  doc.setFillColor(...green);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(...dark);
  doc.setFontSize(20); doc.setFont("helvetica", "bold");
  doc.text("KisanSathi", 15, 13);
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text("Smart AI Farming Platform", 15, 21);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 195, 21, { align: "right" });

  // ── Report type banner ──
  doc.setFillColor(240, 253, 244);
  doc.rect(0, 30, 210, 16, "F");
  doc.setTextColor(...dark);
  doc.setFontSize(13); doc.setFont("helvetica", "bold");
  doc.text(cfg.label.toUpperCase(), 15, 41);
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text(`ID: ${r.id}`, 195, 41, { align: "right" });

  let y = 60;

  // ── Info table ──
  const dateStr = r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—";
  const rows: [string, string][] = [
    ["Crop",     r.crop    || "—"],
    ["Date",     dateStr],
    ["Status",   r.status  || "—"],
    ["Category", cfg.label],
  ];
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...dark);
    doc.text(`${k}:`, 15, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...gray);
    doc.text(v, 55, y);
    y += 9;
  });

  y += 4;

  // ── Findings ──
  doc.setFillColor(...green);
  doc.rect(15, y, 180, 8, "F");
  doc.setTextColor(...dark); doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.text("FINDINGS", 18, y + 5.5);
  y += 13;

  doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(...dark);
  const fLines = doc.splitTextToSize(r.finding, 180);
  doc.text(fLines, 15, y);
  y += fLines.length * 7 + 6;

  // ── Detail ──
  doc.setFillColor(248, 250, 252);
  doc.rect(15, y, 180, 8, "F");
  doc.setTextColor(...dark); doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.text("DETAILED ANALYSIS", 18, y + 5.5);
  y += 13;

  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...gray);
  const dLines = doc.splitTextToSize(r.detail, 180);
  doc.text(dLines, 15, y);
  y += dLines.length * 6 + 10;

  // ── Raw AI data ──
  if (r.raw && typeof r.raw === "object") {
    doc.setFillColor(248, 250, 252);
    doc.rect(15, y, 180, 8, "F");
    doc.setTextColor(...dark); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("AI RECOMMENDATIONS", 18, y + 5.5);
    y += 13;
    doc.setFont("helvetica", "normal"); doc.setTextColor(...gray);
    const entries = Object.entries(r.raw)
      .filter(([, v]) => typeof v === "string" || typeof v === "number")
      .map(([k, v]) => `• ${k.replace(/_/g, " ").toUpperCase()}: ${v}`);
    const rLines = doc.splitTextToSize(entries.join("\n"), 180);
    doc.text(rLines.slice(0, 25), 15, y);
  }

  // ── Footer ──
  doc.setFillColor(...dark);
  doc.rect(0, 282, 210, 15, "F");
  doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text("KisanSathi — Empowering Farmers with Artificial Intelligence", 105, 291, { align: "center" });
  doc.text("www.kisansathi.ai", 105, 296, { align: "center" });

  const blob = doc.output("blob");
  const url  = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

export default function ReportsPage() {
  const [reports, setReports]   = useState<LocalReport[]>([]);
  const [filter, setFilter]     = useState<FilterType>("all");
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [loading, setLoading]   = useState(true);

  const load = () => {
    setLoading(true);
    const all = getReports();
    setReports(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const shown = filter === "all" ? reports : reports.filter(r => r.type === filter);

  const stats = [
    { icon: FileText,      label: "Total Reports",  value: reports.length,                                      color: "#94A3B8" },
    { icon: FileDown,      label: "Downloaded",      value: downloaded.size,                                     color: "#4ADE80" },
    { icon: AlertTriangle, label: "Critical Issues", value: reports.filter(r => r.status === "Critical").length, color: "#F87171" },
    { icon: TrendingUp,    label: "This Week",       value: reports.filter(r => {
        const d = new Date(r.date); const now = new Date();
        return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
      }).length, color: "#FBBF24" },
  ];

  const handleDownload = async (r: LocalReport) => {
    await generatePDF(r);
    setDownloaded(prev => new Set(prev).add(r.id));
  };

  const handleClear = () => {
    if (confirm("Clear all local reports? This cannot be undone.")) {
      clearReports(); load();
    }
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(135deg,rgba(74,222,128,0.2),rgba(74,222,128,0.05))", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(74,222,128,0.15)" }}>
            <FileText size={24} color="#4ADE80" />
          </div>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}>Farming Reports</h1>
            <p style={{ color: "#64748B", fontSize: "13px", marginTop: "4px", display: "flex", alignItems: "center", gap: "5px" }}>
              <Sparkles size={12} color="#4ADE80" /> AI-generated reports from your farming activity
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={load} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#94A3B8", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
            <RefreshCw size={13} /> Refresh
          </button>
          {reports.length > 0 && (
            <button onClick={handleClear} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "10px", background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)", color: "#F87171", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
              <Trash2 size={13} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "18px 16px", textAlign: "center" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${color}14`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
              <Icon size={16} color={color} />
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "5px", fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
        {FILTERS.map(({ type, icon: Icon, label }) => {
          const active = filter === type;
          const cfg = type !== "all" ? TYPE_CFG[type] : null;
          const count = type === "all" ? reports.length : reports.filter(r => r.type === type).length;
          return (
            <button key={type} onClick={() => setFilter(type)} style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px",
              borderRadius: "10px", cursor: "pointer", fontFamily: "inherit",
              background: active ? (cfg?.bg ?? "rgba(74,222,128,0.1)") : "rgba(255,255,255,0.04)",
              border: `1px solid ${active ? (cfg?.border ?? "rgba(74,222,128,0.3)") : "rgba(255,255,255,0.08)"}`,
              color: active ? (cfg?.color ?? "#4ADE80") : "#64748B",
              fontSize: "13px", fontWeight: active ? 700 : 400, transition: "all 0.18s",
            }}>
              <Icon size={13} /> {label}
              <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "8px", background: "rgba(0,0,0,0.25)", color: "inherit" }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Loader2 size={28} color="#4ADE80" style={{ animation: "spin 1s linear infinite", marginBottom: "12px" }} />
          <p style={{ color: "#64748B" }}>Loading reports…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && shown.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ textAlign: "center", padding: "64px 32px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "24px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 40px rgba(74,222,128,0.08)" }}>
              <FileText size={32} color="#4ADE80" strokeWidth={1.5} />
            </div>
            <p style={{ color: "white", fontWeight: 800, fontSize: "18px", marginBottom: "10px", letterSpacing: "-0.02em" }}>No Reports Yet</p>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: 1.7, maxWidth: "400px", margin: "0 auto 24px" }}>
              Reports are generated automatically every time you use <strong style={{ color: "#F87171" }}>Disease Detection</strong> or <strong style={{ color: "#FBBF24" }}>Fertilizer AI</strong>. Go analyze a crop — your report will appear here instantly!
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/dashboard/disease" style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px", borderRadius: "10px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#F87171", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
                <Microscope size={14} /> Disease Detection
              </a>
              <a href="/dashboard/fertilizer" style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px", borderRadius: "10px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "#FBBF24", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
                <FlaskConical size={14} /> Fertilizer AI
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Report cards */}
      {!loading && shown.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <AnimatePresence>
            {shown.map((r, i) => {
              const cfg  = TYPE_CFG[r.type];
              const Icon = cfg.icon;
              const done = downloaded.has(r.id);
              const dateStr = r.date ? new Date(r.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" }}
                >
                  {/* Colored top accent */}
                  <div style={{ height: "3px", background: `linear-gradient(90deg, ${cfg.color}, transparent)` }} />

                  <div style={{ padding: "20px 24px" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                      {/* Icon */}
                      <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={22} color={cfg.color} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Badges row */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: cfg.color, background: cfg.bg, padding: "3px 10px", borderRadius: "20px", border: `1px solid ${cfg.border}`, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {cfg.label}
                          </span>
                          <span style={{ fontSize: "11px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Leaf size={10} /> {r.crop}
                          </span>
                          <span style={{ fontSize: "11px", color: "#475569", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={10} /> {dateStr}
                          </span>
                          <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: `${r.statusColor}15`, color: r.statusColor, border: `1px solid ${r.statusColor}30` }}>
                            {r.status}
                          </span>
                        </div>

                        {/* Finding */}
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "white", marginBottom: "6px", letterSpacing: "-0.01em", lineHeight: 1.4 }}>{r.finding}</p>

                        {/* Detail */}
                        <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: 1.7, marginBottom: "16px" }}>{r.detail}</p>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            onClick={() => handleDownload(r)}
                            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, transition: "all 0.18s",
                              background: done ? "rgba(74,222,128,0.06)" : "linear-gradient(135deg,rgba(74,222,128,0.15),rgba(34,211,238,0.1))",
                              border: `1px solid ${done ? "rgba(74,222,128,0.2)" : "rgba(74,222,128,0.4)"}`,
                              color: "#4ADE80",
                            }}
                          >
                            <Download size={13} /> {done ? "Open PDF Again" : "Download PDF"}
                          </button>
                          <button
                            onClick={() => {
                              const text = `${r.finding}\n\n${r.detail}`;
                              if (navigator.share) navigator.share({ title: r.finding, text });
                              else { navigator.clipboard?.writeText(text); }
                            }}
                            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748B", fontSize: "13px" }}
                          >
                            <Share2 size={13} /> Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Info footer */}
      <div style={{ marginTop: "28px", padding: "16px 20px", background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: "14px", fontSize: "13px", color: "#64748B", lineHeight: 1.7 }}>
        <strong style={{ color: "#4ADE80" }}>How reports work: </strong>
        Reports are automatically saved every time you run Disease Detection or Fertilizer AI. Click <strong style={{ color: "white" }}>Download PDF</strong> to open a formatted PDF report in a new tab.
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:768px){
          .stats-grid-4 { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
}
