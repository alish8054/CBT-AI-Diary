import { useCallback, useEffect, useState } from 'react';
import api from './api/axiosInstance';
import { getAuthItem } from './authStorage';

export default function useUnreadChatCount() {
  const [count, setCount] = useState(0);
  const userId = getAuthItem('userId');

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }

    try {
      const res = await api.get(`/api/chat/unread-count?userId=${userId}`);
      setCount(Number(res.data?.count || 0));
    } catch {
      setCount(0);
    }
  }, [userId]);

  useEffect(() => {
    fetchUnreadCount();

    const interval = window.setInterval(fetchUnreadCount, 5000);
    window.addEventListener('focus', fetchUnreadCount);
    window.addEventListener('chatUnreadChanged', fetchUnreadCount);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', fetchUnreadCount);
      window.removeEventListener('chatUnreadChanged', fetchUnreadCount);
    };
  }, [fetchUnreadCount]);

  return count;
}
