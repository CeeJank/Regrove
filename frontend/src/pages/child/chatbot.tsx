import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCases } from '../../contexts/CasesContext';
import { ChatSession, BotMessage } from '../../types';

<<<<<<< HEAD
import ChatbotAvailable from '../../images/Hexatron_awake.png';
import ChatbotUnavailable from '../../images/Hexatron_sleeping.png';

const isChatbotAvailable = () => { const h = new Date().getHours(); return h >= 18 || h < 7; };

const HexatronIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="18,2 32,9 32,27 18,34 4,27 4,9" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.5"/>
    <circle cx="13" cy="16" r="3" fill="#fff"/>
    <circle cx="23" cy="16" r="3" fill="#fff"/>
    <path d="M13 24 Q18 27 23 24" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <line x1="18" y1="2" x2="18" y2="6" stroke="#60A5FA" strokeWidth="1.5"/>
    <circle cx="18" cy="7" r="1.5" fill="#60A5FA"/>
  </svg>
);
=======
const isChatbotAvailable = () => {
  const h = new Date().getHours();
  return h >= 18 || h < 7;
};
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)

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
<<<<<<< HEAD
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeSession?.messages]);

  const createSession = () => {
    const s: ChatSession = { id: `chat-${Date.now()}`, childId: user?.id ?? '', title: `Chat ${sessions.length + 1}`, createdAt: new Date().toISOString(), messages: [] };
    setSessions(prev => [...prev, s]);
    setActiveSessionId(s.id);
=======

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
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(sessions.find(s => s.id !== id)?.id ?? null);
  };

  const addMessage = (sessionId: string, msg: BotMessage) => {
<<<<<<< HEAD
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, msg] } : s));
=======
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, messages: [...s.messages, msg] } : s
    ));
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
  };

  const handleSend = async () => {
    if (!input.trim() || !activeSessionId || !user || loading) return;
    const userMsg: BotMessage = { id: `m-${Date.now()}`, role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    addMessage(activeSessionId, userMsg);
<<<<<<< HEAD
    setInput(''); setLoading(true);
=======
    setInput('');
    setLoading(true);

>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
    try {
      const session = sessions.find(s => s.id === activeSessionId);
      const history = [...(session?.messages ?? []), userMsg];
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
<<<<<<< HEAD
          model: 'claude-sonnet-4-6', max_tokens: 1000,
          system: `You are Hexatron, a compassionate AI companion for children in a social care programme called Regrove. Your role is to provide emotional support, a listening ear, and gentle guidance. Keep your tone warm, friendly, and age-appropriate. Do not provide medical or legal advice. If the user mentions self-harm, immediately and gently encourage them to reach out to their social worker. Collect emotional context to help social workers understand the child's wellbeing.`,
=======
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: `You are a compassionate AI companion for youth in a social care programme called Regrove. Your role is to provide emotional support, a listening ear, and gentle guidance. Keep your tone warm, friendly, and age-appropriate. Do not provide medical or legal advice. If the user mentions self-harm, encourage them to reach out to their social worker immediately. Collect emotional context from the conversation to help social workers understand the youth's wellbeing.`,
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
          messages: history.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
<<<<<<< HEAD
      const text = data.content?.map((b: { text?: string }) => b.text ?? '').join('') ?? "I'm here to listen. Can you tell me more?";
      addMessage(activeSessionId, { id: `m-${Date.now()}-ai`, role: 'assistant', content: text, timestamp: new Date().toISOString() });
      const userCase = getCaseByChildId(user.id);
      if (userCase) updateAiSummary(userCase.id, `Latest Hexatron insight: "${text.slice(0, 200)}..."`);
    } catch {
      addMessage(activeSessionId, { id: `m-err-${Date.now()}`, role: 'assistant', content: "I'm having trouble connecting right now. Please try again shortly.", timestamp: new Date().toISOString() });
    } finally { setLoading(false); }
=======
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
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  if (!available) {
    return (
<<<<<<< HEAD
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="unavailable-card" style={{ marginLeft: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
             <img 
          src={ChatbotUnavailable} 
          alt="Hexatron_Sleeping" 
          style={{ 
            width: '200px',   // Prevents overflow on small screens
            height: '200px'      // Keeps the original aspect ratio and size
          }} 
        />
          </div>
          <h2>Hexatron is resting now</h2>
          <p>Hexatron will be awake from <strong>6:00 PM to 7:00 AM</strong> Singapore Time.</p>
          <p className="unavailable-sub">Come back tonight, Hexatron will be waiting for you!</p>
=======
      <div className="page-content chatbot-unavailable">
        <div className="unavailable-card">
          <div className="unavailable-icon">🌙</div>
          <h2>My Companion is resting</h2>
          <p>The companion chatbot is available between <strong>6:00 PM and 7:00 AM</strong> Singapore Time.</p>
          <p className="unavailable-sub">Come back tonight — we will be here for you.</p>
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-layout">
      <aside className="chatbot-sidebar">
        <div className="chatbot-sidebar-header">
          <h2>Chats</h2>
<<<<<<< HEAD
          <button className="icon-btn" onClick={createSession} title="New chat" style={{ fontSize: 20, fontWeight: 700 }}>+</button>
        </div>
        {sessions.length === 0 && <p className="empty-state empty-state--sm">Start a new chat.</p>}
        {sessions.map(s => (
          <div key={s.id} className={`contact-row${activeSessionId === s.id ? ' contact-row--active' : ''}`} onClick={() => setActiveSessionId(s.id)}>
=======
          <button className="icon-btn" onClick={createSession} title="New chat">+</button>
        </div>
        {sessions.length === 0 && <p className="empty-state empty-state--sm">Start a new chat.</p>}
        {sessions.map(s => (
          <div
            key={s.id}
            className={`contact-row${activeSessionId === s.id ? ' contact-row--active' : ''}`}
            onClick={() => setActiveSessionId(s.id)}
          >
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
            <div className="contact-info">
              <p className="contact-name">{s.title}</p>
              <p className="contact-preview">{new Date(s.createdAt).toLocaleDateString()}</p>
            </div>
<<<<<<< HEAD
            <button className="icon-btn icon-btn--danger" onClick={e => { e.stopPropagation(); deleteSession(s.id); }} title="Delete">✕</button>
=======
            <button
              className="icon-btn icon-btn--danger"
              onClick={e => { e.stopPropagation(); deleteSession(s.id); }}
              title="Delete chat"
            >✕</button>
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
          </div>
        ))}
      </aside>

      <div className="chat-area">
        {!activeSession ? (
          <div className="chatbot-empty">
<<<<<<< HEAD
            <div style={{ marginBottom: 12 }}>
              <img 
                src={ChatbotAvailable} 
                alt="Hexatron_Awake" 
                style={{ 
                  width: '200px',   // Prevents overflow on small screens
                  height: '200px'      // Keeps the original aspect ratio and size
                }} 
              />
            </div>
            <h2>Meet Hexatron</h2>
            <p>Your safe space to talk. Everything here is only shared with your social worker to help support you.</p>
=======
            <div className="chatbot-empty-icon">🤖</div>
            <h2>Your Companion</h2>
            <p>A safe space to talk. Everything here is confidential and only shared with your social worker to help support you.</p>
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
            <button className="btn btn--primary" onClick={createSession}>Start a new chat</button>
          </div>
        ) : (
          <>
            <div className="chat-header">
<<<<<<< HEAD
              <HexatronIcon />
              <div>
                <p className="chat-contact-name">{activeSession.title}</p>
                <p className="chat-contact-sub">Hexatron is here for you 💙</p>
=======
              <span className="chatbot-avatar">🤖</span>
              <div>
                <p className="chat-contact-name">{activeSession.title}</p>
                <p className="chat-contact-sub">Your companion is here for you</p>
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
              </div>
            </div>
            <div className="chat-messages">
              {activeSession.messages.length === 0 && (
<<<<<<< HEAD
                <div className="chatbot-starter">Hi there 👋 I'm Hexatron, your companion. How are you feeling today?</div>
              )}
              {activeSession.messages.map(m => (
                <div key={m.id} className={`msg-row${m.role === 'user' ? ' msg-row--mine' : ''}`}>
                  {m.role === 'assistant' && <span className="contact-avatar contact-avatar--xs" style={{ background: 'var(--primary)', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>H</span>}
=======
                <div className="chatbot-starter">
                  <p>Hi there 👋 I am here to listen. How are you feeling today?</p>
                </div>
              )}
              {activeSession.messages.map(m => (
                <div key={m.id} className={`msg-row${m.role === 'user' ? ' msg-row--mine' : ''}`}>
                  {m.role === 'assistant' && <span className="contact-avatar contact-avatar--xs">🤖</span>}
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
                  <div className={`msg-bubble${m.role === 'user' ? ' msg-bubble--mine' : ' msg-bubble--bot'}`}>
                    <p>{m.content}</p>
                    <span className="msg-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="msg-row">
<<<<<<< HEAD
                  <span className="contact-avatar contact-avatar--xs" style={{ background: 'var(--primary)', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>H</span>
                  <div className="msg-bubble msg-bubble--bot typing-indicator"><span /><span /><span /></div>
=======
                  <span className="contact-avatar contact-avatar--xs">🤖</span>
                  <div className="msg-bubble msg-bubble--bot typing-indicator">
                    <span /><span /><span />
                  </div>
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="chat-input-bar">
<<<<<<< HEAD
              <textarea className="chat-input" placeholder="Say something to Hexatron..." value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={handleKey} rows={1} disabled={loading} />
=======
              <textarea
                className="chat-input"
                placeholder="Say something..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                disabled={loading}
              />
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
              <button className="btn btn--primary" onClick={handleSend} disabled={!input.trim() || loading}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
<<<<<<< HEAD

export default Chatbot;
=======
export default Chatbot;
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
