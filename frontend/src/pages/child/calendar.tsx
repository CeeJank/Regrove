import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../contexts/EventsContext';
import { useCases } from '../../contexts/CasesContext';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const ChildCalendar: React.FC = () => {
  const { user } = useAuth();
  const { getEventsForUser, respondToEvent } = useEvents();
  const { allWorkers, allChildren } = useCases();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [notification, setNotification] = useState('');

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const userEvents = user ? getEventsForUser(user.id) : [];

  const eventsOnDay = (day: number) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return userEvents.filter(e => e.date === dateStr);
  };

  const selectedEvents = selected ? userEvents.filter(e => e.date === selected) : [];

  const respond = async (id: string, accept: boolean) => {
    if (!user) return;
    try {
      await respondToEvent(id, user.id, accept);
      setNotification(accept ? '✅ Event accepted!' : '❌ Event declined.');
    } catch {
      setNotification('Failed to respond. Please try again.');
    }
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Calendar</h1>
          <p className="page-sub">View your upcoming sessions and events.</p>
        </div>
      </div>
      {notification && <div className="alert alert--info">{notification}</div>}
      <div className="calendar-wrap">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => setCurrent(new Date(year, month - 1, 1))}>‹</button>
          <span className="cal-month-label">{MONTHS[month]} {year}</span>
          <button className="cal-nav-btn" onClick={() => setCurrent(new Date(year, month + 1, 1))}>›</button>
        </div>
        <div className="cal-grid-header">{DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}</div>
        <div className="cal-grid">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="cal-cell cal-cell--empty" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const dayEvts = eventsOnDay(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            return (
              <div
                key={day}
                className={`cal-cell${isToday ? ' cal-cell--today' : ''}${selected === dateStr ? ' cal-cell--selected' : ''}`}
                onClick={() => setSelected(p => p === dateStr ? null : dateStr)}
              >
                <span className="cal-day-num">{day}</span>
                {dayEvts.slice(0, 2).map(e => (
                  <div key={e.id} className={`cal-evt-pill cal-evt-pill--${e.status}`}>{e.title}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="event-detail-panel">
          <h3 className="panel-title">Events on {selected}</h3>
          {selectedEvents.length === 0 ? <p className="empty-state">No events on this day.</p> : (
            selectedEvents.map(e => (
              <div key={e.id} className="event-detail-card">
                <div className="event-detail-header">
                  <strong>{e.title}</strong>
                  <span className={`status-chip status-chip--${e.status}`}>{e.status}</span>
                </div>
                <p className="event-time">{e.startTime} – {e.endTime}</p>
                <p className="event-attendees">Social Workers: {e.workerIds.map(id => allWorkers[id]?.name ?? id).join(', ')}</p>
                <p className="event-attendees">Child: {e.childIds.map(id => allChildren[id]?.name ?? id).join(', ')}</p>
                {e.status === 'pending' && user && e.childIds.includes(user.id) && (
                  <div className="referral-actions" style={{ marginTop: 8 }}>
                    <button className="btn btn--primary btn--sm" onClick={() => respond(e.id, true)}>Accept</button>
                    <button className="btn btn--outline btn--sm" onClick={() => respond(e.id, false)}>Decline</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ChildCalendar;
