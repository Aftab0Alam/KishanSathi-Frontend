"use client"

export const dynamic = 'force-dynamic'
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { adminAPI } from "@/services/api";
import { Users, Camera, MessageCircle, FlaskConical, ShieldCheck } from "lucide-react";

const COLORS = ["#4ADE80","#22D3EE","#8B5CF6","#F87171","#FBBF24","#F59E0B"];

export default function AdminPage() {
  const [stats, setStats] = useState<any>({});
  const [disease, setDisease] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getDiseaseAnalytics()])
      .then(([s, d]) => { setStats(s.data.stats); setDisease(d.data.analytics?.slice(0,8)||[]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label:"Total Users", value: stats.total_users||"--", icon: <Users size={20}/>, color:"#4ADE80" },
    { label:"Disease Scans", value: stats.total_disease_reports||"--", icon: <Camera size={20}/>, color:"#F87171" },
    { label:"AI Chats", value: stats.total_chat_history||"--", icon: <MessageCircle size={20}/>, color:"#22D3EE" },
    { label:"Fertilizer Reports", value: stats.total_fertilizer_reports||"--", icon: <FlaskConical size={20}/>, color:"#FBBF24" },
  ];

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"28px"}}>
        <ShieldCheck size={28} color="#FBBF24"/>
        <div>
          <h1 style={{fontSize:"26px",fontWeight:800,color:"white"}}>Admin Dashboard</h1>
          <p style={{color:"#94A3B8",fontSize:"14px",marginTop:"2px"}}>Platform-wide analytics & management</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"16px",marginBottom:"28px"}}>
        {statCards.map(({label,value,icon,color})=>(
          <div key={label} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${color}33`,borderRadius:"16px",padding:"20px"}}>
            <div style={{color,marginBottom:"10px"}}>{icon}</div>
            <div style={{fontSize:"32px",fontWeight:800,color}}>{value}</div>
            <div style={{fontSize:"12px",color:"#64748B",marginTop:"4px"}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}} className="responsive-grid">
        {disease.length>0&&(
          <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",padding:"20px"}}>
            <h3 style={{color:"white",fontWeight:700,fontSize:"14px",marginBottom:"16px"}}>ðŸ”¬ Top Diseases Detected</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={disease}>
                <XAxis dataKey="disease" stroke="#64748B" fontSize={10} tick={{fill:"#64748B"}}/>
                <YAxis stroke="#64748B" fontSize={10}/>
                <Tooltip contentStyle={{background:"#0a0f1e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"white"}}/>
                <Bar dataKey="count" radius={[6,6,0,0]} fill="#F87171"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",padding:"20px"}}>
          <h3 style={{color:"white",fontWeight:700,fontSize:"14px",marginBottom:"16px"}}>ðŸ“Š Feature Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={[
                {name:"Disease Scan",value:parseInt(stats.total_disease_reports||0)},
                {name:"AI Chat",value:parseInt(stats.total_chat_history||0)},
                {name:"Fertilizer",value:parseInt(stats.total_fertilizer_reports||0)},
                {name:"Yield",value:parseInt(stats.total_yield_predictions||0)},
              ]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name})=>name}>
                {COLORS.map((c,i)=><Cell key={i} fill={c}/>)}
              </Pie>
              <Tooltip contentStyle={{background:"#0a0f1e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"white"}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {loading&&<div style={{textAlign:"center",padding:"40px",color:"#64748B"}}>Loading analytics...</div>}
      <style jsx>{`@media(max-width:768px){.responsive-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}


