import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchConversation,
  fetchMessages,
  sendYouthMessage,
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

export default function YouthSideChatPage() {
  const { conversationId = "1" } = useParams();
  const activeConversationId = Number(conversationId);
  const [conversation, setConversation] = useState<ConversationListItem | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [forceAi, setForceAi] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const youthName = conversation?.youth_name || "Youth";
  const workerName = conversation?.worker_name || "your youth worker";
  const youthId = conversation?.youth_id || 1;
  const modeLabel = forceAi ? "Demo after-hours AI" : "Working-hours chat";

  const loadChat = async () => {
    const [activeConversation, chatMessages] = await Promise.all([
      fetchConversation(activeConversationId),
      fetchMessages(activeConversationId),
    ]);

    setConversation(activeConversation);
    setMessages(chatMessages);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    loadChat()
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

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError("");

    try {
      await sendYouthMessage(activeConversationId, youthId, trimmed, forceAi);
      setMessage("");
      await loadChat();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="app-screen chat-screen chat-only-screen youth-chat-perspective">
      <section className="phone-chat">
        <header className="chat-header">
          <div className="chat-title-row">
            <Link to="/" className="chat-back-link">
              Back
            </Link>
            <div>
              <p className="eyebrow">{modeLabel}</p>
              <h2>{youthName}</h2>
              <p className="chat-subtitle">
                Chatting with {workerName}. After-hours messages can be held by AI
                for worker handover.
              </p>
            </div>
          </div>

          <nav className="chat-header-actions">
            <label className="switch-row">
              <input
                checked={forceAi}
                type="checkbox"
                onChange={(event) => setForceAi(event.target.checked)}
              />
              Demo AI
            </label>
            <Link to={`/chat/${activeConversationId}`} className="secondary-btn">
              Worker view
            </Link>
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

        {conversation?.needs_handover ? (
          <p className="handover-notice">
            This after-hours chat has been saved for worker follow-up.
          </p>
        ) : null}
        {error ? <p className="inline-error">{error}</p> : null}

        <footer className="chat-composer">
          <textarea
            value={message}
            rows={1}
            placeholder="Type your message..."
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
