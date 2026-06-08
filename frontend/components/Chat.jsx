import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../src/api/axiosInstance';
import API_URL from '../src/api';
import { useLanguage } from '../src/i18n/LanguageContext';
import { getAuthItem, getPhotoSrc } from '../src/authStorage';

const Chat = () => {
    const { t } = useLanguage();
    const location = useLocation();
    const userId = getAuthItem('userId');
    const userRole = getAuthItem('userRole');
    const [partner, setPartner] = useState(null);       
    const [clientList, setClientList] = useState([]);   
    const [activeClient, setActiveClient] = useState(null); 
    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);
    const [unreadBySender, setUnreadBySender] = useState({});
    const messagesEndRef = useRef(null);

    const chatPartnerId = userRole === 'CLIENT'
      ? partner?.id
      : activeClient?.id;
    const photoSrc = (person) => getPhotoSrc(person, API_URL);

    const refreshUnreadBySender = useCallback(async () => {
      if (!userId) return;

      try {
        const res = await api.get(`/api/chat/unread-by-sender?userId=${userId}`);
        setUnreadBySender(res.data || {});
      } catch {
        setUnreadBySender({});
      }
    }, [userId]);

    useEffect(() => {
      const reloadChatParticipants = () => setReloadKey(key => key + 1);
      window.addEventListener('psychologistChanged', reloadChatParticipants);
      window.addEventListener('focus', reloadChatParticipants);

      return () => {
        window.removeEventListener('psychologistChanged', reloadChatParticipants);
        window.removeEventListener('focus', reloadChatParticipants);
      };
    }, []);

    useEffect(() => {
      refreshUnreadBySender();

      const interval = window.setInterval(refreshUnreadBySender, 5000);
      window.addEventListener('focus', refreshUnreadBySender);
      window.addEventListener('chatUnreadChanged', refreshUnreadBySender);

      return () => {
        window.clearInterval(interval);
        window.removeEventListener('focus', refreshUnreadBySender);
        window.removeEventListener('chatUnreadChanged', refreshUnreadBySender);
      };
    }, [refreshUnreadBySender]);

    useEffect(() => {
      if (!userId) return;
      setLoading(true);

      const loadParticipants = async () => {
        if (userRole === 'CLIENT') {
          const res = await api.get(`/api/users/${userId}`);
          setPartner(res.data?.psychologist || null);
          return;
        }

        const res = await api.get(`/api/psychologist/clients/my?psychologistId=${userId}`);
        const clients = Array.isArray(res.data) ? res.data : [];
        setClientList(clients);
        setActiveClient(current =>
          clients.find(client => client.id === current?.id) || clients[0] || null
        );
      };

      loadParticipants()
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }, [userId, userRole, location.pathname, reloadKey]);

    useEffect(() => {
      if (!chatPartnerId || !userId) {
        setChatId(null);
        setMessages([]);
        return;
      }

      let cancelled = false;
      let poll;

      const fetchHistory = async () => {
        try {
          const chatRes = await api.post(`/api/chat/create?userId=${userId}&targetId=${chatPartnerId}`);
          if (cancelled) return;

          const activeChatId = chatRes.data.id;
          setChatId(activeChatId);

          const messagesRes = await api.get(`/api/chat/${activeChatId}/messages`);
          if (cancelled) return;

          setMessages(messagesRes.data);
          await api.put(`/api/chat/${activeChatId}/read?userId=${userId}`);

          if (!cancelled) {
            window.dispatchEvent(new CustomEvent('chatUnreadChanged'));
          }
        } catch (err) {
          console.error(err);
        }
      };

      fetchHistory();
      poll = setInterval(fetchHistory, 3000);
      return () => {
        cancelled = true;
        clearInterval(poll);
      };
    }, [chatPartnerId, userId]);

    
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
      if (e) e.preventDefault();
      if (!input.trim() || !chatId || !userId) return;
      
      const content = input.trim();
      setInput('');
      
      
      const tempId = Date.now();
      setMessages(prev => [...prev, {
        id: tempId, 
        content,
        senderId: Number(userId),
        timestamp: new Date().toISOString()
      }]);

      try {
        await api.post('/api/chat/message', {
          chatId,
          senderId: Number(userId),
          content
        });
        window.dispatchEvent(new CustomEvent('chatUnreadChanged'));
      } catch (err) {
        console.error('Send failed:', err);
      }
    };

    if (loading) return <div style={{ color: 'var(--text-muted)', padding: 32 }}>{t('loading')}</div>;

    
    if (userRole === 'CLIENT' && !partner) {
      return (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)', margin: '0 auto', maxWidth: '600px' }}>
          <div style={{ fontSize: 40, marginBottom: 'var(--space-md)' }}>💬</div>
          <h2>{t('chat_no_psych')}</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {t('chat_no_psych_hint')}
          </p>
        </div>
      );
    }

    
    if (userRole === 'PSYCHOLOGIST' && clientList.length === 0) {
      return (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)', margin: '0 auto', maxWidth: '600px' }}>
          <div style={{ fontSize: 40, marginBottom: 'var(--space-md)' }}>💬</div>
          <h2>{t('chat_no_clients')}</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {t('chat_no_clients_hint')}
          </p>
        </div>
      );
    }

    const currentPartner = userRole === 'CLIENT' ? partner : activeClient;

    return (
      <div className="chat-layout" style={{ display: 'flex', gap: 'var(--space-md)', height: 'calc(100vh - 120px)', flexWrap: 'wrap' }}>

        {}
        {userRole === 'PSYCHOLOGIST' && (
          <div className="card chat-sidebar" style={{ width: 240, flexShrink: 0, padding: '12px 0', overflowY: 'auto' }}>
            <div style={{ padding: '0 12px 8px', fontSize: 11, fontWeight: 600,
                          color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('chat_clients')}
            </div>
            {clientList.map(client => {
              const unreadCount = Number(unreadBySender[client.id] || 0);

              return (
                <div
                  key={client.id}
                  onClick={() => setActiveClient(client)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                    background: activeClient?.id === client.id ? 'var(--bg-surface-2)' : 'transparent',
                    borderLeft: activeClient?.id === client.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    transition: 'var(--transition-fast)', margin: '0 4px',
                  }}
                >
                  {photoSrc(client)
                    ? <img src={photoSrc(client)} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} alt="client" />
                    : <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-orange-glow)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: 'var(--accent-orange)'
                      }}>{(client.fullName || client.username || "?")[0]}</div>
                  }
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: activeClient?.id === client.id ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {client.fullName || client.username}
                      </div>
                  </div>
                  {unreadCount > 0 && (
                    <span className="nav-badge" style={{ marginLeft: 0 }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {}
        <div className="chat-container card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', minWidth: '300px' }}>
          {}
          <div className="chat-header" style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
            {}
            <div style={{ position: 'relative' }}>
              {photoSrc(currentPartner)
                ? <img src={photoSrc(currentPartner)}
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt="partner" />
                : <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: '#fff'
                  }}>
                    {(currentPartner?.fullName || currentPartner?.username || "?")[0]}
                  </div>
              }
              <div style={{
                position: 'absolute', bottom: 1, right: 1,
                width: 10, height: 10, background: '#34d399',
                borderRadius: '50%', border: '2px solid var(--bg-surface)'
              }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {currentPartner?.fullName || currentPartner?.username}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {userRole === 'CLIENT' ? t('chat_psychologist') : t('chat_client')}
              </div>
            </div>
          </div>

          {}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px',
                        display: 'flex', flexDirection: 'column', gap: 4 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)',
                            fontSize: 13, marginTop: 32 }}>
                {t('chat_start')}
              </div>
            )}
            {messages.map(msg => {
              const isMe = String(msg.senderId ?? msg.sender?.id ?? msg.sender) === String(userId);
              const sentAt = msg.sentAt || msg.timestamp;
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column',
                                           alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  <div className={isMe ? 'message message-user' : 'message message-ai'}>
                    {msg.content}
                  </div>
                  <div className="message-time" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, marginBottom: 8 }}>
                    {sentAt ? new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {}
          <div className="chat-input-area" style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)' }}>
            <form onSubmit={sendMessage} style={{ display: 'flex', width: '100%', gap: '10px' }}>
                <input
                className="input-field"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={t('chat_placeholder')}
                style={{ flex: 1, borderRadius: 'var(--radius-full)', padding: '10px 20px' }}
                />
                <button type="submit" className="btn-primary" style={{ borderRadius: '50%', width: 42, height: 42, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>➤</button>
            </form>
          </div>
        </div>
      </div>
    );
};

export default Chat;
