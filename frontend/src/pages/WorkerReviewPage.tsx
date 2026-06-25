import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createSummary,
  fetchConversation,
  fetchMessages,
  fetchSummaries,
  markHandoverReviewed,
  type ChatMessage,
  type ConversationListItem,
  type SummaryItem,
} from "../services/youthChatApi";

function getBubbleClass(senderType: string) {
  const type = senderType.toLowerCase();

  if (type === "youth") return "bubble youth";
  if (type === "ai") return "bubble ai";
  return "bubble worker";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function splitSummarySections(summary: string) {
  const knownHeadings = [
    "Main concern",
    "What the youth shared",
    "How the youth seemed to feel",
    "Conversation context",
  ];

  const lines = summary.split(/\r?\n/).map((line) => line.trim());
  const sections: { title: string; paragraphs: string[] }[] = [];
  let currentTitle = "";
  let currentParagraphs: string[] = [];
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      currentParagraphs.push(currentParagraphLines.join(" "));
      currentParagraphLines = [];
    }
  };

  const flushSection = () => {
    flushParagraph();

    if (currentTitle || currentParagraphs.length > 0) {
      sections.push({
        title: currentTitle || "Summary",
        paragraphs: currentParagraphs,
      });
    }
  };

  lines.forEach((line) => {
    if (!line) {
      flushParagraph();
      return;
    }

    if (knownHeadings.includes(line)) {
      flushSection();

      currentTitle = line;
      currentParagraphs = [];
      currentParagraphLines = [];
      return;
    }

    currentParagraphLines.push(line);
  });

  flushSection();

  return sections.length > 0
    ? sections
    : [{ title: "Summary", paragraphs: [summary] }];
}

function getSummaryPreview(summary: string) {
  const firstSection = splitSummarySections(summary)[0];
  const previewText = firstSection.paragraphs[0] || summary;

  if (previewText.length <= 180) {
    return previewText;
  }

  return `${previewText.slice(0, 180).trim()}...`;
}

export default function WorkerReviewPage() {
  const { conversationId = "1" } = useParams();
  const navigate = useNavigate();
  const activeConversationId = Number(conversationId);
  const [conversation, setConversation] = useState<ConversationListItem | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingSummary, setCreatingSummary] = useState(false);
  const [markingReviewed, setMarkingReviewed] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<SummaryItem | null>(null);
  const [error, setError] = useState("");

  const loadReview = async () => {
    const [conversationData, messageData, summaryData] = await Promise.all([
      fetchConversation(activeConversationId),
      fetchMessages(activeConversationId),
      fetchSummaries(activeConversationId),
    ]);

    setConversation(conversationData);
    setMessages(messageData);
    setSummaries(summaryData);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    loadReview()
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load review");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeConversationId]);

  const handleCreateSummary = async () => {
    setCreatingSummary(true);
    setError("");

    try {
      await createSummary(activeConversationId);
      await loadReview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create summary");
    } finally {
      setCreatingSummary(false);
    }
  };

  const handleMarkReviewed = async () => {
    setMarkingReviewed(true);
    setError("");

    try {
      await markHandoverReviewed(activeConversationId);
      navigate("/worker/handover");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to mark handover reviewed"
      );
    } finally {
      setMarkingReviewed(false);
    }
  };

  return (
    <main className="app-screen review-screen">
      <header className="worker-header">
        <div>
          <p className="eyebrow">Worker review</p>
          <h1>{conversation?.youth_name || "Conversation"}</h1>
          <p className="lead">
            Review the transcript and create a handover summary.
          </p>
        </div>
        <nav className="nav-links">
          <Link to="/worker/handover" className="secondary-btn">
            Back to handover
          </Link>
          <Link to={`/chat/${activeConversationId}`} className="secondary-btn">
            Open worker chat
          </Link>
        </nav>
      </header>

      {error ? <p className="error-box">{error}</p> : null}

      <section className="review-layout">
        <div className="review-panel">
          <div className="review-panel-header">
            <div>
              <h2>After-hours transcript</h2>
              <p className="panel-subtitle">
                Youth messages, AI support, and worker replies in time order.
              </p>
            </div>
            <code>{conversation?.risk_level || "risk"}</code>
          </div>
          {loading ? (
            <p className="status">Loading transcript...</p>
          ) : (
            <div className="message-thread review-thread">
              {messages.map((item) => (
                <article className={getBubbleClass(item.sender_type)} key={item.message_id}>
                  <p>{item.message}</p>
                  <span>{formatDate(item.created_at)}</span>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="review-panel summary-panel">
          <div className="review-panel-header">
            <div>
              <h2>Worker handover summary</h2>
              <p className="panel-subtitle">
                Generate this before following up with the youth.
              </p>
            </div>
            <button
              className="primary-btn"
              disabled={creatingSummary}
              onClick={handleCreateSummary}
            >
              {creatingSummary ? "Generating..." : "Generate"}
            </button>
          </div>

          {conversation ? (
            <section className="review-context">
              <span>Youth: {conversation.youth_name}</span>
              <span>Worker: {conversation.worker_name || "Unassigned"}</span>
              <span>Mode: {conversation.mode === "ai" ? "AI after-hours" : "Worker chat"}</span>
            </section>
          ) : null}

          {summaries.length === 0 ? (
            <p className="status">No generated summary yet.</p>
          ) : (
            summaries.map((item) => (
              <article className="summary-card" key={item.summary_id}>
                <div className="summary-card-topline">
                  <span>{formatDate(item.created_at)}</span>
                  <code>{conversation?.risk_level || "risk"}</code>
                </div>
                <h3>Summary preview</h3>
                <p>{getSummaryPreview(item.summary)}</p>
                <button
                  className="secondary-btn summary-read-btn"
                  onClick={() => setSelectedSummary(item)}
                >
                  Read full summary
                </button>
              </article>
            ))
          )}

          <button
            className="primary-btn"
            disabled={summaries.length === 0 || markingReviewed}
            onClick={handleMarkReviewed}
          >
            {markingReviewed ? "Marking reviewed..." : "Mark reviewed"}
          </button>
        </aside>
      </section>

      {selectedSummary ? (
        <div
          className="summary-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedSummary(null)}
        >
          <section
            aria-modal="true"
            className="summary-modal"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="summary-modal-header">
              <div>
                <p className="eyebrow">Full summary</p>
                <h2>Worker handover summary</h2>
                <span>{formatDate(selectedSummary.created_at)}</span>
              </div>
              <button
                aria-label="Close full summary"
                className="secondary-btn"
                onClick={() => setSelectedSummary(null)}
              >
                Close
              </button>
            </div>

            <div className="summary-section-list full-summary-sections">
              {splitSummarySections(selectedSummary.summary).map((section) => (
                <section className="summary-section" key={section.title}>
                  <h3>{section.title}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
