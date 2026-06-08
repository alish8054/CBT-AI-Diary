import { useCallback, useEffect, useState } from 'react';
import api from './api/axiosInstance';
import { getAuthItem } from './authStorage';

const isCompleted = (assignment) => Boolean(assignment?.completed ?? assignment?.isCompleted);

export default function useActiveAssignmentCount() {
  const [count, setCount] = useState(0);
  const userId = getAuthItem('userId');

  const fetchActiveAssignmentCount = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }

    try {
      const res = await api.get(`/api/assignments/client/${userId}`);
      const assignments = Array.isArray(res.data) ? res.data : [];
      setCount(assignments.filter(item => !isCompleted(item)).length);
    } catch {
      setCount(0);
    }
  }, [userId]);

  useEffect(() => {
    fetchActiveAssignmentCount();

    const interval = window.setInterval(fetchActiveAssignmentCount, 10000);
    window.addEventListener('focus', fetchActiveAssignmentCount);
    window.addEventListener('assignmentsChanged', fetchActiveAssignmentCount);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', fetchActiveAssignmentCount);
      window.removeEventListener('assignmentsChanged', fetchActiveAssignmentCount);
    };
  }, [fetchActiveAssignmentCount]);

  return count;
}
