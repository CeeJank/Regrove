import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CalendarEvent } from '../types';

interface EventsContextType {
  events: CalendarEvent[];
  createEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (eventId: string, requesterId: string) => boolean;
  respondToEvent: (eventId: string, userId: string, accept: boolean) => void;
  getEventsForUser: (userId: string) => CalendarEvent[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 'evt-1', title: 'Weekly Check-In Session',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      startTime: '14:00', endTime: '15:00', organizerId: 'worker-1',
      workerIds: ['worker-1'], childIds: ['child-1'], status: 'confirmed',
      inviteStatuses: { 'child-1': 'accepted', 'worker-1': 'accepted' },
    },
    {
      id: 'evt-2', title: 'Group Support Meeting',
      date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      startTime: '10:00', endTime: '11:30', organizerId: 'worker-1',
      workerIds: ['worker-1', 'worker-2'], childIds: ['child-1', 'child-2'], status: 'pending',
      inviteStatuses: { 'worker-1': 'accepted', 'worker-2': 'pending', 'child-1': 'pending', 'child-2': 'pending' },
    },
  ]);

  const createEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: `evt-${Date.now()}` };
    setEvents(prev => [...prev, newEvent]);
  };

  const deleteEvent = (eventId: string, requesterId: string): boolean => {
    const event = events.find(e => e.id === eventId);
    if (!event || event.organizerId !== requesterId) return false;
    setEvents(prev => prev.filter(e => e.id !== eventId));
    return true;
  };

  const respondToEvent = (eventId: string, userId: string, accept: boolean) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      const newStatuses: Record<string, 'pending' | 'accepted' | 'declined'> = { ...(e.inviteStatuses ?? {}), [userId]: accept ? 'accepted' : 'declined' };
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
    events.filter(e => e.organizerId === userId || e.workerIds.includes(userId) || e.childIds.includes(userId));

  return (
    <EventsContext.Provider value={{ events, createEvent, deleteEvent, respondToEvent, getEventsForUser }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
};
