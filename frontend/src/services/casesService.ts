import { ActiveCase, RiskLevel } from '../types';

const API_BASE = 'http://localhost:5000/api';

// Shape the backend sends back for each case row
interface ApiCase {
  childId: number;
  name: string;
  riskLevel: string;   // DB stores 'HIGH' | 'MEDIUM' | 'LOW' — we normalise below
  status: string;
  lastUpdated: string | null;
  aiSummary: string | null;
}

// Shape the backend sends back for the stat cards
export interface DashboardStats {
  totalCases: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

// Normalise DB uppercase risk levels to the frontend's lowercase RiskLevel type
const normaliseRisk = (raw: string): RiskLevel => {
  const map: Record<string, RiskLevel> = {
    HIGH: 'high',
    CRITICAL: 'high', // treat CRITICAL as high in the frontend
    MEDIUM: 'medium',
    LOW: 'low',
  };
  return map[raw.toUpperCase()] ?? 'low';
};

// Map one API row into the ActiveCase shape the contexts and pages expect
const toActiveCase = (row: ApiCase): ActiveCase => ({
  id: String(row.childId),          // use childId as the case id until a real case table exists
  childId: String(row.childId),
  workerId: '',                      // not returned from this endpoint, filled by context if needed
  name: row.name,
  riskLevel: normaliseRisk(row.riskLevel),
  notes: '',                         // notes loaded separately via active-cases detail endpoint
  aiSummary: row.aiSummary ?? 'No AI summary available yet.',
  lastUpdated: row.lastUpdated ?? new Date().toISOString(),
  checkIns: [],
});

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
