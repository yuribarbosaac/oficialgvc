import { useState, useEffect, useCallback } from 'react';

// Hook dedicado para gerenciar rascunho do agendamento
export function useAgendamentoDraft() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const loadDraft = useCallback(() => {
    // Tentar IndexedDB primeiro (mais robusto)
    return new Promise<{data: any, step: number} | null>((resolve) => {
      try {
        const dbRequest = indexedDB.open('GVC_AgendamentoDB', 1);
        dbRequest.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('drafts')) {
            db.createObjectStore('drafts', { keyPath: 'id' });
          }
        };
        dbRequest.onsuccess = (event: any) => {
          const db = event.target.result;
          const tx = db.transaction('drafts', 'readonly');
          const store = tx.objectStore('drafts');
          const getRequest = store.get('agendamento_draft');
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              resolve({
                data: JSON.parse(getRequest.result.data),
                step: getRequest.result.step || 1
              });
            } else {
              resolve(null);
            }
          };
          getRequest.onerror = () => resolve(null);
        };
        dbRequest.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }, []);

  const loadFromStorage = useCallback(async () => {
    // Primeiro verificar sessionStorage
    let savedData = sessionStorage.getItem('gvc_agendamento_draft');
    let savedStep = sessionStorage.getItem('gvc_agendamento_step');
    
    if (savedData && savedStep) {
      try {
        return {
          data: JSON.parse(savedData),
          step: parseInt(savedStep)
        };
      } catch {}
    }
    
    // Depois localStorage
    savedData = localStorage.getItem('gvc_agendamento_draft_backup');
    savedStep = localStorage.getItem('gvc_agendamento_step_backup');
    
    if (savedData && savedStep) {
      try {
        return {
          data: JSON.parse(savedData),
          step: parseInt(savedStep)
        };
      } catch {}
    }
    
    // Por último IndexedDB
    const idbData = await loadDraft();
    if (idbData) return idbData;
    
    return null;
  }, [loadDraft]);

  const saveDraft = useCallback((data: any, step: number) => {
    const dataStr = JSON.stringify(data);
    
    // SessionStorage (principal)
    try {
      sessionStorage.setItem('gvc_agendamento_draft', dataStr);
      sessionStorage.setItem('gvc_agendamento_step', step.toString());
    } catch {}
    
    // LocalStorage (backup)
    try {
      localStorage.setItem('gvc_agendamento_draft_backup', dataStr);
      localStorage.setItem('gvc_agendamento_step_backup', step.toString());
    } catch {}
    
    // IndexedDB (robusto)
    try {
      const dbRequest = indexedDB.open('GVC_AgendamentoDB', 1);
      dbRequest.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'id' });
        }
      };
      dbRequest.onsuccess = (event: any) => {
        const db = event.target.result;
        const tx = db.transaction('drafts', 'readwrite');
        const store = tx.objectStore('drafts');
        store.put({ id: 'agendamento_draft', data: dataStr, step, timestamp: Date.now() });
      };
    } catch {}
  }, []);

  const clearDraft = useCallback(() => {
    sessionStorage.removeItem('gvc_agendamento_draft');
    sessionStorage.removeItem('gvc_agendamento_step');
    localStorage.removeItem('gvc_agendamento_draft_backup');
    localStorage.removeItem('gvc_agendamento_step_backup');
    
    try {
      const dbRequest = indexedDB.open('GVC_AgendamentoDB', 1);
      dbRequest.onsuccess = (event: any) => {
        const db = event.target.result;
        const tx = db.transaction('drafts', 'readwrite');
        const store = tx.objectStore('drafts');
        store.delete('agendamento_draft');
      };
    } catch {}
  }, []);

  const initDraft = useCallback(async () => {
    const draft = await loadFromStorage();
    setIsLoaded(true);
    return draft;
  }, [loadFromStorage]);

  return {
    isLoaded,
    initDraft,
    saveDraft,
    clearDraft
  };
}

export default useAgendamentoDraft;