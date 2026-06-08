import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import api from '../src/api/axiosInstance';
import { getAuthItem, getAuthUser } from '../src/authStorage';

const MOODS = [
    'sad', 'happy', 'down', 'excited', 'disappointed',
    'surprised', 'depressed', 'calm', 'annoyed', 'guilty'
];

export default function MoodCheck() {
    const [selectedMood, setSelectedMood] = useState(null);
    const navigate = useNavigate();
    const username = getAuthUser().username;
    const userId = getAuthItem('userId');

    const handleConfirm = async () => {
        if (!selectedMood || !userId) return;

        try {
            await api.post(`/api/mood/${userId}`, { mood: selectedMood });
            sessionStorage.setItem('todayMood', selectedMood);
            navigate('/client-home');
        } catch (error) {
            console.error('Mood save failed:', error);
            navigate('/client-home');
        }
    };

    return (
        <div className="welcome-wrapper">
            <div className="welcome-container" style={{maxWidth: '800px'}}>
                <h1>Hello, {username}</h1>
                <h2 style={{fontWeight: 'normal', color: '#666'}}>How do you feel today?</h2>

                <div className="mood-grid">
                    {MOODS.map(mood => (
                        <button
                            key={mood}
                            className={`mood-btn ${selectedMood === mood ? 'selected' : ''}`}
                            onClick={() => setSelectedMood(mood)}
                        >
                            {mood}
                        </button>
                    ))}
                </div>

                <button
                    className="btn-primary"
                    disabled={!selectedMood}
                    onClick={handleConfirm}
                    style={{marginTop: '20px', width: '200px'}}
                >
                    Confirm
                </button>
            </div>
        </div>
    );
}