import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [privacyMode, setPrivacyMode] = useState("standard");
  const [autoProof, setAutoProof] = useState(true);
  const [notifyComplete, setNotifyComplete] = useState(true);
  const [notifyFail, setNotifyFail] = useState(true);
  const [notifyReady, setNotifyReady] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const copyId = () => {
    if (user?.anonId) {
      navigator.clipboard.writeText(user.anonId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition flex-shrink-0 ${value ? "bg-primary" : "bg-secondary"}`}
    >
      <div className={`w-5 h-5 bg-foreground rounded-full transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );

  return (
    <div className="max-w-2xl animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Profile */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        <div className="flex justify-between py-2 border-b border-border/50">
          <span className="text-sm text-muted-foreground">User ID</span>
          <span className="text-sm font-mono text-primary flex items-center gap-1 cursor-pointer" onClick={copyId}>
            {user?.anonId}
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-border/50">
          <span className="text-sm text-muted-foreground">Email</span>
          <span className="text-sm text-foreground">***@{user?.email.split("@")[1] || "example.com"}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-sm text-muted-foreground">Account Created</span>
          <span className="text-sm text-foreground">{user?.createdAt || "2025-03-15"}</span>
        </div>
      </div>

      {/* Privacy */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Privacy Settings</h2>
        <div className="flex justify-between items-center py-2">
          <div>
            <p className="text-sm text-foreground">Default Privacy Mode</p>
            <p className="text-xs text-muted-foreground">Default privacy level for new agents</p>
          </div>
          <select
            value={privacyMode}
            onChange={(e) => setPrivacyMode(e.target.value)}
            className="px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="max">Max Privacy</option>
            <option value="standard">Standard</option>
            <option value="fast">Fast</option>
          </select>
        </div>
        <div className="flex justify-between items-center py-2">
          <div>
            <p className="text-sm text-foreground">Auto-Generate Proofs</p>
            <p className="text-xs text-muted-foreground">Automatically generate privacy proofs</p>
          </div>
          <Toggle value={autoProof} onChange={setAutoProof} />
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        {[
          { label: "Email on agent completion", value: notifyComplete, onChange: setNotifyComplete },
          { label: "Email on agent failure", value: notifyFail, onChange: setNotifyFail },
          { label: "Notify when analysis is ready", value: notifyReady, onChange: setNotifyReady },
        ].map((n) => (
          <div key={n.label} className="flex justify-between items-center py-2">
            <span className="text-sm text-foreground">{n.label}</span>
            <Toggle value={n.value} onChange={n.onChange} />
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border border-destructive/30">
        <h2 className="text-lg font-semibold text-destructive mb-4">Dangerous Zone</h2>
        <button
          onClick={() => setDeleteConfirm(true)}
          className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition"
        >
          Delete Account
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button onClick={() => toast.success("Settings saved")} className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition text-sm">
          Save Settings
        </button>
        <button onClick={() => toast.info("Reset to defaults")} className="px-5 py-2.5 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-accent transition">
          Reset to Defaults
        </button>
      </div>

      {/* Delete modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-sm w-full mx-4 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-6">This will delete your account and all agents. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-accent transition">Cancel</button>
              <button onClick={() => { setDeleteConfirm(false); toast.error("Account deletion simulated"); }} className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm hover:opacity-90 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
