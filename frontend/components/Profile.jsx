import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../src/api/axiosInstance';
import API_URL from '../src/api';
import { useLanguage } from '../src/i18n/LanguageContext';
import { clearAuthSession, getAuthItem, getPhotoSrc, setAuthUser } from '../src/authStorage';

const PsychologistSelector = ({ currentPsychologist, pendingRequests, setPendingRequests, onRemove, userId, removing }) => {
  const { t } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(null);

  const handleSearch = async (q) => {
    setQuery(q);
    const trimmedQuery = q.trim();
    if (trimmedQuery.length < 2) {
      setResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const res = await api.get('/api/users/psychologists');
      const needle = trimmedQuery.toLowerCase();
      const filtered = (Array.isArray(res.data) ? res.data : []).filter((psych) =>
        [
          psych.fullName,
          psych.username,
          psych.specialization,
        ].some((value) => (value || '').toLowerCase().includes(needle))
      );
      setResults(filtered);
    } catch (err) {
      console.error(err);
      setResults([]);
      toast.error(t('error_generic'));
    } finally {
      setSearchLoading(false);
    }
  };

  const handleChoose = async (psych) => {
    try {
      const res = await api.post(`/api/users/${userId}/psychologist-requests/${psych.id}`);
      setPendingRequests(prev => {
        const existing = prev.some(request => request.id === res.data.id);
        return existing ? prev : [...prev, res.data];
      });
      setSearchOpen(false);
      setSelectedPreview(null);
      toast.success("Request sent. Wait for psychologist approval.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || t('error_generic'));
    }
  };

  const pendingPsychologistIds = new Set(
    pendingRequests.map(request => request.psychologist?.id)
  );
  const photoSrc = (person) => getPhotoSrc(person, API_URL);

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-header">🧠 {t('profile_my_psych')}</div>

      {currentPsychologist ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {photoSrc(currentPsychologist)
            ? <img src={photoSrc(currentPsychologist)}
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} alt="psych" />
            : <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: '#fff'
              }}>{(currentPsychologist.fullName || currentPsychologist.username || "?")[0]}</div>
          }
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{currentPsychologist.fullName || currentPsychologist.username}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('profile_psychologist')}</div>
          </div>
          <div className="btn-row" style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={() => setSelectedPreview(currentPsychologist)}>
              {t('profile_view')}
            </button>
            <button onClick={onRemove} disabled={removing} style={{
              background: 'rgba(248,113,113,0.1)', color: '#f87171',
              border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius-md)',
              padding: '6px 14px', fontSize: 12, cursor: removing ? 'not-allowed' : 'pointer',
              opacity: removing ? 0.6 : 1
            }}>
              {removing ? t('loading') : t('profile_detach')}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
            {t('profile_no_psych')}
          </p>
          {pendingRequests.length > 0 && (
            <div style={{
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              color: 'var(--text-secondary)',
              fontSize: 13,
              marginBottom: 12,
            }}>
              Your request is waiting for psychologist approval.
            </div>
          )}
          <button className="btn-primary" onClick={() => setSearchOpen(true)}>
            + {t('profile_find_psych')}
          </button>
        </div>
      )}

      {searchOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}>
          <div className="card modal-card" style={{ width: 460, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{t('profile_find_psych')}</h3>
              <button onClick={() => setSearchOpen(false)} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontSize: 20, cursor: 'pointer'
              }}>×</button>
            </div>
            <input
              className="input-field"
              placeholder={t('profile_search_ph')}
              value={query}
              onChange={e => handleSearch(e.target.value)}
              autoFocus
              style={{ marginBottom: 16 }}
            />
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {searchLoading && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                  {t('loading')}
                </div>
              )}
              {!searchLoading && results.length === 0 && query.trim().length >= 2 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                  {t('profile_none_found')}
                </div>
              )}
              {results.map(psych => (
                <div key={psych.id} className="psych-search-result" style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: '1px solid var(--border-subtle)'
                }}>
                  {photoSrc(psych)
                    ? <img src={photoSrc(psych)}
                        style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} alt="psych" />
                    : <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0
                      }}>{(psych.fullName || psych.username || "?")[0]}</div>
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{psych.fullName || psych.username}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('profile_psychologist')}</div>
                  </div>
                  <button className="btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }}
                    onClick={() => setSelectedPreview(psych)}>
                    {t('profile_view')}
                  </button>
                  <button className="btn-primary" style={{ fontSize: 12, padding: '5px 12px' }}
                    disabled={pendingPsychologistIds.has(psych.id)}
                    onClick={() => handleChoose(psych)}>
                    {pendingPsychologistIds.has(psych.id) ? 'Pending' : 'Send request'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedPreview && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedPreview(null)}>
          <div className="card modal-card" style={{ width: 380 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {photoSrc(selectedPreview)
                ? <img src={photoSrc(selectedPreview)}
                    style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }} alt="preview" />
                : <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32, fontWeight: 700, color: '#fff', margin: '0 auto 12px'
                  }}>{(selectedPreview.fullName || selectedPreview.username || "?")[0]}</div>
              }
              <h2 style={{ margin: 0 }}>{selectedPreview.fullName || selectedPreview.username}</h2>
              <span className="badge badge-violet" style={{ marginTop: 6 }}>{t('profile_psychologist')}</span>
              <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)' }}>{selectedPreview.specialization}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('profile_exp') || 'Experience'}: {selectedPreview.experience} {t('profile_years') || 'years'}</p>
            </div>
            <div className="btn-row" style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn-secondary" style={{ flex: 1 }}
                onClick={() => setSelectedPreview(null)}>{t('close')}</button>
              {!currentPsychologist && (
                <button className="btn-primary" style={{ flex: 1 }}
                  disabled={pendingPsychologistIds.has(selectedPreview.id)}
                  onClick={() => { setSelectedPreview(null); handleChoose(selectedPreview); }}>
                  {pendingPsychologistIds.has(selectedPreview.id) ? 'Pending' : 'Send request'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Profile = () => {
    const { t } = useLanguage();
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '', phone: '', aboutMe: '', email: ''
    });
    const [avatarSrc, setAvatarSrc] = useState(null);
    const [myPsychologist, setMyPsychologist] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [removingPsychologist, setRemovingPsychologist] = useState(false);
    const resolvePhoto = (data) => {
        return getPhotoSrc(data, API_URL);
    };

    useEffect(() => {
        const userId = getAuthItem('userId');
        if (userId) {
            fetchUser(userId);
            fetchPendingRequests(userId);
        }
    }, []);

    const fetchPendingRequests = async (id) => {
        try {
            const res = await api.get(`/api/users/${id}/psychologist-requests/pending`);
            setPendingRequests(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setPendingRequests([]);
        }
    };

    const fetchUser = async (id) => {
        try {
            const res = await api.get(`/api/users/${id}`);
            const data = res.data;
            setUser(data);
            setFormData({
                fullName: data.fullName || '',
                phone: data.phone || '',
                aboutMe: data.aboutMe || '',
                email: data.email || ''
            });
            setAvatarSrc(resolvePhoto(data));
            setMyPsychologist(data.psychologist);
        } catch (err) { console.error(err); }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const toastId = toast.loading(t('loading'));
        try {
            const resized = await new Promise(resolve => {
                const img = new Image();
                const url = URL.createObjectURL(file);
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const scale = Math.min(300 / img.width, 300 / img.height, 1);
                  canvas.width = img.width * scale;
                  canvas.height = img.height * scale;
                  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                  canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.85);
                  URL.revokeObjectURL(url);
                };
                img.src = url;
            });
            const base64 = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(resized);
            });

            const res = await api.put(`/api/users/${user.id}/profile-picture`, { profilePicture: base64 });
            const updatedUser = res.data;
            setAvatarSrc(base64);
            setUser(updatedUser);
            setAuthUser(updatedUser);
            window.dispatchEvent(new Event('userProfileChanged'));
            toast.success(t('profile_photo_success') || "Photo updated!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error(t('error_generic'), { id: toastId });
        }
    };

    const handleSave = async () => {
        const toastId = toast.loading(t('loading'));
        try {
            const res = await api.put(`/api/users/${user.id}`, formData);
            setUser(res.data);
            setIsEditing(false);
            toast.success(t('save') + " ✨", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error(t('error_generic'), { id: toastId });
        }
    };

    const handleRemovePsychologist = async () => {
        if (!user.id || removingPsychologist) return;
        const toastId = toast.loading(t('loading'));
        setRemovingPsychologist(true);
        try {
            await api.delete(`/api/users/me/psychologist?clientId=${user.id}`);
            setMyPsychologist(null);
            const updatedUser = { ...user, psychologist: null };
            setUser(updatedUser);
            setAuthUser(updatedUser);
            window.dispatchEvent(new CustomEvent('psychologistChanged', { detail: { psychologist: null } }));
            toast.success(t('profile_detach_success') || "Psychologist detached", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data || t('error_generic'), { id: toastId });
        } finally {
            setRemovingPsychologist(false);
        }
    };

    const handleLogout = () => {
        clearAuthSession();
        window.location.href = '/login';
    };

    const isMobile = window.innerWidth < 768;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1>{t('profile_title')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t('profile_subtitle')}</p>
                </div>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="btn-primary">✏️ {t('profile_edit')}</button>
                ) : (
                    <div className="btn-row" style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setIsEditing(false)} className="btn-secondary">{t('cancel')}</button>
                        <button onClick={handleSave} className="btn-primary">{t('save')}</button>
                    </div>
                )}
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="profile-banner"></div>
                <div style={{ padding: '0 var(--space-lg) var(--space-lg)' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <div className="profile-avatar-large">
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span>{user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : "?")}</span>
                            )}
                        </div>
                        <label htmlFor="avatar-upload" style={{
                            position: 'absolute', bottom: 0, right: 0,
                            width: 24, height: 24, borderRadius: '50%',
                            background: 'var(--accent-primary)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, border: '2px solid var(--bg-base)', zIndex: 2
                        }}>📷</label>
                        <input id="avatar-upload" type="file" accept="image/*"
                            style={{ display: 'none' }} onChange={handleAvatarChange} />
                    </div>

                    <div style={{ marginTop: 'var(--space-md)' }}>
                        {isEditing ? (
                            <input className="input-field" name="fullName" value={formData.fullName} onChange={handleChange} placeholder={t('profile_name_ph') || "Your Name"} style={{ fontSize: '20px', fontWeight: '700', marginBottom: 'var(--space-sm)' }} />
                        ) : (
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: 'var(--space-xs)' }}>{user.fullName || user.username || t('profile_user')}</h2>
                        )}
                        <span className="badge badge-violet">{user.role === 'PSYCHOLOGIST' ? t('profile_psychologist') : t('profile_user')}</span>
                    </div>

                    <div className="profile-fields-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 'var(--space-lg)' }}>
                        <div className="info-field">
                            <label className="input-label">{t('profile_login')}</label>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{user.username}</div>
                        </div>
                        <div className="info-field">
                            <label className="input-label">{t('profile_email')}</label>
                            {isEditing ? (
                                <input className="input-field" name="email" value={formData.email} onChange={handleChange} />
                            ) : (
                                <div style={{ fontSize: '14px', fontWeight: '500', color: user.email ? 'var(--text-primary)' : 'var(--text-muted)' }}>{user.email || t('profile_not_set')}</div>
                            )}
                        </div>
                        <div className="info-field">
                            <label className="input-label">{t('profile_phone')}</label>
                            {isEditing ? (
                                <input className="input-field" name="phone" value={formData.phone} onChange={handleChange} />
                            ) : (
                                <div style={{ fontSize: '14px', fontWeight: '500', color: user.phone ? 'var(--text-primary)' : 'var(--text-muted)' }}>{user.phone || t('profile_not_set')}</div>
                            )}
                        </div>
                    </div>
                    
                    {isEditing && (
                        <div style={{ marginTop: 'var(--space-md)' }}>
                            <label className="input-label">{t('profile_about') || 'About'}</label>
                            <textarea className="input-field" name="aboutMe" value={formData.aboutMe} onChange={handleChange} rows="4" style={{ resize: 'none' }} />
                        </div>
                    )}
                </div>
            </div>


            {user.role === 'CLIENT' && (
                <PsychologistSelector
                    userId={user.id}
                    currentPsychologist={myPsychologist}
                    pendingRequests={pendingRequests}
                    setPendingRequests={setPendingRequests}
                    onRemove={handleRemovePsychologist}
                    removing={removingPsychologist}
                />
            )}

            {isMobile && (
                <button
                    onClick={handleLogout}
                    style={{
                    width: '100%', marginTop: 24,
                    background: 'rgba(248,113,113,0.1)', color: '#f87171',
                    border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: 'var(--radius-lg)', padding: '12px',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                    🚪 {t('nav_logout')}
                </button>
            )}
        </div>
    );
};

export default Profile;
