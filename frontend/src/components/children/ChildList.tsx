import ChildCard from "./ChildCard";
import type { ChildProfileItem } from "./ChildCard";

interface ChildListProps {
  children: ChildProfileItem[];
}

export default function ChildList({ children }: ChildListProps) {
  return (
    <div className="result-box">
      {children.map((child) => (
        <ChildCard key={child.childId} child={child} />
      ))}
    </div>
  );
}
