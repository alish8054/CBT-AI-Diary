import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PsychologistSidebar = () => {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const displayName = user.fullName || user.username || 'Доктор';

    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar" style={{backgroundColor: '#1a2a3a'}}> {/* Чуть темнее для отличия */}
            <Link to="/psychologist/profile" style={{textDecoration: 'none'}}>
                <div className="user-profile">
                    <div className="avatar-circle" style={{overflow: 'hidden', background: '#3498db'}}>
                        {user.photoUrl ? (
                            <img src={`http://localhost:8080${user.photoUrl}`} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                        ) : (
                            <span style={{color: 'white'}}>{displayName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <h3 style={{color: 'white'}}>{displayName}</h3>
                    <div style={{fontSize: '0.7rem', color: '#bdc3c7'}}>Панель специалиста</div>
                </div>
            </Link>

            <nav className="nav-links">
                <Link to="/psychologist" className={`nav-item ${isActive('/psychologist') ? 'highlight-item' : ''}`}>🏠 <span>Рабочий стол</span></Link>
                <Link to="/psychologist/clients" className={`nav-item ${isActive('/psychologist/clients') ? 'highlight-item' : ''}`}>👥 <span>Мои клиенты</span></Link>
                <Link to="/psychologist/notes" className={`nav-item ${isActive('/psychologist/notes') ? 'highlight-item' : ''}`}>📝 <span>Заметки</span></Link>
                <Link to="/psychologist/assignments" className={`nav-item ${isActive('/psychologist/assignments') ? 'active' : ''}`}>
                    🎯 <span>Назначить задания</span>
                </Link>
                <Link to="/psychologist/chat" className={`nav-item ${isActive('/psychologist/chat') ? 'highlight-item' : ''}`}>💬 <span>Чат</span></Link>
                <button
                    onClick={() => {localStorage.clear(); window.location.href='/login'}}
                    className="nav-item logout-btn"
                    style={{background: 'transparent', color: 'rgba(255,255,255,0.7)', boxShadow: 'none'}}
                >
                    🚪 <span>Выход</span>
                </button>
            </nav>
        </div>
    );
};

export default PsychologistSidebar;
