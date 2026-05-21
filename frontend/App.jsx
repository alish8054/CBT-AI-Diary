import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Welcome from './components/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import MoodCheck from './components/MoodCheck';
import ClientHome from './components/ClientHome';
import ClientLayout from './components/ClientLayout';
import Profile from './components/Profile';
import DiaryHome from './components/Diary';
import DreamAnalysis from './components/DreamAnalysis';
import ClientAssignments from './components/ClientAssignments';
import PsychologistLayout from './components/PsychologistLayout';
import PsychologistHome from './components/PsychologistHome';
import ClientList from './components/ClientList';
import ClientDetails from './components/ClientDetails';
import PsychologistNotes from './components/PsychologistNotes';
import PsychologistAssignments from './components/PsychologistAssignments';
import PsychologistProfile from './components/PsychologistProfile';
import Chat from './components/Chat';
import InnerWorld from './components/InnerWorld';
import DailyAdvice from './components/DailyAdvice';
import './components/App.css';
import {DEFAULT_THEME, EMOTION_THEMES} from "./src/themes";

// Защита маршрутов по ролям
const RoleGuard = ({ children, allowedRole }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return <Navigate to="/login" replace />;
    if (user.role !== allowedRole) return <Navigate to="/" replace />;
    return children;
};

function App() {
    React.useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const keyPart = user.id ? user.id : 'guest';
            // Ищем сохраненное настроение за сегодня
            const dateKey = `mood_${keyPart}_${new Date().toDateString()}`;
            const savedMoodId = localStorage.getItem(dateKey);

            let theme = DEFAULT_THEME;
            if (savedMoodId && EMOTION_THEMES[savedMoodId]) {
                theme = EMOTION_THEMES[savedMoodId];
            }

            // Устанавливаем глобальные CSS-переменные
            const root = document.documentElement;
            root.style.setProperty('--theme-primary', theme.colors.primary);
            root.style.setProperty('--theme-secondary', theme.colors.secondary);
            root.style.setProperty('--theme-animation', theme.animation);

        } catch (e) {
            console.error("Ошибка темы:", e);
        }
    }, []);
    return (
        <Router>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    success: { duration: 2500 },
                    error: { duration: 4000 }
                }}
            />
            <Routes>
                {/* ПУБЛИЧНЫЕ */}
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/mood-check" element={<MoodCheck />} />

                {/* КЛИЕНТ */}
                <Route path="/client-home" element={<RoleGuard allowedRole="CLIENT"><ClientLayout><ClientHome /></ClientLayout></RoleGuard>} />
                <Route path="/profile" element={<ClientLayout><Profile /></ClientLayout>} />
                <Route path="/diary" element={<RoleGuard allowedRole="CLIENT"><ClientLayout><DiaryHome /></ClientLayout></RoleGuard>} />
                <Route path="/dreams" element={<RoleGuard allowedRole="CLIENT"><ClientLayout><DreamAnalysis /></ClientLayout></RoleGuard>} />
                <Route path="/chat" element={<ClientLayout><Chat /></ClientLayout>} />
                <Route path="/client-assignments" element={<RoleGuard allowedRole="CLIENT"><ClientLayout><ClientAssignments /></ClientLayout></RoleGuard>} />
                <Route path="/inner-world" element={<RoleGuard allowedRole="CLIENT"><ClientLayout><InnerWorld /></ClientLayout></RoleGuard>} />
                <Route path="/ai-advice" element={<RoleGuard allowedRole="CLIENT"><ClientLayout><DailyAdvice /></ClientLayout></RoleGuard>} />

                {/* ПСИХОЛОГ */}
                <Route path="/psychologist" element={<RoleGuard allowedRole="PSYCHOLOGIST"><PsychologistLayout><PsychologistHome /></PsychologistLayout></RoleGuard>} />
                <Route path="/psychologist/clients" element={<RoleGuard allowedRole="PSYCHOLOGIST"><PsychologistLayout><ClientList /></PsychologistLayout></RoleGuard>} />
                <Route path="/psychologist/client/:id" element={<RoleGuard allowedRole="PSYCHOLOGIST"><PsychologistLayout><ClientDetails /></PsychologistLayout></RoleGuard>} />
                <Route path="/psychologist/profile" element={<RoleGuard allowedRole="PSYCHOLOGIST"><PsychologistLayout><PsychologistProfile /></PsychologistLayout></RoleGuard>} />
                <Route path="/psychologist/notes" element={<RoleGuard allowedRole="PSYCHOLOGIST"><PsychologistLayout><PsychologistNotes /></PsychologistLayout></RoleGuard>} />
                <Route path="/psychologist/chat" element={<RoleGuard allowedRole="PSYCHOLOGIST"><PsychologistLayout><Chat /></PsychologistLayout></RoleGuard>} />
                <Route path="/psychologist/assignments" element={<RoleGuard allowedRole="PSYCHOLOGIST"><PsychologistLayout><PsychologistAssignments /></PsychologistLayout></RoleGuard>} />
            </Routes>
        </Router>
    );
}

export default App;
