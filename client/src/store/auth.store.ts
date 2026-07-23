import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isInitialized: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitialized: false,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
  setInitialized: (value) => set({ isInitialized: value }),
}));
