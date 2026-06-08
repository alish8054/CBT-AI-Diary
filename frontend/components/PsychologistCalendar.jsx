import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import toast from 'react-hot-toast';
import api from '../src/api/axiosInstance';
import { useLanguage } from '../src/i18n/LanguageContext';
import { getAuthItem } from '../src/authStorage';

export default function PsychologistCalendar() {
    const { t } = useLanguage();
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ title: '', time: '' });

    const psychId = getAuthItem('userId');

    useEffect(() => {
        if (psychId) fetchEvents();
    }, [psychId]);

    const fetchEvents = async () => {
        try {
            const res = await api.get(`/api/psychologist-tools/events?psychologistId=${psychId}`);
            setEvents(res.data);
        } catch (e) {
            console.error('Error fetching events:', e);
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        const dateString = localDate.toISOString().split('T')[0];

        try {
            await api.post('/api/psychologist-tools/events', {
                psychologistId: String(psychId),
                title: newEvent.title,
                time: newEvent.time,
                date: dateString
            });
            setNewEvent({ title: '', time: '' });
            fetchEvents();
        } catch (e) {
            console.error('Error adding event:', e);
            toast.error(t('calendar_error_create'));
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/psychologist-tools/events/${id}`);
            fetchEvents();
        } catch (e) {
            console.error('Error deleting event:', e);
        }
    };

    const selectedDateEvents = events.filter(ev =>
        new Date(ev.date).toDateString() === date.toDateString()
    );

    return (
        <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
                <Calendar
                    onChange={setDate}
                    value={date}
                    className="custom-calendar card"
                    tileContent={({ date, view }) => {
                        if (events.find(ev => new Date(ev.date).toDateString() === date.toDateString())) {
                            return <div style={{ height: '4px', width: '4px', backgroundColor: 'var(--accent-primary)', borderRadius: '50%', margin: '2px auto 0' }}></div>
                        }
                    }}
                />
            </div>

            <div className="card" style={{ flex: 1, minWidth: '300px' }}>
                <h3 style={{ fontSize: '15px', marginBottom: 'var(--space-md)' }}>{t('calendar_events_on')} {date.toLocaleDateString()}</h3>

                <form onSubmit={handleAddEvent} style={{ marginBottom: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            className="input-field"
                            placeholder="14:00"
                            value={newEvent.time}
                            onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                            style={{ width: '80px' }}
                            required
                        />
                        <input
                            className="input-field"
                            placeholder={t('calendar_event_title_ph')}
                            value={newEvent.title}
                            onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                            style={{ flex: 1 }}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>+ {t('common_add')}</button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedDateEvents.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '13px' }}>{t('calendar_no_events')}</p>}
                    {selectedDateEvents.map(ev => (
                        <div key={ev.id} style={{
                            padding: '10px 14px', 
                            background: 'var(--bg-surface-2)', 
                            borderRadius: 'var(--radius-md)',
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            <div>
                                <span style={{ fontWeight: '700', color: 'var(--accent-primary)', marginRight: '10px', fontSize: '13px' }}>{ev.time}</span>
                                <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{ev.title}</span>
                            </div>
                            <button onClick={() => handleDelete(ev.id)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
