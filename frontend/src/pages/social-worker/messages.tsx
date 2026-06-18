import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../contexts/MessagesContext';

const CONTACTS = [
  { id: 'child-1', name: 'Alex Rivera', avatar: 'A' },
  { id: 'child-2', name: 'Jamie Tan', avatar: 'J' },
  { id: 'child-3', name: 'Sam Lim', avatar: 'S' },
];

const SWMessages: React.FC = () => {
  const { user } = useAuth();
  const { getConversation, sendMessage } = useMessages();
  const [activeContact, setActiveContact] = useState(CONTACTS[0]);
  const [input, setInput] = useState('');
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversation = user ? getConversation(user.id, activeContact.id) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSend = () => {
    if (!input.trim() || !user) return;
    sendMessage({ senderId: user.id, receiverId: activeContact.id, content: input.trim(), type: 'text' });
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div className="messages-layout">
      <aside className="contacts-panel">
        <div className="contacts-header"><h2>Messages</h2></div>
        {CONTACTS.map(c => (
          <div
            key={c.id}
            className={`contact-row${activeContact.id === c.id ? ' contact-row--active' : ''}`}
            onClick={() => setActiveContact(c)}
          >
            <div className="contact-avatar">{c.avatar}</div>
            <div className="contact-info">
              <p className="contact-name">{c.name}</p>
              <p className="contact-preview">Youth</p>
            </div>
          </div>
        ))}
      </aside>

      <div className="chat-area">
        <div className="chat-header">
          <div className="contact-avatar contact-avatar--lg">{activeContact.avatar}</div>
          <div>
            <p className="chat-contact-name">{activeContact.name}</p>
            <p className="chat-contact-sub">Youth</p>
          </div>
          <div className="chat-actions">
            <button className="icon-btn" title="Voice call" onClick={() => setCallType('voice')}>📞</button>
            <button className="icon-btn" title="Video call" onClick={() => setCallType('video')}>📹</button>
          </div>
        </div>

        <div className="chat-messages">
          {conversation.length === 0 && (
            <p className="empty-state">No messages yet. Start the conversation.</p>
          )}
          {conversation.map(msg => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`msg-row${isMine ? ' msg-row--mine' : ''}`}>
                {!isMine && <div className="contact-avatar contact-avatar--xs">{activeContact.avatar}</div>}
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
          <textarea
            className="chat-input"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button className="btn btn--primary" onClick={handleSend} disabled={!input.trim()}>Send</button>
        </div>
      </div>

      {callType && (
        <div className="modal-overlay" onClick={() => setCallType(null)}>
          <div className="modal modal--call" onClick={e => e.stopPropagation()}>
            <div className="call-icon">{callType === 'voice' ? '📞' : '📹'}</div>
            <h2>{callType === 'voice' ? 'Voice' : 'Video'} Call with {activeContact.name}</h2>
            <p className="call-note">AI is running in the background to collect insights. A summary will be added to Active Cases after the call.</p>
            <button className="btn btn--danger" onClick={() => setCallType(null)}>End Call</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default SWMessages;