import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Referral } from '../types';

interface ReferralsContextType {
  referrals: Referral[];
  createReferral: (referral: Omit<Referral, 'id' | 'timestamp' | 'status'>) => void;
  respondToReferral: (referralId: string, accept: boolean) => void;
  getIncomingReferrals: (workerId: string) => Referral[];
  getOutgoingReferrals: (workerId: string) => Referral[];
}

const ReferralsContext = createContext<ReferralsContextType | undefined>(undefined);

export const ReferralsProvider = ({ children }: { children: ReactNode }) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const createReferral = (referral: Omit<Referral, 'id' | 'timestamp' | 'status'>) => {
    setReferrals(prev => [
      ...prev,
      { ...referral, id: `ref-${Date.now()}`, timestamp: new Date().toISOString(), status: 'pending' },
    ]);
  };

  const respondToReferral = (referralId: string, accept: boolean) => {
    setReferrals(prev =>
      prev.map(r =>
        r.id === referralId ? { ...r, status: accept ? 'accepted' : 'declined' } : r
      )
    );
  };

  const getIncomingReferrals = (workerId: string) =>
    referrals.filter(r => r.toWorkerId === workerId);

  const getOutgoingReferrals = (workerId: string) =>
    referrals.filter(r => r.fromWorkerId === workerId);

  return (
    <ReferralsContext.Provider
      value={{ referrals, createReferral, respondToReferral, getIncomingReferrals, getOutgoingReferrals }}
    >
      {children}
    </ReferralsContext.Provider>
  );
};

export const useReferrals = () => {
  const ctx = useContext(ReferralsContext);
  if (!ctx) throw new Error('useReferrals must be used within ReferralsProvider');
  return ctx;
};