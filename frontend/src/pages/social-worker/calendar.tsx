import React, { useState, useEffect } from 'react';
import { useCalendarService, GridEventShape } from '../../services/useCalendarService';
import axios from 'axios';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface AssignedYouth {
  id: number;
  name: string;
}

const SWCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [assignedYouths, setAssignedYouths] = useState<AssignedYouth[]>([]);
  
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    startTime: '09:00', 
    endTime: '10:00', 
    youthId: 0 
  });

  // Background custom database streaming worker connection
  const service = useCalendarService(currentDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Look up case relationship assignments for dropdown menus
  useEffect(() => {
    const fetchCaseworkRelationships = async () => {
      try {
        const response = await axios.get<AssignedYouth[]>('/api/events/assigned-youth');
        setAssignedYouths(response.data);
        if (response.data.length > 0) {
          setForm(f => ({ ...f, youthId: response.data[0].id }));
        }
      } catch (err) {
        console.error('Failed to look up worker caseload records:', err);
      }
    };
    fetchCaseworkRelationships();
  }, []);

  const handleCellClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetYouthId = form.youthId || (assignedYouths.length > 0 ? assignedYouths[0].id : 1);
    
    const success = await service.createEvent({
      ...form,
      youthId: Number(targetYouthId)
    });
    
    if (success) {
      setShowCreate(false);
      setForm(f => ({ 
        title: '', 
        description: '', 
        date: selectedDateStr || '', 
        startTime: f.startTime, 
        endTime: f.endTime, 
        youthId: assignedYouths[0]?.id || 0 
      }));
    }
  };

  const handleCancelBooking = async (id: string) => {
    await service.deleteEvent(id);
  };

  let displayDayEvents: GridEventShape[] = [];
  if (selectedDateStr) {
    const parsedDay = parseInt(selectedDateStr.split('-')[2], 10);
    displayDayEvents = service.getEventsForDay(parsedDay);
  }

  return (
    // FIX: Removed #C9ECF8 and adjusted alignment parameters to flush perfectly with standard workspace wrappers
    <div className="page-content" style={{ padding: '24px', backgroundColor: '#F8FAFC', minHeight: '100%', fontFamily: 'Plus Jakarta Sans', boxSizing: 'border-box' }}>
    
      {/* BRAND HEADER BANNER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Fredoka, sans-serif', color: '#1E293B', fontSize: '2.5rem', margin: 0 }}>Calendar Hub</h1>
          <p style={{ color: '#64748B', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Unified planning board tracking intentional youth engagement sessions.</p>
        </div>
        <button 
          className="btn btn--primary" 
          style={{ backgroundColor: '#2563EB', color: '#FFF', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }} 
          onClick={() => {
            setForm(f => ({ ...f, date: selectedDateStr || '' }));
            setShowCreate(true);
          }}
        >
          + Book Session
        </button>
      </div>

      {service.error && (
        <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #EF4444', color: '#991B1B', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
          {service.error}
        </div>
      )}

      {/* VERTICAL STACK CONTAINER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* NATIVE INTERACTIVE WORKSPACE GRID */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', opacity: service.loading ? 0.7 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#1E293B' }} onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹</button>
            <span style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.5rem', fontWeight: 'bold', color: '#1E293B' }}>{MONTHS[month]} {year}</span>
            <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#1E293B' }} onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', textAlign: 'center', fontWeight: 'bold', marginBottom: '10px', color: '#64748B', fontSize: '0.9rem' }}>
            {DAYS.map(d => <div key={d} style={{ padding: '8px 0' }}>{d}</div>)}
          </div>

          {/* FIX: Set 'minmax(0, 1fr)' layout structure to completely lock the absolute cell dimensions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '10px' }}>
            {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`empty-${i}`} style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', minHeight: '130px' }} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvts = service.getEventsForDay(day);
              const isSelected = selectedDateStr === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              return (
                <div 
                  key={day} 
                  onClick={() => handleCellClick(day)} 
                  style={{ 
                    border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0', 
                    borderRadius: '8px', 
                    minHeight: '135px', // FIX: Slightly scaled layout window size up for line items
                    padding: '8px 6px', 
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFF', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                >
                  <span style={{ fontWeight: 'bold', color: '#1E293B', fontSize: '0.9rem', marginBottom: '6px' }}>{day}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1, overflow: 'hidden' }}>
                    {dayEvts.slice(0, 2).map(evt => (
                      <div 
                        key={evt.id} 
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '5px 6px', 
                          borderRadius: '4px', 
                          fontWeight: '600', 
                          backgroundColor: '#DBEAFE',
                          color: '#1E40AF',
                          // FIX: Modified text configurations to permit beautiful clean multi-line wrapping sequences
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          lineHeight: '1.2',
                          display: '-webkit-box',
                          WebkitLineClamp: 2, // Keeps things secure by wrapping up to 2 distinct lines maximum
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                        title={evt.title}
                      >
                        📅 {evt.title}
                      </div>
                    ))}
                  </div>
                  {dayEvts.length > 2 && <div style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 'bold', textAlign: 'right', marginTop: '2px' }}>+{dayEvts.length - 2} more</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* TIMELINE CONTROL CONSOLE */}
        {selectedDateStr && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '2px solid #F1F5F9', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', marginTop: 0, color: '#1E293B', marginBottom: 0 }}>Events for {selectedDateStr}</h3>
              <button onClick={() => setSelectedDateStr(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}>×</button>
            </div>
            
            {displayDayEvents.length === 0 ? (
              <p style={{ color: '#64748B', fontStyle: 'italic' }}>No appointments scheduled for this date.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {displayDayEvents.map(evt => (
                  <div key={evt.id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ color: '#1E293B' }}>{evt.title}</strong>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', backgroundColor: '#DBEAFE', color: '#2563EB', borderRadius: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          {evt.status || 'PENDING'}
                        </span>
                      </div>
                      
                      <p style={{ margin: '2px 0', fontSize: '0.8rem', color: '#64748B' }}>⏰ Time: {evt.startTime} – {evt.endTime}</p>
                      <p style={{ margin: '2px 0', fontSize: '0.8rem', color: '#1E293B' }}>👶 Attending Youth: <strong>{evt.associatedChild}</strong></p>

                      {evt.context?.description && (
                        <p 
                          style={{ 
                            fontSize: '0.8rem', 
                            color: '#475569', 
                            margin: '8px 0 0 0', 
                            padding: '8px', 
                            backgroundColor: '#F1F5F9', 
                            borderRadius: '4px',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {evt.context.description}
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={() => handleCancelBooking(evt.id)} 
                      style={{ width: '100%', marginTop: '12px', border: 'none', backgroundColor: '#EF4444', color: '#FFF', padding: '8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Cancel Appointment
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE MODAL DIALOG */}
      {showCreate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30,41,59,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setShowCreate(false)}>
          <div style={{ backgroundColor: '#FFF', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Fredoka, sans-serif', margin: '0 0 16px 0', color: '#1E293B' }}>Book New Appointment</h3>
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input placeholder="Session Title" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }} required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <textarea placeholder="Description objectives..." style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0', minHeight: '50px' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              
              <select style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }} value={form.youthId} onChange={e => setForm(f => ({ ...f, youthId: Number(e.target.value) }))}>
                {assignedYouths.length === 0 ? (
                  <option value={0}>No active youth cases found</option>
                ) : (
                  assignedYouths.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                )}
              </select>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                <input type="date" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }} required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                <input type="time" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }} value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                <input type="time" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }} value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" style={{ padding: '8px 16px', background: 'none', border: '1px solid #E2E8F0', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" disabled={assignedYouths.length === 0} style={{ padding: '8px 16px', backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', opacity: assignedYouths.length === 0 ? 0.5 : 1 }}>Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SWCalendar;