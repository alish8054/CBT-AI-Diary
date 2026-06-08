import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../src/api/axiosInstance';
import { useLanguage } from '../src/i18n/LanguageContext';
import { getAuthItem } from '../src/authStorage';

export default function PsychologistNotes() {
    const { t } = useLanguage();
    const [notes, setNotes] = useState([]);
    const [clients, setClients] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', clientId: '' });
    const userId = getAuthItem('userId');

    const getClientName = (note) => {
        return note.client?.fullName || note.client?.username || t('notes_no_client');
    };

    useEffect(() => {
        if (userId) {
            fetchNotes();
            fetchClients();
        }
    }, [userId]);

    const fetchNotes = async () => {
        try {
            const res = await api.get(`/api/psychologist-tools/notes?psychologistId=${userId}`);
            setNotes(res.data);
        } catch (e) {
            console.error('Error fetching notes:', e);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/psychologist-tools/notes', formData);
            setIsCreating(false);
            setFormData({ title: '', content: '', clientId: '' });
            fetchNotes();
            toast.success(t('notes_save_success'));
        } catch (e) {
            console.error('Error saving note:', e);
            toast.error(t('error_generic'));
        }
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1>{t('notes_title')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t('notes_confidential')}</p>
                </div>
                <button className="btn-primary" onClick={() => setIsCreating(true)}>{t('notes_new')}</button>
            </header>

            {isCreating && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-card" style={{ width: '100%', maxWidth: '600px' }}>
                        <h3 className="card-header">{t('notes_create_title')}</h3>
                        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-lg)' }}>
                            <div className="two-col-layout" style={{ marginBottom: 'var(--space-md)' }}>
                                <div>
                                    <label className="input-label">{t('profile_title')}</label>
                                    <input 
                                        className="input-field"
                                        placeholder={t('notes_title_ph')} 
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="input-label">{t('chat_client')}</label>
                                    <select 
                                        className="input-field"
                                        value={formData.clientId}
                                        onChange={e => setFormData({...formData, clientId: e.target.value})}
                                        required
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <option value="">{t('notes_select_client')}</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.fullName || c.username}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <label className="input-label">{t('diary_placeholder')}</label>
                                <textarea 
                                    className="input-field"
                                    placeholder={t('notes_content_ph')} 
                                    value={formData.content}
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                    style={{ height: '150px', resize: 'none' }}
                                    required
                                />
                            </div>
                            <div className="btn-row">
                                <button type="submit" className="btn-primary">{t('notes_save')}</button>
                                <button type="button" className="btn-secondary" onClick={() => setIsCreating(false)}>{t('notes_cancel')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="cards-grid">
                {notes.map(note => (
                    <div key={note.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{note.title}</h3>
                                <div className="badge badge-violet" style={{ marginTop: '6px' }}>{t('chat_client')}: {getClientName(note)}</div>
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{note.content}</p>
                    </div>
                ))}
                
                {notes.length === 0 && !isCreating && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}>рџ“ќ</div>
                        <p>{t('notes_list_empty')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
