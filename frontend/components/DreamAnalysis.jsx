import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './App.css';

export default function DreamAnalysis() {
    const [dreams, setDreams] = useState([]);
    const [newDream, setNewDream] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (user.id) fetchDreams();
    }, [user.id]);

    const fetchDreams = async () => {
        try {
            const res = await fetch(`/api/dreams/user/${user.id}`);
            if (res.ok) setDreams(await res.json());
        } catch (e) { console.error(e); }
    };

    // СОЗДАНИЕ
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newDream.trim()) return;

        const res = await fetch('/api/dreams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, text: newDream })
        });

        if (res.ok) {
            setNewDream('');
            fetchDreams();
            toast.success("Сон сохранен");
        } else {
            const message = await res.text();
            toast.error(message || "Не удалось сохранить сон");
        }
    };

    // РЕДАКТИРОВАНИЕ
    const startEdit = (dream) => {
        setEditingId(dream.id);
        setEditContent(dream.content || dream.text);
    };

    const handleUpdate = async (id) => {
        const res = await fetch(`/api/dreams/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: editContent })
        });

        if (res.ok) {
            setEditingId(null);
            fetchDreams();
            toast.success("Запись сна обновлена");
        }
    };

    // УДАЛЕНИЕ
    const handleDelete = async (id) => {
        const res = await fetch(`/api/dreams/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchDreams();
            toast.success("Сон удален");
        }
    };

    return (
        <div className="diary-container" style={{maxWidth: '800px'}}>
            <h1 style={{textAlign: 'center', marginBottom: '20px', color: '#4c1d95'}}>Дневник Снов</h1>

            <form onSubmit={handleCreate} style={{marginBottom: '30px', background: '#f5f3ff', padding: '20px', borderRadius: '12px', border: '1px solid #ddd6fe'}}>
                <textarea
                    placeholder="Опишите, что вам приснилось..."
                    value={newDream}
                    onChange={(e) => setNewDream(e.target.value)}
                    style={{width: '100%', height: '100px', padding: '15px', borderRadius: '8px', border: '1px solid #c4b5fd', marginBottom: '10px'}}
                    required
                />
                <button type="submit" className="btn-primary" style={{width: '100%', background: '#7c3aed'}}>Записать сон</button>
            </form>

            <div className="entry-list">
                {dreams.length === 0 && <p style={{textAlign: 'center', color: '#94a3b8'}}>Вы еще не записывали свои сны.</p>}

                {dreams.map(dream => (
                    <div key={dream.id} className="entry-item" style={{position: 'relative', borderLeft: '4px solid #8b5cf6'}}>
                        <small style={{color: '#94a3b8'}}>{new Date(dream.createdAt).toLocaleString()}</small>

                        {/* КНОПКИ УПРАВЛЕНИЯ */}
                        <div style={{position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '10px'}}>
                            <button onClick={() => startEdit(dream)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem'}}>✏️</button>
                            <button onClick={() => handleDelete(dream.id)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#ef4444'}}>🗑️</button>
                        </div>

                        {/* РЕЖИМ РЕДАКТИРОВАНИЯ ИЛИ ПРОСМОТРА */}
                        {editingId === dream.id ? (
                            <div style={{marginTop: '15px'}}>
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    style={{width: '100%', height: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #7c3aed', marginBottom: '10px'}}
                                />
                                <div style={{display: 'flex', gap: '10px'}}>
                                    <button onClick={() => handleUpdate(dream.id)} className="btn-primary" style={{padding: '5px 15px', background: '#7c3aed'}}>Сохранить</button>
                                    <button onClick={() => setEditingId(null)} className="btn-secondary" style={{padding: '5px 15px'}}>Отмена</button>
                                </div>
                            </div>
                        ) : (
                            <p style={{marginTop: '15px', whiteSpace: 'pre-wrap', paddingRight: '50px'}}>
                                {dream.content || dream.text}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
