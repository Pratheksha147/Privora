import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAgents } from "@/lib/mock-data";
import { Play, CheckCircle, ShieldCheck, TrendingUp, PlusCircle, List } from "lucide-react";

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const agents = getAgents();

  const active = agents.filter((a) => a.status === "running").length;
  const completed = agents.filter((a) => a.status === "completed").length;
  const verified = agents.filter((a) => a.privacyStatus === "verified").length;
  const totalExec = agents.reduce((s, a) => s + a.executions, 0);

  const stats = [
    {
      label: "Active Agents",
      value: active,
      sub: "Currently running",
      icon: Play,
      gradient: "from-[hsl(217,91%,60%)] to-[hsl(217,91%,35%)]",
      glow: "shadow-[0_0_30px_hsl(217,91%,60%,0.3)]",
    },
    {
      label: "Completed",
      value: completed,
      sub: "Total executions",
      icon: CheckCircle,
      gradient: "from-[hsl(160,84%,39%)] to-[hsl(160,84%,25%)]",
      glow: "shadow-[0_0_30px_hsl(160,84%,39%,0.3)]",
    },
    {
      label: "Privacy Verified",
      value: `${verified}/${agents.length}`,
      sub: "All agents verified",
      icon: ShieldCheck,
      gradient: "from-[hsl(174,60%,40%)] to-[hsl(174,60%,28%)]",
      glow: "shadow-[0_0_30px_hsl(174,60%,40%,0.3)]",
    },
    {
      label: "Total Executions",
      value: totalExec,
      sub: "All time",
      icon: TrendingUp,
      gradient: "from-[hsl(270,70%,65%)] to-[hsl(270,70%,40%)]",
      glow: "shadow-[0_0_30px_hsl(270,70%,65%,0.3)]",
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${s.gradient} ${s.glow} p-6 flex flex-col items-center text-center hover:scale-[1.04] transition-transform duration-200 cursor-default`}
          >
            {/* Icon */}
            <div className="mb-3 rounded-full bg-[hsl(0,0%,100%,0.15)] p-3">
              <s.icon className={`h-5 w-5 text-[hsl(0,0%,100%)] ${s.label === "Active Agents" ? "animate-pulse" : ""}`} />
            </div>
            {/* Number */}
            <p className="text-[48px] font-bold leading-none text-[hsl(0,0%,100%)]">{s.value}</p>
            {/* Label */}
            <p className="mt-2 text-sm font-semibold text-[hsl(0,0%,100%,0.9)]">{s.label}</p>
            <p className="text-xs text-[hsl(0,0%,100%,0.6)]">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Welcome */}
      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome back, <span className="text-primary">{user?.anonId}</span>!
        </h1>
        <p className="text-muted-foreground mb-6">Manage your privacy-preserving agents from here.</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard/create-agent")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Agent
          </button>
          <button
            onClick={() => navigate("/dashboard/agents")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-accent transition"
          >
            <List className="h-4 w-4" />
            View All Agents
          </button>
        </div>
      </div>
    </div>
  );
}
