interface MoodBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

interface AnalyticsPanelProps {
  riskScore: number;
  sessionCount: number;
  moodBreakdown: MoodBreakdown;
}

export default function AnalyticsPanel({ riskScore, sessionCount, moodBreakdown }: AnalyticsPanelProps) {
  return (
    <section className="card" style={{ marginBottom: 16 }}>
      <p className="eyebrow">Analytics</p>
      <h2 style={{ marginBottom: 8 }}>Overview snapshot</h2>
      <p className="lead">Risk score: {riskScore}</p>
      <p className="lead">Sessions tracked: {sessionCount}</p>

      <div style={{ display: "grid", gap: 8 }}>
        {[
          ['Positive', moodBreakdown.positive],
          ['Neutral', moodBreakdown.neutral],
          ['Negative', moodBreakdown.negative],
        ].map(([label, value]) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <strong>{label}</strong>
              <span>{String(value)}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: '#e5e7eb' }}>
              <div
                style={{
                  width: `${value}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: label === 'Positive' ? '#22c55e' : label === 'Neutral' ? '#facc15' : '#f87171',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
