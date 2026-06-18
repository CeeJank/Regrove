// components/child-profile/CheckInFeed.tsx
import React from 'react';

const MOOD_EMOJI = ['', '😄', '🙂', '😐', '😔', '😢'];

interface CheckInItem {
  id: string;
  mood: number;
  events: string;
  timestamp: string;
}

interface CheckInFeedProps {
  checkIns: CheckInItem[];
}

export const CheckInFeed: React.FC<CheckInFeedProps> = ({ checkIns }) => {
  if (checkIns.length === 0) {
    return <p className="empty-state">No check-ins recorded yet.</p>;
  }

  return (
    <div className="checkin-list">
      {checkIns.map((ci) => (
        <div key={ci.id} className="checkin-row" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', margin: '0.75rem 0' }}>
          <span className="checkin-emoji" style={{ fontSize: '1.25rem' }}>{MOOD_EMOJI[ci.mood]}</span>
          <div style={{ flex: 1 }}>
            <p className="checkin-events" style={{ margin: 0 }}>{ci.events}</p>
            <p className="checkin-date" style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6B7280' }}>
              {new Date(ci.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CheckInFeed;