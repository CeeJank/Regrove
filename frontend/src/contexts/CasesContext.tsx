import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ActiveCase, CheckIn, RiskLevel, User } from '../types';

export const MOCK_CHILDREN: Record<string, { name: string; email: string; username: string; dateOfBirth: string }> = {
  'child-1': { name: 'Alex Rivera', email: 'alex@regrove.sg', username: 'alexr', dateOfBirth: '2008-03-15' },
  'child-2': { name: 'Jamie Tan', email: 'jamie@regrove.sg', username: 'jamiet', dateOfBirth: '2009-07-22' },
  'child-3': { name: 'Sam Lim', email: 'sam@regrove.sg', username: 'saml', dateOfBirth: '2010-01-10' },
};

export const MOCK_WORKERS: Record<string, { name: string; email: string }> = {
  'worker-1': { name: 'Sarah Chen', email: 'sarah@regrove.sg' },
  'worker-2': { name: 'Marcus Lee', email: 'marcus@regrove.sg' },
  'worker-3': { name: 'Priya Nair', email: 'priya@regrove.sg' },
};

interface CasesContextType {
  cases: ActiveCase[];
  allChildren: typeof MOCK_CHILDREN;
  allWorkers: typeof MOCK_WORKERS;
  addCheckIn: (caseId: string, checkIn: CheckIn) => void;
  updateAiSummary: (caseId: string, summary: string) => void;
  updateRiskLevel: (caseId: string, level: RiskLevel) => void;
  updateNotes: (caseId: string, notes: string) => void;
  removeCase: (caseId: string) => void;
  getCaseByChildId: (childId: string) => ActiveCase | undefined;
  addChildAccount: (child: User) => void;
  updateRecentInteraction: (workerId: string, childId: string) => void;
  getRecentChildren: (workerId: string) => string[];
  appendMeetupSummary: (childId: string, summary: string) => void;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

const MOCK_CASES: ActiveCase[] = [
  {
    id: 'case-1', childId: 'child-1', workerId: 'worker-1', riskLevel: 'medium',
    notes: 'Child shows signs of improvement over the past two weeks.',
    aiSummary: 'Recent check-ins suggest moderate stress related to school. Mood trend: improving.',
    lastUpdated: new Date().toISOString(), checkIns: [], recentWorkerIds: ['worker-1'],
  },
  {
    id: 'case-2', childId: 'child-2', workerId: 'worker-1', riskLevel: 'high',
    notes: 'Requires urgent follow-up regarding home situation.',
    aiSummary: 'Multiple negative mood entries logged this week. Flagged: family conflict, isolation.',
    lastUpdated: new Date().toISOString(), checkIns: [], recentWorkerIds: ['worker-1'],
  },
  {
    id: 'case-3', childId: 'child-3', workerId: 'worker-1', riskLevel: 'low',
    notes: 'Progressing well. Consider de-escalation review next month.',
    aiSummary: 'Consistent positive mood. Chatbot sessions focus on school achievements.',
    lastUpdated: new Date().toISOString(), checkIns: [], recentWorkerIds: ['worker-1'],
  },
];

export const CasesProvider = ({ children }: { children: ReactNode }) => {
  const [cases, setCases] = useState<ActiveCase[]>(MOCK_CASES);
  const [childrenMap, setChildrenMap] = useState(MOCK_CHILDREN);
  // Track recent interactions per worker: workerId -> ordered list of childIds
  const [recentMap, setRecentMap] = useState<Record<string, string[]>>({
    'worker-1': ['child-1', 'child-2', 'child-3'],
  });

  const addCheckIn = (caseId: string, checkIn: CheckIn) => {
    setCases(prev => prev.map(c =>
      c.id === caseId ? { ...c, checkIns: [...c.checkIns, checkIn], lastUpdated: new Date().toISOString() } : c
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

  const removeCase = (caseId: string) => {
    setCases(prev => prev.filter(c => c.id !== caseId));
  };

  const getCaseByChildId = (childId: string) => cases.find(c => c.childId === childId);

  const addChildAccount = (child: User) => {
    setChildrenMap(prev => ({
      ...prev,
      [child.id]: { name: child.fullName, email: child.email, username: child.username, dateOfBirth: child.dateOfBirth || '' },
    }));
    const newCase: ActiveCase = {
      id: `case-${Date.now()}`, childId: child.id, workerId: 'worker-1',
      riskLevel: 'low', notes: '', aiSummary: '',
      lastUpdated: new Date().toISOString(), checkIns: [], recentWorkerIds: ['worker-1'],
    };
    setCases(prev => [...prev, newCase]);
  };

  const updateRecentInteraction = (workerId: string, childId: string) => {
    setRecentMap(prev => {
      const list = prev[workerId] ?? [];
      const filtered = list.filter(id => id !== childId);
      return { ...prev, [workerId]: [childId, ...filtered] };
    });
  };

  const getRecentChildren = (workerId: string) => recentMap[workerId] ?? [];

  const appendMeetupSummary = (childId: string, summary: string) => {
    const c = cases.find(cs => cs.childId === childId);
    if (c) {
      updateAiSummary(c.id, `${c.aiSummary}\n\n[Meetup Session] ${summary}`);
    }
  };

  return (
    <CasesContext.Provider value={{
      cases, allChildren: childrenMap, allWorkers: MOCK_WORKERS,
      addCheckIn, updateAiSummary, updateRiskLevel, updateNotes, removeCase,
      getCaseByChildId, addChildAccount, updateRecentInteraction, getRecentChildren, appendMeetupSummary,
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
