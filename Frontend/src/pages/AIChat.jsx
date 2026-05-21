import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { chatWithAI } from '../services/api';

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hello! I'm your AI evaluation assistant. Upload and analyze data first, then ask me questions about team performance, grades, and insights.",
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    if (!text.trim() || typing) return;

    const userMsg = { role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const response = await chatWithAI(text, true);
      
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: response.answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { 
          role: 'ai', 
          text: `Sorry, I encountered an error: ${error.message}. Please make sure you have uploaded and analyzed data first.`,
          isError: true
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const suggestions = [
    'Which team is performing best?',
    'What are common weaknesses across teams?',
    'Which team needs the most improvement?',
  ];

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: m.role === 'ai' ? 'var(--primary-bg)' : 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: m.role === 'ai' ? 'var(--primary)' : '#fff',
            }}>
              {m.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`chat-bubble ${m.role === 'ai' ? 'ai' : 'user'}`} style={m.isError ? { background: 'var(--danger-bg)', color: 'var(--danger)' } : {}}>
              {m.text.split('\n').map((line, j) => (
                <span key={j}>
                  {line.replace(/\*\*(.*?)\*\*/g, '«$1»').split('«').map((part, k) => {
                    if (part.includes('»')) {
                      const [bold, rest] = part.split('»');
                      return <span key={k}><strong>{bold}</strong>{rest}</span>;
                    }
                    return part;
                  })}
                  {j < m.text.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'var(--primary-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--primary)',
            }}>
              <Bot size={16} />
            </div>
            <div className="chat-bubble ai" style={{ display: 'flex', gap: 4, padding: '16px 22px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gray-400)', animation: 'pulse 1.2s ease infinite' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gray-400)', animation: 'pulse 1.2s ease infinite .2s' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gray-400)', animation: 'pulse 1.2s ease infinite .4s' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="suggestion-chips">
          {suggestions.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-bar">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about team performance, grades, suggestions…"
          disabled={typing}
        />
        <button onClick={() => sendMessage(input)} disabled={typing || !input.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
