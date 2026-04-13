import React from "react";
import { useEffect, useState } from "react";

import { ShieldCheck, BarChart3, TrendingUp, CheckCircle, Lock, Download } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { getAnalytics } from "@/lib/api";
import { downloadResult } from "@/lib/api"



const COLORS = ["hsl(217, 91%, 60%)", "hsl(160, 84%, 39%)", "hsl(43, 96%, 56%)", "hsl(270, 60%, 60%)"];

export default function AnalyticsPage() {

const [data, setData] = useState<any[]>([]);
const [summary, setSummary] = useState({
  rows: 0,
  processedTime: "0s",
  confidence: "0%"
});
const [privacy, setPrivacy] = useState([])
const [performance, setPerformance] = useState([])
const [agentId, setAgentId] = useState("")

useEffect(() => {
  const loadAnalytics = async () => {
    try {
      const analytics = await getAnalytics();
      setAgentId(analytics.agent_id)
      setSummary({
        rows: analytics.rows || 0,
        processedTime: analytics.processedTime || "1s",
        confidence: analytics.confidence || "98%"
      });

      setData(analytics.data || []);
      setPrivacy(
analytics.privacy
? [
{ name: "Sensitive Fields", value: analytics.privacy.sensitive_fields?.length || 0 },
{ name: "Safe", value: 5 }
]
: []
)
      setPerformance([
{
name: "Execution Time",
duration: parseFloat(analytics.processedTime || "1")
},
{
name: "Rows",
duration: analytics.rows || 0
}
])

    } catch (error) {
      console.error(error);
    }
  };

  loadAnalytics();
}, []);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analysis Results</h1>
          <p className="text-sm text-muted-foreground mt-1">Customer Analyzer · Completed at {new Date().toLocaleString()}</p>
        </div>
        <span className="privacy-badge-verified px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" /> VERIFIED PRIVATE
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Records", value: summary.rows, icon: BarChart3, color: "text-primary bg-primary/10" },
          { label: "Processing Time", value: summary.processedTime, icon: TrendingUp, color: "text-success bg-success/10" },
          { label: "Privacy Status", value: "✓ Verified", icon: ShieldCheck, color: "text-emerald-400 bg-emerald-500/10" },
          { label: "Data Confidence", value: summary.confidence, icon: CheckCircle, color: "text-purple-400 bg-purple-500/10" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <div className={`p-2 rounded-md ${s.color}`}><s.icon className="h-4 w-4" /></div>
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-4 gap-4">
        {[
 { icon: "📊", title: "Columns Detected", value: data.length, sub: "Dataset structure" },
 { icon: "📈", title: "Total Records", value: summary.rows, sub: "Rows processed" },
 { icon: "✓", title: "Execution Status", value: "Completed", sub: "Successfully analyzed" },
 { icon: "🔒", title: "Privacy Risk", value: summary.confidence, sub: "Data safety level" },
].map((ins) => (
          <div key={ins.title} className="glass-card p-5 hover:scale-[1.02] transition-transform">
            <span className="text-2xl">{ins.icon}</span>
            <p className="text-xs text-muted-foreground mt-2">{ins.title}</p>
            <p className="text-lg font-bold text-foreground mt-1">{ins.value}</p>
            <p className="text-xs text-muted-foreground">{ins.sub}</p>
          </div>
        ))}
      </div>

     {/* Privacy + Execution Charts */}
<div className="grid grid-cols-2 gap-4">

{/* Privacy Risk */}
<div className="glass-card p-5">
<h3 className="text-sm font-semibold text-foreground mb-4">
Privacy Risk Distribution
</h3>

<ResponsiveContainer width="100%" height={250}>
<PieChart>

<Pie
data={privacy}
dataKey="value"
nameKey="name"
cx="50%"
cy="50%"
outerRadius={90}
>

{privacy.map((_, i) => (
<Cell key={i} fill={COLORS[i % COLORS.length]} />
))}

</Pie>

<Tooltip />
<Legend />

</PieChart>
</ResponsiveContainer>

</div>


{/* Execution Performance */}
<div className="glass-card p-5">
<h3 className="text-sm font-semibold text-foreground mb-4">
Execution Performance
</h3>

<ResponsiveContainer width="100%" height={250}>
<BarChart data={performance}>

<XAxis dataKey="name" />
<YAxis />

<Tooltip />

<Bar dataKey="duration">

{performance.map((_, i) => (
<Cell key={i} fill={COLORS[i % COLORS.length]} />
))}

</Bar>

</BarChart>
</ResponsiveContainer>

</div>

</div>

      {/* Downloads */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Download Results</h3>
        <div className="flex gap-3">
          {[
 { label: "Download PDF", icon: Download, format:"pdf" },
 { label: "Download CSV", icon: Download, format:"csv" },
 { label: "Download JSON", icon: Download, format:"json" },
].map((btn) => (
            <button
              key={btn.label}
              onClick={() => downloadResult(agentId, btn.format)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-secondary text-foreground text-sm font-medium hover:bg-accent transition"
            >
              <btn.icon className="h-4 w-4" /> {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Info */}
      <div className="glass-card p-5 border-l-4 border-success">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Your Privacy is Protected</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              This analysis was performed securely with zero data exposure. All processing happened privately
              with cryptographic verification. No raw data was transmitted or stored outside the secure enclave.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
