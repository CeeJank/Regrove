import { ActiveCase, RiskLevel } from "../types";

const API_BASE = "/api";

// Shape the backend sends back for each case row
interface ApiCase {
  childId: number;
  name: string;
  riskLevel: string;
  status: string;
  age: number | null;
  school: string | null;
  category: string | null;
  lastUpdated: string | null;
  aiSummary: string | null;
  latestNote: string | null;
  checkInsJSON: Array<{
    id: number;
    mood: number;
    events: string;
    timestamp: string;
  }>;
  notesHistoryJSON: Array<{
    id: number;
    noteText: string;
    createdAt: string;
  }>;
}

// Shape the backend sends back for the stat cards
export interface DashboardStats {
  totalCases: number;
  criticalRisk: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

// Normalise DB uppercase risk levels to the frontend's lowercase RiskLevel type
const normaliseRisk = (raw: string): RiskLevel => {
  const map: Record<string, RiskLevel> = {
    CRITICAL: "critical",
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
  };
  return map[raw.toUpperCase()] ?? "low";
};

// Map one API row into the ActiveCase shape the contexts and pages expect
const toActiveCase = (row: ApiCase): ActiveCase => ({
  id: String(row.childId),
  childId: String(row.childId),
  workerId: "",
  name: row.name,
  age: row.age ?? null,
  school: row.school ?? null,
  category: row.category ?? null,
  riskLevel: normaliseRisk(row.riskLevel),
  notes: row.latestNote ?? "", // Retains current snapshot text for editing
  aiSummary: row.aiSummary ?? "No AI summary available yet.",
  lastUpdated: row.lastUpdated ?? new Date().toISOString(),

  // Transform DB check-ins array, fallback to safe array if missing
  checkIns: (row.checkInsJSON ?? []).map((ci) => ({
    id: String(ci.id),
    childId: String(row.childId),
    mood: ci.mood as 1 | 2 | 3 | 4 | 5,
    events: ci.events,
    timestamp: ci.timestamp,
  })),

  // Transform DB historical notes array, fallback safely if empty
  notesHistory: (row.notesHistoryJSON ?? []).map((n) => ({
    id: String(n.id),
    noteText: n.noteText,
    createdAt: n.createdAt,
  })),
});

export interface WorkerProfile {
  workerId: number;
  fullName: string;
  specialization: string | null;
}

export const fetchWorkerProfile = async (): Promise<WorkerProfile> => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/workers/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to load worker profile (${res.status})`);
  return res.json();
};

// PATCH /api/children/:childId/risk
// Persists a risk level change for a youth.
export const patchRiskLevel = async (
  childId: string,
  riskLevel: string,
): Promise<void> => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/children/${childId}/risk`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ riskLevel }),
  });
  if (!res.ok) throw new Error(`Failed to update risk level (${res.status})`);
};

// PATCH /api/children/:childId/notes
// Saves a worker note for a youth (appends a new row to worker_notes).
export const patchNotes = async (
  childId: string,
  notes: string,
): Promise<void> => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/children/${childId}/notes`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) throw new Error(`Failed to save notes (${res.status})`);
};

export const fetchDashboard = async (): Promise<{
  stats: DashboardStats;
  cases: ActiveCase[];
}> => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/workers/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to load dashboard (${res.status})`);
  }

  const data = await res.json();

  return {
    stats: data.stats as DashboardStats,
    cases: (data.cases as ApiCase[]).map(toActiveCase),
  };
};
