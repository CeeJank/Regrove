import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChildDocumentation, CANSItem } from '../types';

interface DocumentationContextType {
  docs: ChildDocumentation[];
  getDocByChildId: (childId: string) => ChildDocumentation | undefined;
  upsertDoc: (doc: ChildDocumentation) => void;
  updateCANS: (childId: string, items: CANSItem[]) => void;
  appendMeetupNotes: (childId: string, notes: string) => void;
  updateSummary: (childId: string, summary: string) => void;
  appendExtraNotes: (childId: string, notes: string) => void;
}

const DocumentationContext = createContext<DocumentationContextType | undefined>(undefined);

const MOCK_DOCS: ChildDocumentation[] = [
  {
    id: 'doc-1', childId: 'child-1', fullName: 'Alex Rivera', nricLast4: '123A',
    dateOfBirth: '2008-03-15', gender: 'Male', race: 'Hispanic', nationality: 'Singaporean PR',
    address: '10 Toa Payoh Central, #08-01, Singapore 310010', parentContact: '+65 9123 4567',
    school: 'Toa Payoh Secondary School', level: 'Secondary 3', hobbies: 'Floorball, Reading',
    cansItems: [
      {
        id: 'cans-1', domain: 'Strengths', item: 'Recreation', rating: 1,
        caseNotes: "Assessed as useful strength. C expressed strong interest and prior experience in floorball.\n\nC participated in school competitions previously and proactively sought opportunities to continue involvement in sports. CW assessed that C demonstrates a clear interest and competency in floorball, which can serve as a positive avenue for engagement, social connection, and identity development.",
        actions: "CW explored C's hobbies and prior involvement in floorball.\nCW provided information regarding VOX Floorball programme, training arrangements, and participation opportunities.\nCW encouraged C's interest in community engagement and sports participation.\nCW obtained C's Telegram contact for follow-up communication regarding programme participation.",
      },
    ],
    summary: 'Alex is a 16-year-old male currently in Secondary 3 at Toa Payoh Secondary School. He has shown consistent improvement and demonstrates a strong interest in sports, particularly floorball, which serves as a positive engagement avenue.',
    extraNotes: '',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'doc-2', childId: 'child-2', fullName: 'Jamie Tan', nricLast4: '456B',
    dateOfBirth: '2009-07-22', gender: 'Female', race: 'Chinese', nationality: 'Singaporean',
    address: '5 Clementi Ave 3, #12-05, Singapore 120005', parentContact: '+65 9234 5678',
    school: 'Clementi Secondary School', level: 'Secondary 2', hobbies: 'Art, Music',
    cansItems: [], summary: '', extraNotes: '', lastUpdated: new Date().toISOString(),
  },
  {
    id: 'doc-3', childId: 'child-3', fullName: 'Sam Lim', nricLast4: '789C',
    dateOfBirth: '2010-01-10', gender: 'Male', race: 'Chinese', nationality: 'Singaporean',
    address: '22 Jurong East Ave 1, #05-10, Singapore 609726', parentContact: '+65 9345 6789',
    school: 'Jurong East Secondary School', level: 'Secondary 1', hobbies: 'Gaming, Football',
    cansItems: [], summary: '', extraNotes: '', lastUpdated: new Date().toISOString(),
  },
];

export const DocumentationProvider = ({ children }: { children: ReactNode }) => {
  const [docs, setDocs] = useState<ChildDocumentation[]>(MOCK_DOCS);

  const getDocByChildId = (childId: string) => docs.find(d => d.childId === childId);

  const upsertDoc = (doc: ChildDocumentation) => {
    setDocs(prev => {
      const exists = prev.find(d => d.childId === doc.childId);
      if (exists) return prev.map(d => d.childId === doc.childId ? { ...doc, lastUpdated: new Date().toISOString() } : d);
      return [...prev, { ...doc, lastUpdated: new Date().toISOString() }];
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
      const existing = d.extraNotes ? d.extraNotes + '\n\n' : '';
      return { ...d, extraNotes: existing + notes, lastUpdated: new Date().toISOString() };
    }));
  };

  const appendMeetupNotes = (childId: string, notes: string) => {
    setDocs(prev => prev.map(d => {
      if (d.childId !== childId) return d;
      const newItem: CANSItem = {
        id: `cans-meetup-${Date.now()}`, domain: 'Meetup Session',
        item: 'AI Session Notes', rating: 1, caseNotes: notes, actions: 'Generated from meetup session.',
      };
      return { ...d, cansItems: [...d.cansItems, newItem], lastUpdated: new Date().toISOString() };
    }));
  };

  return (
    <DocumentationContext.Provider value={{
      docs, getDocByChildId, upsertDoc, updateCANS, appendMeetupNotes, updateSummary, appendExtraNotes,
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