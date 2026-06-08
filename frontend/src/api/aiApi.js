import api from './axiosInstance';

export const aiApi = {
  history: () =>
    api.get('/api/ai/messages').then(r => r.data),

  chat: (message) =>
    api.post('/api/ai/chat', { message }).then(r => r.data.response),
};

export default aiApi;
