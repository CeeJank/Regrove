import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ActiveCase, CheckIn, RiskLevel, User } from '../types';
import { apiFetch } from '../services/api';
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

interface CasesContextType {
  cases: ActiveCase[];
  allChildren: Record<string, ChildRecord>;
  allWorkers: Record<string, WorkerRecord>;
  loading: boolean;
  addCheckIn: (caseId: string, checkIn: CheckIn) => void;
  updateAiSummary: (caseId: string, summary: string) => void;
  updateRiskLevel: (caseId: string, level: RiskLevel) => void;
  updateNotes: (caseId: string, notes: string) => void;
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
  const [recentMap, setRecentMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    apiFetch<{ cases: ActiveCase[]; children?: Record<string, ChildRecord>; workers?: Record<string, WorkerRecord> }>('/active/')
      .then(data => {
        setCases(data.cases ?? (Array.isArray(data) ? (data as ActiveCase[]) : []));
        if (data.children) setAllChildren(data.children);
        if (data.workers) setAllWorkers(data.workers);
      })
      .catch(() => {})
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

  const updateRiskLevel = (caseId: string, level: RiskLevel) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, riskLevel: level } : c));
  };

  const updateNotes = (caseId: string, notes: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, notes } : c));
  };

  const removeCase = async (caseId: string) => {
    const c = cases.find(cs => cs.id === caseId);
    if (!c) return;
    await apiFetch(`/cans_case/${c.childId}`, { method: 'DELETE' });
    setCases(prev => prev.filter(cs => cs.id !== caseId));
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
    const c = cases.find(cs => cs.childId === childId);
    if (c) {
      const existing = c.aiSummary ? `${c.aiSummary}\n\n` : '';
      updateAiSummary(c.id, `${existing}[Meetup Session] ${summary}`);
    }
  };

  return (
    <CasesContext.Provider value={{
      cases, allChildren, allWorkers, loading,
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
