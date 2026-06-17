import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCases } from '../../contexts/CasesContext';

const MOODS = [
  { value: 1 as const, emoji: '😄', label: 'Great' },
  { value: 2 as const, emoji: '🙂', label: 'Good' },
  { value: 3 as const, emoji: '😐', label: 'Okay' },
  { value: 4 as const, emoji: '😔', label: 'Not great' },
  { value: 5 as const, emoji: '😢', label: 'Struggling' },
];

const CheckIns: React.FC = () => {
  const { user } = useAuth();
  const { getCaseByChildId, addCheckIn } = useCases();
  const [selectedMood, setSelectedMood] = useState<1|2|3|4|5|null>(null);
  const [events, setEvents] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!user || selectedMood === null) return;
    const userCase = getCaseByChildId(user.id);
    if (!userCase) return;
    addCheckIn(userCase.id, {
      id: `ci-${Date.now()}`,
      childId: user.id,
      timestamp: new Date().toISOString(),
      mood: selectedMood,
      events,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page-content checkin-page">
        <div className="checkin-success">
          <div className="checkin-success-emoji">🌟</div>
          <h2>Thanks for checking in!</h2>
          <p>Your feelings have been noted. Your social worker will be notified.</p>
          <button className="btn btn--primary" onClick={() => { setSubmitted(false); setSelectedMood(null); setEvents(''); }}>
            Check in again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content checkin-page">
      <h1 className="page-title">Daily Check-In</h1>
      <p className="page-sub">Take a moment. How are you feeling right now?</p>

      <div className="mood-picker">
        {MOODS.map(m => (
          <button
            key={m.value}
            type="button"
            className={`mood-btn${selectedMood === m.value ? ' mood-btn--selected' : ''}`}
            onClick={() => setSelectedMood(m.value)}
          >
            <span className="mood-emoji">{m.emoji}</span>
            <span className="mood-label">{m.label}</span>
          </button>
        ))}
      </div>

      {selectedMood !== null && (
        <div className="checkin-extra">
          <label className="form-label">Want to share what's been going on? (optional)</label>
          <textarea
            className="form-input"
            rows={4}
            placeholder="Tell us about something positive or challenging that happened today..."
            value={events}
            onChange={e => setEvents(e.target.value)}
          />
          <button className="btn btn--primary btn--lg checkin-submit" onClick={handleSubmit}>
            Submit Check-In
          </button>
          <p className="checkin-privacy">🔒 Only your social worker can see this.</p>
        </div>
      )}
    </div>
  );
};
export default CheckIns;