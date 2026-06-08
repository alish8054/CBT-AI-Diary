import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { aiApi } from '../api/aiApi';


export default function AiChatPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const history = await aiApi.history();
        if (cancelled) return;

        if (Array.isArray(history) && history.length > 0) {
          setMessages(history.map(item => ({
            role: item.role,
            text: item.text,
            ts: item.createdAt ? new Date(item.createdAt) : new Date(),
          })));
        } else {
          setMessages([{ role: 'ai', text: t('ai_chat_welcome'), ts: new Date() }]);
        }
      } catch {
        if (!cancelled) {
          setMessages([{ role: 'ai', text: t('ai_chat_welcome'), ts: new Date() }]);
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const message = (text || input).trim();
    if (!message || loading || historyLoading) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text: message, ts: new Date() }]);
    setLoading(true);

    try {
      const response = await aiApi.chat(message);
      setMessages(prev => [...prev, { role: 'ai', text: response, ts: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: t('ai_chat_error'),
        ts: new Date(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>

      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{t('ai_chat_title')}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          {t('ai_chat_subtitle')}
        </p>
      </div>

      <div className="chat-container" style={{ flex: 1 }}>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px',
                      display: 'flex', flexDirection: 'column', gap: 8 }}>

          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {msg.role === 'ai' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <img
                    src="/img_1.png"
                    alt="Sau Sana"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 800, lineHeight: 1 }}>
                    Sau Sana
                  </span>
                </div>
              )}
              <div className={msg.role === 'user' ? 'message message-user' : 'message message-ai'}
                style={{
                  whiteSpace: 'pre-wrap',
                  opacity: msg.error ? 0.6 : 1,
                }}>
                {msg.text}
              </div>
              <div className="message-time">
                {msg.ts instanceof Date && !Number.isNaN(msg.ts.getTime())
                  ? msg.ts.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </div>
            </div>
          ))}

          {historyLoading && (
            <div style={{
              color: 'var(--text-muted)',
              fontSize: 13,
              textAlign: 'center',
              padding: '18px 0'
            }}>
              {t('loading')}
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src="/img_1.png"
                alt="Sau Sana"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '10px 16px',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>


        <div className="chat-input-area">
          <input
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
            placeholder={t('ai_chat_placeholder')}
            disabled={loading || historyLoading}
          />
          <button className="chat-send-btn" onClick={() => send()} disabled={loading || historyLoading}>
            ➤
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
