import { getAuthItem } from '../authStorage';

const rawBaseUrl = import.meta.env.VITE_API_URL || '';
const BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const buildUrl = (url) => {
  if (/^https?:\/\//i.test(url)) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BASE_URL}${cleanUrl}`;
};

const parseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async (url, options = {}) => {
  const headers = {
    ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  const token = getAuthItem('accessToken');
  if (token && token !== 'undefined') headers.Authorization = `Bearer ${token}`;

  const response = await fetch(buildUrl(url), {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = await parseBody(response);

  if (!response.ok) {
    const error = new Error(
      typeof data === 'string' ? data : data?.error || response.statusText
    );
    error.response = { status: response.status, data };
    throw error;
  }

  return { data, status: response.status };
};

const api = {
  get: (url, config = {}) => request(url, { ...config, method: 'GET' }),
  post: (url, data, config = {}) => request(url, { ...config, method: 'POST', body: data }),
  put: (url, data, config = {}) => request(url, { ...config, method: 'PUT', body: data }),
  delete: (url, config = {}) => request(url, { ...config, method: 'DELETE' }),
};

export default api;
