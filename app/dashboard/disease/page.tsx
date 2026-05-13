"use client";
export const dynamic = "force-dynamic";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload, Camera, CheckCircle, Loader2, X, Microscope,
  ShieldCheck, Pill, AlertTriangle, ImagePlus, Video,
  Info, Leaf,
} from "lucide-react";
import { diseaseAPI } from "@/services/api";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { saveReport } from "@/utils/reportStore";

const SEV_COLOR: Record<string, string> = {
  Low: "#4ADE80", Medium: "#FBBF24", High: "#F87171", Critical: "#EF4444",
};

/* ── Tips for farmers ── */
const PHOTO_TIPS = [
  { icon: "1", text: "Take photo in daylight — avoid shade" },
  { icon: "2", text: "Focus on the diseased leaf or stem" },
  { icon: "3", text: "Keep camera 20–30 cm from the plant" },
  { icon: "4", text: "One leaf per photo gives best results" },
];

export default function DiseasePage() {
  const [file, setFile]       = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<any>(null);
  const [error, setError]     = useState("");
  const [mode, setMode]       = useState<"upload" | "camera">("upload");
  const [stream, setStream]   = useState<MediaStream | null>(null);
  const [camError, setCamError] = useState("");
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { language, t } = useLanguage();

  /* ── Dropzone ── */
  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]; if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setError("");
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [] }, maxSize: 10 * 1024 * 1024, multiple: false,
  });

  /* ── Camera ── */
  const startCamera = async () => {
    setCamError("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setCamError("Camera not accessible. Please allow camera permission or use Upload Image instead.");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  const capturePhoto = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const f = new File([blob], "capture.jpg", { type: "image/jpeg" });
      setFile(f); setPreview(canvas.toDataURL("image/jpeg"));
      setResult(null); setError("");
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  /* ── Analyze ── */
  const analyze = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("language", language);
      const res = await diseaseAPI.analyze(fd);
      const analysis = res.data.analysis;
      setResult(analysis);
      // Save to local report store so Reports page shows it immediately
      const sev = (analysis.severity || "").toLowerCase();
      saveReport({
        type: "disease",
        crop: analysis.crop_type || "Unknown Crop",
        finding: `${analysis.disease_name || "Disease Detected"} — ${analysis.severity || "Unknown"} Severity`,
        detail: analysis.treatment ||
          `Confidence: ${analysis.confidence ?? "—"}%. Monitor the crop closely and consult your local agronomist.`,
        status: sev === "high" || sev === "critical" ? "Critical"
          : sev === "medium" ? "Moderate" : "Low Risk",
        statusColor: sev === "high" || sev === "critical" ? "#F87171"
          : sev === "medium" ? "#FBBF24" : "#4ADE80",
        raw: analysis,
      });
    } catch (e: any) {
      setError(e.response?.data?.detail || "Analysis failed. Check backend GROQ_API_KEY.");
    } finally { setLoading(false); }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(""); stopCamera(); };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Microscope size={22} color="#F87171" />
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
              {t("disease_detection")}
            </h1>
            <p style={{ color: "#64748B", fontSize: "13px", marginTop: "2px" }}>
              Upload or capture your crop photo — AI diagnoses disease instantly
            </p>
          </div>
        </div>
        <LanguageSwitcher />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="responsive-grid">
        {/* ── Left: Image input ── */}
        <div>
          {/* Mode toggle */}
          {!file && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {[
                { id: "upload", icon: Upload,  label: "Upload Image",   desc: "From your gallery" },
                { id: "camera", icon: Camera,  label: "Capture Photo",  desc: "Use your camera"   },
              ].map(({ id, icon: Icon, label, desc }) => (
                <button key={id}
                  onClick={() => { setMode(id as any); if (id === "camera") startCamera(); else stopCamera(); }}
                  style={{
                    flex: 1, padding: "14px 12px", borderRadius: "14px", cursor: "pointer",
                    background: mode === id ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.04)",
                    border: mode === id ? "2px solid rgba(248,113,113,0.4)" : "1px solid rgba(255,255,255,0.08)",
                    color: mode === id ? "#F87171" : "#64748B",
                    textAlign: "center", fontFamily: "inherit", transition: "all 0.2s",
                  }}
                >
                  <Icon size={22} style={{ margin: "0 auto 6px" }} />
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>{label}</div>
                  <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "2px" }}>{desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Camera view */}
          {mode === "camera" && !file && (
            <div style={{ marginBottom: "16px", borderRadius: "16px", overflow: "hidden", background: "#000", position: "relative", border: "2px solid rgba(248,113,113,0.3)" }}>
              {camError ? (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <AlertTriangle size={28} color="#F87171" style={{ margin: "0 auto 10px" }} />
                  <p style={{ color: "#F87171", fontSize: "13px" }}>{camError}</p>
                  <button onClick={() => setMode("upload")} className="btn-primary" style={{ marginTop: "12px", padding: "8px 20px", fontSize: "13px" }}>
                    Switch to Upload
                  </button>
                </div>
              ) : stream ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }} />
                  {/* Viewfinder corners */}
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                    {["0 0 auto auto","0 auto auto 0","auto 0 0 auto","auto auto 0 0"].map((p, i) => (
                      <div key={i} style={{ position: "absolute", inset: p.split(" ").reduce((a,v,j) => ({...a, [["top","right","bottom","left"][j]]:v}),{} as any), width: "20px", height: "20px", border: "3px solid #F87171", borderRadius: i%2===0?"0 8px 0 0":i===1?"8px 0 0 0":i===2?"0 0 8px 0":"0 0 0 8px", borderWidth: [i===0||i===3?"3px 3px 0 0":i===1||i===2?"3px 0 0 3px":"3px"][0] }} />
                    ))}
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.8))", padding: "12px", display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button onClick={capturePhoto} style={{ padding: "10px 24px", borderRadius: "30px", background: "#F87171", border: "none", color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Camera size={16} /> Capture Photo
                    </button>
                    <button onClick={stopCamera} style={{ padding: "10px 14px", borderRadius: "30px", background: "rgba(255,255,255,0.15)", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <X size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <Video size={32} color="#64748B" style={{ margin: "0 auto 10px" }} />
                  <p style={{ color: "#64748B", fontSize: "13px", marginBottom: "12px" }}>Allow camera access to capture plant photo</p>
                  <button onClick={startCamera} className="btn-primary" style={{ padding: "9px 20px", fontSize: "13px" }}>
                    Open Camera
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          )}

          {/* Dropzone (upload mode) */}
          {mode === "upload" && !file && (
            <div {...getRootProps()} style={{
              border: `2px dashed ${isDragActive ? "#F87171" : "rgba(255,255,255,0.15)"}`,
              borderRadius: "18px", padding: "40px 20px", textAlign: "center", cursor: "pointer",
              background: isDragActive ? "rgba(248,113,113,0.06)" : "rgba(255,255,255,0.03)",
              transition: "all 0.3s", marginBottom: "16px",
            }}>
              <input {...getInputProps()} />
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(248,113,113,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <ImagePlus size={26} color="#F87171" />
              </div>
              <p style={{ color: "white", fontWeight: 700, fontSize: "16px", marginBottom: "6px" }}>
                {isDragActive ? "Drop your plant photo here" : "Tap to select plant photo"}
              </p>
              <p style={{ color: "#64748B", fontSize: "13px", marginBottom: "14px" }}>
                Choose from gallery or drag & drop here
              </p>
              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                {["JPG", "PNG", "WEBP", "HEIC"].map(f => (
                  <span key={f} style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "6px", background: "rgba(248,113,113,0.08)", color: "#F87171", border: "1px solid rgba(248,113,113,0.2)", fontWeight: 600 }}>{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {file && preview && (
            <div style={{ position: "relative", marginBottom: "16px", borderRadius: "16px", overflow: "hidden", border: "2px solid rgba(248,113,113,0.3)" }}>
              <img src={preview} alt="Plant" style={{ width: "100%", maxHeight: "280px", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px" }}>
                <button onClick={reset} style={{ background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", padding: "7px", cursor: "pointer", color: "white", display: "flex" }}>
                  <X size={14} />
                </button>
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.75))", padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", color: "#94A3B8" }}>{file.name} · {(file.size / 1024).toFixed(0)} KB</div>
              </div>
            </div>
          )}

          {/* Analyze button */}
          {file && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={analyze} disabled={loading} className="btn-primary"
              style={{ width: "100%", padding: "15px", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.75 : 1 }}>
              {loading
                ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> AI is analyzing your crop…</>
                : <><Microscope size={18} /> Analyze Disease Now</>}
            </motion.button>
          )}

          {error && (
            <div style={{ marginTop: "12px", padding: "13px 16px", borderRadius: "12px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#F87171", fontSize: "13px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: "1px" }} /> {error}
            </div>
          )}

          {/* Photo tips for farmers */}
          {!file && (
            <div style={{ marginTop: "16px", padding: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
                <Info size={14} color="#FBBF24" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FBBF24" }}>Photo Tips for Best Results</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {PHOTO_TIPS.map(tip => (
                  <div key={tip.icon} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#4ADE80", flexShrink: 0 }}>
                      {tip.icon}
                    </div>
                    <span style={{ fontSize: "12px", color: "#94A3B8", lineHeight: 1.5 }}>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Results ── */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <CheckCircle size={20} color="#4ADE80" />
                  <h3 style={{ fontWeight: 700, color: "white", fontSize: "16px" }}>Analysis Complete</h3>
                </div>

                {/* Disease name */}
                <div style={{ fontSize: "22px", fontWeight: 800, color: "white", marginBottom: "10px" }}>
                  {result.disease_name}
                </div>

                {/* Badges */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                  <span style={{ padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, background: `${SEV_COLOR[result.severity] || "#94A3B8"}22`, color: SEV_COLOR[result.severity] || "#94A3B8", border: `1px solid ${SEV_COLOR[result.severity] || "#94A3B8"}44` }}>
                    {result.severity} Severity
                  </span>
                  <span style={{ padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, background: "rgba(34,211,238,0.1)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.3)" }}>
                    {result.confidence}% Confidence
                  </span>
                </div>

                {result.description && (
                  <p style={{ color: "#94A3B8", fontSize: "13px", lineHeight: 1.7, marginBottom: "16px" }}>
                    {result.description}
                  </p>
                )}

                {result.treatment && (
                  <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", marginBottom: "12px" }}>
                    <div style={{ fontWeight: 700, color: "#4ADE80", fontSize: "13px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Pill size={14} /> Treatment Recommendation
                    </div>
                    <p style={{ color: "#CBD5E1", fontSize: "13px", lineHeight: 1.7, margin: 0 }}>{result.treatment}</p>
                  </div>
                )}

                {result.prevention_tips?.length > 0 && (
                  <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.15)" }}>
                    <div style={{ fontWeight: 700, color: "#22D3EE", fontSize: "13px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <ShieldCheck size={14} /> Prevention Tips
                    </div>
                    {result.prevention_tips.map((tip: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                        <Leaf size={12} color="#4ADE80" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span style={{ color: "#94A3B8", fontSize: "13px", lineHeight: 1.6 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={reset} style={{ marginTop: "16px", width: "100%", padding: "11px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#94A3B8", cursor: "pointer", fontSize: "13px", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Camera size={14} /> Scan Another Plant
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ height: "100%", minHeight: "320px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "20px", padding: "32px", textAlign: "center" }}>
                <div>
                  {loading ? (
                    <>
                      <Loader2 size={36} color="#F87171" style={{ animation: "spin 1s linear infinite", marginBottom: "14px" }} />
                      <p style={{ color: "white", fontWeight: 600, marginBottom: "6px" }}>Analyzing your plant…</p>
                      <p style={{ color: "#64748B", fontSize: "13px" }}>AI is checking for diseases, pests, and nutrient deficiencies</p>
                    </>
                  ) : (
                    <>
                      <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                        <Microscope size={30} color="#F87171" strokeWidth={1.5} />
                      </div>
                      <p style={{ color: "white", fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>AI Results Appear Here</p>
                      <p style={{ color: "#64748B", fontSize: "13px", lineHeight: 1.6 }}>
                        Upload or capture a photo of your crop leaf or stem. AI will detect disease, recommend treatment, and give prevention tips.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:768px) { .responsive-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
