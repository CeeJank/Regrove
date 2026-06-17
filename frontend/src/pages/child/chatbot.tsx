import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCases } from '../../contexts/CasesContext';
import { ChatSession, BotMessage } from '../../types';

const isChatbotAvailable = () => {
  const h = new Date().getHours();
  return h >= 18 || h < 7;
};

const Chatbot: React.FC = () => {
  const { user } = useAuth();
  const { getCaseByChildId, updateAiSummary } = useCases();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const available = isChatbotAvailable();
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const createSession = () => {
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      childId: user?.id ?? '',
      title: `Chat ${sessions.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(sessions.find(s => s.id !== id)?.id ?? null);
  };

  const addMessage = (sessionId: string, msg: BotMessage) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, messages: [...s.messages, msg] } : s
    ));
  };

  const handleSend = async () => {
    if (!input.trim() || !activeSessionId || !user || loading) return;
    const userMsg: BotMessage = { id: `m-${Date.now()}`, role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    addMessage(activeSessionId, userMsg);
    setInput('');
    setLoading(true);

    try {
      const session = sessions.find(s => s.id === activeSessionId);
      const history = [...(session?.messages ?? []), userMsg];
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: `You are a compassionate AI companion for youth in a social care programme called Regrove. Your role is to provide emotional support, a listening ear, and gentle guidance. Keep your tone warm, friendly, and age-appropriate. Do not provide medical or legal advice. If the user mentions self-harm, encourage them to reach out to their social worker immediately. Collect emotional context from the conversation to help social workers understand the youth's wellbeing.`,
          messages: history.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b: any) => b.text ?? '').join('') ?? 'I am here to listen. Can you tell me more?';
      const botMsg: BotMessage = { id: `m-${Date.now()}-ai`, role: 'assistant', content: text, timestamp: new Date().toISOString() };
      addMessage(activeSessionId, botMsg);

      // update AI summary for case
      const userCase = getCaseByChildId(user.id);
      if (userCase) {
        updateAiSummary(userCase.id, `Latest chatbot insight: "${text.slice(0, 200)}..."`);
      }
    } catch {
      addMessage(activeSessionId, {
        id: `m-err-${Date.now()}`, role: 'assistant',
        content: 'I seem to be having trouble connecting right now. Please try again shortly.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  if (!available) {
    return (
      <div className="page-content chatbot-unavailable">
        <div className="unavailable-card">
          <div className="unavailable-icon">🌙</div>
          <h2>My Companion is resting</h2>
          <p>The companion chatbot is available between <strong>6:00 PM and 7:00 AM</strong> Singapore Time.</p>
          <p className="unavailable-sub">Come back tonight — we will be here for you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-layout">
      <aside className="chatbot-sidebar">
        <div className="chatbot-sidebar-header">
          <h2>Chats</h2>
          <button className="icon-btn" onClick={createSession} title="New chat">+</button>
        </div>
        {sessions.length === 0 && <p className="empty-state empty-state--sm">Start a new chat.</p>}
        {sessions.map(s => (
          <div
            key={s.id}
            className={`contact-row${activeSessionId === s.id ? ' contact-row--active' : ''}`}
            onClick={() => setActiveSessionId(s.id)}
          >
            <div className="contact-info">
              <p className="contact-name">{s.title}</p>
              <p className="contact-preview">{new Date(s.createdAt).toLocaleDateString()}</p>
            </div>
            <button
              className="icon-btn icon-btn--danger"
              onClick={e => { e.stopPropagation(); deleteSession(s.id); }}
              title="Delete chat"
            >✕</button>
          </div>
        ))}
      </aside>

      <div className="chat-area">
        {!activeSession ? (
          <div className="chatbot-empty">
            <div className="chatbot-empty-icon">🤖</div>
            <h2>Your Companion</h2>
            <p>A safe space to talk. Everything here is confidential and only shared with your social worker to help support you.</p>
            <button className="btn btn--primary" onClick={createSession}>Start a new chat</button>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <span className="chatbot-avatar">🤖</span>
              <div>
                <p className="chat-contact-name">{activeSession.title}</p>
                <p className="chat-contact-sub">Your companion is here for you</p>
              </div>
            </div>
            <div className="chat-messages">
              {activeSession.messages.length === 0 && (
                <div className="chatbot-starter">
                  <p>Hi there 👋 I am here to listen. How are you feeling today?</p>
                </div>
              )}
              {activeSession.messages.map(m => (
                <div key={m.id} className={`msg-row${m.role === 'user' ? ' msg-row--mine' : ''}`}>
                  {m.role === 'assistant' && <span className="contact-avatar contact-avatar--xs">🤖</span>}
                  <div className={`msg-bubble${m.role === 'user' ? ' msg-bubble--mine' : ' msg-bubble--bot'}`}>
                    <p>{m.content}</p>
                    <span className="msg-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="msg-row">
                  <span className="contact-avatar contact-avatar--xs">🤖</span>
                  <div className="msg-bubble msg-bubble--bot typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="chat-input-bar">
              <textarea
                className="chat-input"
                placeholder="Say something..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                disabled={loading}
              />
              <button className="btn btn--primary" onClick={handleSend} disabled={!input.trim() || loading}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default Chatbot;