import React from "react";
import { mockResults } from "@/lib/mock-data";
import { ShieldCheck, BarChart3, TrendingUp, CheckCircle, Lock, Download } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(217, 91%, 60%)", "hsl(160, 84%, 39%)", "hsl(43, 96%, 56%)", "hsl(270, 60%, 60%)"];

export default function AnalyticsPage() {
  const data = mockResults.categories;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analysis Results</h1>
          <p className="text-sm text-muted-foreground mt-1">Customer Analyzer · Completed at 2025-03-28 14:34</p>
        </div>
        <span className="privacy-badge-verified px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" /> VERIFIED PRIVATE
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Records", value: "1,000", icon: BarChart3, color: "text-primary bg-primary/10" },
          { label: "Processing Time", value: mockResults.processedTime, icon: TrendingUp, color: "text-success bg-success/10" },
          { label: "Privacy Status", value: "✓ Verified", icon: ShieldCheck, color: "text-emerald-400 bg-emerald-500/10" },
          { label: "Data Confidence", value: mockResults.confidence, icon: CheckCircle, color: "text-purple-400 bg-purple-500/10" },
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
          { icon: "📊", title: "Top Category", value: "Category A (45%)", sub: "Most frequent" },
          { icon: "📈", title: "Average Score", value: "8.5/10", sub: "Overall quality" },
          { icon: "✓", title: "Verified Records", value: "998/1000", sub: "98.8% valid" },
          { icon: "🔒", title: "Privacy Status", value: "✓ Verified", sub: "Zero exposure" },
        ].map((ins) => (
          <div key={ins.title} className="glass-card p-5 hover:scale-[1.02] transition-transform">
            <span className="text-2xl">{ins.icon}</span>
            <p className="text-xs text-muted-foreground mt-2">{ins.title}</p>
            <p className="text-lg font-bold text-foreground mt-1">{ins.value}</p>
            <p className="text-xs text-muted-foreground">{ins.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fill: "hsl(218, 11%, 82%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(218, 11%, 82%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(219, 24%, 20%)", border: "1px solid hsl(219, 24%, 28%)", borderRadius: 8, color: "#fff" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Percentage Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data} dataKey="percentage" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(219, 24%, 20%)", border: "1px solid hsl(219, 24%, 28%)", borderRadius: 8, color: "#fff" }}
              />
              <Legend
                formatter={(value) => <span style={{ color: "hsl(218, 11%, 82%)", fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trends Table */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Analysis Breakdown</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-xs text-muted-foreground">Category</th>
              <th className="text-left py-2 text-xs text-muted-foreground">Count</th>
              <th className="text-left py-2 text-xs text-muted-foreground">Percentage</th>
              <th className="text-left py-2 text-xs text-muted-foreground">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c, i) => (
              <tr key={c.name} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-secondary/30" : ""}`}>
                <td className="py-3 text-foreground font-medium">{c.name}</td>
                <td className="py-3 text-foreground">{c.count}</td>
                <td className="py-3 text-foreground">{c.percentage}%</td>
                <td className="py-3">
                  <span className={c.trend === "up" ? "text-success" : c.trend === "down" ? "text-destructive" : "text-muted-foreground"}>
                    {c.trend === "up" ? `↑ Up ${c.change}%` : c.trend === "down" ? `↓ Down ${c.change}%` : "→ Stable"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Downloads */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Download Results</h3>
        <div className="flex gap-3">
          {[
            { label: "Download PDF", icon: Download },
            { label: "Download CSV", icon: Download },
            { label: "Download JSON", icon: Download },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => toast.success(`${btn.label} started`)}
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
