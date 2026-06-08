import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../src/api/axiosInstance';
import { useLanguage } from '../src/i18n/LanguageContext';
import { getAuthItem } from '../src/authStorage';

export default function ClientAssignments() {
    const { t } = useLanguage();
    const [assignments, setAssignments] = useState([]);
    const [answer, setAnswer] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [completingId, setCompletingId] = useState(null);
    const userId = getAuthItem('userId');

    useEffect(() => {
        if (userId) fetchAssignments();
    }, [userId]);

    const fetchAssignments = async () => {
        try {
            const res = await api.get(`/api/assignments/client/${userId}`);
            setAssignments(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('Error fetching assignments:', e);
            toast.error(t('error_generic'));
        }
    };

    const isCompleted = (item) => Boolean(item.completed ?? item.isCompleted);

    const handleComplete = async (id) => {
        if (!answer.trim()) return toast.error(t('error_generic'));

        setCompletingId(id);
        try {
            await api.put(`/api/assignments/${id}/complete`, { answer: answer.trim() });
            setSelectedId(null);
            setAnswer('');
            await fetchAssignments();
            toast.success(t('tasks_done'));
        } catch (e) {
            console.error('Error completing assignment:', e);
            toast.error(t('error_generic'));
        } finally {
            setCompletingId(null);
        }
    };

    return (
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <header style={{ marginBottom: 'var(--space-xl)' }}>
                <h1>{t('assignments_program')}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{t('home_tasks_desc')}</p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {assignments.map(item => (
                    <div key={item.id} className="card" style={{ 
                        borderLeft: isCompleted(item) ? '4px solid var(--color-world)' : '4px solid var(--color-tasks)',
                        opacity: isCompleted(item) ? 0.8 : 1
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                            <span className={`badge ${isCompleted(item) ? 'badge-emerald' : 'badge-amber'}`}>
                                {isCompleted(item) ? t('tasks_done') : t('tasks_active')}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {t('chat_psychologist')}: <span style={{ color: 'var(--text-accent)' }}>{item.psychologist.fullName || '...'}</span>
                            </span>
                        </div>

                        <h3 style={{ marginBottom: 'var(--space-sm)', textDecoration: isCompleted(item) ? 'line-through' : 'none' }}>
                            {item.title}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-md)' }}>
                            {item.description}
                        </p>

                        {!isCompleted(item) && selectedId !== item.id && (
                            <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)' }} onClick={() => {
                                setSelectedId(item.id);
                                setAnswer('');
                            }}>
                                {t('home_tasks_btn')}
                            </button>
                        )}

                        {selectedId === item.id && (
                            <div style={{ marginTop: 'var(--space-md)', background: 'var(--bg-surface-2)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                                <label className="input-label">{t('assignments_client_answer')}</label>
                                <textarea 
                                    className="input-field"
                                    placeholder="..." 
                                    value={answer} 
                                    onChange={e => setAnswer(e.target.value)}
                                    style={{ height: '120px', marginBottom: 'var(--space-md)', resize: 'none' }}
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => handleComplete(item.id)}
                                        className="btn-primary"
                                        disabled={completingId === item.id}
                                        style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)' }}
                                    >
                                        {completingId === item.id ? t('loading') : t('profile_save')}
                                    </button>
                                    <button onClick={() => {
                                        setSelectedId(null);
                                        setAnswer('');
                                    }} className="btn-secondary">{t('cancel')}</button>
                                </div>
                            </div>
                        )}

                        {isCompleted(item) && (
                            <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)' }}>
                                <div className="input-label">{t('assignments_client_answer')}:</div>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>{item.clientAnswer}</p>
                            </div>
                        )}
                    </div>
                ))}
                
                {assignments.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)', border: '2px dashed var(--border-subtle)' }}>
                        <div style={{ fontSize: '40px', marginBottom: 'var(--space-sm)' }}>🎯</div>
                        <p style={{ color: 'var(--text-muted)' }}>{t('assignments_empty')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
