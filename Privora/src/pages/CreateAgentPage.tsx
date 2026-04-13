import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAgent } from "@/lib/api";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Upload, Loader2, Check } from "lucide-react";

const agentTypes = ["Data Processing", "ML Prediction", "API Integration", "Custom Task"] as const;
const fileTypes = ["CSV", "Excel (.xlsx)", "JSON", "PDF"];
const dbTypes = ["MySQL", "PostgreSQL", "MongoDB", "SQLite"];
const httpMethods = ["GET", "POST", "PUT"];

export default function CreateAgentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Data Processing");

  // Step 2
  const [dataSourceTab, setDataSourceTab] = useState<"api" | "file" | "database">("api");
  const [apiUrl, setApiUrl] = useState("");
  const [apiMethod, setApiMethod] = useState("GET");
  const [apiHeaders, setApiHeaders] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("CSV");
  const [dbType, setDbType] = useState("PostgreSQL");
  const [dbConnection, setDbConnection] = useState("");
  const [privacyMode, setPrivacyMode] = useState<"max" | "standard" | "fast">("standard");
  const [encrypt, setEncrypt] = useState(true);
  const [proofGen, setProofGen] = useState(true);

  const nameError = name.length > 0 && (name.length < 3 || name.length > 50);

  const canNext1 = name.length >= 3 && name.length <= 50;

  const getDataSourceDetails = () => {
    if (dataSourceTab === "api") return apiUrl || "https://api.example.com/data";
    if (dataSourceTab === "file") return fileName || "uploaded_file." + fileType.toLowerCase().replace(/[^a-z]/g, "");
    return `${dbType} connection`;
  };

  const handleCreate = async () => {
  setLoading(true);

  const agent = {
    name,
    description,
    type,
    privacyMode,
    encryption: encrypt,
    proofGeneration: proofGen,
    dataSource: {
      type: dataSourceTab,
      details: getDataSourceDetails(),
    },
  };

  try {
    const res = await createAgent(agent);

    toast.success("Agent created successfully");

    navigate(`/dashboard/agents/${res.id}`);

  } catch (error) {
    toast.error("Failed to create agent");
  }

  setLoading(false);
};

  const privacyOptions = [
    { value: "max", label: "⭐⭐⭐ Max Privacy", desc: "Slower, generates strong proofs", time: "5-30 seconds" },
    { value: "standard", label: "⭐⭐ Standard", desc: "Balanced privacy & speed", time: "2-5 seconds" },
    { value: "fast", label: "⭐ Fast", desc: "Quick execution", time: "<1 second" },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
              s < step ? "bg-success text-success-foreground" : s === step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? "bg-success" : "bg-border"}`} />}
          </React.Fragment>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-6">
        {step === 1 ? "Basic Information" : step === 2 ? "Data Source & Privacy" : "Review & Create"}
      </h1>

      <div className="glass-card p-6">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Agent Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Customer Analyzer"
                maxLength={50}
                className="w-full px-4 py-3 rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              <div className="flex justify-between mt-1">
                {nameError && <p className="text-destructive text-xs">Name must be 3-50 characters</p>}
                <p className="text-xs text-muted-foreground ml-auto">{name.length}/50</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                placeholder="What will this agent do?"
                rows={4}
                className="w-full px-4 py-3 rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/200</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Agent Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 rounded-md bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              >
                {agentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Data Source Tabs */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Select Data Source</label>
              <div className="flex gap-1 bg-secondary rounded-md p-1 mb-4">
                {(["api", "file", "database"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDataSourceTab(tab)}
                    className={`flex-1 py-2 rounded text-sm font-medium transition ${
                      dataSourceTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "api" ? "API Endpoint" : tab === "file" ? "File Upload" : "Database"}
                  </button>
                ))}
              </div>

              {dataSourceTab === "api" && (
                <div className="space-y-3">
                  <input
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.example.com/data"
                    className="w-full px-4 py-3 rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                  <select
                    value={apiMethod}
                    onChange={(e) => setApiMethod(e.target.value)}
                    className="w-full px-4 py-3 rounded-md bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  >
                    {httpMethods.map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <input
                    value={apiHeaders}
                    onChange={(e) => setApiHeaders(e.target.value)}
                    placeholder='Enter headers as JSON (optional)'
                    className="w-full px-4 py-3 rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
              )}

              {dataSourceTab === "file" && (
  <div className="space-y-3">

    <input
      type="file"
      id="fileUpload"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          setFileName(file.name);
          toast.success(`File selected: ${file.name}`);
        }
      }}
    />

    <label
      htmlFor="fileUpload"
      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition block"
    >
      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />

      <p className="text-sm text-muted-foreground">
        {fileName || "Click to upload your file"}
      </p>

      {fileName && (
        <p className="text-xs text-primary mt-1">
          {fileName}
        </p>
      )}

      <button
        type="button"
        className="mt-3 px-4 py-1.5 rounded text-xs bg-secondary text-foreground hover:bg-accent transition"
      >
        Browse
      </button>

    </label>

    <select
      value={fileType}
      onChange={(e) => setFileType(e.target.value)}
      className="w-full px-4 py-3 rounded-md bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
    >
      {fileTypes.map((f) => (
  <option key={f} value={f}>
    {f}
  </option>
))}
    </select>

  </div>
)}

              {dataSourceTab === "database" && (
                <div className="space-y-3">
                  <select
                    value={dbType}
                    onChange={(e) => setDbType(e.target.value)}
                    className="w-full px-4 py-3 rounded-md bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  >
                    {dbTypes.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <div>
                    <input
                      value={dbConnection}
                      onChange={(e) => setDbConnection(e.target.value)}
                      placeholder="Database connection string"
                      className="w-full px-4 py-3 rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                    <p className="text-xs text-muted-foreground mt-1">🔒 Will be encrypted</p>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy Mode */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Privacy Mode</label>
              <div className="space-y-2">
                {privacyOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition ${
                      privacyMode === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      checked={privacyMode === opt.value}
                      onChange={() => setPrivacyMode(opt.value as any)}
                      className="mt-1 accent-primary"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      <p className="text-xs text-muted-foreground">Estimated time: {opt.time}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-md border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Encrypt all data</p>
                  <p className="text-xs text-muted-foreground">Data encrypted with AES-256</p>
                </div>
                <button
                  onClick={() => setEncrypt(!encrypt)}
                  className={`w-11 h-6 rounded-full transition ${encrypt ? "bg-primary" : "bg-secondary"}`}
                >
                  <div className={`w-5 h-5 bg-foreground rounded-full transition-transform ${encrypt ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </label>
              <label className="flex items-center justify-between p-3 rounded-md border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Generate Privacy Proof</p>
                  <p className="text-xs text-muted-foreground">Proof verifies execution securely</p>
                </div>
                <button
                  onClick={() => setProofGen(!proofGen)}
                  className={`w-11 h-6 rounded-full transition ${proofGen ? "bg-primary" : "bg-secondary"}`}
                >
                  <div className={`w-5 h-5 bg-foreground rounded-full transition-transform ${proofGen ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {[
              { label: "Agent Name", value: name },
              { label: "Description", value: description || "—" },
              { label: "Type", value: type },
              { label: "Data Source", value: `${dataSourceTab.toUpperCase()} — ${getDataSourceDetails()}` },
              { label: "Privacy Mode", value: privacyMode.charAt(0).toUpperCase() + privacyMode.slice(1) },
              { label: "Encryption", value: encrypt ? "Enabled" : "Disabled" },
              { label: "Proof Generation", value: proofGen ? "Enabled" : "Disabled" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-start py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => step === 1 ? navigate("/dashboard") : setStep(step - 1)}
            className="flex items-center gap-1 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-accent transition text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 1 ? "Cancel" : "Previous"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !canNext1}
              className="flex items-center gap-1 px-5 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition text-sm disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-md bg-success text-success-foreground font-semibold hover:opacity-90 transition text-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin-slow" />}
              {loading ? "Creating..." : "Create Agent"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
