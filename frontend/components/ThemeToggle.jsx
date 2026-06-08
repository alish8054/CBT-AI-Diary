import React, { useEffect, useState } from 'react';

const getInitialTheme = () => {
  const saved = localStorage.getItem('app_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark';
};

export default function ThemeToggle({ collapsed }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="theme-toggle"
      aria-label={`Switch to ${nextTheme} theme`}
    >
      {!collapsed && (
        <span className="theme-toggle-label">
          {theme === 'dark' ? 'Light theme' : 'Dark theme'}
        </span>
      )}
    </button>
  );
}
