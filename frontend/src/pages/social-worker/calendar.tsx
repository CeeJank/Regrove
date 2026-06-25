import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../contexts/EventsContext';
import { useCases } from '../../contexts/CasesContext';
import { CalendarEvent } from '../../types';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const SWCalendar: React.FC = () => {
  const { user } = useAuth();
  const { events, createEvent, deleteEvent, getEventsForUser } = useEvents();
  const { allChildren, allWorkers } = useCases();
  const [current, setCurrent] = useState(new Date());
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [deleteMsg, setDeleteMsg] = useState('');
  const [childSearch, setChildSearch] = useState('');
  const [workerSearch, setWorkerSearch] = useState('');
  const [form, setForm] = useState({
    title: '', date: '', startTime: '09:00', endTime: '10:00',
    workerIds: user?.id ? [user.id] : [],
    childIds: [] as string[],
  });

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const userEvents = user ? getEventsForUser(user.id) : [];

  const eventsOnDay = (day: number) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return userEvents.filter(e => e.date === dateStr);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (form.childIds.length === 0) { alert('Please add at least one child.'); return; }
    const inviteStatuses: Record<string, 'pending' | 'accepted' | 'declined'> = {};
    form.workerIds.forEach(id => { inviteStatuses[id] = id === user.id ? 'accepted' : 'pending'; });
    form.childIds.forEach(id => { inviteStatuses[id] = 'pending'; });
    try {
      await createEvent({ ...form, organizerId: user.id, status: 'pending', inviteStatuses });
      setShowCreate(false);
      setForm({ title: '', date: '', startTime: '09:00', endTime: '10:00', workerIds: [user.id], childIds: [] });
      setChildSearch(''); setWorkerSearch('');
    } catch {
      alert('Failed to create event. Please try again.');
    }
  };

  const handleDelete = async (evt: CalendarEvent) => {
    if (!user) return;
    try {
      const ok = await deleteEvent(evt.id, user.id);
      setDeleteMsg(ok ? 'Event deleted.' : 'Only the organizer can delete this event.');
    } catch {
      setDeleteMsg('Failed to delete event.');
    }
    setTimeout(() => setDeleteMsg(''), 3000);
  };

  const selectedEvents = selectedDate ? userEvents.filter(e => e.date === selectedDate) : [];

  const childSuggestions = Object.entries(allChildren).filter(([id, c]) =>
    childSearch && c.name.toLowerCase().includes(childSearch.toLowerCase()) && !form.childIds.includes(id)
  ).slice(0, 5);

  const workerSuggestions = Object.entries(allWorkers).filter(([id, w]) =>
    workerSearch && w.name.toLowerCase().includes(workerSearch.toLowerCase()) && !form.workerIds.includes(id)
  ).slice(0, 5);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-sub">Manage events and sessions with your child.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowCreate(true)}>+ Create Event</button>
      </div>

      {deleteMsg && <div className="alert alert--info">{deleteMsg}</div>}

      <div className="calendar-wrap">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => setCurrent(new Date(year, month-1, 1))}>‹</button>
          <span className="cal-month-label">{MONTHS[month]} {year}</span>
          <button className="cal-nav-btn" onClick={() => setCurrent(new Date(year, month+1, 1))}>›</button>
        </div>
        <div className="cal-grid-header">{DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}</div>
        <div className="cal-grid">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="cal-cell cal-cell--empty" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const dayEvts = eventsOnDay(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            return (
              <div key={day}
                className={`cal-cell${isToday ? ' cal-cell--today' : ''}${selectedDate === dateStr ? ' cal-cell--selected' : ''}`}
                onClick={() => setSelectedDate(prev => prev === dateStr ? null : dateStr)}>
                <span className="cal-day-num">{day}</span>
                {dayEvts.slice(0,2).map(e => (
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
          {selectedEvents.length === 0 ? <p className="empty-state">No events on this day.</p> : (
            selectedEvents.map(e => (
              <div key={e.id} className="event-detail-card">
                <div className="event-detail-header">
                  <strong>{e.title}</strong>
                  <span className={`status-chip status-chip--${e.status}`}>{e.status}</span>
                </div>
                <p className="event-time">{e.startTime} – {e.endTime}</p>
                <p className="event-attendees">Workers: {e.workerIds.map(id => allWorkers[id]?.name ?? id).join(', ')}</p>
                <p className="event-attendees">Child: {e.childIds.map(id => allChildren[id]?.name ?? id).join(', ')}</p>
                {user && e.organizerId === user.id && (
                  <button className="btn btn--danger btn--sm" style={{ marginTop: 8 }} onClick={() => handleDelete(e)}>Delete Event</button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Create Event</h2>
            <form onSubmit={handleCreate} className="auth-form">
              <div className="form-group">
                <label className="form-label">Event Title</label>
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

              <div className="form-group">
                <label className="form-label">Add Child (required, min. 1)</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" placeholder="Type child's name..." value={childSearch}
                    onChange={e => setChildSearch(e.target.value)} />
                  {childSuggestions.length > 0 && (
                    <div className="search-dropdown" style={{ position: 'absolute', width: '100%', zIndex: 10 }}>
                      {childSuggestions.map(([id, c]) => (
                        <div key={id} className="search-result-row" onClick={() => {
                          setForm(f => ({ ...f, childIds: [...f.childIds, id] }));
                          setChildSearch('');
                        }}>
                          <div className="search-avatar">{c.name[0]}</div>
                          <p className="search-result-name">{c.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="tag-row">
                  {form.childIds.map(id => (
                    <span key={id} className="invite-tag">
                      {allChildren[id]?.name ?? id}
                      <button type="button" onClick={() => setForm(f => ({ ...f, childIds: f.childIds.filter(x => x !== id) }))}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Add Another Worker (optional)</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" placeholder="Type worker's name..." value={workerSearch}
                    onChange={e => setWorkerSearch(e.target.value)} />
                  {workerSuggestions.length > 0 && (
                    <div className="search-dropdown" style={{ position: 'absolute', width: '100%', zIndex: 10 }}>
                      {workerSuggestions.map(([id, w]) => (
                        <div key={id} className="search-result-row" onClick={() => {
                          setForm(f => ({ ...f, workerIds: [...f.workerIds, id] }));
                          setWorkerSearch('');
                        }}>
                          <div className="search-avatar">{w.name[0]}</div>
                          <p className="search-result-name">{w.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="tag-row">
                  {form.workerIds.map(id => (
                    <span key={id} className="invite-tag invite-tag--worker">
                      {allWorkers[id]?.name ?? id}{id === user?.id ? ' (you)' : ''}
                      {id !== user?.id && (
                        <button type="button" onClick={() => setForm(f => ({ ...f, workerIds: f.workerIds.filter(x => x !== id) }))}>×</button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn--outline" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SWCalendar;
