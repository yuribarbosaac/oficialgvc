import { useState, useEffect } from 'react';

const SESSION_ID_KEY = 'gvc_session_id';

export function useSessionId(): string {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_ID_KEY);
    if (stored) {
      setSessionId(stored);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem(SESSION_ID_KEY, newId);
      setSessionId(newId);
    }
  }, []);

  return sessionId;
}