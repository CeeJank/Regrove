import { useNavigate } from "react-router-dom";

export interface ChildProfileItem {
  childId: number;
  workerId: number;
  name: string;
  age: number;
  riskLevel: string;
  lastSessionDate: string;
  status: string;
}

interface ChildCardProps {
  child: ChildProfileItem;
}

export default function ChildCard({ child }: ChildCardProps) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/children/${child.childId}`)}
      style={{
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        background: "var(--accent-bg)",
        cursor: "pointer",
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/children/${child.childId}`);
        }
      }}
    >
      <h2 style={{ margin: "0 0 4px" }}>{child.name}</h2>
      <p style={{ margin: "0 0 8px", color: "var(--text-h)" }}>
        Age {child.age} • Risk {child.riskLevel} • Status {child.status}
      </p>
      <p style={{ margin: 0, color: "var(--text-h)" }}>
        Last session: {child.lastSessionDate}
      </p>
    </article>
  );
}
