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

export async function forgotPasswordRequest(email: string): Promise<{ message: string }> {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
}

export async function resetPasswordRequest(token: string, password: string): Promise<{ message: string }> {
  const { data } = await api.post('/auth/reset-password', { token, password });
  return data;
}

export async function recordAppReturnRequest(): Promise<void> {
  await api.post('/auth/app-return');
}

export async function deleteAccountRequest(): Promise<void> {
  await api.delete('/auth/me');
}
