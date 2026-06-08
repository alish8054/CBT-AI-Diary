import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App.jsx'
import '../components/App.css'
import { LanguageProvider } from './i18n/LanguageContext'

const savedTheme = localStorage.getItem('app_theme');
document.documentElement.setAttribute(
    'data-theme',
    savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <LanguageProvider>
            <App />
        </LanguageProvider>
    </React.StrictMode>,
)
