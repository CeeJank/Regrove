import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarEvent } from '../types';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';

interface EventsContextType {
  events: CalendarEvent[];
  loading: boolean;
  createEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  deleteEvent: (eventId: string, requesterId: string) => Promise<boolean>;
  respondToEvent: (eventId: string, userId: string, accept: boolean) => Promise<void>;
  getEventsForUser: (userId: string) => CalendarEvent[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    apiFetch<CalendarEvent[]>('/events/hub')
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const createEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    const created = await apiFetch<CalendarEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
    setEvents(prev => [...prev, created]);
  };

  const deleteEvent = async (eventId: string, requesterId: string): Promise<boolean> => {
    const event = events.find(e => e.id === eventId);
    if (!event || event.organizerId !== requesterId) return false;
    await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
    setEvents(prev => prev.filter(e => e.id !== eventId));
    return true;
  };

  const respondToEvent = async (eventId: string, userId: string, accept: boolean) => {
    const status = accept ? 'accepted' : 'declined';
    await apiFetch(`/events/${eventId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ userId, status }),
    });
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      const newStatuses: Record<string, 'pending' | 'accepted' | 'declined'> = {
        ...(e.inviteStatuses ?? {}),
        [userId]: status,
      };
      const allParticipants = [...e.workerIds, ...e.childIds];
      const allAccepted = allParticipants.every(id => newStatuses[id] === 'accepted');
      const anyDeclined = allParticipants.some(id => newStatuses[id] === 'declined');
      return {
        ...e,
        inviteStatuses: newStatuses,
        status: allAccepted ? 'confirmed' : anyDeclined ? 'declined' : 'pending',
      };
    }));
  };

  const getEventsForUser = (userId: string) =>
    events.filter(e =>
      e.organizerId === userId ||
      e.workerIds.includes(userId) ||
      e.childIds.includes(userId)
    );

  return (
    <EventsContext.Provider value={{ events, loading, createEvent, deleteEvent, respondToEvent, getEventsForUser }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
};
