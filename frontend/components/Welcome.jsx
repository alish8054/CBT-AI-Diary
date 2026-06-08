import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../src/i18n/LanguageContext';

export default function Welcome() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '600px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '4.5rem', marginBottom: 'var(--space-md)' }}>🌿</div>
                <h1 className="auth-title" style={{ fontSize: 'clamp(2rem, 8vw, 2.8rem)', marginBottom: 'var(--space-sm)' }}>
                    CBT AI Diary
                </h1>
                <p className="auth-subtitle" style={{ fontSize: '1.15rem', marginBottom: 'var(--space-xl)', lineHeight: '1.7' }}>
                    {t('welcome_subtitle')}
                </p>
                
                <div className="btn-row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="btn-primary"
                        style={{ padding: '12px 32px', fontSize: '1.1rem', minWidth: '180px' }}
                    >
                        {t('welcome_login_btn')}
                    </button>
                    <button 
                        onClick={() => navigate('/register')} 
                        className="btn-secondary"
                        style={{ padding: '12px 32px', fontSize: '1.1rem', minWidth: '180px' }}
                    >
                        {t('auth_btn_register')}
                    </button>
                </div>
                
                <div style={{ 
                    marginTop: 'var(--space-2xl)', 
                    paddingTop: 'var(--space-lg)', 
                    borderTop: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                }}>
                    {t('welcome_footer')}
                </div>
            </div>
            
            <div className="app-layout" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
            </div>
        </div>
    );
}
