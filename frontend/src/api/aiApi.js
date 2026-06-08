import api from './axiosInstance';

export const aiApi = {
  chat: (message) =>
    api.post('/api/ai/chat', { message }).then(r => r.data.response),
};

export default aiApi;
