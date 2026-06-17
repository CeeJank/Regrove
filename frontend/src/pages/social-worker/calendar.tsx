import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../contexts/EventsContext';
import { CalendarEvent } from '../../types';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const MOCK_WORKERS: Record<string, string> = { 'worker-1': 'Sarah Chen', 'worker-2': 'Marcus Lee' };
const MOCK_CHILDREN: Record<string, string> = { 'child-1': 'Alex Rivera', 'child-2': 'Jamie Tan', 'child-3': 'Sam Lim' };

const SWCalendar: React.FC = () => {
  const { user } = useAuth();
  const { events, createEvent, deleteEvent, getEventsForUser } = useEvents();
  const [current, setCurrent] = useState(new Date());
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', date: '', startTime: '09:00', endTime: '10:00',
    workerIds: ['worker-1', 'worker-2'], childIds: ['child-1'],
  });
  const [deleteMsg, setDeleteMsg] = useState('');

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const userEvents = user ? getEventsForUser(user.id) : [];

  const eventsOnDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return userEvents.filter(e => e.date === dateStr);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    createEvent({
      ...form,
      organizerId: user.id,
      status: 'pending',
    });
    setShowCreate(false);
    setForm({ title: '', date: '', startTime: '09:00', endTime: '10:00', workerIds: ['worker-1', 'worker-2'], childIds: ['child-1'] });
  };

  const handleDelete = (evt: CalendarEvent) => {
    if (!user) return;
    const ok = deleteEvent(evt.id, user.id);
    setDeleteMsg(ok ? 'Event deleted.' : 'Only the organizer can delete this event.');
    setTimeout(() => setDeleteMsg(''), 3000);
  };

  const selectedEvents = selectedDate ? userEvents.filter(e => e.date === selectedDate) : [];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-sub">Manage events and check-ins with your youth.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowCreate(true)}>+ Create Event</button>
      </div>
      {deleteMsg && <div className="alert alert--info">{deleteMsg}</div>}
      <div className="calendar-wrap">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => setCurrent(new Date(year, month - 1, 1))}>‹</button>
          <span className="cal-month-label">{MONTHS[month]} {year}</span>
          <button className="cal-nav-btn" onClick={() => setCurrent(new Date(year, month + 1, 1))}>›</button>
        </div>
        <div className="cal-grid-header">{DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}</div>
        <div className="cal-grid">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const dayEvts = eventsOnDay(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            return (
              <div
                key={day}
                className={`cal-cell${isToday ? ' cal-cell--today' : ''}${selectedDate === dateStr ? ' cal-cell--selected' : ''}`}
                onClick={() => setSelectedDate(prev => prev === dateStr ? null : dateStr)}
              >
                <span className="cal-day-num">{day}</span>
                {dayEvts.slice(0, 2).map(e => (
                  <div key={e.id} className={`cal-evt-pill cal-evt-pill--${e.status}`}>{e.title}</div>
                ))}
                {dayEvts.length > 2 && <div className="cal-more">+{dayEvts.length - 2} more</div>}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="event-detail-panel">
          <h3 className="panel-title">Events on {selectedDate}</h3>
          {selectedEvents.length === 0 ? (
            <p className="empty-state">No events on this day.</p>
          ) : (
            selectedEvents.map(e => (
              <div key={e.id} className="event-detail-card">
                <div className="event-detail-header">
                  <strong>{e.title}</strong>
                  <span className={`status-chip status-chip--${e.status}`}>{e.status}</span>
                </div>
                <p className="event-time">{e.startTime} – {e.endTime}</p>
                <p className="event-attendees">
                  Workers: {e.workerIds.map(id => MOCK_WORKERS[id] ?? id).join(', ')}
                </p>
                <p className="event-attendees">
                  Youth: {e.childIds.map(id => MOCK_CHILDREN[id] ?? id).join(', ')}
                </p>
                {user && e.organizerId === user.id && (
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(e)}>Delete</button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Create Event</h2>
            <form onSubmit={handleCreate} className="auth-form">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Start</label>
                  <input className="form-input" type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">End</label>
                  <input className="form-input" type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                </div>
              </div>
              <p className="form-note">Inviting: Sarah Chen, Marcus Lee (workers) · Alex Rivera (youth). Invites sent upon creation.</p>
              <div className="modal-actions">
                <button type="button" className="btn btn--outline" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default SWCalendar;