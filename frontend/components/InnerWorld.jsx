import React, { useState, useEffect } from 'react';
import PhaserGame from './PhaserGame';
import api from '../src/api/axiosInstance';
import { useLanguage } from '../src/i18n/LanguageContext';
import { getAuthItem } from '../src/authStorage';

export default function InnerWorld() {
    const { t, lang } = useLanguage();
    const [status, setStatus] = useState({ daysLogged: 0, requiredDays: 5, isUnlocked: false });
    const [showGame, setShowGame] = useState(false);
    const userId = getAuthItem('userId');

    useEffect(() => {
        if (userId) {
            api.get(`/api/gamification/status/${userId}`)
                .then(res => {
                    const data = res.data;
                    setStatus({
                        daysLogged: data.daysLogged || 0,
                        requiredDays: data.requiredDays || 5,
                        isUnlocked: data.isUnlocked || false
                    });
                })
                .catch(e => console.error('Error fetching gamification status:', e));
        }
    }, [userId]);

    if (showGame) {
        return <PhaserGame onExit={() => setShowGame(false)} />;
    }

    const daysLeft = Math.max(0, status.requiredDays - status.daysLogged);

    function getPluralKey(n) {
        if (lang === 'ru') {
            if (n % 10 === 1 && n % 100 !== 11) return 'world_plural_entry_1';
            if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'world_plural_entry_2';
            return 'world_plural_entry_5';
        }
        if (lang === 'en' || lang === 'kz') {
            return n === 1 ? 'world_plural_entry_1' : 'world_plural_entry_2';
        }
        return 'world_plural_entry_1'; 
    }

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <header style={{ marginBottom: 'var(--space-2xl)' }}>
                <div style={{ fontSize: '5rem', marginBottom: 'var(--space-md)' }}>🍃</div>
                <h1 style={{ color: 'var(--color-world)' }}>{t('world_garden_title')}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    {t('world_garden_desc')}
                </p>
            </header>

            <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: 'var(--space-2xl)', border: '1px solid var(--border-subtle)' }}>
                {status.isUnlocked ? (
                    <div>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>✨</div>
                        <h2 style={{ marginBottom: 'var(--space-sm)' }}>{t('world_unlocked_title')}</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
                            {t('world_unlocked_desc')}
                        </p>
                        <button 
                            className="btn-primary" 
                            style={{ width: '100%', padding: 'var(--space-md)', fontSize: '1.1rem', background: 'linear-gradient(135deg, #34d399, #10b981)' }}
                            onClick={() => setShowGame(true)}
                        >
                            {t('world_enter_btn')}
                        </button>
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🔒</div>
                        <h2 style={{ marginBottom: 'var(--space-sm)' }}>{t('world_locked_title')}</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                            {lang === 'ru' ? (
                                <>Для доступа к саду нужно сделать еще <strong>{daysLeft}</strong> {t(getPluralKey(daysLeft))} в дневнике.</>
                            ) : lang === 'kz' ? (
                                <>Баққа кіру үшін күнделікке тағы <strong>{daysLeft}</strong> {t(getPluralKey(daysLeft))} жасау керек.</>
                            ) : (
                                <>To access the garden, you need to make <strong>{daysLeft}</strong> more {t(getPluralKey(daysLeft))} in your diary.</>
                            )}
                        </p>
                        
                        <div style={{ height: '12px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ 
                                width: `${Math.min(100, (status.daysLogged / status.requiredDays) * 100)}%`, 
                                height: '100%', 
                                background: 'linear-gradient(90deg, #34d399, #10b981)',
                                transition: 'width 1s ease'
                            }} />
                        </div>
                        <div className="input-label" style={{ textAlign: 'center' }}>
                            {status.daysLogged} / {status.requiredDays} {t('world_entries_count')}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: 'var(--space-2xl)', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', maxWidth: '600px', margin: 'var(--space-2xl) auto 0' }}>
                {t('world_quote')}
            </div>
        </div>
    );
}
