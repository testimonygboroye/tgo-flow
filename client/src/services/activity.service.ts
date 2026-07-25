import { api } from '../lib/api';

export interface Activity {
  _id: string;
  action: string;
  description: string;
  actor: { name: string; email: string };
  createdAt: string;
}

export async function listActivityRequest(workspaceId: string): Promise<Activity[]> {
  const { data } = await api.get(`/workspaces/${workspaceId}/activity`);
  return data.activity;
}
