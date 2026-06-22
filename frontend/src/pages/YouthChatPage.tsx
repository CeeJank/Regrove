import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchConversation,
  fetchMessages,
  sendWorkerMessage,
  type ChatMessage,
  type ConversationListItem,
} from "../services/youthChatApi";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getBubbleClass(senderType: string) {
  const type = senderType.toLowerCase();

  if (type === "youth") return "bubble youth";
  if (type === "ai") return "bubble ai";
  return "bubble worker";
}

export default function YouthChatPage() {
  const { conversationId = "1" } = useParams();
  const activeConversationId = Number(conversationId);
  const [conversation, setConversation] = useState<ConversationListItem | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const youthName = conversation?.youth_name || "Youth";
  const workerName = conversation?.worker_name || "Unassigned worker";
  const modeLabel = conversation?.mode === "ai" ? "After-hours history" : "Worker chat";

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    Promise.all([
      fetchConversation(activeConversationId),
      fetchMessages(activeConversationId),
    ])
      .then(([activeConversation, chatMessages]) => {
        if (!isMounted) return;
        setConversation(activeConversation);
        setMessages(chatMessages);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load chat");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeConversationId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const reloadMessages = async () => {
    const [activeConversation, chatMessages] = await Promise.all([
      fetchConversation(activeConversationId),
      fetchMessages(activeConversationId),
    ]);
    setConversation(activeConversation);
    setMessages(chatMessages);
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError("");

    try {
      await sendWorkerMessage(
        activeConversationId,
        trimmed,
        conversation?.worker_id
      );
      setMessage("");
      await reloadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="app-screen chat-screen chat-only-screen">
      <section className="phone-chat">
        <header className="chat-header">
          <div className="chat-title-row">
            <Link to="/dashboard" className="chat-back-link">
              Back
            </Link>
            <div>
              <p className="eyebrow">{modeLabel}</p>
              <h2>{youthName}</h2>
              <p className="chat-subtitle">
                Replying as {workerName}
              </p>
            </div>
          </div>
          <nav className="chat-header-actions">
            <Link
              to={`/youth/chat/${activeConversationId}`}
              className="secondary-btn"
            >
              Youth view
            </Link>
            {conversation?.needs_handover ? (
              <Link
                to={`/worker/handover/${activeConversationId}`}
                className="secondary-btn"
              >
                Review handover
              </Link>
            ) : null}
          </nav>
        </header>

        {loading ? (
          <div className="chat-empty">Loading chat...</div>
        ) : (
          <div className="message-thread">
            {messages.length === 0 ? (
              <div className="chat-empty">No messages yet.</div>
            ) : (
              messages.map((item) => (
                <article className={getBubbleClass(item.sender_type)} key={item.message_id}>
                  <p>{item.message}</p>
                  <span>{formatTime(item.created_at)}</span>
                </article>
              ))
            )}
            <div ref={messageEndRef} />
          </div>
        )}

        {error ? <p className="inline-error">{error}</p> : null}

        <footer className="chat-composer">
          <textarea
            value={message}
            rows={1}
            placeholder={`Reply to ${youthName}...`}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <button className="primary-btn" disabled={sending} onClick={handleSend}>
            Send
          </button>
        </footer>
      </section>
    </main>
  );
}
