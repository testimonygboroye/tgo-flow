import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post('/auth/refresh');
      const newToken = data.accessToken as string;
      useAuthStore.getState().setAccessToken(newToken);

      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      refreshQueue = [];
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
