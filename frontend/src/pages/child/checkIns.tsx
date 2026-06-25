import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
<<<<<<< HEAD
import { apiFetch } from '../../services/api';
=======
import { useCases } from '../../contexts/CasesContext';
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)

const MOODS = [
  { value: 1 as const, emoji: '😄', label: 'Great' },
  { value: 2 as const, emoji: '🙂', label: 'Good' },
  { value: 3 as const, emoji: '😐', label: 'Okay' },
  { value: 4 as const, emoji: '😔', label: 'Not great' },
  { value: 5 as const, emoji: '😢', label: 'Struggling' },
];

<<<<<<< HEAD
const WELLBEING_QUESTIONS = [
  { key: 'q1_sleep', question: '😴 How did you sleep last night?' },
  { key: 'q2_safe', question: '🛡️ Do you feel safe at home and school?' },
  { key: 'q3_support', question: '🤝 Is there someone you can talk to when you are feeling down?' },
  { key: 'q4_worry', question: '💭 Is there anything worrying you lately?' },
  { key: 'q5_proud', question: '⭐ What is something you are proud of this week?' },
];

const CheckIns: React.FC = () => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<1|2|3|4|5|null>(null);
  const [events, setEvents] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!user || selectedMood === null) return;
    setLoading(true);
    setError('');
    try {
      await apiFetch(`/sdq/${user.id}`, {
        method: 'POST',
        body: JSON.stringify({
          mood: selectedMood,
          events,
          q1_sleep: answers['q1_sleep'] ?? '',
          q2_safe: answers['q2_safe'] ?? '',
          q3_support: answers['q3_support'] ?? '',
          q4_worry: answers['q4_worry'] ?? '',
          q5_proud: answers['q5_proud'] ?? '',
        }),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setSelectedMood(null);
    setEvents('');
    setAnswers({});
    setError('');
=======
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
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
  };

  if (submitted) {
    return (
      <div className="page-content checkin-page">
        <div className="checkin-success">
          <div className="checkin-success-emoji">🌟</div>
          <h2>Thanks for checking in!</h2>
<<<<<<< HEAD
          <p>Your feelings have been noted. Your social worker can see this to better support you.</p>
          <button className="btn btn--primary" onClick={reset}>Check in again</button>
=======
          <p>Your feelings have been noted. Your social worker will be notified.</p>
          <button className="btn btn--primary" onClick={() => { setSubmitted(false); setSelectedMood(null); setEvents(''); }}>
            Check in again
          </button>
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
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
<<<<<<< HEAD
          <button key={m.value} type="button"
            className={`mood-btn${selectedMood === m.value ? ' mood-btn--selected' : ''}`}
            onClick={() => setSelectedMood(m.value)}>
=======
          <button
            key={m.value}
            type="button"
            className={`mood-btn${selectedMood === m.value ? ' mood-btn--selected' : ''}`}
            onClick={() => setSelectedMood(m.value)}
          >
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
            <span className="mood-emoji">{m.emoji}</span>
            <span className="mood-label">{m.label}</span>
          </button>
        ))}
      </div>

      {selectedMood !== null && (
        <div className="checkin-extra">
<<<<<<< HEAD
          <div className="form-group">
            <label className="form-label">What's been going on? (optional)</label>
            <textarea className="form-input" rows={3}
              placeholder="Share something positive or challenging that happened today..."
              value={events} onChange={e => setEvents(e.target.value)} />
          </div>

          <div className="wellbeing-section">
            <h3 className="wellbeing-title">Wellbeing Check-In</h3>
            <p className="wellbeing-sub">Answer as honestly as you can — only your social worker can see this.</p>
            {WELLBEING_QUESTIONS.map(q => (
              <div key={q.key} className="form-group">
                <label className="form-label">{q.question}</label>
                <textarea className="form-input" rows={2}
                  placeholder="Type your answer here..."
                  value={answers[q.key] ?? ''}
                  onChange={e => setAnswers(a => ({ ...a, [q.key]: e.target.value }))} />
              </div>
            ))}
          </div>

          {error && <p className="form-error">{error}</p>}
          <button
            className="btn btn--primary btn--lg checkin-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting…' : 'Submit Check-In'}
          </button>
          <p className="checkin-privacy">🔒 Only your social worker can see your responses.</p>
=======
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
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
        </div>
      )}
    </div>
  );
};
<<<<<<< HEAD

export default CheckIns;
=======
export default CheckIns;
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
