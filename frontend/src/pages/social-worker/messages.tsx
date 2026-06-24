import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../contexts/MessagesContext';
import { useCases } from '../../contexts/CasesContext';
import { useNavigate } from 'react-router-dom';

const SWMessages: React.FC = () => {
  const { user } = useAuth();
  const { getConversation, sendMessage, getRecentContacts } = useMessages();
  const { allChildren, updateRecentInteraction } = useCases();
  const navigate = useNavigate();

  const recentContactIds = user ? getRecentContacts(user.id) : [];
  const defaultContacts = Object.entries(allChildren).slice(0, 10).map(([id]) => id);
  const contactIds = recentContactIds.length > 0
    ? [...new Set([...recentContactIds, ...defaultContacts])].slice(0, 10)
    : defaultContacts;

  const [activeContactId, setActiveContactId] = useState<string | null>(contactIds[0] ?? null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversation = user && activeContactId ? getConversation(user.id, activeContactId) : [];
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation]);

  const handleSend = () => {
    if (!input.trim() || !user || !activeContactId) return;
    sendMessage({ senderId: user.id, receiverId: activeContactId, content: input.trim(), type: 'text' });
    setInput('');
  };
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const filteredIds = search
    ? Object.entries(allChildren).filter(([, c]) => c.name.toLowerCase().includes(search.toLowerCase())).map(([id]) => id)
    : contactIds;

  const activeChild = activeContactId ? allChildren[activeContactId] : null;

  return (
    <div className="messages-layout">
      <aside className="contacts-panel">
        <div className="contacts-header">
          <h2>Messages</h2>
          <input className="search-input-sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filteredIds.map(id => {
          const child = allChildren[id];
          if (!child) return null;
          return (
            <div key={id}
              className={`contact-row${activeContactId === id ? ' contact-row--active' : ''}`}
              onClick={() => { setActiveContactId(id); if (user) updateRecentInteraction(user.id, id); }}>
              <div className="contact-avatar">{child.name[0]}</div>
              <div className="contact-info">
                <p className="contact-name">{child.name}</p>
                <p className="contact-preview">Youth</p>
              </div>
            </div>
          );
        })}
      </aside>

      <div className="chat-area">
        {!activeChild ? (
          <div className="chat-empty">
            <p className="empty-state">Select a youth to start messaging.</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="contact-avatar contact-avatar--lg">{activeChild.name[0]}</div>
              <div>
                <p className="chat-contact-name">{activeChild.name}</p>
                <p className="chat-contact-sub">Youth</p>
              </div>
            </div>

            <div className="chat-messages">
              {conversation.length === 0 && <p className="empty-state">No messages yet. Start the conversation.</p>}
              {conversation.map(msg => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`msg-row${isMine ? ' msg-row--mine' : ''}`}>
                    {!isMine && <div className="contact-avatar contact-avatar--xs">{activeChild.name[0]}</div>}
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
          </>
        )}
      </div>
    </div>
  );
};

export default SWMessages;