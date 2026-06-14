import { useNavigate } from "react-router-dom";
import { startSession } from "../../services/sessionService";

interface StartSessionButtonProps {
  childId: number;
}

export default function StartSessionButton({ childId }: StartSessionButtonProps) {
  const navigate = useNavigate();
  const handleStart = async () => {
    try {
      const session = await startSession(childId);
      if (session && session.sessionId) {
        navigate(`/children/${childId}/session/${session.sessionId}`);
      } else {
        throw new Error("No sessionId returned from server");
      }
    } catch (err: any) {
      console.error("Failed to start session:", err);
      alert(`Error: Could not start session. Details: ${err.message || err}`);
    }
  };
  return (
    <button className="primary-btn" onClick={handleStart}>
      Start session
    </button>
  );
}
