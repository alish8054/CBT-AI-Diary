import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../src/api/axiosInstance';
import { useLanguage } from '../src/i18n/LanguageContext';
import { getAuthItem } from '../src/authStorage';

export default function DreamAnalysis() {
    const { t } = useLanguage();
    const [dreams, setDreams] = useState([]);
    const [newDream, setNewDream] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [showForm, setShowForm] = useState(false);

    const userId = getAuthItem('userId');

    useEffect(() => {
        if (userId) fetchDreams();
    }, [userId]);

    const fetchDreams = async () => {
        try {
            const res = await api.get(`/api/dreams/user/${userId}`);
            const data = res.data;
            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setDreams(sorted);
        } catch (e) { 
            console.error('Error fetching dreams:', e); 
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newDream.trim()) return;

        try {
            await api.post('/api/dreams', { userId: userId, text: newDream });
            setNewDream('');
            setShowForm(false);
            fetchDreams();
            toast.success(t('dreams_toast_saved'));
        } catch (e) {
            console.error('Error creating dream:', e);
            const message = e.response?.data || t('dreams_toast_save_error');
            toast.error(message);
        }
    };

    const startEdit = (dream) => {
        setEditingId(dream.id);
        setEditContent(dream.content || dream.text);
    };

    const handleUpdate = async (id) => {
        try {
            await api.put(`/api/dreams/${id}`, { content: editContent });
            setEditingId(null);
            fetchDreams();
            toast.success(t('dreams_toast_updated'));
        } catch (e) {
            console.error('Error updating dream:', e);
            toast.error(t('error_generic'));
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/dreams/${id}`);
            fetchDreams();
            toast.success(t('dreams_toast_deleted'));
        } catch (e) {
            console.error('Error deleting dream:', e);
            toast.error(t('error_generic'));
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ position: 'relative', marginBottom: 'var(--space-xl)' }}>
                <div style={{ 
                    position: 'absolute', 
                    top: '-20px', 
                    left: '-20px', 
                    right: '-20px', 
                    height: '100px', 
                    background: 'rgba(56, 189, 248, 0.08)', 
                    zIndex: -1,
                    borderRadius: 'var(--radius-xl)'
                }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                    <h1>{t('dreams_my_dreams')}</h1>
                    {!showForm && (
                        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}>
                            {t('dreams_record_btn')}
                        </button>
                    )}
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 'var(--space-xl)', borderLeft: '4px solid var(--color-dreams)' }}>
                    <h3 className="card-header">{t('dreams_new_dream')}</h3>
                    <form onSubmit={handleCreate}>
                        <textarea
                            className="input-field"
                            placeholder={t('dreams_placeholder')}
                            value={newDream}
                            onChange={(e) => setNewDream(e.target.value)}
                            style={{ height: '120px', marginBottom: 'var(--space-md)', resize: 'none' }}
                            required
                        />
                        <div className="btn-row">
                            <button type="submit" className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}>{t('dreams_save_btn')}</button>
                            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>{t('cancel')}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="cards-grid" style={{ gridTemplateColumns: '1fr' }}>
                {dreams.length === 0 && !showForm && (
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
                        <div style={{ fontSize: '40px', marginBottom: 'var(--space-sm)' }}>🌙</div>
                        <p>{t('dreams_empty_hint')}</p>
                    </div>
                )}

                {dreams.map(dream => (
                    <div key={dream.id} className="card" style={{ borderLeft: '4px solid var(--color-dreams)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="badge badge-sky">{new Date(dream.createdAt).toLocaleDateString()}</span>
                                <span style={{ fontSize: '18px' }}>🌙</span>
                            </div>
                            <div className="btn-row" style={{ gap: '8px' }}>
                                <button onClick={() => startEdit(dream)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>✏️</button>
                                <button onClick={() => handleDelete(dream.id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', color: '#f87171' }}>🗑️</button>
                            </div>
                        </div>

                        {editingId === dream.id ? (
                            <div>
                                <textarea
                                    className="input-field"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    style={{ height: '150px', marginBottom: 'var(--space-md)', resize: 'none' }}
                                />
                                <div className="btn-row">
                                    <button onClick={() => handleUpdate(dream.id)} className="btn-primary" style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}>{t('save')}</button>
                                    <button onClick={() => setEditingId(null)} className="btn-secondary">{t('cancel')}</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ marginBottom: 'var(--space-sm)' }}>{t('dreams_dream_at')} {new Date(dream.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                                <p style={{ 
                                    color: 'var(--text-secondary)', 
                                    whiteSpace: 'pre-wrap',
                                    display: '-webkit-box',
                                    WebkitLineClamp: '3',
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    marginBottom: 'var(--space-md)'
                                }}>
                                    {dream.content || dream.text}
                                </p>
                                <div className="divider" style={{ margin: 'var(--space-sm) 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <span className="badge badge-sky">#dream</span>
                                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>#subconscious</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        <span>{t('dreams_mood_before')}</span>
                                        <span style={{ color: 'var(--color-dreams)' }}>{t('dreams_mood_calm')}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
