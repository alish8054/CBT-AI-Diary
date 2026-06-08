import React from 'react';
import { useLanguage } from '../src/i18n/LanguageContext';

const LANGS = [
  { code: 'ru', label: 'RU', title: 'Русский' },
  { code: 'en', label: 'EN', title: 'English' },
  { code: 'kz', label: 'ҚЗ', title: 'Қазақша' },
];

export default function LangSwitcher({ collapsed }) {
  const { lang, changeLang } = useLanguage();

  return (
    <div className="lang-switcher" style={{
      display: 'flex',
      flexDirection: collapsed ? 'column' : 'row',
      gap: collapsed ? 4 : 4,
      padding: collapsed ? '4px 0' : '0 var(--space-sm)',
      alignItems: 'center',
      marginBottom: 6,
    }}>
      {!collapsed && (
        <span style={{
          fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          marginRight: 2, flexShrink: 0,
        }}>🌐</span>
      )}
      {LANGS.map(l => (
        <button
          key={l.code}
          title={l.title}
          onClick={() => changeLang(l.code)}
          className="lang-btn"
          style={{
            background: lang === l.code ? 'var(--accent-primary)' : 'var(--bg-surface-2)',
            color: lang === l.code ? '#fff' : 'var(--text-muted)',
            border: lang === l.code
              ? '1px solid var(--accent-primary)'
              : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px 8px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            letterSpacing: '0.03em',
            lineHeight: 1.8,
            flexShrink: 0,
          }}
        >
          <span className="lang-label">{l.label}</span>
        </button>
      ))}
    </div>
  );
}
