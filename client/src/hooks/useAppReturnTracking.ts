import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/auth.store';
import { recordAppReturnRequest } from '../services/auth.service';

const AWAY_THRESHOLD_MS = 60 * 1000; // Only counts as "returned" if away for 1+ minute

export function useAppReturnTracking() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now();
      } else if (document.visibilityState === 'visible' && hiddenAtRef.current) {
        const awayDuration = Date.now() - hiddenAtRef.current;
        hiddenAtRef.current = null;
        if (awayDuration >= AWAY_THRESHOLD_MS && useAuthStore.getState().accessToken) {
          recordAppReturnRequest().catch(() => {});
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [accessToken]);
}
