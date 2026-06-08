const AUTH_KEYS = ['accessToken', 'refreshToken', 'userId', 'userRole', 'user'];

export const getAuthItem = (key) => {
  return sessionStorage.getItem(key);
};

export const setAuthItem = (key, value) => {
  if (value === undefined || value === null) return;
  localStorage.removeItem(key);
  sessionStorage.setItem(key, String(value));
};

export const getAuthUser = () => {
  try {
    return JSON.parse(getAuthItem('user') || '{}');
  } catch {
    return {};
  }
};

export const setAuthUser = (user) => {
  setAuthItem('user', JSON.stringify(user || {}));
};

export const clearAuthSession = () => {
  AUTH_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
};

AUTH_KEYS.forEach((key) => {
  localStorage.removeItem(key);
});

export const getPhotoSrc = (user, apiUrlBuilder = (value) => value) => {
  const src = user?.profilePicture || user?.photoUrl;
  if (!src) return null;
  return src.startsWith('/uploads/') ? apiUrlBuilder(src) : src;
};
