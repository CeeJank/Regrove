import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChildDocumentation, CANSItem } from '../types';
import { apiFetch } from '../services/api';

interface DocumentationContextType {
  docs: ChildDocumentation[];
  getDocByChildId: (childId: string) => ChildDocumentation | undefined;
  fetchDocForChild: (childId: string) => Promise<void>;
  upsertDoc: (doc: ChildDocumentation) => void;
  updateCANS: (childId: string, items: CANSItem[]) => void;
  appendMeetupNotes: (childId: string, notes: string) => void;
  updateSummary: (childId: string, summary: string) => void;
  appendExtraNotes: (childId: string, notes: string) => void;
}

const DocumentationContext = createContext<DocumentationContextType | undefined>(undefined);

export const DocumentationProvider = ({ children }: { children: ReactNode }) => {
  const [docs, setDocs] = useState<ChildDocumentation[]>([]);

  const getDocByChildId = (childId: string) => docs.find(d => d.childId === childId);

  const fetchDocForChild = async (childId: string) => {
    if (docs.some(d => d.childId === childId)) return;
    try {
      const data = await apiFetch<ChildDocumentation>(`/child/${childId}`);
      setDocs(prev => {
        if (prev.some(d => d.childId === childId)) return prev;
        return [...prev, { ...data, lastUpdated: new Date().toISOString() }];
      });
    } catch {}
  };

  const upsertDoc = (doc: ChildDocumentation) => {
    setDocs(prev => {
      const exists = prev.some(d => d.childId === doc.childId);
      const updated = { ...doc, lastUpdated: new Date().toISOString() };
      return exists
        ? prev.map(d => d.childId === doc.childId ? updated : d)
        : [...prev, updated];
    });
  };

  const updateCANS = (childId: string, items: CANSItem[]) => {
    setDocs(prev => prev.map(d =>
      d.childId === childId ? { ...d, cansItems: items, lastUpdated: new Date().toISOString() } : d
    ));
  };

  const updateSummary = (childId: string, summary: string) => {
    setDocs(prev => prev.map(d =>
      d.childId === childId ? { ...d, summary, lastUpdated: new Date().toISOString() } : d
    ));
  };

  const appendExtraNotes = (childId: string, notes: string) => {
    setDocs(prev => prev.map(d => {
      if (d.childId !== childId) return d;
      const existing = d.extraNotes ? `${d.extraNotes}\n\n` : '';
      return { ...d, extraNotes: existing + notes, lastUpdated: new Date().toISOString() };
    }));
  };

  const appendMeetupNotes = (childId: string, notes: string) => {
    setDocs(prev => prev.map(d => {
      if (d.childId !== childId) return d;
      const newItem: CANSItem = {
        id: `cans-meetup-${Date.now()}`,
        domain: 'Meetup Session',
        item: 'AI Session Notes',
        rating: 1,
        caseNotes: notes,
        actions: 'Generated from meetup session.',
      };
      return { ...d, cansItems: [...d.cansItems, newItem], lastUpdated: new Date().toISOString() };
    }));
  };

  return (
    <DocumentationContext.Provider value={{
      docs, getDocByChildId, fetchDocForChild, upsertDoc,
      updateCANS, appendMeetupNotes, updateSummary, appendExtraNotes,
    }}>
      {children}
    </DocumentationContext.Provider>
  );
};

export const useDocumentation = () => {
  const ctx = useContext(DocumentationContext);
  if (!ctx) throw new Error('useDocumentation must be used within DocumentationProvider');
  return ctx;
};
