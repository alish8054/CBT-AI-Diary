import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { clearAuthSession, getAuthItem } from '../src/authStorage';
import api from '../src/api/axiosInstance';

export default function PsychologistDashboard() {
    const [clients, setClients] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const role = getAuthItem('userRole');
        if (role !== 'PSYCHOLOGIST') {
            navigate('/');
            return;
        }
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await api.get('/api/psychologist/clients/my');
            setClients(res.data);
        } catch (error) {
            console.error("Ошибка:", error);
        }
    };

    const handleLogout = () => {
        clearAuthSession();
        navigate('/');
    };

    return (
        <div className="diary-wrapper"> {/* Используем тот же стиль обертки */}
            <nav style={{ padding: '20px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#667eea' }}>Кабинет Психолога</h2>
                <button onClick={handleLogout} className="btn-secondary">Выйти</button>
            </nav>

            <div className="diary-container" style={{maxWidth: '800px'}}>
                <h1 style={{marginBottom: '10px'}}>Здравствуйте, удачного вам дня!</h1>
                <p style={{textAlign: 'center', color: '#666', marginBottom: '30px'}}>
                    Список клиентов, предоставивших доступ к своим записям.
                </p>

                <div className="entry-list">
                    {clients.length === 0 && <p style={{textAlign: 'center', color: '#999'}}>Пока нет активных клиентов с записями.</p>}

                    {clients.map(client => (
                        <div key={client.clientId} className="entry-item" style={{borderLeft: '5px solid #667eea'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                                <h3 style={{margin: 0, color: '#333'}}>Клиент: {client.clientName}</h3>
                                <span style={{fontSize: '0.8rem', color: '#888'}}>
                  {new Date(client.lastEntryDate).toLocaleString()}
                </span>
                            </div>

                            <div style={{
                                background: '#f9f9f9',
                                padding: '15px',
                                borderRadius: '8px',
                                fontStyle: 'italic',
                                color: '#555',
                                marginBottom: '15px'
                            }}>
                                "{client.lastEntryText.length > 100 ? client.lastEntryText.substring(0, 100) + '...' : client.lastEntryText}"
                            </div>

                            <div style={{textAlign: 'right'}}>
                                <button
                                    className="btn-primary"
                                    onClick={() => alert(`Переход к полной истории клиента ${client.clientName} (Функционал в разработке)`)}
                                >
                                    Перейти к записи
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
