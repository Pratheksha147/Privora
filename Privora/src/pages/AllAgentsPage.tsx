import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAgents, deleteAgent } from "@/lib/api";
import { useEffect } from "react";
import { Search, PlusCircle, MoreHorizontal, Trash2, Eye, ShieldCheck, ShieldX, Clock } from "lucide-react";
import { toast } from "sonner";



const statusColors: Record<string, string> = {
  running: "text-primary",
  completed: "text-success",
  failed: "text-destructive",
  paused: "text-warning",
};

const statusIcons: Record<string, string> = {
  running: "🟢",
  completed: "🟢",
  failed: "🔴",
  paused: "🟡",
};

export default function AllAgentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("lastRun");
  const [agents, setAgents] = useState<any[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = agents;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q));
    }
    if (statusFilter !== "All") {
      list = list.filter((a) => a.status === statusFilter.toLowerCase());
    }
    if (sortBy === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [agents, search, statusFilter, sortBy]);

  const handleDelete = async (id: string) => {
  await deleteAgent(id);
  setAgents((prev) => prev.filter((a) => a.id !== id));
  setDeleteConfirm(null);
  toast.success("Agent deleted");
};

useEffect(() => {
  const loadAgents = async () => {
    try {
      const data = await getAgents();

      const formatted = data.map((a: any) => ({
        ...a,
        id: a._id,
        lastRun: a.lastRun || "Never",
        privacyStatus: a.privacyStatus || "verified"
      }));

      setAgents(formatted);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load agents");
    }
  };

  loadAgents();
}, []);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">All Agents</h1>
        <button
          onClick={() => navigate("/dashboard/create-agent")}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition text-sm"
        >
          <PlusCircle className="h-4 w-4" />
          Create New Agent
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agent name or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-md bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {["All", "Running", "Completed", "Failed", "Paused"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-md bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="lastRun">Sort: Last Run</option>
          <option value="name">Sort: Name (A-Z)</option>
          <option value="created">Sort: Date Created</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Agent ID</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Name</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Type</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Privacy</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Last Run</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((agent) => (
              <tr key={agent.id} className="border-b border-border/50 hover:bg-accent/30 transition">
                <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{agent.id}</td>
                <td className="py-3 px-4">
                  <button onClick={() => navigate(`/dashboard/agents/${agent.id}`)} className="text-primary hover:underline font-medium">
                    {agent.name}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-xs bg-secondary text-muted-foreground">{agent.type}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${statusColors[agent.status]}`}>
                    {statusIcons[agent.status]} {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {agent.privacyStatus === "verified" ? (
                    <span className="inline-flex items-center gap-1 text-xs privacy-badge-verified px-2 py-0.5 rounded">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs privacy-badge-failed px-2 py-0.5 rounded">
                      <ShieldX className="h-3 w-3" /> Unverified
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {agent.lastRun}
                </td>
                <td className="py-3 px-4 text-right relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === agent.id ? null : agent.id)}
                    className="p-1 rounded hover:bg-secondary transition"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {openMenu === agent.id && (
                    <div className="absolute right-4 top-10 bg-card border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={() => { navigate(`/dashboard/agents/${agent.id}`); setOpenMenu(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent transition"
                      >
                        <Eye className="h-3 w-3" /> View
                      </button>
                      <button
                        onClick={() => { setDeleteConfirm(agent.id); setOpenMenu(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">No agents found</div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-sm w-full mx-4 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Agent</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone. Are you sure?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-accent transition">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm hover:opacity-90 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
