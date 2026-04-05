import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAgent, deleteAgent, mockExecutions, mockLogs, mockResults, type LogEntry } from "@/lib/mock-data";
import { toast } from "sonner";
import {
  Copy, Check, ShieldCheck, ShieldX, Clock, Play, Pause, Square, Trash2,
  Download, Clipboard, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const agent = getAgent(id || "");
  const [tab, setTab] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<"All" | "INFO" | "WARNING" | "ERROR">("All");
  const [logSearch, setLogSearch] = useState("");
  const [resultsFormat, setResultsFormat] = useState<"json" | "table">("table");
  const [privacyExpanded, setPrivacyExpanded] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredLogs = useMemo(() => {
    let logs: LogEntry[] = mockLogs;
    if (logFilter !== "All") logs = logs.filter((l) => l.level === logFilter);
    if (logSearch) {
      const q = logSearch.toLowerCase();
      logs = logs.filter((l) => l.message.toLowerCase().includes(q));
    }
    return logs;
  }, [logFilter, logSearch]);

  if (!agent) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Agent not found. <button onClick={() => navigate("/dashboard/agents")} className="text-primary hover:underline">Go back</button>
      </div>
    );
  }

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(null), 1500);
  };

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <button onClick={() => copy(text, field)} className="ml-2 text-muted-foreground hover:text-foreground transition">
      {copiedField === field ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
    </button>
  );

  const executions = mockExecutions.filter((e) => e.agentId === agent.id);

  const statusColor = agent.status === "running" ? "text-primary" : agent.status === "completed" ? "text-success" : agent.status === "failed" ? "text-destructive" : "text-warning";
  const statusIcon = agent.status === "running" || agent.status === "completed" ? "🟢" : agent.status === "failed" ? "🔴" : "🟡";

  const tabs = ["Configuration", "Results", "Execution History", "Privacy & Proof ⭐", "Logs"];

  const handleAction = async (action: string) => {
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setActionLoading(false);
    toast.success(`Agent ${action}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="font-mono text-xs text-muted-foreground flex items-center">
              {agent.id} <CopyBtn text={agent.id} field="agentId" />
            </span>
            <span className={`text-xs font-medium ${statusColor}`}>{statusIcon} {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Last run: {agent.lastRun}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition border-b-2 ${
              tab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass-card p-6">
        {tab === 0 && (
          <div className="space-y-4">
            {[
              { label: "Name", value: agent.name },
              { label: "Description", value: agent.description || "—" },
              { label: "Type", value: agent.type },
              { label: "Created", value: agent.created },
              { label: "Data Source", value: `${agent.dataSource.type.toUpperCase()} — ${agent.dataSource.details}` },
              { label: "Privacy Mode", value: agent.privacyMode.charAt(0).toUpperCase() + agent.privacyMode.slice(1) },
              { label: "Encryption", value: agent.encryption ? "Enabled" : "Disabled" },
              { label: "Proof Generation", value: agent.proofGeneration ? "Enabled" : "Disabled" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-secondary rounded-md p-4">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-semibold text-foreground mt-1">Completed at 2025-03-28 14:32</p>
              </div>
              <div className="bg-secondary rounded-md p-4">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-semibold text-foreground mt-1">{mockResults.processedTime}</p>
              </div>
              <div className="bg-secondary rounded-md p-4">
                <p className="text-xs text-muted-foreground">Rows Processed</p>
                <p className="text-sm font-semibold text-foreground mt-1">{mockResults.totalRecords.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              {(["table", "json"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setResultsFormat(f)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                    resultsFormat === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>

            {resultsFormat === "table" ? (
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
                  {mockResults.categories.map((c) => (
                    <tr key={c.name} className="border-b border-border/50">
                      <td className="py-2 text-foreground">{c.name}</td>
                      <td className="py-2 text-foreground">{c.count}</td>
                      <td className="py-2 text-foreground">{c.percentage}%</td>
                      <td className="py-2">
                        <span className={c.trend === "up" ? "text-success" : c.trend === "down" ? "text-destructive" : "text-muted-foreground"}>
                          {c.trend === "up" ? "↑" : c.trend === "down" ? "↓" : "→"} {c.trend === "stable" ? "Stable" : `${c.change}%`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <pre className="bg-secondary rounded-md p-4 text-xs text-foreground overflow-x-auto font-mono">
                {JSON.stringify(mockResults, null, 2)}
              </pre>
            )}

            <div className="flex gap-2">
              <button onClick={() => toast.success("Downloaded as JSON")} className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-secondary text-foreground text-xs hover:bg-accent transition">
                <Download className="h-3 w-3" /> Download JSON
              </button>
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(mockResults)); toast.success("Copied!"); }} className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-secondary text-foreground text-xs hover:bg-accent transition">
                <Clipboard className="h-3 w-3" /> Copy
              </button>
            </div>
          </div>
        )}

        {tab === 2 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs text-muted-foreground">Run ID</th>
                <th className="text-left py-2 text-xs text-muted-foreground">Started</th>
                <th className="text-left py-2 text-xs text-muted-foreground">Completed</th>
                <th className="text-left py-2 text-xs text-muted-foreground">Duration</th>
                <th className="text-left py-2 text-xs text-muted-foreground">Status</th>
                <th className="text-left py-2 text-xs text-muted-foreground">Proof</th>
              </tr>
            </thead>
            <tbody>
              {executions.length > 0 ? executions.map((ex) => (
                <tr key={ex.id} className="border-b border-border/50 hover:bg-accent/30 transition">
                  <td className="py-2 font-mono text-xs text-muted-foreground">{ex.id}</td>
                  <td className="py-2 text-foreground">{ex.started}</td>
                  <td className="py-2 text-foreground">{ex.completed}</td>
                  <td className="py-2 text-foreground">{ex.duration}</td>
                  <td className="py-2 text-success">✓ {ex.status.charAt(0).toUpperCase() + ex.status.slice(1)}</td>
                  <td className="py-2">
                    {ex.proofStatus === "verified" ? (
                      <span className="privacy-badge-verified px-2 py-0.5 rounded text-xs">✓ Verified</span>
                    ) : (
                      <span className="privacy-badge-pending px-2 py-0.5 rounded text-xs">⏳ Pending</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No executions yet</td></tr>
              )}
            </tbody>
          </table>
        )}

        {tab === 3 && (
          <div className="space-y-8">
            {/* Large Privacy Badge */}
            <div className="text-center py-8">
              {agent.privacyStatus === "verified" ? (
                <div className="inline-flex flex-col items-center animate-pulse-glow rounded-2xl p-8 privacy-badge-verified">
                  <ShieldCheck className="h-16 w-16 mb-3" />
                  <span className="text-2xl font-bold">✓ VERIFIED PRIVATE</span>
                  <span className="text-sm mt-1 opacity-80">All executions verified</span>
                </div>
              ) : agent.privacyStatus === "pending" ? (
                <div className="inline-flex flex-col items-center rounded-2xl p-8 privacy-badge-pending">
                  <Clock className="h-16 w-16 mb-3" />
                  <span className="text-2xl font-bold">⏳ PENDING VERIFICATION</span>
                </div>
              ) : (
                <div className="inline-flex flex-col items-center rounded-2xl p-8 privacy-badge-failed">
                  <ShieldX className="h-16 w-16 mb-3" />
                  <span className="text-2xl font-bold">✗ VERIFICATION FAILED</span>
                </div>
              )}
            </div>

            {/* Proof Details */}
            <div className="bg-secondary rounded-lg p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground mb-3">Proof Details</h3>
              {[
                { label: "Proof ID", value: "proof_" + (agent.id.split("_")[1] || "7a2f9k1m"), mono: true },
                { label: "Proof Hash", value: "0xa1b2c3d4e5f67890abcdef1234567890abcdef12", mono: true },
                { label: "Proof Type", value: "SHA-256 Hash" },
                { label: "Generated", value: "2025-03-28 14:32:00 UTC" },
                { label: "Verified", value: "2025-03-28 14:32:15 UTC" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className={`text-xs text-foreground flex items-center ${item.mono ? "font-mono" : ""}`}>
                    {item.value.length > 30 ? item.value.slice(0, 30) + "..." : item.value}
                    <CopyBtn text={item.value} field={item.label} />
                  </span>
                </div>
              ))}
            </div>

            {/* Audit Trail */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Execution Audit Trail</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs text-muted-foreground">Execution ID</th>
                    <th className="text-left py-2 text-xs text-muted-foreground">Timestamp</th>
                    <th className="text-left py-2 text-xs text-muted-foreground">Proof Hash</th>
                    <th className="text-left py-2 text-xs text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockExecutions.slice(0, 3).map((ex) => (
                    <tr key={ex.id} className="border-b border-border/50 hover:bg-accent/30 transition">
                      <td className="py-2 font-mono text-xs text-muted-foreground">{ex.id}</td>
                      <td className="py-2 text-foreground text-xs">{ex.started}</td>
                      <td className="py-2">
                        <button
                          onClick={() => copy(ex.proofHash, ex.id)}
                          className="font-mono text-xs text-primary hover:underline"
                          title={ex.proofHash}
                        >
                          {ex.proofHash.slice(0, 16)}...
                        </button>
                      </td>
                      <td className="py-2">
                        {ex.proofStatus === "verified" ? (
                          <span className="privacy-badge-verified px-2 py-0.5 rounded text-xs">✓ Verified</span>
                        ) : (
                          <span className="privacy-badge-pending px-2 py-0.5 rounded text-xs">⏳ Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Privacy Explanation */}
            <button
              onClick={() => setPrivacyExpanded(!privacyExpanded)}
              className="w-full flex items-center justify-between p-4 rounded-md bg-secondary hover:bg-accent transition"
            >
              <span className="text-sm font-medium text-foreground">How does this protect your privacy?</span>
              {privacyExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {privacyExpanded && (
              <div className="bg-secondary/50 rounded-md p-4 text-sm text-muted-foreground leading-relaxed">
                Privora uses zero-knowledge proofs (ZKPs) to verify that your agent executed correctly without revealing any of the underlying data.
                A cryptographic hash is generated for each execution, creating an immutable audit trail. This means anyone can verify
                that the computation was performed correctly, but no one can access the actual data that was processed. Your data never
                leaves the secure enclave, and the proof serves as mathematical evidence of correct execution.
              </div>
            )}
          </div>
        )}

        {tab === 4 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex gap-1">
                {(["All", "INFO", "WARNING", "ERROR"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setLogFilter(level)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                      logFilter === level ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <input
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search logs..."
                className="flex-1 px-3 py-1.5 rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <div className="bg-[hsl(220,26%,10%)] rounded-md p-4 font-mono text-xs space-y-1 max-h-[400px] overflow-y-auto">
              {filteredLogs.map((log, i) => (
                <div key={i} className={log.level === "INFO" ? "log-info" : log.level === "WARNING" ? "log-warning" : "log-error"}>
                  [{log.timestamp}] [{log.level}] {log.message}
                </div>
              ))}
              {filteredLogs.length === 0 && <div className="text-muted-foreground">No logs matching filter</div>}
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 mt-6">
        {(agent.status === "paused" || agent.status === "completed") && (
          <button onClick={() => handleAction("started")} disabled={actionLoading} className="flex items-center gap-2 px-4 py-2 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin-slow" /> : <Play className="h-4 w-4" />} Start
          </button>
        )}
        {agent.status === "running" && (
          <>
            <button onClick={() => handleAction("paused")} className="flex items-center gap-2 px-4 py-2 rounded-md bg-warning text-warning-foreground text-sm font-medium hover:opacity-90 transition">
              <Pause className="h-4 w-4" /> Pause
            </button>
            <button onClick={() => handleAction("stopped")} className="flex items-center gap-2 px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition">
              <Square className="h-4 w-4" /> Stop
            </button>
          </>
        )}
        <button
          onClick={() => setDeleteConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition ml-auto"
        >
          <Trash2 className="h-4 w-4" /> Delete Agent
        </button>
      </div>

      {/* Delete modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-sm w-full mx-4 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Agent</h3>
            <p className="text-sm text-muted-foreground mb-6">This will permanently delete this agent and all its data.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-accent transition">Cancel</button>
              <button onClick={() => { deleteAgent(agent.id); toast.success("Agent deleted"); navigate("/dashboard/agents"); }} className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm hover:opacity-90 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
