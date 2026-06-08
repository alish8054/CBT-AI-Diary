import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../src/api/axiosInstance';
import { useLanguage } from '../src/i18n/LanguageContext';
import { getAuthItem } from '../src/authStorage';

export default function PsychologistAssignments() {
    const { t } = useLanguage();
    const [assignments, setAssignments] = useState([]);
    const [clients, setClients] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', clientId: '' });
    const userId = getAuthItem('userId');

    useEffect(() => {
        if (userId) {
            fetchAssignments();
            fetchClients();
        }
    }, [userId]);

    const fetchAssignments = async () => {
        try {
            const res = await api.get(`/api/assignments/psychologist/${userId}`);
            setAssignments(res.data);
        } catch (e) {
            console.error('Error fetching assignments:', e);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await api.get(`/api/psychologist/clients/my?psychologistId=${userId}`);
            setClients(res.data);
        } catch (e) {
            console.error('Error fetching clients:', e);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/assignments', { ...formData, psychologistId: userId });
            setIsCreating(false);
            setFormData({ title: '', description: '', clientId: '' });
            fetchAssignments();
            toast.success(t('assignments_success_toast'));
        } catch (e) {
            console.error('Error creating assignment:', e);
            toast.error(t('error_generic'));
        }
    };

    const isCompleted = (item) => Boolean(item.completed ?? item.isCompleted);
    const clientName = (item) =>
        item.client?.fullName || item.client?.username || item.client?.email || `#${item.client?.id || '?'}`;

    return (
        <div className="fade-in">
            <header style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1>{t('assignments_program')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t('assignments_control')}</p>
                </div>
                <button className="btn-primary" onClick={() => setIsCreating(true)}>{t('assignments_new')}</button>
            </header>

            {isCreating && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-card" style={{ width: '100%', maxWidth: '600px' }}>
                        <h3 className="card-header">{t('assignments_create_title')}</h3>
                        <form onSubmit={handleCreate} style={{ padding: 'var(--space-lg)' }}>
                            <div className="two-col-layout" style={{ marginBottom: 'var(--space-md)' }}>
                                <div>
                                    <label className="input-label">{t('profile_title')}</label>
                                    <input className="input-field" placeholder={t('assignments_title_ph')} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="input-label">{t('chat_client')}</label>
                                    <select className="input-field" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} required style={{ cursor: 'pointer' }}>
                                        <option value="">{t('assignments_client_placeholder')}</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.fullName || c.username}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <label className="input-label">{t('assignments_instructions_label')}</label>
                                <textarea className="input-field" placeholder={t('assignments_instructions_ph')} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ height: '120px', resize: 'none' }} required />
                            </div>
                            <div className="btn-row">
                                <button type="submit" className="btn-primary">{t('assignments_send')}</button>
                                <button type="button" className="btn-secondary" onClick={() => setIsCreating(false)}>{t('notes_cancel')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="cards-grid">
                {assignments.map(item => (
                    <div key={item.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                            <span className={`badge ${isCompleted(item) ? 'badge-emerald' : 'badge-amber'}`}>
                                {isCompleted(item) ? t('tasks_done') : t('assignments_status_in_progress')}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--bg-surface-2)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: 'var(--radius-full)',
                            padding: '5px 12px',
                            marginBottom: 'var(--space-md)',
                            maxWidth: '100%'
                        }}>
                            <span className="input-label" style={{ margin: 0 }}>{t('chat_client')}</span>
                            <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {clientName(item)}
                            </span>
                        </div>
                        <h3 style={{ marginBottom: 'var(--space-sm)' }}>{item.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', fontSize: '14px', lineHeight: 1.6 }}>{item.description}</p>
                        
                        {item.clientAnswer && (
                            <div style={{ background: 'var(--bg-surface-2)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-tasks)' }}>
                                <div className="input-label" style={{ color: 'var(--color-tasks)', marginBottom: '8px' }}>{t('assignments_client_answer')}</div>
                                <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '14px', fontStyle: 'italic' }}>{item.clientAnswer}</p>
                            </div>
                        )}
                    </div>
                ))}
                
                {assignments.length === 0 && !isCreating && (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-2xl)', border: '1px dashed var(--border-subtle)' }}>
                        <div style={{ fontSize: '40px', marginBottom: 'var(--space-sm)' }}>🎯</div>
                        <p style={{ color: 'var(--text-muted)' }}>{t('assignments_empty')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
