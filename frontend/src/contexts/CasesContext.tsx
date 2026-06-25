import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ActiveCase, CheckIn, RiskLevel, User } from '../types';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';

export type ChildRecord = {
  profileId: string;
  userId: string;
  name: string;
  email: string;
  username: string;
  dateOfBirth: string;
};
export type WorkerRecord = {
  profileId: string;
  userId: string;
  name: string;
  email: string;
};

export interface CreateChildForm {
  fullName: string;
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
}

interface CasesContextType {
  cases: ActiveCase[];
  allChildren: Record<string, ChildRecord>;
  allWorkers: Record<string, WorkerRecord>;
  loading: boolean;
  error: string | null;
  stats?: {
    totalCases: number;
    criticalRisk: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
  addCheckIn: (caseId: string, checkIn: CheckIn) => void;
  updateAiSummary: (caseId: string, summary: string) => void;
  updateRiskLevel: (caseId: string, level: RiskLevel) => Promise<void>;
  updateNotes: (caseId: string, notes: string) => Promise<void>;
  removeCase: (caseId: string) => Promise<void>;
  getCaseByChildId: (childId: string) => ActiveCase | undefined;
  addChildAccount: (form: CreateChildForm) => Promise<void>;
  updateRecentInteraction: (workerId: string, childId: string) => void;
  getRecentChildren: (workerId: string) => string[];
  appendMeetupSummary: (childId: string, summary: string) => void;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

export const CasesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cases, setCases] = useState<ActiveCase[]>([]);
  const [allChildren, setAllChildren] = useState<Record<string, ChildRecord>>({});
  const [allWorkers, setAllWorkers] = useState<Record<string, WorkerRecord>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentMap, setRecentMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    apiFetch<{ cases: ActiveCase[]; children?: Record<string, ChildRecord>; workers?: Record<string, WorkerRecord> }>('/active/')
      .then(data => {
        setCases(data.cases ?? (Array.isArray(data) ? (data as ActiveCase[]) : []));
        if (data.children) setAllChildren(data.children);
        if (data.workers) setAllWorkers(data.workers);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load cases');
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const addCheckIn = (caseId: string, checkIn: CheckIn) => {
    setCases(prev => prev.map(c =>
      c.id === caseId
        ? { ...c, checkIns: [...c.checkIns, checkIn], lastUpdated: new Date().toISOString() }
        : c
    ));
  };

  const updateAiSummary = (caseId: string, summary: string) => {
    setCases(prev => prev.map(c =>
      c.id === caseId ? { ...c, aiSummary: summary, lastUpdated: new Date().toISOString() } : c
    ));
  };

  const updateRiskLevel = async (caseId: string, level: RiskLevel) => {
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return;

    setCases(prev => prev.map(c => c.id === caseId ? { ...c, riskLevel: level } : c));

    try {
      await apiFetch(`/children/${targetCase.childId}/risk`, {
        method: 'PATCH',
        body: JSON.stringify({ riskLevel: level }),
      });
    } catch (error) {
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, riskLevel: targetCase.riskLevel } : c));
      throw error;
    }
  };

  const updateNotes = async (caseId: string, notes: string) => {
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return;

    setCases(prev => prev.map(c => c.id === caseId ? { ...c, notes } : c));

    try {
      await apiFetch(`/children/${targetCase.childId}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
      });
    } catch (error) {
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, notes: targetCase.notes } : c));
      throw error;
    }
  };

  const removeCase = async (caseId: string) => {
    const c = cases.find(cs => cs.id === caseId);
    if (!c) return;
    await apiFetch(`/cans_case/${c.childId}`, { method: 'DELETE' });
    setCases(prev => prev.filter(cs => cs.id !== caseId));
  };

  const getCaseByChildId = (childId: string) => cases.find(c => c.childId === childId);

  const addChildAccount = async (form: CreateChildForm) => {
    const createdResponse = await apiFetch<{ success: boolean; data: { id: number; user_id?: number | null; full_name: string } }>('/child', {
      method: 'POST',
      body: JSON.stringify({
        full_name: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password,
        dateOfBirth: form.dateOfBirth,
      }),
    });
    const created = createdResponse.data;
    const childId = String(created.id);

    setAllChildren(prev => ({
      ...prev,
      [childId]: {
        profileId: childId,
        userId: created.user_id ? String(created.user_id) : '',
        name: created.full_name,
        email: form.email,
        username: form.username,
        dateOfBirth: form.dateOfBirth,
      },
    }));

    setCases(prev => [...prev, {
      id: childId,
      childId,
      workerId: user?.id ?? '',
      name: created.full_name,
      age: null,
      school: null,
      category: null,
      riskLevel: 'low',
      notes: '',
      aiSummary: '',
      lastUpdated: new Date().toISOString(),
      checkIns: [],
      notesHistory: [],
    }]);

    if (user) {
      setRecentMap(prev => {
        const list = prev[user.id] ?? [];
        return { ...prev, [user.id]: [childId, ...list.filter(id => id !== childId)] };
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
    const c = cases.find(cs => cs.childId === childId);
    if (c) {
      const existing = c.aiSummary ? `${c.aiSummary}\n\n` : '';
      updateAiSummary(c.id, `${existing}[Meetup Session] ${summary}`);
    }
  };

  return (
    <CasesContext.Provider value={{
      cases, allChildren, allWorkers, loading, error,
      stats: {
        totalCases: cases.length,
        criticalRisk: cases.filter(c => c.riskLevel === 'critical').length,
        highRisk: cases.filter(c => c.riskLevel === 'high').length,
        mediumRisk: cases.filter(c => c.riskLevel === 'medium').length,
        lowRisk: cases.filter(c => c.riskLevel === 'low').length,
      },
      addCheckIn, updateAiSummary, updateRiskLevel, updateNotes,
      removeCase, getCaseByChildId, addChildAccount,
      updateRecentInteraction, getRecentChildren, appendMeetupSummary,
    }}>
      {children}
    </CasesContext.Provider>
  );
};

export const useCases = () => {
  const ctx = useContext(CasesContext);
  if (!ctx) throw new Error('useCases must be used within CasesProvider');
  return ctx;
};
