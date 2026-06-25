import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { UnifiedHubEvent } from '../types';

export interface GridEventShape {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  associatedChild: string | null;
  origin: 'manual';
  pillClass: string;
  icon: string;
  context: {
    description?: string;
  } | null;
}

export const useCalendarService = (currentDate: Date) => {
  const [events, setEvents] = useState<UnifiedHubEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Data Stream Pipeline Pipeline
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Keep your exact route endpoint from express router: /api/events/hub
      const response = await axios.get<UnifiedHubEvent[]>('/api/events/hub');
      setEvents(response.data);
    } catch (err: any) {
      // Grabs the exact message sent by your controller or falls back cleanly
      setError(err.response?.data?.message || 'Failed to sync timeline data streams');
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Structural Database Mutations
  const createEvent = async (formData: { title: string; description: string; date: string; startTime: string; endTime: string; youthId: number }) => {
    try {
      // Maps to router.post("/", ...) which points to /api/events
      await axios.post('/api/events', formData);
      await fetchFeed(); 
      return true;
    } catch (err) {
      console.error('Service error allocating manual event:', err);
      return false;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      // Maps to router.delete("/:id", ...) which points to /api/events/:id
      await axios.delete(`/api/events/${eventId}`);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      return true;
    } catch (err) {
      console.error('Service unauthorized or blocked deletion:', err);
      return false;
    }
  };

  // 3. Grid Row Matrix Filter
  const getEventsForDay = (day: number): GridEventShape[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return events
      .filter(e => e.date === dateStr)
      .map(e => {
        const pillClass = `cal-evt-pill--manual-${(e.status || 'PENDING').toLowerCase()}`;
        
        return {
          id: e.id,
          title: e.title,
          startTime: e.startTime,
          endTime: e.endTime,
          status: e.status || 'PENDING',
          associatedChild: e.associatedChild,
          origin: 'manual' as const,
          pillClass,
          icon: '📅',
          context: e.extraContext
        };
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return {
    loading,
    error,
    createEvent,
    deleteEvent,
    getEventsForDay,
    refresh: fetchFeed
  };
};
