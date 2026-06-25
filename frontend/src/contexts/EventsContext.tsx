<<<<<<< HEAD
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
=======
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CalendarEvent } from '../types';

interface EventsContextType {
  events: CalendarEvent[];
  createEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (eventId: string, requesterId: string) => boolean;
  respondToEvent: (eventId: string, userId: string, accept: boolean) => void;
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
  getEventsForUser: (userId: string) => CalendarEvent[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
<<<<<<< HEAD
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
=======
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 'evt-1',
      title: 'Weekly Check-In Session',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:00',
      organizerId: 'worker-1',
      workerIds: ['worker-1'],
      childIds: ['child-1'],
      status: 'confirmed',
    },
    {
      id: 'evt-2',
      title: 'Group Support Meeting',
      date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:30',
      organizerId: 'worker-1',
      workerIds: ['worker-1', 'worker-2'],
      childIds: ['child-1', 'child-2'],
      status: 'pending',
    },
  ]);

  const createEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: `evt-${Date.now()}` };
    setEvents(prev => [...prev, newEvent]);
  };

  const deleteEvent = (eventId: string, requesterId: string): boolean => {
    const event = events.find(e => e.id === eventId);
    if (!event || event.organizerId !== requesterId) return false;
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
    setEvents(prev => prev.filter(e => e.id !== eventId));
    return true;
  };

<<<<<<< HEAD
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
=======
  const respondToEvent = (eventId: string, _userId: string, accept: boolean) => {
    setEvents(prev =>
      prev.map(e =>
        e.id === eventId ? { ...e, status: accept ? 'confirmed' : 'declined' } : e
      )
    );
  };

  const getEventsForUser = (userId: string) =>
    events.filter(
      e => e.organizerId === userId || e.workerIds.includes(userId) || e.childIds.includes(userId)
    );

  return (
    <EventsContext.Provider value={{ events, createEvent, deleteEvent, respondToEvent, getEventsForUser }}>
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
<<<<<<< HEAD
};
=======
};
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
