import { ActiveCase, RiskLevel } from '../types';

const API_BASE = '/api';


// Shape the backend sends back for each case row
interface ApiCase {
  childId: number;
  name: string;
  riskLevel: string;   // DB stores 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL' — normalised below
  status: string;
  age: number | null;
  school: string | null;
  category: string | null;
  lastUpdated: string | null;
  aiSummary: string | null;
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
    CRITICAL: 'critical',
    HIGH:     'high',
    MEDIUM:   'medium',
    LOW:      'low',
  };
  return map[raw.toUpperCase()] ?? 'low';
};

// Map one API row into the ActiveCase shape the contexts and pages expect
const toActiveCase = (row: ApiCase): ActiveCase => ({
  id: String(row.childId),
  childId: String(row.childId),
  workerId: '',
  name: row.name,
  age: row.age ?? null,
  school: row.school ?? null,
  category: row.category ?? null,
  riskLevel: normaliseRisk(row.riskLevel),
  notes: '',
  aiSummary: row.aiSummary ?? 'No AI summary available yet.',
  lastUpdated: row.lastUpdated ?? new Date().toISOString(),
  checkIns: [],
});

export interface WorkerProfile {
  workerId: number;
  fullName: string;
  specialization: string | null;
}

export const fetchWorkerProfile = async (): Promise<WorkerProfile> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/workers/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to load worker profile (${res.status})`);
  return res.json();
};

/**
 * Fetches the full dashboard payload for the logged-in worker.
 * Returns stat card data and the cases list together.
 */
export const fetchDashboard = async (): Promise<{
  stats: DashboardStats;
  cases: ActiveCase[];
}> => {
  const token = localStorage.getItem('token');

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
