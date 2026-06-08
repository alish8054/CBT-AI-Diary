import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../src/i18n/LanguageContext';
import { getAuthItem } from '../src/authStorage';
import useUnreadChatCount from '../src/useUnreadChatCount';

const CLIENT_TABS = [
  { icon: '📖', path: '/diary',  labelKey: 'nav_diary'  },
  { icon: '✨', path: '/ai-chat', labelKey: 'ai_chat_title' },
  { icon: '🏠', path: '/client-home',   labelKey: 'nav_home', center: true },
  { icon: '💬', path: '/chat',   labelKey: 'nav_chat'   },
];

const PSYCH_TABS = [
  { icon: '👥', path: '/psychologist/clients',  labelKey: 'nav_clients' },
  { icon: '🗒️', path: '/psychologist/notes',    labelKey: 'nav_notes'   },
  { icon: '🏠', path: '/psychologist',          labelKey: 'nav_home', center: true },
  { icon: '📝', path: '/psychologist/assignments', labelKey: 'nav_tasks' },
  { icon: '💬', path: '/psychologist/chat',     labelKey: 'nav_chat'    },
];

export default function BottomNav() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { t }     = useLanguage();
  const userRole  = getAuthItem('userRole');
  const unreadChatCount = useUnreadChatCount();

  const tabs = userRole === 'PSYCHOLOGIST' ? PSYCH_TABS : CLIENT_TABS;

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 64,
      background: 'var(--bg-bottom-nav)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 600,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path ||
                         (tab.path !== '/' && location.pathname.startsWith(tab.path));
        const badgeCount = tab.labelKey === 'nav_chat' ? unreadChatCount : 0;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 0',
              position: 'relative',
              transition: 'var(--transition-fast)',
            }}
          >
            {tab.center ? (
              <div style={{
                width: 52, height: 52,
                background: isActive
                  ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                  : 'var(--bg-surface-2)',
                border: isActive
                  ? '2px solid var(--accent-primary)'
                  : '1px solid var(--border-subtle)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
                marginTop: -18,
                boxShadow: isActive ? '0 4px 20px rgba(139,92,246,0.4)' : 'none',
                transition: 'var(--transition-fast)',
              }}>
                {tab.icon}
              </div>
            ) : (
              <>
                {badgeCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: 4,
                    right: '24%',
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    borderRadius: 999,
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 800,
                    lineHeight: '18px',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
                  }}>
                    {badgeCount}
                  </span>
                )}
                <span style={{
                  fontSize: 24,
                  filter: isActive ? 'none' : 'grayscale(0.3) opacity(0.6)',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                  transition: 'var(--transition-fast)',
                  display: 'block',
                }}>
                  {tab.icon}
                </span>
                {isActive && (
                  <div style={{
                    width: 4, height: 4,
                    background: 'var(--accent-primary)',
                    borderRadius: '50%',
                  }} />
                )}
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}

