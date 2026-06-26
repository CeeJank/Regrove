import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCases } from '../../contexts/CasesContext';
import { fetchAllChildren, type ChildProfile } from '../../services/childService';
import {
  fetchConversations,
  fetchMessages,
  sendWorkerMessage,
  type ConversationListItem,
  type ChatMessage,
} from '../../services/youthChatApi';
import { apiFetch } from '../../services/apiFetch';

const RISK_META: Record<string, { bg: string; text: string; dot: string }> = {
  LOW:      { bg: '#F0FDF4', text: '#166534', dot: '#22C55E' },
  MEDIUM:   { bg: '#FEFCE8', text: '#92400E', dot: '#EAB308' },
  HIGH:     { bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444' },
  CRITICAL: { bg: '#F5F3FF', text: '#6D28D9', dot: '#7C3AED' },
  low:      { bg: '#F0FDF4', text: '#166534', dot: '#22C55E' },
  medium:   { bg: '#FEFCE8', text: '#92400E', dot: '#EAB308' },
  high:     { bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444' },
  critical: { bg: '#F5F3FF', text: '#6D28D9', dot: '#7C3AED' },
};

const SWMessages: React.FC = () => {
  const { user } = useAuth();
  const { allWorkers } = useCases();

  // All children from the database
  const [allChildren, setAllChildren]         = useState<ChildProfile[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(true);

  // Existing conversations for this worker
  const [conversations, setConversations]         = useState<ConversationListItem[]>([]);
  const [convsLoading, setConvsLoading]           = useState(true);

  // Currently selected child and their conversation
  const [selectedChild,  setSelectedChild]  = useState<ChildProfile | null>(null);
  const [activeConv,     setActiveConv]     = useState<ConversationListItem | null>(null);
  const [messages,       setMessages]       = useState<ChatMessage[]>([]);
  const [msgsLoading,    setMsgsLoading]    = useState(false);

  const [input,   setInput]   = useState('');
  const [sending, setSending] = useState(false);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);

  // Worker profile ID — needed when creating conversations / sending messages.
  // It lives in allWorkers keyed by the auth user's id.
  const workerProfileId: number | null = user
    ? Number(allWorkers[user.id]?.profileId) || null
    : null;

  // ── Data loading ────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchAllChildren()
      .then(setAllChildren)
      .catch(() => {/* silently leave empty */})
      .finally(() => setChildrenLoading(false));
  }, []);

  const loadConversations = useCallback(async () => {
    setConvsLoading(true);
    try {
      const all = await fetchConversations();
      // Only keep conversations that belong to this worker (if we have their profile ID)
      const mine = workerProfileId
        ? all.filter((c) => c.worker_id === workerProfileId || c.worker_id === null)
        : all;
      setConversations(mine.sort((a, b) =>
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      ));
    } catch {
      setConversations([]);
    } finally {
      setConvsLoading(false);
    }
  }, [workerProfileId]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  // ── Scroll to bottom when messages change ───────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Select a child from the sidebar ─────────────────────────────────────────

  const selectChild = useCallback(async (child: ChildProfile) => {
    setSelectedChild(child);
    setError('');
    setInput('');

    const existing = conversations.find((c) => c.youth_id === child.id) ?? null;
    setActiveConv(existing);

    if (existing) {
      setMsgsLoading(true);
      try {
        const fetched = await fetchMessages(existing.conversation_id);
        setMessages(fetched);
      } catch {
        setMessages([]);
        setError('Failed to load messages.');
      } finally {
        setMsgsLoading(false);
      }
    } else {
      setMessages([]);
    }
  }, [conversations]);

  // ── Send a message ───────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!input.trim() || !selectedChild || !user) return;
    setError('');
    setSending(true);

    try {
      let convId: number;
      let conv = activeConv;

      // No conversation yet — create one first
      if (!conv) {
        if (!workerProfileId) throw new Error('Worker profile not loaded yet. Please wait and try again.');

        const created = await apiFetch('/api/conversations', {
          method: 'POST',
          body: JSON.stringify({ userId: selectedChild.id, workerId: workerProfileId }),
        });
        if (!created.ok) {
          const j = await created.json().catch(() => ({}));
          throw new Error((j as { message?: string }).message || 'Failed to create conversation.');
        }
        const newConv: ConversationListItem = await created.json();
        convId = newConv.conversation_id;
        setActiveConv(newConv);
        conv = newConv;
        // Refresh the conversation list so the new entry appears in the sidebar
        await loadConversations();
      } else {
        convId = conv.conversation_id;
      }

      await sendWorkerMessage(convId, input.trim(), workerProfileId);
      setInput('');

      // Reload messages for this conversation
      const updated = await fetchMessages(convId);
      setMessages(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  };

  // ── Sidebar contact list ─────────────────────────────────────────────────────
  // Show children who already have conversations first, then the rest.

  const childrenWithConv = allChildren.filter((c) =>
    conversations.some((cv) => cv.youth_id === c.id)
  );
  const childrenWithoutConv = allChildren.filter((c) =>
    !conversations.some((cv) => cv.youth_id === c.id)
  );

  const lowerSearch = search.toLowerCase();
  const filterFn = (c: ChildProfile) =>
    !lowerSearch || c.full_name.toLowerCase().includes(lowerSearch);

  const contactsTop    = childrenWithConv.filter(filterFn);
  const contactsBottom = childrenWithoutConv.filter(filterFn);

  const convByYouthId = new Map(conversations.map((c) => [c.youth_id, c]));

  const renderContact = (child: ChildProfile) => {
    const conv = convByYouthId.get(child.id);
    const meta = conv ? (RISK_META[conv.risk_level] ?? RISK_META.low) : null;
    const isActive = selectedChild?.id === child.id;

    return (
      <div
        key={child.id}
        className={`contact-row${isActive ? ' contact-row--active' : ''}`}
        onClick={() => void selectChild(child)}
      >
        <div className="contact-avatar">{child.full_name[0]}</div>
        <div className="contact-info">
          <p className="contact-name">{child.full_name}</p>
          {conv ? (
            <p className="contact-preview" style={{ fontSize: 11 }}>
              {new Date(conv.last_message_at).toLocaleDateString()}
              {meta && (
                <span
                  className="risk-badge"
                  style={{ background: meta.bg, color: meta.text, marginLeft: 6, fontSize: 10 }}
                >
                  <span className="risk-dot" style={{ background: meta.dot }} />
                  {conv.risk_level}
                </span>
              )}
            </p>
          ) : (
            <p className="contact-preview" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              No messages yet
            </p>
          )}
        </div>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="messages-layout">

      {/* ── Left contacts panel ───────────────────────────────────── */}
      <aside className="contacts-panel">
        <div className="contacts-header">
          <h2>Messages</h2>
          <input
            className="search-input-sm"
            placeholder="Search youth…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {childrenLoading || convsLoading ? (
          <p className="empty-state" style={{ padding: '12px 16px' }}>Loading…</p>
        ) : (
          <>
            {contactsTop.length > 0 && (
              <>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', padding: '8px 16px 4px', fontWeight: 600 }}>
                  RECENT
                </p>
                {contactsTop.map(renderContact)}
              </>
            )}
            {contactsBottom.length > 0 && (
              <>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', padding: '8px 16px 4px', fontWeight: 600 }}>
                  ALL YOUTH
                </p>
                {contactsBottom.map(renderContact)}
              </>
            )}
            {contactsTop.length === 0 && contactsBottom.length === 0 && (
              <p className="empty-state" style={{ padding: '12px 16px' }}>
                {search ? 'No youth match your search.' : 'No youth in the database.'}
              </p>
            )}
          </>
        )}
      </aside>

      {/* ── Chat area ────────────────────────────────────────────── */}
      <div className="chat-area">
        {!selectedChild ? (
          <div className="chat-empty">
            <p className="empty-state">Select a youth to start messaging.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="chat-header">
              <div className="contact-avatar contact-avatar--lg">{selectedChild.full_name[0]}</div>
              <div>
                <p className="chat-contact-name">{selectedChild.full_name}</p>
                <p className="chat-contact-sub">
                  {selectedChild.school || 'Youth'}
                  {activeConv && (
                    <span style={{ marginLeft: 8 }}>
                      {(() => {
                        const meta = RISK_META[activeConv.risk_level] ?? RISK_META.low;
                        return (
                          <span
                            className="risk-badge"
                            style={{ background: meta.bg, color: meta.text, fontSize: 11 }}
                          >
                            <span className="risk-dot" style={{ background: meta.dot }} />
                            {activeConv.risk_level}
                          </span>
                        );
                      })()}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {error && <p className="form-error" style={{ margin: '8px 0' }}>{error}</p>}

              {msgsLoading && <p className="empty-state">Loading messages…</p>}

              {!msgsLoading && messages.length === 0 && (
                <p className="empty-state">
                  {activeConv
                    ? 'No messages yet in this conversation.'
                    : 'No conversation yet — send a message to start one.'}
                </p>
              )}

              {messages.map((msg) => {
                const isWorker = msg.sender_type === 'worker';
                return (
                  <div key={msg.message_id} className={`msg-row${isWorker ? ' msg-row--mine' : ''}`}>
                    {!isWorker && (
                      <div className="contact-avatar contact-avatar--xs">
                        {selectedChild.full_name[0]}
                      </div>
                    )}
                    <div className={`msg-bubble${isWorker ? ' msg-bubble--mine' : ''}`}>
                      <p>{msg.message}</p>
                      <span className="msg-time">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="chat-input-bar">
              <textarea
                className="chat-input"
                placeholder="Type a message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                disabled={sending}
              />
              <button
                className="btn btn--primary"
                onClick={() => void handleSend()}
                disabled={!input.trim() || sending}
              >
                {sending ? '…' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SWMessages;
