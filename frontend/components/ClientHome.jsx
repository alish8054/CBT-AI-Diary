import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../src/api/axiosInstance';
import { useLanguage } from '../src/i18n/LanguageContext';
import { getAuthItem } from '../src/authStorage';

export default function ClientHome() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const userId = getAuthItem('userId');
    const [userName, setUserName] = useState('');

    const MOOD_OPTIONS = [
        { key: 'happy', label: t('mood_happy'), emoji: '🌟' },
        { key: 'joy', label: t('mood_energy'), emoji: '⚡' },
        { key: 'calm', label: t('mood_calm'), emoji: '🧘' },
        { key: 'sad', label: t('mood_sad'), emoji: '☁️' },
        { key: 'annoyed', label: t('mood_annoyed'), emoji: '🔥' }
    ];
    
    
    const TODAY = new Date().toISOString().split('T')[0];
    const MOOD_KEY = `mood_${userId}_${TODAY}`;
    
    const [selectedMood, setSelectedMood] = useState(() => {
        return localStorage.getItem(MOOD_KEY);
    });
    const [moodSelected, setMoodSelected] = useState(() => {
        return localStorage.getItem(MOOD_KEY) !== null;
    });

    const [stats, setStats] = useState({ diaryCount: 0, sleepCount: 0, taskCount: 0 });

    useEffect(() => {
        if (userId) {
            checkTodayMood();
            fetchStats();
            fetchUserName();
        }
    }, [userId]);

    const fetchUserName = async () => {
        try {
            const res = await api.get(`/api/users/${userId}`);
            setUserName(res.data.fullName || res.data.username);
        } catch (e) { console.error(e); }
    };

    const checkTodayMood = async () => {
        try {
            const res = await api.get(`/api/mood/today/${userId}`);
            const data = res.data;
            if (data.mood && data.mood !== "") {
                localStorage.setItem(MOOD_KEY, data.mood);
                setSelectedMood(data.mood);
                setMoodSelected(true);
            }
        } catch (e) { console.error(e); }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get(`/api/dashboard/stats?userId=${userId}`);
            setStats(res.data);
        } catch (e) { console.error(e); }
    };

    const handleMoodClick = async (moodKey) => {
        try {
            await api.post(`/api/mood/${userId}`, { mood: moodKey });
            localStorage.setItem(MOOD_KEY, moodKey);
            setSelectedMood(moodKey);
            setMoodSelected(true);
            toast.success(t('mood_saved'));
        } catch (e) { toast.error(t('mood_error')); }
    };

    if (!moodSelected) {
        return (
            <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t('home_morning')}, {userName}! 👋</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '3.5rem' }}>{t('home_mood_now')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem' }}>
                    {MOOD_OPTIONS.map((mood) => (
                        <div key={mood.key} className="card" style={{ cursor: 'pointer', padding: '2rem 1rem', textAlign: 'center' }} onClick={() => handleMoodClick(mood.key)}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{mood.emoji}</div>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{mood.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const currentMoodObj = MOOD_OPTIONS.find(m => m.key === selectedMood);

    return (
        <div>
            <header style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1>{t('home_greeting')}, {userName} 👋</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t('home_subtitle')} — {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                {currentMoodObj && (
                    <div className="card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>{currentMoodObj.emoji}</span>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('home_mood_your')}</div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{currentMoodObj.label}</div>
                        </div>
                        <button 
                            onClick={() => setMoodSelected(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', marginLeft: '10px' }}
                        >
                            {t('home_mood_change')}
                        </button>
                    </div>
                )}
            </header>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: 'var(--space-xl)' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-diary)' }}>{stats.diaryCount}</div>
                    <div className="input-label" style={{ marginBottom: 0 }}>{t('home_stat_diary')}</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-dreams)' }}>{stats.sleepCount}</div>
                    <div className="input-label" style={{ marginBottom: 0 }}>{t('home_stat_dreams')}</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-tasks)' }}>{stats.taskCount}</div>
                    <div className="input-label" style={{ marginBottom: 0 }}>{t('home_stat_tasks')}</div>
                </div>
            </div>

            <div className="two-col-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="card">
                    <h2 style={{ marginBottom: 'var(--space-sm)' }}>📖 {t('home_diary_title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                        {t('home_diary_desc')}
                    </p>
                    <button className="btn-primary" onClick={() => navigate('/diary')}>{t('home_diary_btn')}</button>
                </div>

                <div className="card" style={{ background: 'var(--bg-surface-2)' }}>
                    <h3 style={{ marginBottom: 'var(--space-sm)' }}>🎯 {t('home_tasks_title')}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('home_tasks_desc')}</p>
                    <button className="btn-primary" style={{ marginTop: 'var(--space-md)', width: '100%' }} onClick={() => navigate('/client-assignments')}>{t('home_tasks_btn')}</button>
                </div>
            </div>

            <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontSize: '2.5rem' }}>✨</div>
                    <div>
                        <h3 style={{ margin: 0 }}>{t('home_world_title')}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 12px' }}>{t('home_world_desc')}</p>
                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => navigate('/inner-world')}>{t('home_world_btn')}</button>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontSize: '2.5rem' }}>🌙</div>
                    <div>
                        <h3 style={{ margin: 0 }}>{t('home_dreams_title')}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 12px' }}>{t('home_dreams_desc')}</p>
                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => navigate('/dreams')}>{t('home_dreams_btn')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
