interface RecentSession {
  sessionId: number;
  date: string;
  summary: string;
}

interface RecentSessionListProps {
  sessions: RecentSession[];
}

export default function RecentSessionList({ sessions }: RecentSessionListProps) {
  return (
    <section className="card" style={{ marginBottom: 16 }}>
      <p className="eyebrow">Recent sessions</p>
      <h2 style={{ marginBottom: 8 }}>Session history</h2>

      {sessions.length === 0 ? (
        <p className="lead">No recent sessions available yet.</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
          {sessions.map((session) => (
            <li key={session.sessionId}>
              <strong>{session.date}</strong> — {session.summary}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
