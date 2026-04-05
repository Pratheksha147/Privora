export interface Agent {
  id: string;
  name: string;
  description: string;
  type: "Data Processing" | "ML Prediction" | "API Integration" | "Custom Task";
  status: "running" | "completed" | "failed" | "paused";
  privacyStatus: "verified" | "unverified" | "pending";
  privacyMode: "max" | "standard" | "fast";
  lastRun: string;
  created: string;
  executions: number;
  dataSource: {
    type: "api" | "file" | "database";
    details: string;
  };
  encryption: boolean;
  proofGeneration: boolean;
}

export interface Execution {
  id: string;
  agentId: string;
  started: string;
  completed: string;
  duration: string;
  status: "completed" | "failed" | "running";
  proofStatus: "verified" | "pending" | "failed";
  proofHash: string;
}

export interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARNING" | "ERROR";
  message: string;
}

export const mockAgents: Agent[] = [
  {
    id: "agent_001",
    name: "Customer Analyzer",
    description: "Analyzes customer behavior patterns using ML models",
    type: "ML Prediction",
    status: "running",
    privacyStatus: "verified",
    privacyMode: "max",
    lastRun: "2 minutes ago",
    created: "2025-03-15",
    executions: 5,
    dataSource: { type: "api", details: "https://api.example.com/customers" },
    encryption: true,
    proofGeneration: true,
  },
  {
    id: "agent_002",
    name: "Data Processor",
    description: "Processes and transforms raw datasets",
    type: "Data Processing",
    status: "completed",
    privacyStatus: "verified",
    privacyMode: "standard",
    lastRun: "1 hour ago",
    created: "2025-03-20",
    executions: 12,
    dataSource: { type: "file", details: "sales_data.csv" },
    encryption: true,
    proofGeneration: true,
  },
  {
    id: "agent_003",
    name: "API Handler",
    description: "Integrates with external APIs for data collection",
    type: "API Integration",
    status: "failed",
    privacyStatus: "unverified",
    privacyMode: "fast",
    lastRun: "3 hours ago",
    created: "2025-03-22",
    executions: 8,
    dataSource: { type: "api", details: "https://api.external.com/v2/data" },
    encryption: true,
    proofGeneration: false,
  },
  {
    id: "agent_004",
    name: "Sentiment Scanner",
    description: "Analyzes text sentiment from social feeds",
    type: "ML Prediction",
    status: "completed",
    privacyStatus: "verified",
    privacyMode: "max",
    lastRun: "30 minutes ago",
    created: "2025-03-18",
    executions: 23,
    dataSource: { type: "database", details: "PostgreSQL - social_feeds" },
    encryption: true,
    proofGeneration: true,
  },
  {
    id: "agent_005",
    name: "Report Generator",
    description: "Generates weekly compliance reports",
    type: "Custom Task",
    status: "paused",
    privacyStatus: "pending",
    privacyMode: "standard",
    lastRun: "2 days ago",
    created: "2025-03-10",
    executions: 3,
    dataSource: { type: "file", details: "compliance_logs.json" },
    encryption: true,
    proofGeneration: true,
  },
];

export const mockExecutions: Execution[] = [
  {
    id: "exec_001",
    agentId: "agent_001",
    started: "2025-03-28 14:32",
    completed: "2025-03-28 14:34",
    duration: "2m 34s",
    status: "completed",
    proofStatus: "verified",
    proofHash: "0xa1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: "exec_002",
    agentId: "agent_001",
    started: "2025-03-28 13:10",
    completed: "2025-03-28 13:15",
    duration: "5m 12s",
    status: "completed",
    proofStatus: "verified",
    proofHash: "0xg7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6",
  },
  {
    id: "exec_003",
    agentId: "agent_001",
    started: "2025-03-28 12:45",
    completed: "2025-03-28 12:50",
    duration: "4m 58s",
    status: "completed",
    proofStatus: "pending",
    proofHash: "0xm2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1",
  },
  {
    id: "exec_004",
    agentId: "agent_002",
    started: "2025-03-28 10:00",
    completed: "2025-03-28 10:03",
    duration: "3m 12s",
    status: "completed",
    proofStatus: "verified",
    proofHash: "0xq2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1",
  },
];

export const mockLogs: LogEntry[] = [
  { timestamp: "14:32:00", level: "INFO", message: "Agent started" },
  { timestamp: "14:32:05", level: "INFO", message: "Fetching data from API" },
  { timestamp: "14:32:08", level: "INFO", message: "Processing data..." },
  { timestamp: "14:32:15", level: "INFO", message: "Received 1000 records" },
  { timestamp: "14:32:30", level: "WARNING", message: "2 records had missing fields, using defaults" },
  { timestamp: "14:33:00", level: "INFO", message: "Running ML prediction model" },
  { timestamp: "14:33:45", level: "INFO", message: "Analysis complete" },
  { timestamp: "14:33:50", level: "INFO", message: "Encrypting results with AES-256" },
  { timestamp: "14:34:00", level: "INFO", message: "Generating privacy proof..." },
  { timestamp: "14:34:10", level: "INFO", message: "Computing SHA-256 hash" },
  { timestamp: "14:34:15", level: "INFO", message: "Privacy verification complete ✓" },
  { timestamp: "14:34:16", level: "INFO", message: "Agent execution finished successfully" },
];

export const mockResults = {
  totalRecords: 1000,
  processedTime: "2m 34s",
  confidence: "98.5%",
  privacyStatus: "verified" as const,
  categories: [
    { name: "Category A", count: 450, percentage: 45, trend: "up", change: 5 },
    { name: "Category B", count: 350, percentage: 35, trend: "down", change: 2 },
    { name: "Category C", count: 150, percentage: 15, trend: "stable", change: 0 },
    { name: "Category D", count: 50, percentage: 5, trend: "up", change: 1 },
  ],
};

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
}

export function getAgents(): Agent[] {
  const stored = localStorage.getItem("ps4_agents");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("ps4_agents", JSON.stringify(mockAgents));
  return mockAgents;
}

export function saveAgents(agents: Agent[]) {
  localStorage.setItem("ps4_agents", JSON.stringify(agents));
}

export function addAgent(agent: Agent) {
  const agents = getAgents();
  agents.unshift(agent);
  saveAgents(agents);
  return agent;
}

export function deleteAgent(id: string) {
  const agents = getAgents().filter((a) => a.id !== id);
  saveAgents(agents);
}

export function getAgent(id: string): Agent | undefined {
  return getAgents().find((a) => a.id === id);
}
