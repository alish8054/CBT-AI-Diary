import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../src/api/axiosInstance';
import { useLanguage } from '../src/i18n/LanguageContext';

const moodToScore = (mood) => {
    const scores = {
        depressed: 1,
        down: 2,
        sad: 3,
        annoyed: 4,
        calm: 6,
        satisfied: 6,
        joy: 8,
        energetic: 8,
        energy: 8,
        happy: 9,
        excited: 10,
    };

    return scores[String(mood || '').trim().toLowerCase()] ?? 5;
};
export default function ClientDetails() {
    const { t } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [moodHistory, setMoodHistory] = useState([]);
    const [records, setRecords] = useState([]);
    const [diaryRecords, setDiaryRecords] = useState([]);
    const [dreamRecords, setDreamRecords] = useState([]);
    const [activeTab, setActiveTab] = useState('diary');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        let isMounted = true;

        const loadClientDetails = async () => {
            setLoading(true);
            setError('');

            try {
                const [clientRes, moodsRes, diaryRes, dreamsRes] = await Promise.all([
                    api.get(`/api/users/${id}`),
                    api.get(`/api/psychologist/client/${id}/mood-history`),
                    api.get(`/api/diary/user/${id}`),
                    api.get(`/api/dreams/user/${id}`)
                ]);

                if (!isMounted) return;

                const formattedMoodHistory = moodsRes.data.map(item => ({
                    ...item,
                    score: moodToScore(item.mood)
                }));

                setClient(clientRes.data);
                setMoodHistory(formattedMoodHistory);
                setDiaryRecords(diaryRes.data);
                setDreamRecords(dreamsRes.data);
                setRecords(activeTab === 'dreams' ? dreamsRes.data : diaryRes.data);
            } catch (e) {
                console.error('Client details loading failed:', e);
                if (isMounted) {
                    setError(t('client_details_load_error'));
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadClientDetails();
        return () => { isMounted = false; };
    }, [id, t]);

    useEffect(() => {
        setRecords(activeTab === 'dreams' ? dreamRecords : diaryRecords);
    }, [activeTab, diaryRecords, dreamRecords]);

    const handleStartChat = () => {
        if (!client) return;
        localStorage.setItem('chatTarget', JSON.stringify(client));
        navigate('/psychologist/chat');
    };

    if (error) return <div className="card" style={{ margin: '20px', color: '#f87171' }}>{error}</div>;
    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>{t('client_details_loading')}</div>;
    if (!client) return <div className="card" style={{ margin: '20px' }}>{t('client_details_not_found')}</div>;

    return (
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px' }}>
                        <h1>{client.fullName || client.username}</h1>
                        <span className="badge badge-amber">{t('client_details_active_status')}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>{t('client_details_id')} #{client.id.toString().padStart(4, '0')}{' \u2022 '}{client.email}</p>
                </div>
                <div className="btn-row">
                    <button onClick={handleStartChat} className="btn-primary">
                        {t('client_details_write')}
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 className="card-header">{t('client_details_mood_dynamics')}</h3>
                <div style={{ height: '300px', width: '100%', marginTop: 'var(--space-md)' }}>
                    {moodHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={moodHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                                <XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: '11px' }} />
                                <YAxis domain={[0, 10]} stroke="var(--text-muted)" style={{ fontSize: '11px' }} />
                                <Tooltip 
                                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--accent-primary)' }}
                                />
                                <Line type="monotone" dataKey="score" stroke="var(--accent-primary)" strokeWidth={3} dot={{ fill: 'var(--accent-primary)', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>{t('client_details_no_chart_data')}</div>
                    )}
                </div>
            </div>

            <div className="btn-row" style={{ marginBottom: 'var(--space-lg)' }}>
                <button
                    className={activeTab === 'diary' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('diary')}
                    style={{ background: activeTab === 'diary' ? 'var(--color-diary)' : '' }}
                >
                    {t('client_details_diary')}
                </button>
                <button
                    className={activeTab === 'dreams' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('dreams')}
                    style={{ background: activeTab === 'dreams' ? 'var(--color-dreams)' : '' }}
                >
                    {t('client_details_dreams')}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {records.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-xl)' }}>{t('diary_empty')}</p>}

                {records.map(rec => (
                    <div key={rec.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                            <span className="badge" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}>{new Date(rec.createdAt).toLocaleString()}</span>
                        </div>
                        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{rec.text || rec.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
