import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ActiveCase, CheckIn, RiskLevel } from '../types';
<<<<<<< HEAD
import { apiFetch } from '../services/api';
import { fetchDashboard, DashboardStats } from '../services/casesService';
import { useAuth } from './AuthContext';

export type ChildRecord = { name: string; email: string; username: string; dateOfBirth: string };
export type WorkerRecord = { name: string; email: string };

export interface CreateChildForm {
  fullName: string;
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
}

interface ActivePayload {
  cases?: ActiveCase[];
  children?: Record<string, ChildRecord>;
  workers?: Record<string, WorkerRecord>;
}
=======
import { fetchDashboard, DashboardStats, patchRiskLevel, patchNotes } from '../services/casesService';
>>>>>>> a61d0e1 (added dashboard and child profile routes along with child-profile frontend logic and related components)

interface CasesContextType {
  cases: ActiveCase[];
  stats: DashboardStats | null;
  allChildren: Record<string, ChildRecord>;
  allWorkers: Record<string, WorkerRecord>;
  loading: boolean;
  error: string | null;
  addCheckIn: (caseId: string, checkIn: CheckIn) => void;
  updateAiSummary: (caseId: string, summary: string) => void;
<<<<<<< HEAD
  updateRiskLevel: (caseId: string, level: RiskLevel) => void;
  updateNotes: (caseId: string, notes: string) => void;
  removeCase: (caseId: string) => Promise<void>;
=======
  updateRiskLevel: (caseId: string, level: RiskLevel) => Promise<void>;
  updateNotes: (caseId: string, notes: string) => Promise<void>;
  removeCase: (caseId: string) => void;
>>>>>>> a61d0e1 (added dashboard and child profile routes along with child-profile frontend logic and related components)
  getCaseByChildId: (childId: string) => ActiveCase | undefined;
  addChildAccount: (form: CreateChildForm) => Promise<void>;
  updateRecentInteraction: (workerId: string, childId: string) => void;
  getRecentChildren: (workerId: string) => string[];
  appendMeetupSummary: (childId: string, summary: string) => void;
  refresh: () => Promise<void>;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

const ensureCaseDefaults = (c: ActiveCase): ActiveCase => ({
  ...c,
  name: c.name ?? '',
  notes: c.notes ?? '',
  aiSummary: c.aiSummary ?? '',
  lastUpdated: c.lastUpdated ?? new Date().toISOString(),
  checkIns: c.checkIns ?? [],
  recentWorkerIds: c.recentWorkerIds ?? [],
});

const computeStatsFromCases = (items: ActiveCase[]): DashboardStats => ({
  totalCases: items.length,
  highRisk: items.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length,
  mediumRisk: items.filter(c => c.riskLevel === 'medium').length,
  lowRisk: items.filter(c => c.riskLevel === 'low').length,
});

export const CasesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cases, setCases] = useState<ActiveCase[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allChildren, setAllChildren] = useState<Record<string, ChildRecord>>({});
  const [allWorkers, setAllWorkers] = useState<Record<string, WorkerRecord>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentMap, setRecentMap] = useState<Record<string, string[]>>({});

  const load = async () => {
    if (!user) {
      setCases([]);
      setStats(null);
      setAllChildren({});
      setAllWorkers({});
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [activeResult, dashboardResult] = await Promise.allSettled([
        apiFetch<ActivePayload | ActiveCase[]>('/active/'),
        user.role === 'social_worker' ? fetchDashboard() : Promise.resolve(null),
      ]);

      let nextCases: ActiveCase[] = [];
      let nextStats: DashboardStats | null = null;
      let nextChildren: Record<string, ChildRecord> = {};
      let nextWorkers: Record<string, WorkerRecord> = {};
      let loadError: string | null = null;

      if (activeResult.status === 'fulfilled') {
        const activeData = activeResult.value;
        if (Array.isArray(activeData)) {
          nextCases = activeData.map(ensureCaseDefaults);
        } else {
          nextCases = (activeData.cases ?? []).map(ensureCaseDefaults);
          nextChildren = activeData.children ?? {};
          nextWorkers = activeData.workers ?? {};
        }
      } else {
        loadError = activeResult.reason instanceof Error ? activeResult.reason.message : 'Failed to load cases';
      }

      if (dashboardResult.status === 'fulfilled' && dashboardResult.value) {
        const dashboardData = dashboardResult.value;
        const dashboardCases = dashboardData.cases.map(ensureCaseDefaults);

        nextCases = nextCases.length > 0
          ? nextCases.map(activeCase => {
              const dashboardCase = dashboardCases.find(c => c.childId === activeCase.childId || c.id === activeCase.id);
              return dashboardCase ? ensureCaseDefaults({ ...dashboardCase, ...activeCase }) : activeCase;
            })
          : dashboardCases;

        setStats(dashboardData.stats);
      } else if (nextCases.length > 0) {
        nextStats = computeStatsFromCases(nextCases);
        setStats(nextStats);
      } else {
        setStats(null);
      }

      if (dashboardResult.status === 'rejected' && !nextCases.length) {
        loadError = dashboardResult.reason instanceof Error ? dashboardResult.reason.message : 'Failed to load cases';
      }

      setCases(nextCases);
      setAllChildren(nextChildren);
      setAllWorkers(nextWorkers);
      setError(loadError);
    } catch (err) {
      setCases([]);
      setStats(null);
      setAllChildren({});
      setAllWorkers({});
      setError(err instanceof Error ? err.message : 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  const addCheckIn = (caseId: string, checkIn: CheckIn) => {
    setCases(prev =>
      prev.map(c =>
        c.id === caseId
          ? { ...c, checkIns: [...c.checkIns, checkIn], lastUpdated: new Date().toISOString() }
          : c
      )
    );
  };

  const updateAiSummary = (caseId: string, summary: string) => {
    setCases(prev =>
      prev.map(c =>
        c.id === caseId ? { ...c, aiSummary: summary, lastUpdated: new Date().toISOString() } : c
      )
    );
  };

  const updateRiskLevel = async (caseId: string, level: RiskLevel) => {
    // Optimistic update — UI reflects change immediately
    setCases(prev =>
      prev.map(c => (c.id === caseId ? { ...c, riskLevel: level } : c))
    );
    try {
      await patchRiskLevel(caseId, level);
    } catch (err) {
      console.error('Failed to persist risk level:', err);
      // On failure, re-fetch to restore the true DB state
      load();
    }
  };

  const updateNotes = async (caseId: string, notes: string) => {
    // Optimistic update
    setCases(prev =>
      prev.map(c => (c.id === caseId ? { ...c, notes } : c))
    );
    try {
      await patchNotes(caseId, notes);
    } catch (err) {
      console.error('Failed to persist notes:', err);
      load();
    }
  };

  const removeCase = async (caseId: string) => {
    const activeCase = cases.find(c => c.id === caseId);
    if (!activeCase) return;
    await apiFetch(`/cans_case/${activeCase.childId}`, { method: 'DELETE' });
    setCases(prev => prev.filter(c => c.id !== caseId));
  };

  const getCaseByChildId = (childId: string) => cases.find(c => c.childId === childId);

  const addChildAccount = async (form: CreateChildForm) => {
    const created = await apiFetch<{ id: string; fullName: string; email: string; username: string; dateOfBirth: string }>('/child', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    setAllChildren(prev => ({
      ...prev,
      [created.id]: {
        name: created.fullName,
        email: created.email,
        username: created.username,
        dateOfBirth: created.dateOfBirth,
      },
    }));

    if (user) {
      setRecentMap(prev => {
        const list = prev[user.id] ?? [];
        return { ...prev, [user.id]: [created.id, ...list.filter(id => id !== created.id)] };
      });
    }
  };

  const updateRecentInteraction = (workerId: string, childId: string) => {
    setRecentMap(prev => {
      const list = prev[workerId] ?? [];
      return { ...prev, [workerId]: [childId, ...list.filter(id => id !== childId)] };
    });
  };

  const getRecentChildren = (workerId: string) => recentMap[workerId] ?? [];

  const appendMeetupSummary = (childId: string, summary: string) => {
    const activeCase = cases.find(c => c.childId === childId);
    if (!activeCase) return;
    const existing = activeCase.aiSummary ? `${activeCase.aiSummary}\n\n` : '';
    updateAiSummary(activeCase.id, `${existing}[Meetup Session] ${summary}`);
  };

  return (
    <CasesContext.Provider
      value={{
        cases,
        stats,
        allChildren,
        allWorkers,
        loading,
        error,
        addCheckIn,
        updateAiSummary,
        updateRiskLevel,
        updateNotes,
        removeCase,
        getCaseByChildId,
        addChildAccount,
        updateRecentInteraction,
        getRecentChildren,
        appendMeetupSummary,
        refresh: load,
      }}
    >
      {children}
    </CasesContext.Provider>
  );
};

export const useCases = () => {
  const ctx = useContext(CasesContext);
  if (!ctx) throw new Error('useCases must be used within CasesProvider');
  return ctx;
};
