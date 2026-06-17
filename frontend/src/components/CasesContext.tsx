import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ActiveCase, CheckIn, RiskLevel } from '../types';

interface CasesContextType {
  cases: ActiveCase[];
  addCheckIn: (caseId: string, checkIn: CheckIn) => void;
  updateAiSummary: (caseId: string, summary: string) => void;
  updateRiskLevel: (caseId: string, level: RiskLevel) => void;
  updateNotes: (caseId: string, notes: string) => void;
  removeCase: (caseId: string) => void;
  getCaseByChildId: (childId: string) => ActiveCase | undefined;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

const MOCK_CASES: ActiveCase[] = [
  {
    id: 'case-1',
    childId: 'child-1',
    workerId: 'worker-1',
    riskLevel: 'medium',
    notes: 'Child shows signs of improvement over the past two weeks.',
    aiSummary: 'Recent check-ins suggest the child is experiencing moderate stress related to school. Mood trend: improving.',
    lastUpdated: new Date().toISOString(),
    checkIns: [],
  },
  {
    id: 'case-2',
    childId: 'child-2',
    workerId: 'worker-1',
    riskLevel: 'high',
    notes: 'Requires urgent follow-up regarding home situation.',
    aiSummary: 'Multiple negative mood entries logged this week. Flagged topics: family conflict, isolation.',
    lastUpdated: new Date().toISOString(),
    checkIns: [],
  },
  {
    id: 'case-3',
    childId: 'child-3',
    workerId: 'worker-1',
    riskLevel: 'low',
    notes: 'Progressing well. Consider de-escalation review next month.',
    aiSummary: 'Consistent positive mood. Chatbot sessions focus on school achievements.',
    lastUpdated: new Date().toISOString(),
    checkIns: [],
  },
];

export const CasesProvider = ({ children }: { children: ReactNode }) => {
  const [cases, setCases] = useState<ActiveCase[]>(MOCK_CASES);

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
      prev.map(c => (c.id === caseId ? { ...c, aiSummary: summary, lastUpdated: new Date().toISOString() } : c))
    );
  };

  const updateRiskLevel = (caseId: string, level: RiskLevel) => {
    setCases(prev => prev.map(c => (c.id === caseId ? { ...c, riskLevel: level } : c)));
  };

  const updateNotes = (caseId: string, notes: string) => {
    setCases(prev => prev.map(c => (c.id === caseId ? { ...c, notes } : c)));
  };

  const removeCase = (caseId: string) => {
    setCases(prev => prev.filter(c => c.id !== caseId));
  };

  const getCaseByChildId = (childId: string) => cases.find(c => c.childId === childId);

  return (
    <CasesContext.Provider value={{ cases, addCheckIn, updateAiSummary, updateRiskLevel, updateNotes, removeCase, getCaseByChildId }}>
      {children}
    </CasesContext.Provider>
  );
};

export const useCases = () => {
  const ctx = useContext(CasesContext);
  if (!ctx) throw new Error('useCases must be used within CasesProvider');
  return ctx;
};