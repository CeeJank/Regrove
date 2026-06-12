interface RiskOverviewCardProps {
  riskLevel: string;
  riskScore: number;
}

export default function RiskOverviewCard({ riskLevel, riskScore }: RiskOverviewCardProps) {
  return (
    <section className="card" style={{ marginBottom: 16 }}>
      <p className="eyebrow">Risk overview</p>
      <h2 style={{ marginBottom: 8 }}>Current risk level: {riskLevel}</h2>
      <p className="lead" style={{ marginBottom: 8 }}>
        Risk score: {riskScore}/100
      </p>
      <div
        style={{
          width: "100%",
          height: 10,
          borderRadius: 999,
          background: "linear-gradient(90deg, #22c55e 0%, #facc15 50%, #ef4444 100%)",
          opacity: 0.9,
        }}
      />
    </section>
  );
}
