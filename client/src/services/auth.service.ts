import { api } from '../lib/api';
import type { User } from '../types';

interface AuthResponse {
  status: string;
  user: User;
  accessToken: string;
}

export async function registerRequest(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
  return data;
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout');
}

export async function refreshRequest(): Promise<{ accessToken: string }> {
  const { data } = await api.post<{ accessToken: string }>('/auth/refresh');
  return data;
}
