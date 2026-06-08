import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../src/api/axiosInstance';
import API_URL from '../src/api';
import toast from 'react-hot-toast';
import { useLanguage } from '../src/i18n/LanguageContext';
import { getAuthItem } from '../src/authStorage';

export default function ClientList() {
    const { t } = useLanguage();
    const [clients, setClients] = useState([]);
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('active'); 
    const userId = getAuthItem('userId');

    useEffect(() => {
        if (!userId) return;
        fetchActiveClients();
        fetchRequests();
    }, [userId]);

    const fetchActiveClients = () => {
        api.get(`/api/psychologist/clients/my?psychologistId=${userId}`)
            .then(res => setClients(Array.isArray(res.data) ? res.data : []))
            .catch(() => setClients([]));
    };

    const fetchRequests = () => {
        api.get(`/api/psychologist/requests?psychologistId=${userId}`)
            .then(res => {
                setRequests(Array.isArray(res.data) ? res.data : []);
            }).catch(() => setRequests([]));
    };

    const handleApprove = async (requestId) => {
        try {
            await api.post(`/api/psychologist/requests/${requestId}/approve?psychologistId=${userId}`);
            toast.success('Client approved');
            fetchRequests();
            fetchActiveClients();
            window.dispatchEvent(new Event('psychologistRequestsChanged'));
        } catch (err) { console.error(err); }
    };

    const handleReject = async (requestId) => {
        try {
            await api.post(`/api/psychologist/requests/${requestId}/reject?psychologistId=${userId}`);
            toast.success('Request rejected');
            fetchRequests();
            window.dispatchEvent(new Event('psychologistRequestsChanged'));
        } catch (err) { console.error(err); }
    };

    const matchesSearch = (item) => {
        const normalized = search.trim().toLowerCase();
        if (!normalized) return true;

        const client = activeTab === 'active' ? item : item.client || {};
        return [
            client.fullName,
            client.username,
            client.email,
            client.phone,
            client.id != null ? String(client.id) : ''
        ].some(value => String(value || '').toLowerCase().includes(normalized));
    };

    const displayList = (activeTab === 'active' ? clients : requests).filter(matchesSearch);
    const photoSrc = (item) => {
        const src = item?.profilePicture || item?.photoUrl;
        return src && src.startsWith('/uploads/') ? API_URL(src) : src;
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1>{t('clients_title')}</h1>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                        <button 
                            onClick={() => setActiveTab('active')}
                            style={{ 
                                background: 'none', border: 'none', padding: '0 0 8px', cursor: 'pointer',
                                color: activeTab === 'active' ? 'var(--accent-primary)' : 'var(--text-muted)',
                                borderBottom: activeTab === 'active' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                fontWeight: activeTab === 'active' ? '600' : '400', fontSize: '14px'
                            }}
                        >
                            {t('clients_current')} ({clients.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('discover')}
                            style={{ 
                                background: 'none', border: 'none', padding: '0 0 8px', cursor: 'pointer',
                                color: activeTab === 'discover' ? 'var(--accent-primary)' : 'var(--text-muted)',
                                borderBottom: activeTab === 'discover' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                fontWeight: activeTab === 'discover' ? '600' : '400', fontSize: '14px'
                            }}
                        >
                            {t('clients_pending')} ({requests.length})
                        </button>
                    </div>
                </div>
                <div style={{ minWidth: '250px', flex: '1', maxWidth: '400px' }}>
                    <input 
                        className="input-field"
                        type="text" 
                        placeholder={t('profile_search_ph')} 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>

            <div className="cards-grid">
                {displayList.map(rawItem => {
                    const item = activeTab === 'active' ? rawItem : rawItem.client;
                    return (
                    <div key={rawItem.id} className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                            <div style={{ 
                                width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', 
                                background: 'var(--bg-surface-2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', border: '1px solid var(--border-subtle)',
                                overflow: 'hidden'
                            }}>
                                {photoSrc(item)
                                    ? <img src={photoSrc(item)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
                                    : <span>👤</span>
                                }
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>{item.fullName || item.username}</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID: #{item.id.toString().padStart(4, '0')}</p>
                            </div>
                        </div>

                        <div className="divider" style={{ margin: 'var(--space-md) 0' }} />

                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: 'var(--space-sm)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{t('profile_email')}:</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{item.email || '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{t('profile_phone')}:</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{item.phone || '—'}</span>
                            </div>
                        </div>

                        {activeTab === 'active' ? (
                            <Link 
                                to={`/psychologist/client/${item.id}`} 
                                className="btn-primary" 
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                {t('clients_open_card')}
                            </Link>
                        ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button 
                                    onClick={() => handleApprove(rawItem.id)}
                                    className="btn-primary" 
                                    style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #34d399, #10b981)' }}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(rawItem.id)}
                                    className="btn-secondary"
                                    style={{ flex: 1, justifyContent: 'center', color: '#f87171' }}
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                )})}
                
                {displayList.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}>
                            {activeTab === 'active' ? '👥' : '✨'}
                        </div>
                        <p>{activeTab === 'active' ? t('clients_empty') : t('clients_pending_empty')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
