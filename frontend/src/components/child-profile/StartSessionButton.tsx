import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";

interface StartSessionButtonProps {
  childId: number;
}

export default function StartSessionButton({ childId }: StartSessionButtonProps) {
  const navigate = useNavigate();
  const handleStart = async () => {
    try {
      const session = await apiFetch<{ sessionId: number }>(`/session/start/${childId}`, { method: 'POST' });
      if (session?.sessionId) {
        navigate(`/children/${childId}/session/${session.sessionId}`);
      } else {
        throw new Error("No sessionId returned from server");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Error: Could not start session. Details: ${msg}`);
    }
  };
  return (
    <button className="primary-btn" onClick={handleStart}>
      Start session
    </button>
  );
}
