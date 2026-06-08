import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../src/api/axiosInstance';
import { useLanguage } from '../src/i18n/LanguageContext';
import { clearAuthSession } from '../src/authStorage';

const PASSWORD_RULE_MESSAGE = 'Password must be at least 6 characters and include a letter, a number, and a symbol such as @ or _.';

const isStrongPassword = (password) => {
    const chars = Array.from(password || '');
    const hasLetter = chars.some(char => /\p{L}/u.test(char));
    const hasNumber = chars.some(char => /\p{N}/u.test(char));
    const hasSymbol = chars.some(char => !/\p{L}/u.test(char) && !/\p{N}/u.test(char) && !/\s/u.test(char));
    return chars.length >= 6 && hasLetter && hasNumber && hasSymbol;
};

export default function Register() {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ username: '', password: '', role: 'CLIENT', email: '' });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        clearAuthSession();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!isStrongPassword(formData.password)) {
            toast.error(PASSWORD_RULE_MESSAGE);
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/api/auth/register', formData);

            if (res.status === 200) {
                toast.success(t('auth_reg_success'));
                navigate('/login');
            } else {
                toast.error(t('auth_reg_error'));
            }
        } catch (error) {
            toast.error(error.response?.data?.error || t('auth_error_connection'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo auth-logo-mark">
                    <img src="/app-icon-rounded.png" alt="Sau Sana" />
                </div>
                <h2 className="auth-title">{t('auth_reg_title')}</h2>
                <p className="auth-subtitle">{t('auth_reg_sub')}</p>

                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label className="input-label">{t('auth_role')}</label>
                        <select
                            className="input-field"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            style={{ cursor: 'pointer' }}
                        >
                            <option value="CLIENT">{t('auth_role_client')}</option>
                            <option value="PSYCHOLOGIST">{t('auth_role_psych')}</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label className="input-label">{t('auth_username')}</label>
                        <input
                            className="input-field"
                            type="text"
                            placeholder={t('auth_username_reg_ph')}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label className="input-label">Email</label>
                        <input
                            className="input-field"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="input-label">{t('auth_password')}</label>
                        <input
                            className="input-field"
                            type="password"
                            placeholder="At least 6 chars: letters, numbers, symbol"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <p style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            Use at least 6 characters with a letter, a number, and a symbol like @ or _.
                        </p>
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                        {loading ? t('loading') : t('auth_submit_reg')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('auth_have_account')}</span>
                    <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                        {t('auth_submit_login')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
