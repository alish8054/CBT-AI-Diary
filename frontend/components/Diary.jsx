import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './App.css';

export default function DiaryHome() {
    const [entries, setEntries] = useState([]);
    const [newText, setNewText] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (user.id) fetchEntries();
    }, [user.id]);

    const fetchEntries = async () => {
        try {
            const res = await fetch(`/api/diary/user/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                // Сортируем так, чтобы новые были сверху
                const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setEntries(sorted);
            }
        } catch (e) { console.error(e); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newText.trim()) return;

        const res = await fetch('/api/diary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, text: newText })
        });

        if (res.ok) {
            setNewText('');
            fetchEntries();
            toast.success("Запись сохранена!");
        } else {
            const errorText = await res.text();
            toast.error(errorText || "Ошибка сохранения");
        }
    };

    const startEdit = (entry) => {
        setEditingId(entry.id);
        setEditText(entry.text || entry.content);
    };

    const handleUpdate = async (id) => {
        const res = await fetch(`/api/diary/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: editText })
        });

        if (res.ok) {
            setEditingId(null);
            fetchEntries();
            toast.success("Запись дополнена");
        }
    };

    const handleDelete = async (id) => {
        const res = await fetch(`/api/diary/${id}`, { method: 'DELETE' });

        if (res.ok) {
            if (editingId === id) {
                setEditingId(null);
            }
            fetchEntries();
            toast.success("Запись удалена");
        } else {
            toast.error("Не удалось удалить запись");
        }
    };

    // ПРОВЕРКА: Писал ли пользователь сегодня?
    const todayStr = new Date().toLocaleDateString();
    const hasTodayEntry = entries.some(entry => new Date(entry.createdAt).toLocaleDateString() === todayStr);

    return (
        <div className="diary-container" style={{maxWidth: '800px'}}>
            <h1 style={{textAlign: 'center', marginBottom: '20px'}}>Мой Дневник</h1>

            {/* Если сегодня записи еще не было - показываем форму */}
            {!hasTodayEntry ? (
                <form onSubmit={handleCreate} style={{marginBottom: '30px', background: '#f8fafc', padding: '20px', borderRadius: '12px'}}>
                    <h3 style={{marginTop: 0, color: '#475569'}}>Главная мысль дня</h3>
                    <textarea
                        placeholder="Опишите свои чувства и события за сегодня..."
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        style={{width: '100%', height: '100px', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px'}}
                        required
                    />
                    <button type="submit" className="btn-primary" style={{width: '100%'}}>Сохранить запись на сегодня</button>
                </form>
            ) : (
                // Если запись есть - показываем заглушку
                <div style={{marginBottom: '30px', background: '#ecfdf5', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #10b981'}}>
                    <h3 style={{margin: 0, color: '#065f46'}}>✅ Запись на сегодня создана</h3>
                    <p style={{color: '#047857', fontSize: '0.9rem'}}>Вы можете дополнить её, нажав кнопку редактирования (✏️) ниже.</p>
                </div>
            )}

            <div className="entry-list">
                {entries.length === 0 && <p style={{textAlign: 'center', color: '#94a3b8'}}>Здесь пока пусто.</p>}

                {entries.map(entry => (
                    <div key={entry.id} className="entry-item" style={{position: 'relative'}}>
                        <small style={{color: '#94a3b8', fontWeight: 'bold'}}>{new Date(entry.createdAt).toLocaleDateString()}</small>
                        <small style={{color: '#cbd5e1', marginLeft: '10px'}}>{new Date(entry.createdAt).toLocaleTimeString()}</small>

                        <div style={{position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px'}}>
                            <button onClick={() => startEdit(entry)} style={{background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem'}}>✏️ Дополнить</button>
                            <button onClick={() => handleDelete(entry.id)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#ef4444'}}>🗑️</button>
                        </div>

                        {editingId === entry.id ? (
                            <div style={{marginTop: '15px'}}>
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    style={{width: '100%', height: '150px', padding: '10px', borderRadius: '8px', border: '2px solid #667eea', marginBottom: '10px'}}
                                />
                                <div style={{display: 'flex', gap: '10px'}}>
                                    <button onClick={() => handleUpdate(entry.id)} className="btn-primary" style={{padding: '8px 20px'}}>💾 Сохранить изменения</button>
                                    <button onClick={() => setEditingId(null)} className="btn-secondary" style={{padding: '8px 20px'}}>Отмена</button>
                                </div>
                            </div>
                        ) : (
                            <p style={{marginTop: '25px', whiteSpace: 'pre-wrap', color: '#333', lineHeight: '1.6'}}>
                                {entry.text || entry.content}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
