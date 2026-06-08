const rawBaseUrl = import.meta.env.VITE_API_URL || '';
const BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export const API_URL = (path) => {

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${cleanPath}`;
};

export default API_URL;
