interface ChildSummaryCardProps {
  name: string;
  age: number;
  status: string;
}

export default function ChildSummaryCard({ name, age, status }: ChildSummaryCardProps) {
  return (
    <section className="card" style={{ marginBottom: 16 }}>
      <p className="eyebrow">Child profile</p>
      <h1 style={{ marginBottom: 6 }}>{name}</h1>
      <p className="lead" style={{ marginBottom: 8 }}>
        Age {age} • Status {status}
      </p>
    </section>
  );
}
