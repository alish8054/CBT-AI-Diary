import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const [user, setUser] = useState({});
    const [displayName, setDisplayName] = useState('Загрузка...');
    const [avatarLetter, setAvatarLetter] = useState('?');

    useEffect(() => {
        try {
            // Читаем то, что сохранил Login.jsx
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(storedUser);

            // Логика имени: fullName -> username -> email -> Гость
            const name = storedUser.fullName || storedUser.username || 'Гость';
            setDisplayName(name);

            // Первая буква для аватарки
            setAvatarLetter(name.charAt(0).toUpperCase());
        } catch (e) {
            setDisplayName('Гость');
        }
    }, []);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.clear(); // Удаляем всё (юзера, настроения)
        window.location.href = '/login';
    };

    // --- СТИЛИ (INLINE STYLES) ---
    // Используем !important через string trick, если обычный стиль не работает
    const containerStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '280px',
        height: '100vh',
        backgroundColor: '#2c3e50', // ТЕМНО-СИНИЙ
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 20px',
        zIndex: 1000,
        overflowY: 'auto',
        boxShadow: '4px 0 15px rgba(0,0,0,0.2)'
    };

    // Общие стили для ссылок
    const linkBase = {
        textDecoration: 'none',
        padding: '12px 20px',
        marginBottom: '8px',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', gap: '15px',
        fontSize: '1rem', fontWeight: '600', transition: '0.3s'
    };

    const linkNormal = { ...linkBase, color: 'rgba(255,255,255,0.7)' };
    const linkActive = { ...linkBase, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: 'white', boxShadow: '0 4px 15px rgba(118, 75, 162, 0.4)' };

    return (
        <div style={containerStyle} className="force-dark-sidebar">
            {/* ПРОФИЛЬ В САЙДБАРЕ */}
            <Link to="/profile" style={{textDecoration: 'none'}}>
                <div style={{textAlign: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                    <div style={{
                        width: '80px', height: '80px', margin: '0 auto 15px',
                        backgroundColor: '#e67e22',
                        borderRadius: '50%',
                        overflow: 'hidden', // Чтобы фото было круглым
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '3px solid rgba(255,255,255,0.3)'
                    }}>
                        {user.photoUrl ? (
                            <img
                                src={`http://localhost:8080${user.photoUrl}`}
                                style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                alt="User"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <span style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'white'}}>
                    {displayName.charAt(0).toUpperCase()}
                </span>
                        )}
                    </div>
                    <h3 style={{color: 'white', margin: 0, fontSize: '1.1rem'}}>{displayName}</h3>
                    <div style={{fontSize: '0.8rem', color: '#bdc3c7', marginTop: '5px'}}>Личный кабинет</div>
                </div>
            </Link>

            {/* МЕНЮ */}
            <nav style={{display: 'flex', flexDirection: 'column'}}>
                <Link to="/client-home" style={isActive('/client-home') ? linkActive : linkNormal}>🏠 Главная</Link>
                <Link to="/diary" style={isActive('/diary') ? linkActive : linkNormal}>📖 Дневник</Link>
                <Link to="/dreams" style={isActive('/dreams') ? linkActive : linkNormal}>🌙 Сны</Link>
                <Link to="/ai-advice" style={isActive('/ai-advice') ? linkActive : linkNormal}>🤖 AI Советы</Link>
                <Link to="/inner-world" style={isActive('/inner-world') ? linkActive : linkNormal}>✨ Мир</Link>
                <Link to="/chat" style={isActive('/chat') ? linkActive : linkNormal}>💬 Чат</Link>
                <Link to="/client-assignments" style={isActive('/client-assignments') ? linkActive : linkNormal}>📝 Задания</Link>

                <button onClick={handleLogout} style={{
                    marginTop: 'auto', background: 'transparent', color: 'rgba(255,255,255,0.7)',
                    border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 'bold', fontSize: '1rem'
                }}>
                    🚪 Выйти
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;
