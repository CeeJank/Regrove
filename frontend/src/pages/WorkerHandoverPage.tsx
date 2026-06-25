import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchHandoverConversations,
  type ConversationListItem,
} from "../services/youthChatApi";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function WorkerHandoverPage() {
  const [items, setItems] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetchHandoverConversations()
      .then((data) => {
        if (isMounted) setItems(data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load handover");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="app-screen worker-screen">
      <header className="worker-header">
        <div>
          <p className="eyebrow">Worker portal</p>
          <h1>After-hours handover</h1>
          <p className="lead">
            Conversations that need human review after AI support.
          </p>
        </div>
        <nav className="nav-links">
          <Link to="/dashboard" className="secondary-btn">
            Dashboard
          </Link>
          <Link to="/testing" className="secondary-btn">
            API console
          </Link>
        </nav>
      </header>

      {loading ? <p className="status">Loading handover list...</p> : null}
      {error ? <p className="error-box">{error}</p> : null}

      <section className="handover-flow">
        <article>
          <strong>1</strong>
          <span>Youth messages after working hours</span>
        </article>
        <article>
          <strong>2</strong>
          <span>AI gives a short supportive reply</span>
        </article>
        <article>
          <strong>3</strong>
          <span>Conversation is flagged for handover</span>
        </article>
        <article>
          <strong>4</strong>
          <span>Worker reviews summary and follows up</span>
        </article>
      </section>

      <section className="handover-grid">
        {!loading && items.length === 0 ? (
          <article className="handover-card">
            <h2>No active handovers</h2>
            <p>After-hours AI chats will appear here for worker review.</p>
          </article>
        ) : (
          items.map((item) => (
            <article className="handover-card" key={item.conversation_id}>
              <div className="card-topline">
                <code>AI handover pending</code>
                <span>{formatDate(item.last_message_at)}</span>
              </div>
              <h2>{item.youth_name}</h2>
              <p>
                Assigned worker: <strong>{item.worker_name || "Unassigned"}</strong>
              </p>
              <div className="handover-card-meta">
                <code>{item.risk_level} risk</code>
                <code>{item.mode === "ai" ? "AI after-hours" : "Worker chat"}</code>
              </div>
              <p>
                Review the after-hours transcript, generate a short summary, and
                decide the next worker follow-up.
              </p>
              <Link
                className="primary-btn"
                to={`/worker/handover/${item.conversation_id}`}
              >
                Review chat
              </Link>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
