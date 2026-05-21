import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const moodToScore = (mood) => {
    const scores = { "Депрессивно": 1, "Подавлено": 2, "Грустно": 3, "Раздраженно": 4, "Удовлетворённо": 6, "Радостно": 8, "Счастливо": 9, "Восторженно": 10 };
    return scores[mood] || 5;
};

export default function ClientDetails() {
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
    const [aiSummary, setAiSummary] = useState('');
    const [generatingSummary, setGeneratingSummary] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchJson = async (url) => {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            return response.json();
        };

        const loadClientDetails = async () => {
            setLoading(true);
            setError('');

            try {
                const [clientData, moodsData, diaryData, dreamsData] = await Promise.all([
                    fetchJson(`/api/users/${id}`),
                    fetchJson(`/api/psychologist/client/${id}/mood-history`),
                    fetchJson(`/api/diary/user/${id}`),
                    fetchJson(`/api/dreams/user/${id}`)
                ]);

                if (!isMounted) return;

                const formattedMoodHistory = moodsData.map(item => ({
                    ...item,
                    score: moodToScore(item.mood)
                }));

                setClient(clientData);
                setMoodHistory(formattedMoodHistory);
                setDiaryRecords(diaryData);
                setDreamRecords(dreamsData);
                setRecords(activeTab === 'dreams' ? dreamsData : diaryData);
            } catch (e) {
                console.error('Client details loading failed:', e);
                if (isMounted) {
                    setClient(null);
                    setError('Не удалось загрузить досье клиента. Проверьте, что сервер запущен и клиент существует.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadClientDetails();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        setRecords(activeTab === 'dreams' ? dreamRecords : diaryRecords);
    }, [activeTab, diaryRecords, dreamRecords]);

    const handleGenerateSummary = async () => {
        setGeneratingSummary(true);
        try {
            const res = await fetch(`/api/psychologist/client/${id}/summary`);
            if (res.ok) {
                const text = await res.text();
                setAiSummary(text);
                toast.success("Сводка сформирована");
            } else {
                toast.error("Ошибка при генерации сводки");
            }
        } catch (e) {
            toast.error("Ошибка сети");
        } finally {
            setGeneratingSummary(false);
        }
    };

    const handleStartChat = () => {
        if (!client) return;
        localStorage.setItem('chatTarget', JSON.stringify(client));
        navigate('/psychologist/chat');
    };

    if (error) return <div className="diary-container">Error loading client details. Check that the backend is running and the client exists.</div>;

    if (loading) return <div className="diary-container">⏳ Загрузка досье...</div>;
    if (!client) return <div className="diary-container">❌ Клиент не найден</div>;

    return (
        <div className="diary-container" style={{maxWidth: '1000px'}}>
            {/* ШАПКА ПРОФИЛЯ */}
            <div style={{display: 'flex', gap: '30px', marginBottom: '30px', alignItems: 'center', flexWrap: 'wrap'}}>
                {/* ... (avatar code) */}
                <div style={{flex: 1}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
                        <h1 style={{margin: 0}}>{client.fullName || client.username}</h1>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={handleGenerateSummary} className="btn-secondary" disabled={generatingSummary} style={{padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                {generatingSummary ? '⏳ Генерирую...' : '✨ AI Сводка'}
                            </button>
                            <button onClick={handleStartChat} className="btn-primary" style={{padding: '10px 20px'}}>
                                💬 Написать сообщение
                            </button>
                        </div>
                    </div>
                    {/* ... (rest of profile info) */}
                </div>
            </div>

            {/* AI SUMMARY BOX */}
            {aiSummary && (
                <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '30px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{marginTop: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        ✨ Клиническая сводка (AI)
                    </h3>
                    <div style={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        color: '#334155',
                        fontSize: '0.95rem'
                    }}>
                        {aiSummary}
                    </div>
                </div>
            )}

            {/* ГРАФИК */}
            <div style={{height: '350px', background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #eee'}}>
                <h3>Динамика настроения</h3>
                {moodHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="90%" minWidth={300} minHeight={250}>
                        <LineChart data={moodHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 10]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="score" stroke="#667eea" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p style={{color: '#999', textAlign: 'center', marginTop: '50px'}}>Нет данных для графика</p>
                )}
            </div>

            {/* ВКЛАДКИ */}
            <div style={{marginBottom: '20px'}}>
                <button
                    className={activeTab === 'diary' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('diary')}
                    style={{marginRight: '10px'}}
                >
                    📖 Дневник
                </button>
                <button
                    className={activeTab === 'dreams' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('dreams')}
                >
                    🌙 Сны
                </button>
            </div>

            {/* СПИСОК ЗАПИСЕЙ */}
            <div className="entry-list">
                {records.length === 0 && <p style={{color: '#999'}}>Записей пока нет.</p>}

                {records.map(rec => (
                    <div key={rec.id} className="entry-item">
                        <small style={{color: '#888'}}>{new Date(rec.createdAt).toLocaleString()}</small>
                        {/* Поддержка разных имен полей */}
                        <p style={{marginTop: '10px', whiteSpace: 'pre-wrap'}}>{rec.text || rec.content}</p>

                        {(rec.aiAnalysis || rec.interpretation) && (
                            <div style={{background: '#f0f9ff', padding: '15px', marginTop: '10px', borderRadius: '8px', borderLeft: '4px solid #667eea'}}>
                                <strong>💡 AI Анализ:</strong> {rec.aiAnalysis || rec.interpretation}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
