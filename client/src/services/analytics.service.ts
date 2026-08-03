import { api } from '../lib/api';

export interface AuthEvent {
  _id: string;
  userEmail: string;
  userName: string;
  eventType: 'register' | 'login' | 'logout' | 'app_return' | 'account_deleted';
  metadata: string;
  createdAt: string;
}

export async function listAnalyticsRequest(): Promise<AuthEvent[]> {
  const { data } = await api.get('/analytics');
  return data.events;
}
