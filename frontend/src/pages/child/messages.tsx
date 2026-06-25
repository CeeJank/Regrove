import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../contexts/MessagesContext';
import { useCases } from '../../contexts/CasesContext';

const ChildMessages: React.FC = () => {
  const { user } = useAuth();
  const { getConversation, sendMessage } = useMessages();
  const { allWorkers } = useCases();
  const [input, setInput] = useState('');
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const worker = Object.entries(allWorkers)[0]?.[1] ?? null;
  const workerId = worker?.userId ?? '';
  const conversation = user && workerId ? getConversation(user.id, workerId) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSend = async () => {
    if (!input.trim() || !user || !workerId) return;
    await sendMessage({ senderId: user.id, receiverId: workerId, content: input.trim(), type: 'text' });
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div className="messages-layout messages-layout--full">
      <div className="chat-area">
        <div className="chat-header">
          <div className="contact-avatar contact-avatar--lg">{worker?.name?.[0] ?? 'S'}</div>
          <div>
            <p className="chat-contact-name">{worker?.name ?? 'Social Worker'}</p>
            <p className="chat-contact-sub">Your Social Worker</p>
          </div>
          <div className="chat-actions">
            <button className="icon-btn" onClick={() => setCallType('voice')}>📞</button>
            <button className="icon-btn" onClick={() => setCallType('video')}>📹</button>
          </div>
        </div>

        <div className="chat-messages">
          {conversation.length === 0 && (
            <p className="empty-state">No messages yet. Say hello to your social worker!</p>
          )}
          {conversation.map(msg => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`msg-row${isMine ? ' msg-row--mine' : ''}`}>
                {!isMine && <div className="contact-avatar contact-avatar--xs">{worker?.name?.[0] ?? 'S'}</div>}
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
            <h2>{callType === 'voice' ? 'Voice' : 'Video'} Call with {worker?.name ?? 'Social Worker'}</h2>
            <button className="btn btn--danger" onClick={() => setCallType(null)}>End Call</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ChildMessages;
