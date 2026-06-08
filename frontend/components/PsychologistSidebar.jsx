import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API_URL from '../src/api';
import api from '../src/api/axiosInstance';
import { useLanguage } from '../src/i18n/LanguageContext';
import LangSwitcher from './LangSwitcher';
import { clearAuthSession, getAuthItem, getAuthUser, getPhotoSrc } from '../src/authStorage';
import ThemeToggle from './ThemeToggle';
import useUnreadChatCount from '../src/useUnreadChatCount';

const PsychologistSidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const location = useLocation();
    const { t } = useLanguage();
    const user = getAuthUser();
    const userId = getAuthItem('userId') || user.id;
    const [requestCount, setRequestCount] = useState(0);
    const [profileUser, setProfileUser] = useState(user);
    const [avatarSrc, setAvatarSrc] = useState(getPhotoSrc(user, API_URL));
    const unreadChatCount = useUnreadChatCount();
    const displayName = profileUser.fullName || profileUser.username || t('profile_psychologist');

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        clearAuthSession();
        window.location.href = '/login';
    };

    const handleNavClick = () => {
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    useEffect(() => {
        const loadUser = () => {
            const updatedUser = getAuthUser();
            setProfileUser(updatedUser);
            setAvatarSrc(getPhotoSrc(updatedUser, API_URL));
        };

        window.addEventListener('userProfileChanged', loadUser);
        return () => window.removeEventListener('userProfileChanged', loadUser);
    }, []);

    useEffect(() => {
        if (!userId) return;

        let cancelled = false;
        const fetchRequestCount = async () => {
            try {
                const res = await api.get(`/api/psychologist/requests?psychologistId=${userId}`);
                if (!cancelled) {
                    setRequestCount(Array.isArray(res.data) ? res.data.length : 0);
                }
            } catch {
                if (!cancelled) setRequestCount(0);
            }
        };

        fetchRequestCount();
        const interval = window.setInterval(fetchRequestCount, 30000);
        window.addEventListener('focus', fetchRequestCount);
        window.addEventListener('psychologistRequestsChanged', fetchRequestCount);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
            window.removeEventListener('focus', fetchRequestCount);
            window.removeEventListener('psychologistRequestsChanged', fetchRequestCount);
        };
    }, [userId]);

    return (
        <aside className={`sidebar${sidebarOpen ? '' : ' collapsed'}`}>
            <button
                className="sidebar-toggle-btn"
                onClick={() => setSidebarOpen(open => !open)}
                aria-label="Toggle sidebar"
            >
                {sidebarOpen ? '×' : '☰'}
            </button>

            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <img src="/app-icon-rounded.png" alt="Sau Sana" className="brand-logo-image" />
                </div>
                <div>
                    <div className="sidebar-brand-name">Sau Sana</div>
                    <div className="sidebar-brand-sub">Professional Panel</div>
                </div>
            </div>

            <Link to="/psychologist/profile" className="sidebar-user" onClick={handleNavClick}>
                <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}>
                    {avatarSrc ? (
                        <img src={avatarSrc} alt="User" />
                    ) : (
                        <span>{displayName.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <div className="user-name">{displayName}</div>
                    <div className="user-role">{t('profile_psychologist')}</div>
                </div>
            </Link>

            <nav className="nav-section">
                <Link to="/psychologist" className={`nav-item ${isActive('/psychologist') ? 'active' : ''}`} onClick={handleNavClick}>
                    <span className="nav-icon">🏠</span> <span className="nav-label">{t('nav_home')}</span>
                </Link>
                <Link to="/psychologist/clients" className={`nav-item ${isActive('/psychologist/clients') ? 'active' : ''}`} onClick={handleNavClick}>
                    <span className="nav-icon">👥</span> <span className="nav-label">{t('nav_clients')}</span>
                    {requestCount > 0 && (
                        <span className="nav-badge" title={`${requestCount} ${t('clients_pending')}`}>
                            {requestCount}
                        </span>
                    )}
                </Link>
                <Link to="/psychologist/notes" className={`nav-item ${isActive('/psychologist/notes') ? 'active' : ''}`} onClick={handleNavClick}>
                    <span className="nav-icon">🗒️</span> <span className="nav-label">{t('nav_notes')}</span>
                </Link>
                <Link to="/psychologist/assignments" className={`nav-item ${isActive('/psychologist/assignments') ? 'active' : ''}`} onClick={handleNavClick}>
                    <span className="nav-icon">📝</span> <span className="nav-label">{t('nav_tasks')}</span>
                </Link>
                <Link to="/psychologist/chat" className={`nav-item ${isActive('/psychologist/chat') ? 'active' : ''}`} onClick={handleNavClick}>
                    <span className="nav-icon">💬</span> <span className="nav-label">{t('nav_chat')}</span>
                    {unreadChatCount > 0 && <span className="nav-badge">{unreadChatCount}</span>}
                </Link>
            </nav>

            <div className="sidebar-footer">
                <ThemeToggle collapsed={!sidebarOpen} />
                <div className="divider" style={{ margin: '8px 0' }} />
                <LangSwitcher collapsed={!sidebarOpen} />
                <div className="divider" style={{ margin: '8px 0' }} />
                <button onClick={handleLogout} className="logout-btn">
                    <span className="nav-icon">🚪</span> <span className="logout-label">{t('nav_logout')}</span>
                </button>
            </div>
        </aside>
    );
};

export default PsychologistSidebar;
