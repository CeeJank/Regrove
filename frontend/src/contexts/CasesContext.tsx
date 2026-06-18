import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ActiveCase, CheckIn, RiskLevel } from '../types';
import { fetchDashboard, DashboardStats, patchRiskLevel, patchNotes } from '../services/casesService';

interface CasesContextType {
  cases: ActiveCase[];
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  addCheckIn: (caseId: string, checkIn: CheckIn) => void;
  updateAiSummary: (caseId: string, summary: string) => void;
  updateRiskLevel: (caseId: string, level: RiskLevel) => Promise<void>;
  updateNotes: (caseId: string, notes: string) => Promise<void>;
  removeCase: (caseId: string) => void;
  getCaseByChildId: (childId: string) => ActiveCase | undefined;
  refresh: () => void;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

export const CasesProvider = ({ children }: { children: ReactNode }) => {
  const [cases, setCases] = useState<ActiveCase[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboard();
      setCases(data.cases);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  // Fetch once when the app mounts
  useEffect(() => { load(); }, []);

  // Local optimistic updates — these keep the UI snappy while
  // the real PATCH endpoints get wired in subsequent phases
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

  const removeCase = (caseId: string) => {
    setCases(prev => prev.filter(c => c.id !== caseId));
  };

  const getCaseByChildId = (childId: string) =>
    cases.find(c => c.childId === childId);

  return (
    <CasesContext.Provider
      value={{
        cases,
        stats,
        loading,
        error,
        addCheckIn,
        updateAiSummary,
        updateRiskLevel,
        updateNotes,
        removeCase,
        getCaseByChildId,
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
