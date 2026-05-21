import React from 'react';
import Sidebar from './Sidebar';
import BackgroundElements from './BackgroundElements';

const ClientLayout = ({ children }) => {
    // Получаем данные для темы
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const keyPart = user.id ? user.id : 'guest';
    const dateKey = `mood_${keyPart}_${new Date().toDateString()}`;
    const savedMoodId = localStorage.getItem(dateKey);

    return (
        <div className="client-layout-wrapper">
            {/* 1. ЗЕЛЕНАЯ ЗОНА: Сайдбар (фиксирован слева) */}
            <Sidebar />

            {/* 2. ФИОЛЕТОВАЯ ЗОНА: Фон (лежит под контентом) */}
            <BackgroundElements themeId={savedMoodId || 'default'} />

            {/* 3. БЕЛАЯ ЗОНА: Обертка для контента */}
            <div className="main-content">
                {/* Здесь будет отрисовываться diary-container (белый лист) */}
                {children}
            </div>
        </div>
    );
};

export default ClientLayout;
