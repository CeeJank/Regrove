import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../contexts/MessagesContext';
import { useCases } from '../../contexts/CasesContext';

const ChildMessages: React.FC = () => {
  const { user } = useAuth();
  const { getConversation, sendMessage } = useMessages();
  const { allWorkers } = useCases();

  const workerEntries = Object.entries(allWorkers);
  const [activeWorkerId, setActiveWorkerId] = useState<string>(workerEntries[0]?.[0] ?? '');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversation = user ? getConversation(user.id, activeWorkerId) : [];
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation]);

  const handleSend = () => {
    if (!input.trim() || !user) return;
    setError('');
    try {
      sendMessage({ senderId: user.id, receiverId: activeWorkerId, content: input.trim(), type: 'text' });
      setInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.');
    }
  };
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const filtered = search
    ? workerEntries.filter(([, w]) => w.name.toLowerCase().includes(search.toLowerCase()))
    : workerEntries;

  const activeWorker = allWorkers[activeWorkerId];

  return (
    <div className="messages-layout">
      <aside className="contacts-panel">
        <div className="contacts-header">
          <h2>Messages</h2>
          <input className="search-input-sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filtered.map(([id, worker]) => (
          <div key={id} className={`contact-row${activeWorkerId === id ? ' contact-row--active' : ''}`}
            onClick={() => setActiveWorkerId(id)}>
            <div className="contact-avatar" style={{ background: 'var(--primary)' }}>{worker.name[0]}</div>
            <div className="contact-info">
              <p className="contact-name">{worker.name}</p>
              <p className="contact-preview">Social Worker</p>
            </div>
          </div>
        ))}
      </aside>

      <div className="chat-area">
        <div className="chat-header">
          <div className="contact-avatar contact-avatar--lg" style={{ background: 'var(--primary)' }}>{activeWorker?.name?.[0] ?? 'S'}</div>
          <div>
            <p className="chat-contact-name">{activeWorker?.name ?? 'Social Worker'}</p>
            <p className="chat-contact-sub">Your Social Worker</p>
          </div>
        </div>

        <div className="chat-messages">
          {error && <p className="form-error">{error}</p>}
          {conversation.length === 0 && <p className="empty-state">No messages yet. Say hello! 👋</p>}
          {conversation.map(msg => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`msg-row${isMine ? ' msg-row--mine' : ''}`}>
                {!isMine && <div className="contact-avatar contact-avatar--xs" style={{ background: 'var(--primary)' }}>{activeWorker?.name?.[0] ?? 'S'}</div>}
                <div className={`msg-bubble${isMine ? ' msg-bubble--mine' : ''}`}>
                  <p>{msg.content}</p>
                  <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-bar">
          <textarea className="chat-input" placeholder="Type a message..." value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={handleKey} rows={1} />
          <button className="btn btn--primary" onClick={handleSend} disabled={!input.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChildMessages;
