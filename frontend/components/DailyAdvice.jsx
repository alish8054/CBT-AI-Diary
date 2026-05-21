import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import './App.css';

export default function DailyAdvice() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [advice, setAdvice] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user.id) fetchAdvice();
    }, [user.id]);

    const fetchAdvice = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/ai-advice/daily/${user.id}`);
            if (!res.ok) {
                toast.error('Could not generate advice');
                return;
            }
            setAdvice(await res.json());
        } catch (error) {
            console.error(error);
            toast.error('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="diary-container" style={{maxWidth: '850px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '24px'}}>
                <div>
                    <h1 style={{margin: 0}}>AI Daily Guide</h1>
                    <p style={{margin: '8px 0 0', color: '#64748b'}}>Based on your mood and diary entries.</p>
                </div>
                <button onClick={fetchAdvice} className="btn-primary" disabled={loading} style={{padding: '10px 18px'}}>
                    {loading ? 'Thinking...' : 'Refresh'}
                </button>
            </div>

            {loading && !advice ? (
                <p style={{textAlign: 'center', color: '#64748b'}}>Generating advice...</p>
            ) : advice ? (
                <div style={{display: 'grid', gap: '18px'}}>
                    <section style={{background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px'}}>
                        <div style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '8px'}}>
                            Today's mood: <strong>{advice.todayMood || 'not selected'}</strong>
                        </div>
                        <div style={{whiteSpace: 'pre-wrap', lineHeight: 1.65, color: '#1f2937'}}>
                            {advice.advice}
                        </div>
                    </section>

                    {advice.tasks && advice.tasks.length > 0 && (
                        <section style={{background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px'}}>
                            <h2 style={{fontSize: '1.2rem', marginTop: 0}}>Tasks for today</h2>
                            <ul style={{margin: 0, paddingLeft: '22px', lineHeight: 1.8}}>
                                {advice.tasks.map((task, index) => <li key={index}>{task}</li>)}
                            </ul>
                        </section>
                    )}

                    {advice.source === 'local' && (
                        <p style={{fontSize: '0.85rem', color: '#94a3b8', margin: 0}}>
                            Local mode is active. Set OPENAI_API_KEY on the backend for full AI reasoning.
                        </p>
                    )}
                </div>
            ) : (
                <p style={{textAlign: 'center', color: '#64748b'}}>No advice yet.</p>
            )}
        </div>
    );
}
