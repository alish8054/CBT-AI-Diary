import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const PsychologistProfile = () => {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: '', specialization: '', experience: '', aboutMe: '', phone: '',
        certificateUrls: '', // Для ссылок на сертификаты
        socialLinks: ''      // Для соцсетей (Instagram, Telegram и т.д.)
    });

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(stored);
        setFormData({
            fullName: stored.fullName || '',
            specialization: stored.specialization || '',
            experience: stored.experience || '',
            aboutMe: stored.aboutMe || '',
            phone: stored.phone || '',
            certificateUrls: stored.certificateUrls || '',
            socialLinks: stored.socialLinks || '' // Убедись, что это поле есть в Entity User (String)
        });
    }, []);

    // ЗАГРУЗКА АВАТАРКИ
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const data = new FormData();
        data.append('file', file);

        const toastId = toast.loading("Загрузка фото...");
        try {
            const res = await fetch(`/api/users/${user.id}/avatar`, { method: 'POST', body: data });
            if (res.ok) {
                const updated = await res.json();
                localStorage.setItem('user', JSON.stringify(updated));
                setUser(updated);
                toast.success("Фото обновлено!", { id: toastId });
                setTimeout(() => window.location.reload(), 1000); // Обновляем, чтобы сайдбар подхватил
            }
        } catch (e) { toast.error("Ошибка", { id: toastId }); }
    };

    const handleSave = async () => {
        const toastId = toast.loading("Saving...");

        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const savedUser = await res.json();
            localStorage.setItem('user', JSON.stringify(savedUser));
            setUser(savedUser);
            setFormData({
                fullName: savedUser.fullName || '',
                specialization: savedUser.specialization || '',
                experience: savedUser.experience || '',
                aboutMe: savedUser.aboutMe || '',
                phone: savedUser.phone || '',
                certificateUrls: savedUser.certificateUrls || '',
                socialLinks: savedUser.socialLinks || ''
            });
            setIsEditing(false);
            toast.success("Profile saved", { id: toastId });
            return;
        } catch (error) {
            console.error(error);
            toast.error("Profile was not saved", { id: toastId });
            return;
        }

        // Здесь должен быть fetch на обновление данных пользователя
        // Пока обновляем локально для вида
        const updated = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
        setIsEditing(false);
        toast.success("Профиль сохранен");
    };

    return (
        <div className="profile-card-container">
            <div className="profile-banner" style={{background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'}}></div>

            {/* АВАТАРКА С ЗАГРУЗКОЙ */}
            <div className="profile-avatar-wrapper"
                 onClick={() => isEditing && fileInputRef.current.click()}
                 style={{background: '#3498db', overflow: 'hidden', cursor: isEditing ? 'pointer' : 'default'}}>

                {user.photoUrl ? (
                    <img src={`http://localhost:8080${user.photoUrl}`} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                    <span style={{fontSize: '3rem', color: 'white'}}>{(user.fullName || "П").charAt(0)}</span>
                )}

                {isEditing && (
                    <div style={{position:'absolute', bottom:0, width:'100%', background:'rgba(0,0,0,0.5)', color:'white', fontSize:'0.8rem', textAlign:'center'}}>
                        Изменить
                    </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display: 'none'}} accept="image/*" />
            </div>

            <div className="profile-header-info">
                <div>
                    {isEditing ? (
                        <input className="edit-input" value={formData.fullName} onChange={(e)=>setFormData({...formData, fullName: e.target.value})} />
                    ) : (
                        <h1 className="profile-name-large">{user.fullName || user.username}</h1>
                    )}
                    <span className="profile-role-badge">Психолог</span>
                </div>
                <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="btn-primary">
                    {isEditing ? '💾 Сохранить' : '✏️ Изменить'}
                </button>
            </div>

            <div className="profile-details-grid">
                {/* Основные поля */}
                <div className="detail-box">
                    <div className="detail-label">Специализация</div>
                    {isEditing ? <input className="edit-input" value={formData.specialization} onChange={(e)=>setFormData({...formData, specialization: e.target.value})}/> : <div className="detail-value">{user.specialization || '—'}</div>}
                </div>

                {/* СЕРТИФИКАТЫ И СОЦСЕТИ */}
                <div className="detail-box">
                    <div className="detail-label">Phone</div>
                    {isEditing ? <input className="edit-input" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})}/> : <div className="detail-value">{user.phone || '—'}</div>}
                </div>

                <div className="detail-box">
                    <div className="detail-label">Experience</div>
                    {isEditing ? <input className="edit-input" type="number" min="0" value={formData.experience} onChange={(e)=>setFormData({...formData, experience: e.target.value})}/> : <div className="detail-value">{user.experience ? `${user.experience} years` : '—'}</div>}
                </div>

                <div className="detail-box" style={{gridColumn: '1 / -1'}}>
                    <div className="detail-label">About</div>
                    {isEditing ? <textarea className="edit-input" value={formData.aboutMe} onChange={(e)=>setFormData({...formData, aboutMe: e.target.value})}/> : <div className="detail-value">{user.aboutMe || '—'}</div>}
                </div>

                <div className="detail-box" style={{gridColumn: '1 / -1'}}>
                    <div className="detail-label">Сертификаты (Ссылки)</div>
                    {isEditing ? (
                        <textarea className="edit-input" placeholder="Вставьте ссылки на сертификаты через запятую" value={formData.certificateUrls} onChange={(e)=>setFormData({...formData, certificateUrls: e.target.value})}/>
                    ) : (
                        <div className="detail-value">
                            {user.certificateUrls ? user.certificateUrls.split(',').map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noreferrer" style={{display:'block', color:'#3498db', marginBottom:'5px'}}>🔗 Сертификат {i+1}</a>
                            )) : "Нет сертификатов"}
                        </div>
                    )}
                </div>

                <div className="detail-box" style={{gridColumn: '1 / -1'}}>
                    <div className="detail-label">Соцсети</div>
                    {isEditing ? (
                        <input className="edit-input" placeholder="Instagram, Telegram..." value={formData.socialLinks} onChange={(e)=>setFormData({...formData, socialLinks: e.target.value})}/>
                    ) : (
                        <div className="detail-value">{user.socialLinks || "Не указаны"}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PsychologistProfile;
