import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import API_URL from '../src/api';
import { getAuthUser, getPhotoSrc } from '../src/authStorage';
import ThemeToggle from './ThemeToggle';

const ClientLayout = ({ children }) => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [user, setUser] = useState({});

    useEffect(() => {
        const onResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(true);
        };
        window.addEventListener('resize', onResize);
        
        const storedUser = getAuthUser();
        setUser(storedUser);

        return () => window.removeEventListener('resize', onResize);
    }, []);

    const avatarSrc = getPhotoSrc(user, API_URL);

    return (
        <div className="app-layout">
            {!isMobile && (
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            )}

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {isMobile && (
                    <div className="top-bar">
                        <div className="top-bar-brand">
                            <img src="/logo.png" alt="Sau Sana" className="top-bar-logo" />
                            <div className="top-bar-title">Sau Sana</div>
                        </div>
                        <ThemeToggle collapsed />
                        <button onClick={() => navigate('/profile')} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center'
                        }}>
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #f97316, #fb923c)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 700, color: '#fff',
                                }}>
                                    {(user.fullName || user.username || "?")[0].toUpperCase()}
                                </div>
                            )}
                        </button>
                    </div>
                )}

                <main className="main-content" style={{
                    paddingBottom: isMobile ? '80px' : undefined,
                    height: isMobile ? 'auto' : '100vh',
                }}>
{children}
                </main>
            </div>

            {isMobile && <BottomNav />}
        </div>
    );
};

export default ClientLayout;
