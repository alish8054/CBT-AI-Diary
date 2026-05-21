import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const Profile = () => {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '', phone: '', aboutMe: '', email: ''
    });

    // Ссылка на скрытый input для файла
    const fileInputRef = useRef(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);
        setFormData({
            fullName: storedUser.fullName || '',
            phone: storedUser.phone || '',
            aboutMe: storedUser.aboutMe || '',
            email: storedUser.email || ''
        });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ФУНКЦИЯ ЗАГРУЗКИ ФОТО
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const toastId = toast.loading("Загрузка фото...");

        try {
            // Отправляем файл на сервер
            const res = await fetch(`/api/users/${user.id}/avatar`, {
                method: 'POST',
                body: formData // Заголовки Content-Type браузер поставит сам
            });

            if (res.ok) {
                const updatedUser = await res.json();

                // Обновляем локальное хранилище и состояние
                // ВАЖНО: Если сервер вернул относительный путь (/uploads/...),
                // браузер поймет его корректно относительно текущего домена
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);

                toast.success("Фото обновлено!", { id: toastId });
            } else {
                toast.error("Ошибка загрузки", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("Ошибка сервера", { id: toastId });
        }
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
                phone: savedUser.phone || '',
                aboutMe: savedUser.aboutMe || '',
                email: savedUser.email || ''
            });
            setIsEditing(false);
            toast.success("Saved", { id: toastId });
            return;
        } catch (error) {
            console.error(error);
            toast.error("Profile was not saved", { id: toastId });
            return;
        }

        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        toast.success("Данные сохранены!");
        // Здесь добавь fetch на обновление текстовых данных, если нужно
    };

    return (
        <div className="profile-card-container">
            <div className="profile-banner"></div>

            {/* АВАТАРКА В ПРОФИЛЕ */}
            <div className="profile-avatar-wrapper"
                 onClick={() => fileInputRef.current.click()}
                 style={{
                     background: '#e67e22',
                     cursor: 'pointer',
                     overflow: 'hidden', // Это ОБЯЗАТЕЛЬНО, чтобы фото не вылезало за границы круга
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                 }}>

                {user.photoUrl ? (
                    <img
                        src={`http://localhost:8080${user.photoUrl}`}
                        alt="Avatar"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover', // Сохраняет пропорции, обрезая лишнее по краям
                            display: 'block'
                        }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div style={{fontSize: '4rem', color: 'white', fontWeight: 'bold'}}>
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                    </div>
                )}

                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display: 'none'}} accept="image/*" />
            </div>

            <div className="profile-header-info">
                <div style={{flex: 1}}>
                    {isEditing ? (
                        <input className="edit-input" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Ваше Имя" />
                    ) : (
                        <h1 className="profile-name-large">{user.fullName || user.username || "Гость"}</h1>
                    )}
                    <span className="profile-role-badge">{user.role === 'PSYCHOLOGIST' ? 'Психолог' : 'Пользователь'}</span>
                </div>
                <div>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="btn-primary">✏️ Изменить</button>
                    ) : (
                        <div style={{display:'flex', gap:'10px'}}>
                            <button onClick={() => setIsEditing(false)} style={{background:'#ddd', padding:'10px 20px', borderRadius:'8px', border:'none'}}>Отмена</button>
                            <button onClick={handleSave} className="btn-primary">Сохранить</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-details-grid">
                <div className="detail-box">
                    <div className="detail-label">Логин</div>
                    <div className="detail-value">{user.username}</div>
                </div>
                <div className="detail-box">
                    <div className="detail-label">Email</div>
                    {isEditing ? <input className="edit-input" name="email" value={formData.email} onChange={handleChange} /> : <div className="detail-value">{user.email || "Не указан"}</div>}
                </div>
                <div className="detail-box">
                    <div className="detail-label">Телефон</div>
                    {isEditing ? <input className="edit-input" name="phone" value={formData.phone} onChange={handleChange} /> : <div className="detail-value">{user.phone || "Не указан"}</div>}
                </div>

            </div>
        </div>
    );
};

export default Profile;
