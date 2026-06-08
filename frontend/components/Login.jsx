import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../src/api/axiosInstance';
import { useLanguage } from '../src/i18n/LanguageContext';
import { clearAuthSession, setAuthItem, setAuthUser } from '../src/authStorage';

const Login = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    React.useEffect(() => {
        clearAuthSession();
        console.log('Login component mounted');
    }, []);

    const [step, setStep] = useState('login'); 
    const [pendingUserId, setPendingUserId] = useState(null);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const persistSession = (data, fallbackUsername) => {
        const userId = data.userId ?? data.id;
        const role = data.role;
        const user = {
            ...data,
            id: userId,
            username: data.username || fallbackUsername,
            role,
        };

        if (data.accessToken) setAuthItem('accessToken', data.accessToken);
        if (data.refreshToken) setAuthItem('refreshToken', data.refreshToken);
        if (userId !== undefined && userId !== null) setAuthItem('userId', String(userId));
        if (role) setAuthItem('userRole', role);
        setAuthUser(user);

        return user;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log('--- LOGIN START ---');
        console.log('Username:', formData.username);
        setError('');
        setLoading(true);
        try {
            console.log('Calling api.post(/api/auth/login)...');
            const res = await api.post('/api/auth/login', { 
                username: formData.username, 
                password: formData.password 
            });
            console.log('API CALL SUCCESSFUL. Response data:', res.data);

            if (res.data.requires2fa) {
                console.log('2FA required, switching step');
                setPendingUserId(res.data.userId);
                setStep('2fa');
                toast.success(t('auth_2fa_subtitle'));
                return;
            }

            console.log('Saving credentials to localStorage...');
            const user = persistSession(res.data, formData.username);

            console.log('Login successful, navigating to home...');
            toast.dismiss('auth-login-success');
            toast.success(`${t('auth_welcome')}${user.fullName || user.username}!`, {
                id: 'auth-login-success',
                duration: 1500,
            });
            navigate(user.role === 'PSYCHOLOGIST' ? '/psychologist' : '/client-home');

        } catch (err) {
            console.error('--- LOGIN ERROR CATCHED ---');
            console.error('Error object:', err);
            if (err.response) {
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);
            }
            setError(err.response?.data?.error || t('auth_error_generic'));
            toast.error(err.response?.data?.error || t('auth_error_login'));
        } finally {
            console.log('--- LOGIN FINALLY ---');
            setLoading(false);
        }
    };

    const handleVerify2fa = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/api/auth/verify-2fa', { userId: pendingUserId, otp });
            const user = persistSession(res.data, formData.username);

            toast.dismiss('auth-login-success');
            toast.success(t('auth_reg_success'), {
                id: 'auth-login-success',
                duration: 1500,
            });
            navigate(user.role === 'PSYCHOLOGIST' ? '/psychologist' : '/client-home');
        } catch (err) {
            console.error('2FA ERROR:', err);
            setError(err.response?.data?.error || t('auth_2fa_invalid'));
            toast.error(t('auth_2fa_invalid'));
        } finally {
            setLoading(false);
        }
    };

    if (step === '2fa') {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-logo auth-logo-mark">
                        <img src="/app-icon-rounded.png" alt="Sau Sana" />
                    </div>
                    <h2 className="auth-title">{t('auth_2fa_title')}</h2>
                    <p className="auth-subtitle">{t('auth_2fa_subtitle')}</p>
                    <form onSubmit={handleVerify2fa}>
                        <label className="input-label">{t('auth_2fa_code')}</label>
                        <input
                            className="input-field"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                            placeholder="000000"
                            inputMode="numeric"
                            maxLength={6}
                            style={{ textAlign: 'center', fontSize: 24, letterSpacing: '0.4em' }}
                            autoFocus
                        />
                        <button className="btn-primary" type="submit" disabled={loading}
                            style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}>
                            {loading ? t('loading') : t('auth_2fa_verify')}
                        </button>
                    </form>
                    {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 10 }}>{error}</p>}
                    <button className="btn-secondary" onClick={() => setStep('login')} style={{ width: '100%', marginTop: 10, justifyContent: 'center' }}>
                        {t('cancel')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo auth-logo-mark">
                    <img src="/app-icon-rounded.png" alt="Sau Sana" />
                </div>
                <h2 className="auth-title">{t('auth_login_title')}</h2>
                <p className="auth-subtitle">{t('auth_login_sub')}</p>
                
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label className="input-label">{t('auth_username')}</label>
                        <input
                            className="input-field"
                            type="text"
                            name="username"
                            placeholder={t('auth_username_ph')}
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="input-label">{t('auth_password')}</label>
                        <input
                            className="input-field"
                            type="password"
                            name="password"
                            placeholder={t('auth_password_ph')}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                        {loading ? t('loading') : t('auth_submit_login')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('auth_no_account')}</span>
                    <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                        {t('auth_btn_register')}
                    </Link>
                </div>
            </div>
            <div className="app-layout" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}></div>
        </div>
    );
};

export default Login;
