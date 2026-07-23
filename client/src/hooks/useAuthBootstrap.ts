import { useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export function useAuthBootstrap() {
  const { setAuth, setInitialized, isInitialized } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const { data } = await api.post('/auth/refresh');
        if (cancelled) return;

        const meResponse = await api.get('/auth/me').catch(() => null);
        if (meResponse?.data?.user) {
          setAuth(meResponse.data.user, data.accessToken);
        } else {
          useAuthStore.getState().setAccessToken(data.accessToken);
        }
      } catch {
        // No valid session — user needs to log in. This is expected, not an error.
      } finally {
        if (!cancelled) setInitialized(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [setAuth, setInitialized]);

  return { isInitialized };
}
