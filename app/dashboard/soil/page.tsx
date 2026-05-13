"use client";
export const dynamic = "force-dynamic";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Layers, Upload, Camera, MapPin, X, Loader2,
  CheckCircle, Sprout, Droplets, FlaskConical,
  BarChart3, Sun, CloudRain, AlertTriangle,
  Navigation, ChevronDown, ImagePlus, Video,
} from "lucide-react";
import { soilAPI } from "@/services/api";

const CITIES = [
  "Ludhiana","Amritsar","Delhi","Jaipur","Lucknow","Patna",
  "Bhopal","Nagpur","Pune","Hyderabad","Bengaluru","Ahmedabad",
  "Indore","Varanasi","Kanpur","Chandigarh","Surat","Nashik",
];

const SOIL_COLORS: Record<string,string> = {
  "Clay":         "#F87171",
  "Sandy":        "#FBBF24",
  "Loamy":        "#4ADE80",
  "Black Cotton": "#A78BFA",
  "Red":          "#F97316",
  "Alluvial":     "#22D3EE",
  "Laterite":     "#FB923C",
  "Saline":       "#64748B",
};

export default function SoilPage() {
  const [file, setFile]       = useState<File|null>(null);
  const [preview, setPreview] = useState<string|null>(null);
  const [mode, setMode]       = useState<"upload"|"camera">("upload");
  const [stream, setStream]   = useState<MediaStream|null>(null);
  const [camErr, setCamErr]   = useState("");
  const [locMode, setLocMode] = useState<"gps"|"manual">("gps");
  const [city, setCity]       = useState("");
  const [gpsStatus, setGpsStatus] = useState<"idle"|"loading"|"ok"|"error">("idle");
  const [coords, setCoords]   = useState<{lat:number;lng:number}|null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<any>(null);
  const [error, setError]     = useState("");
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback((files: File[]) => {
    const f = files[0]; if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setError("");
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept:{"image/*":[]}, maxSize: 10*1024*1024, multiple: false,
  });

  const startCam = async () => {
    setCamErr("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:{ideal:"environment"} } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch { setCamErr("Camera not accessible. Use Upload instead."); }
  };
  const stopCam = () => { stream?.getTracks().forEach(t=>t.stop()); setStream(null); };
  const capture = () => {
    const v = videoRef.current, c = canvasRef.current; if (!v||!c) return;
    c.width=v.videoWidth; c.height=v.videoHeight;
    c.getContext("2d")?.drawImage(v,0,0);
    c.toBlob(blob => {
      if (!blob) return;
      const f = new File([blob],"soil.jpg",{type:"image/jpeg"});
      setFile(f); setPreview(c.toDataURL("image/jpeg")); setResult(null); setError(""); stopCam();
    },"image/jpeg",0.92);
  };

  const getGPS = () => {
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({lat:pos.coords.latitude,lng:pos.coords.longitude}); setGpsStatus("ok"); },
      ()  => { setGpsStatus("error"); }
    );
  };

  const analyze = async () => {
    if (!file) { setError("Please upload or capture a soil photo first."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (coords) { fd.append("lat", String(coords.lat)); fd.append("lng", String(coords.lng)); }
      if (city)   fd.append("city", city);
      const res = await soilAPI.analyze(fd);
      // Backend wraps response in { success: true, analysis: {...} }
      const data = res.data?.analysis ?? res.data;
      if (!data) throw new Error("Empty response from server");
      setResult(data);
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Analysis failed. Check backend connection.";
      setError(msg);
    } finally { setLoading(false); }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(""); stopCam(); };
  const soilColor = result ? (SOIL_COLORS[result.soil_type] || "#4ADE80") : "#10B981";

  return (
    <div style={{maxWidth:"920px",margin:"0 auto"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Layers size={22} color="#10B981"/>
          </div>
          <div>
            <h1 style={{fontSize:"24px",fontWeight:800,color:"white",letterSpacing:"-0.02em"}}>Soil Intelligence</h1>
            <p style={{color:"#64748B",fontSize:"13px",marginTop:"2px"}}>AI soil analysis + best crop recommendations for your land</p>
          </div>
        </div>
        {result && (
          <button onClick={reset} style={{padding:"8px 16px",borderRadius:"10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",color:"#94A3B8",cursor:"pointer",fontSize:"13px",fontFamily:"inherit"}}>
            New Analysis
          </button>
        )}
      </div>

      {!result ? (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}} className="responsive-grid">
          {/* LEFT: Image input */}
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            {/* Mode toggle */}
            <div style={{display:"flex",gap:"8px"}}>
              {[{id:"upload",icon:Upload,label:"Upload Photo"},{id:"camera",icon:Camera,label:"Capture Photo"}].map(({id,icon:Icon,label})=>(
                <button key={id} onClick={()=>{setMode(id as any);if(id==="camera")startCam();else stopCam();}}
                  style={{flex:1,padding:"12px 8px",borderRadius:"12px",cursor:"pointer",textAlign:"center",fontFamily:"inherit",transition:"all 0.2s",
                    background:mode===id?"rgba(16,185,129,0.12)":"rgba(255,255,255,0.04)",
                    border:mode===id?"2px solid rgba(16,185,129,0.4)":"1px solid rgba(255,255,255,0.08)",
                    color:mode===id?"#10B981":"#64748B"}}>
                  <Icon size={20} style={{margin:"0 auto 4px"}}/>
                  <div style={{fontSize:"12px",fontWeight:700}}>{label}</div>
                </button>
              ))}
            </div>

            {/* Camera */}
            {mode==="camera" && !file && (
              <div style={{borderRadius:"14px",overflow:"hidden",background:"#000",border:"2px solid rgba(16,185,129,0.3)",position:"relative"}}>
                {camErr ? (
                  <div style={{padding:"28px",textAlign:"center"}}>
                    <AlertTriangle size={24} color="#F87171" style={{margin:"0 auto 8px"}}/>
                    <p style={{color:"#F87171",fontSize:"13px",marginBottom:"12px"}}>{camErr}</p>
                    <button onClick={()=>setMode("upload")} style={{padding:"8px 18px",borderRadius:"8px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",color:"#10B981",cursor:"pointer",fontFamily:"inherit",fontSize:"12px"}}>
                      Use Upload Instead
                    </button>
                  </div>
                ) : stream ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",height:"220px",objectFit:"cover",display:"block"}}/>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.8))",padding:"12px",display:"flex",gap:"8px",justifyContent:"center"}}>
                      <button onClick={capture} style={{padding:"9px 22px",borderRadius:"30px",background:"#10B981",border:"none",color:"white",fontWeight:700,fontSize:"13px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"6px"}}>
                        <Camera size={15}/> Capture Soil Photo
                      </button>
                      <button onClick={stopCam} style={{padding:"9px 12px",borderRadius:"30px",background:"rgba(255,255,255,0.15)",border:"none",color:"white",cursor:"pointer",display:"flex",alignItems:"center"}}>
                        <X size={14}/>
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{padding:"36px",textAlign:"center"}}>
                    <Video size={28} color="#64748B" style={{margin:"0 auto 10px"}}/>
                    <p style={{color:"#64748B",fontSize:"13px",marginBottom:"12px"}}>Allow camera access to capture soil photo</p>
                    <button onClick={startCam} style={{padding:"9px 20px",borderRadius:"8px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",color:"#10B981",cursor:"pointer",fontFamily:"inherit",fontSize:"13px"}}>
                      Open Camera
                    </button>
                  </div>
                )}
                <canvas ref={canvasRef} style={{display:"none"}}/>
              </div>
            )}

            {/* Dropzone */}
            {mode==="upload" && !file && (
              <div {...getRootProps()} style={{borderRadius:"14px",padding:"36px 20px",textAlign:"center",cursor:"pointer",border:`2px dashed ${isDragActive?"#10B981":"rgba(255,255,255,0.12)"}`,background:isDragActive?"rgba(16,185,129,0.05)":"rgba(255,255,255,0.03)",transition:"all 0.25s"}}>
                <input {...getInputProps()}/>
                <div style={{width:"52px",height:"52px",borderRadius:"14px",background:"rgba(16,185,129,0.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                  <ImagePlus size={24} color="#10B981"/>
                </div>
                <p style={{color:"white",fontWeight:700,fontSize:"15px",marginBottom:"6px"}}>{isDragActive?"Drop soil photo here":"Upload Soil Photo"}</p>
                <p style={{color:"#64748B",fontSize:"13px"}}>Take a clear photo of your field soil and upload it here</p>
              </div>
            )}

            {/* Preview */}
            {file && preview && (
              <div style={{position:"relative",borderRadius:"14px",overflow:"hidden",border:"2px solid rgba(16,185,129,0.35)"}}>
                <img src={preview} alt="Soil" style={{width:"100%",maxHeight:"240px",objectFit:"cover",display:"block"}}/>
                <button onClick={reset} style={{position:"absolute",top:"8px",right:"8px",background:"rgba(0,0,0,0.65)",border:"none",borderRadius:"50%",padding:"6px",cursor:"pointer",color:"white",display:"flex"}}>
                  <X size={14}/>
                </button>
                <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.7))",padding:"10px 12px",fontSize:"12px",color:"#94A3B8"}}>
                  {file.name} · {(file.size/1024).toFixed(0)} KB
                </div>
              </div>
            )}

            {/* Location */}
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"14px",padding:"16px"}}>
              <div style={{fontSize:"12px",fontWeight:700,color:"#94A3B8",marginBottom:"10px",letterSpacing:"0.04em"}}>LOCATION (for crop suggestions)</div>
              <div style={{display:"flex",gap:"6px",marginBottom:"12px"}}>
                {[{id:"gps",label:"Use My GPS"},{id:"manual",label:"Select City"}].map(({id,label})=>(
                  <button key={id} onClick={()=>setLocMode(id as any)} style={{flex:1,padding:"8px",borderRadius:"8px",cursor:"pointer",fontSize:"12px",fontWeight:locMode===id?700:400,fontFamily:"inherit",transition:"all 0.18s",
                    background:locMode===id?"rgba(16,185,129,0.1)":"transparent",
                    border:locMode===id?"1px solid rgba(16,185,129,0.3)":"1px solid rgba(255,255,255,0.07)",
                    color:locMode===id?"#10B981":"#64748B"}}>
                    {label}
                  </button>
                ))}
              </div>
              {locMode==="gps" ? (
                <button onClick={getGPS} disabled={gpsStatus==="loading"} style={{width:"100%",padding:"10px",borderRadius:"10px",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:"7px",transition:"all 0.2s",
                  background:gpsStatus==="ok"?"rgba(16,185,129,0.1)":"rgba(255,255,255,0.05)",
                  border:gpsStatus==="ok"?"1px solid rgba(16,185,129,0.3)":"1px solid rgba(255,255,255,0.09)",
                  color:gpsStatus==="ok"?"#10B981":gpsStatus==="error"?"#F87171":"#94A3B8"}}>
                  {gpsStatus==="loading" ? <><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/> Getting location…</>
                  : gpsStatus==="ok"     ? <><CheckCircle size={14}/> GPS: {coords?.lat.toFixed(3)}, {coords?.lng.toFixed(3)}</>
                  : gpsStatus==="error"  ? <><AlertTriangle size={14}/> GPS failed — try Manual</>
                  : <><Navigation size={14}/> Detect My Location</>}
                </button>
              ) : (
                <select value={city} onChange={e=>setCity(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:"10px",background:"#0d1117",border:"1px solid rgba(255,255,255,0.18)",color:city?"white":"#64748B",fontSize:"13px",outline:"none",fontFamily:"inherit",appearance:"none",cursor:"pointer"}}>
                  <option value="" style={{background:"#0d1117",color:"#94A3B8"}}>-- Select your city --</option>
                  {CITIES.map(c=><option key={c} value={c} style={{background:"#0d1117",color:"white"}}>{c}</option>)}
                </select>
              )}
            </div>

            {/* Analyze button */}
            {file && (
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                onClick={analyze} disabled={loading}
                style={{padding:"15px",borderRadius:"14px",cursor:"pointer",fontFamily:"inherit",fontSize:"15px",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",border:"none",background:"linear-gradient(135deg,#10B981,#4ADE80)",color:"#050816",opacity:loading?0.75:1}}>
                {loading ? <><Loader2 size={18} style={{animation:"spin 1s linear infinite"}}/> AI is analyzing soil…</> : <><Layers size={18}/> Analyze Soil & Get Crop Plan</>}
              </motion.button>
            )}
            {error && (
              <div style={{padding:"12px 14px",borderRadius:"10px",background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",color:"#F87171",fontSize:"13px",display:"flex",gap:"8px",alignItems:"center"}}>
                <AlertTriangle size={14} style={{flexShrink:0}}/>{error}
              </div>
            )}
          </div>

          {/* RIGHT: Empty state */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.03)",border:"1px dashed rgba(255,255,255,0.08)",borderRadius:"18px",padding:"40px 24px",textAlign:"center",minHeight:"400px"}}>
            <div>
              {loading ? (
                <>
                  <Loader2 size={40} color="#10B981" style={{animation:"spin 1s linear infinite",margin:"0 auto 16px"}}/>
                  <p style={{color:"white",fontWeight:700,fontSize:"16px",marginBottom:"8px"}}>AI Analyzing Your Soil…</p>
                  <p style={{color:"#64748B",fontSize:"13px",lineHeight:1.6}}>Detecting soil type, nutrients, pH level and finding the best crops for your land</p>
                </>
              ) : (
                <>
                  <div style={{width:"80px",height:"80px",borderRadius:"50%",background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
                    <Layers size={36} color="#10B981" strokeWidth={1.5}/>
                  </div>
                  <p style={{color:"white",fontWeight:800,fontSize:"18px",marginBottom:"10px"}}>Smart Soil Detection</p>
                  <div style={{display:"flex",flexDirection:"column",gap:"8px",textAlign:"left",maxWidth:"260px",margin:"0 auto"}}>
                    {["Upload or capture a soil photo","(Optional) Set your location","Click Analyze — AI does the rest!"].map((s,i)=>(
                      <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start"}}>
                        <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,color:"#10B981",flexShrink:0}}>{i+1}</div>
                        <span style={{fontSize:"13px",color:"#94A3B8",lineHeight:1.5}}>{s}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── RESULTS ── */
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
          {/* Soil card */}
          <div style={{background:`linear-gradient(135deg, ${soilColor}18, rgba(16,185,129,0.06))`,border:`1px solid ${soilColor}30`,borderRadius:"22px",padding:"28px",marginBottom:"20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"16px",marginBottom:"20px"}}>
              <div>
                <div style={{fontSize:"13px",color:"#64748B",marginBottom:"6px",display:"flex",alignItems:"center",gap:"5px"}}>
                  <CheckCircle size={13} color="#10B981"/> Soil Analysis Complete
                </div>
                <div style={{fontSize:"32px",fontWeight:900,color:"white",letterSpacing:"-0.03em"}}>{result.soil_type}</div>
                <div style={{fontSize:"14px",color:soilColor,marginTop:"4px",fontWeight:600}}>Soil Type</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:"48px",fontWeight:900,color:soilColor,letterSpacing:"-0.03em"}}>{result.confidence}%</div>
                <div style={{fontSize:"12px",color:"#64748B"}}>AI Confidence</div>
                {result.soil_health_score && (
                  <div style={{fontSize:"12px",color:"#4ADE80",marginTop:"4px",fontWeight:600}}>Health Score: {result.soil_health_score}/100</div>
                )}
                {result.location && <div style={{fontSize:"12px",color:"#475569",marginTop:"4px",display:"flex",alignItems:"center",gap:"4px",justifyContent:"flex-end"}}><MapPin size={11}/>{result.location}</div>}
              </div>
            </div>

            {/* Soil stats — extended */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:"10px"}}>
              {[
                {label:"pH Level",        value:result.ph,              color:"#22D3EE"},
                {label:"Organic Matter",  value:result.organic_matter,  color:"#4ADE80"},
                {label:"Water Retention", value:result.water_retention, color:"#60A5FA"},
                {label:"Drainage",        value:result.drainage,        color:"#FBBF24"},
                {label:"Nitrogen",        value:result.nitrogen,        color:"#A78BFA"},
                {label:"Phosphorus",      value:result.phosphorus,      color:"#F87171"},
                {label:"Potassium",       value:result.potassium,       color:"#FB923C"},
              ].map(({label,value,color})=>value&&(
                <div key={label} style={{background:"rgba(255,255,255,0.07)",borderRadius:"12px",padding:"14px 12px",textAlign:"center"}}>
                  <div style={{fontSize:"15px",fontWeight:800,color,marginBottom:"4px"}}>{value}</div>
                  <div style={{fontSize:"10px",color:"#64748B"}}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Soil improvement tips */}
          {result.soil_improvement_tips?.length > 0 && (
            <div style={{marginBottom:"16px",padding:"16px 20px",borderRadius:"14px",background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.15)"}}>
              <div style={{fontSize:"13px",fontWeight:700,color:"#4ADE80",marginBottom:"10px",display:"flex",alignItems:"center",gap:"6px"}}>
                <CheckCircle size={14}/> Soil Improvement Tips
              </div>
              {result.soil_improvement_tips.map((tip:string,i:number)=>(
                <div key={i} style={{display:"flex",gap:"8px",marginBottom:"6px",alignItems:"flex-start"}}>
                  <div style={{width:"18px",height:"18px",borderRadius:"50%",background:"rgba(74,222,128,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,color:"#4ADE80",flexShrink:0}}>{i+1}</div>
                  <span style={{fontSize:"13px",color:"#94A3B8",lineHeight:1.5}}>{tip}</span>
                </div>
              ))}
            </div>
          )}

          {/* Warning */}
          {result.warnings && (
            <div style={{marginBottom:"16px",padding:"12px 16px",borderRadius:"12px",background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",color:"#FBBF24",fontSize:"13px",display:"flex",gap:"8px",alignItems:"center"}}>
              <AlertTriangle size={14} style={{flexShrink:0}}/> {result.warnings}
            </div>
          )}

          {/* Crop recommendations */}
          <div style={{marginBottom:"12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px"}}>
              <Sprout size={18} color="#10B981"/>
              <span style={{fontWeight:700,color:"white",fontSize:"16px"}}>Best Crops for Your Soil & Location</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"12px"}}>
              {result.crop_recommendations?.map((c:any,i:number)=>(
                <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                  style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:"16px",padding:"18px 16px",position:"relative",overflow:"hidden"}}>
                  {/* Suitability badge */}
                  {c.suitability && (
                    <div style={{position:"absolute",top:"12px",right:"12px",fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"20px",background:"rgba(16,185,129,0.15)",color:"#10B981",border:"1px solid rgba(16,185,129,0.25)"}}>
                      {c.suitability}% fit
                    </div>
                  )}
                  <div style={{fontSize:"15px",fontWeight:700,color:"white",marginBottom:"12px",paddingRight:"60px"}}>{c.crop}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
                    {[
                      {icon:Sun,        color:"#FBBF24", label:"Season",     value:c.season},
                      {icon:Droplets,   color:"#22D3EE", label:"Water",      value:c.water},
                      {icon:FlaskConical,color:"#A78BFA",label:"Fertilizer", value:c.fertilizer},
                      {icon:BarChart3,  color:"#4ADE80", label:"Yield/Acre", value:c.yield},
                      ...(c.profit_per_acre ? [{icon:BarChart3, color:"#FBBF24", label:"Profit/Acre", value:c.profit_per_acre}] : []),
                    ].map(({icon:Icon,color,label,value})=>(
                      <div key={label} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                        <Icon size={13} color={color} style={{flexShrink:0}}/>
                        <span style={{fontSize:"11px",color:"#64748B",minWidth:"72px"}}>{label}:</span>
                        <span style={{fontSize:"12px",color:"#CBD5E1",fontWeight:500}}>{value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:768px){.responsive-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
