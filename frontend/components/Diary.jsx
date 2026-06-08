import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../src/api/axiosInstance';
import { useLanguage } from '../src/i18n/LanguageContext';
import { getAuthItem } from '../src/authStorage';

export default function DiaryHome() {
    const { t } = useLanguage();
    const [entries, setEntries] = useState([]);
    const [newText, setNewText] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [showForm, setShowForm] = useState(false);

    const userId = getAuthItem('userId');

    useEffect(() => {
        if (userId) fetchEntries();
    }, [userId]);

    const fetchEntries = async () => {
        try {
            const res = await api.get(`/api/diary/user/${userId}`);
            const data = res.data;
            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setEntries(sorted);
        } catch (e) { console.error(e); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newText.trim()) return;

        try {
            await api.post('/api/diary', { userId, text: newText });
            setNewText('');
            setShowForm(false);
            fetchEntries();
            toast.success(t('diary_toast_saved'));
        } catch (error) {
            toast.error(error.response?.data || t('diary_toast_save_error'));
        }
    };

    const startEdit = (entry) => {
        setEditingId(entry.id);
        setEditText(entry.text || entry.content);
    };

    const handleUpdate = async (id) => {
        try {
            await api.put(`/api/diary/${id}`, { text: editText });
            setEditingId(null);
            fetchEntries();
            toast.success(t('diary_toast_updated'));
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/diary/${id}`);
            if (editingId === id) setEditingId(null);
            fetchEntries();
            toast.success(t('diary_toast_deleted'));
        } catch (e) {
            toast.error(t('diary_toast_delete_error'));
        }
    };

    const todayStr = new Date().toLocaleDateString();
    const hasTodayEntry = entries.some(entry => new Date(entry.createdAt).toLocaleDateString() === todayStr);

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <h1>{t('diary_my_diary')}</h1>
                {!hasTodayEntry && !showForm && (
                    <button className="btn-primary" onClick={() => setShowForm(true)}>{t('diary_new')}</button>
                )}
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 className="card-header">{t('diary_main_thought')}</h3>
                    <form onSubmit={handleCreate}>
                        <textarea
                            className="input-field"
                            placeholder={t('diary_placeholder')}
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            style={{ height: '120px', marginBottom: 'var(--space-md)', resize: 'none' }}
                            required
                        />
                        <div className="btn-row">
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>{t('diary_save_btn')}</button>
                            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>{t('cancel')}</button>
                        </div>
                    </form>
                </div>
            )}

            {hasTodayEntry && !editingId && (
                <div className="card" style={{ marginBottom: 'var(--space-xl)', borderColor: 'var(--color-world)', background: 'rgba(52, 211, 153, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>✅</span>
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--color-world)' }}>{t('diary_today_created')}</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>{t('diary_today_hint')}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="cards-grid" style={{ gridTemplateColumns: '1fr' }}>
                {entries.length === 0 && !showForm && (
                    <div style={{ 
                        height: '200px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: 'var(--bg-surface-2)',
                        border: '2px dashed var(--border-medium)',
                        borderRadius: 'var(--radius-xl)',
                        color: 'var(--text-muted)',
                        gridColumn: '1 / -1'
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: 'var(--space-sm)' }}>📖</div>
                        <p>{t('diary_empty_hint')}</p>
                    </div>
                )}

                {entries.map(entry => (
                    <div key={entry.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="badge badge-violet">{new Date(entry.createdAt).toLocaleDateString()}</span>
                                <span style={{ fontSize: '18px' }}>✨</span>
                            </div>
                            <div className="btn-row" style={{ gap: '8px' }}>
                                <button onClick={() => startEdit(entry)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>✏️</button>
                                <button onClick={() => handleDelete(entry.id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', color: '#f87171' }}>🗑️</button>
                            </div>
                        </div>

                        {editingId === entry.id ? (
                            <div>
                                <textarea
                                    className="input-field"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    style={{ height: '150px', marginBottom: 'var(--space-md)', resize: 'none' }}
                                />
                                <div className="btn-row">
                                    <button onClick={() => handleUpdate(entry.id)} className="btn-primary">{t('save')}</button>
                                    <button onClick={() => setEditingId(null)} className="btn-secondary">{t('cancel')}</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ marginBottom: 'var(--space-sm)' }}>{t('diary_entry_at')} {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                                <p style={{ 
                                    color: 'var(--text-secondary)', 
                                    whiteSpace: 'pre-wrap',
                                    display: '-webkit-box',
                                    WebkitLineClamp: '3',
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    marginBottom: 'var(--space-md)'
                                }}>
                                    {entry.text || entry.content}
                                </p>
                                <div className="divider" style={{ margin: 'var(--space-sm) 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>#diary</span>
                                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>#mindfulness</span>
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('diary_reading_time')}</span>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
