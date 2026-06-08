import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../src/api/axiosInstance';
import API_URL from '../src/api';
import { useLanguage } from '../src/i18n/LanguageContext';
import { getAuthItem, setAuthUser } from '../src/authStorage';

const PsychologistProfile = () => {
    const { t } = useLanguage();
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: '', specialization: '', experience: '', aboutMe: '', phone: '',
        certificateUrls: '',
        socialLinks: ''
    });
    const resolvePhoto = (data) => {
        const src = data?.profilePicture || data?.photoUrl;
        return src && src.startsWith('/uploads/') ? API_URL(src) : src || null;
    };

    useEffect(() => {
        const storedId = getAuthItem('userId');
        if (storedId) fetchUser(storedId);
    }, []);

    const fetchUser = async (id) => {
        try {
            const res = await api.get(`/api/users/${id}`);
            const data = res.data;
            setUser(data);
            setFormData({
                fullName: data.fullName || '',
                specialization: data.specialization || '',
                experience: data.experience || '',
                aboutMe: data.aboutMe || '',
                phone: data.phone || '',
                certificateUrls: data.certificateUrls || '',
                socialLinks: data.socialLinks || ''
            });
            setAvatarSrc(resolvePhoto(data));
        } catch (err) { 
            console.error('Error fetching user profile:', err); 
        }
    };

    const resizeImage = (file, maxW, maxH) => {
        return new Promise(resolve => {
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(maxW / img.width, maxH / img.height, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.85);
            URL.revokeObjectURL(url);
          };
          img.src = url;
        });
    };
      
    const toBase64 = (blob) => {
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const toastId = toast.loading(t('profile_toast_processing_photo'));
        try {
            const resized = await resizeImage(file, 300, 300);
            const base64 = await toBase64(resized);

            const res = await api.put(`/api/users/${user.id}/profile-picture`, { profilePicture: base64 });
            const updated = res.data;

            setAvatarSrc(base64);
            setUser(updated);
            setAuthUser(updated);
            window.dispatchEvent(new Event('userProfileChanged'));
            toast.success(t('profile_toast_photo_updated'), { id: toastId });
        } catch (error) {
            console.error('Error updating avatar:', error);
            toast.error(t('auth_error_connection'), { id: toastId });
        }
    };

    const handleSave = async () => {
        const toastId = toast.loading(t('common_thinking'));

        try {
            const res = await api.put(`/api/users/${user.id}`, formData);
            const savedUser = res.data;
            setAuthUser(savedUser);
            setUser(savedUser);
            setIsEditing(false);
            toast.success(t('diary_toast_saved'), { id: toastId });
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(t('diary_toast_save_error'), { id: toastId });
        }
    };

    return (
        <div className="profile-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1>{t('psych_profile_title')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t('psych_profile_subtitle')}</p>
                </div>
                <div className="btn-row">
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="btn-primary">✏️ {t('profile_edit')}</button>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(false)} className="btn-secondary">{t('profile_cancel')}</button>
                            <button onClick={handleSave} className="btn-primary">{t('profile_save')}</button>
                        </>
                    )}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="profile-banner" style={{ height: '120px', background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)' }}></div>
                <div style={{ padding: '0 var(--space-lg) var(--space-lg)' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginTop: '-50px' }}>
                        <div className="profile-avatar-large" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--bg-surface)', overflow: 'hidden', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#fff', fontWeight: 'bold' }}>
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span>{(user.fullName || user.username || "P").charAt(0)}</span>
                            )}
                        </div>
                        <label htmlFor="avatar-upload-psych" style={{
                            position: 'absolute', bottom: 0, right: 0,
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'var(--accent-primary)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, border: '2px solid var(--bg-surface)', zIndex: 2
                        }}>📷</label>
                        <input id="avatar-upload-psych" type="file" accept="image/*"
                            style={{ display: 'none' }} onChange={handleAvatarChange} />
                    </div>

                    <div style={{ marginTop: 'var(--space-md)' }}>
                        {isEditing ? (
                            <input className="input-field" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} style={{ fontSize: '20px', fontWeight: '700', marginBottom: 'var(--space-sm)' }} />
                        ) : (
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: 'var(--space-xs)' }}>{user.fullName || user.username}</h2>
                        )}
                        <span className="badge badge-sky">{t('profile_psychologist')}</span>
                    </div>

                    <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                        <div className="info-field">
                            <label className="input-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('profile_specialization')}</label>
                            {isEditing ? (
                                <input className="input-field" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} />
                            ) : (
                                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{user.specialization || '—'}</div>
                            )}
                        </div>
                        <div className="info-field">
                            <label className="input-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('profile_experience')}</label>
                            {isEditing ? (
                                <input className="input-field" type="number" min="0" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
                            ) : (
                                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{user.experience ? `${user.experience} ${t('profile_years')}` : '—'}</div>
                            )}
                        </div>
                        <div className="info-field">
                            <label className="input-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('profile_phone')}</label>
                            {isEditing ? (
                                <input className="input-field" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            ) : (
                                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{user.phone || '—'}</div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--space-md)' }}>
                        <label className="input-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('profile_about_me')}</label>
                        {isEditing ? (
                            <textarea className="input-field" value={formData.aboutMe} onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })} rows="4" style={{ resize: 'none', width: '100%' }} />
                        ) : (
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{user.aboutMe || t('profile_no_info')}</div>
                        )}
                    </div>

                    <div style={{ marginTop: 'var(--space-md)' }}>
                        <label className="input-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('profile_certificates')}</label>
                        {isEditing ? (
                            <textarea className="input-field" placeholder={t('profile_certs_ph')} value={formData.certificateUrls} onChange={(e) => setFormData({ ...formData, certificateUrls: e.target.value })} rows="2" style={{ resize: 'none', width: '100%' }} />
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {user.certificateUrls ? user.certificateUrls.split(',').map((url, i) => (
                                    <a key={`cert-${i}`} href={url} target="_blank" rel="noreferrer" className="badge badge-violet" style={{ textDecoration: 'none' }}>🔗 {t('profile_certificates')} {i + 1}</a>
                                )) : <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{t('profile_no_certs')}</span>}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 'var(--space-md)' }}>
                        <label className="input-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('profile_social')}</label>
                        {isEditing ? (
                            <input className="input-field" placeholder={t('profile_social_ph')} value={formData.socialLinks} onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })} style={{ width: '100%' }} />
                        ) : (
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user.socialLinks || t('profile_not_specified')}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PsychologistProfile;
