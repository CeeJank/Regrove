import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // Format: YYYY-MM-DD
  startTime: string;
  endTime: string;
  status: string; // PENDING, CONFIRMED, DECLINED
  associatedChild?: string;
  organizerId?: string;
}

interface EventsContextType {
  events: CalendarEvent[];
  loading: boolean;
  refreshEvents: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  const refreshEvents = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetches direct database results from the Express endpoint
      const response = await axios.get<CalendarEvent[]>('/api/events/hub');
      setEvents(response.data);
    } catch (err) {
      console.error('Failed to synchronize events from backend feed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch data whenever a worker logs in
  useEffect(() => {
    if (user) {
      refreshEvents();
    } else {
      setEvents([]);
    }
  }, [user]);

  return (
    <EventsContext.Provider value={{ events, loading, refreshEvents }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
};