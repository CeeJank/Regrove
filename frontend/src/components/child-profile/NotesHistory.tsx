// components/child-profile/NotesHistory.tsx
import React from 'react';

interface NoteHistoryItem {
  id: string;
  noteText: string;
  createdAt: string;
}

interface NotesHistoryProps {
  notes: NoteHistoryItem[];
}

export const NotesHistory: React.FC<NotesHistoryProps> = ({ notes }) => {
  if (notes.length === 0) {
    return <p className="empty-state">No case notes recorded yet.</p>;
  }

  return (
    <div className="notes-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
      {notes.map((note) => (
        <div key={note.id} className="note-timeline-item" style={{ borderLeft: '2px solid #E5E7EB', paddingLeft: '1rem', marginLeft: '0.25rem' }}>
          <p className="note-date" style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280', fontWeight: 500 }}>
            {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="note-text" style={{ margin: '0.25rem 0 0 0', color: '#374151', whiteSpace: 'pre-wrap' }}>
            {note.noteText}
          </p>
        </div>
      ))}
    </div>
  );
};

export default NotesHistory;