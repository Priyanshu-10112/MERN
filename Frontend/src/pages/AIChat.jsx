import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import { chatWithAI, getChatHistory } from '../services/api';
import { useLocation } from 'react-router-dom';

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadId, setUploadId] = useState(null);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Get uploadId from navigation state
    if (location.state?.uploadId) {
      setUploadId(location.state.uploadId);
      loadChatHistory(location.state.uploadId);
    }
  }, [location]);

  const loadChatHistory = async (id) => {
    try {
      const response = await getChatHistory(id);
      if (response.success && response.data?.messages) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await chatWithAI(userMessage, uploadId);
      
      // Add AI response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.answer 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What are the key insights from this data?",
    "What patterns do you see?",
    "What's the average value?",
    "Show me the top performers",
    "What recommendations do you have?"
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>AI Chat Assistant</h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          {uploadId ? 'Ask questions about your uploaded data' : 'Upload a file first to enable context-aware chat'}
        </p>
      </div>

      {!uploadId && messages.length === 0 && (
        <div className="panel" style={{ padding: 40, textAlign: 'center', marginBottom: 20 }}>
          <Bot size={48} style={{ color: 'var(--gray-400)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Data Uploaded</h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: 20 }}>
            Upload and analyze a file to enable context-aware chat
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="panel" style={{ flex: 1, padding: 20, overflowY: 'auto', marginBottom: 16 }}>
        {messages.length === 0 && uploadId && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Bot size={48} style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Start a conversation</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20 }}>
              Try asking one of these questions:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400, margin: '0 auto' }}>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="btn btn-outline"
                  onClick={() => setInput(q)}
                  style={{ textAlign: 'left', fontSize: 13 }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 20,
              alignItems: 'start'
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: msg.role === 'user' ? 'var(--primary)' : 'var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {msg.role === 'user' ? (
                <User size={20} style={{ color: 'white' }} />
              ) : (
                <Bot size={20} style={{ color: 'var(--gray-700)' }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                background: msg.role === 'user' ? 'var(--primary-bg)' : 'var(--gray-50)',
                padding: 12,
                borderRadius: 8,
                fontSize: 14,
                lineHeight: 1.6
              }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} style={{ color: 'var(--gray-700)' }} />
            </div>
            <div style={{
              background: 'var(--gray-50)',
              padding: 12,
              borderRadius: 8
            }}>
              <Loader className="spinner" size={16} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 12 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={uploadId ? "Ask a question about your data..." : "Upload a file first..."}
          disabled={!uploadId || loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid var(--gray-200)',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none'
          }}
        />
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={!input.trim() || loading || !uploadId}
          style={{ padding: '12px 20px' }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
