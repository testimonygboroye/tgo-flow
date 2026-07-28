import { api } from '../lib/api';
import type { Workspace, WorkspaceMembership, Member, MembershipRole } from '../types';

export async function createWorkspaceRequest(name: string): Promise<Workspace> {
  const { data } = await api.post('/workspaces', { name });
  return data.workspace;
}

export async function listWorkspacesRequest(): Promise<WorkspaceMembership[]> {
  const { data } = await api.get('/workspaces');
  return data.workspaces;
}

export async function getWorkspaceMembersRequest(workspaceId: string): Promise<Member[]> {
  const { data } = await api.get(`/workspaces/${workspaceId}/members`);
  return data.members;
}

export async function inviteMemberRequest(workspaceId: string, email: string, role: MembershipRole) {
  const { data } = await api.post(`/workspaces/${workspaceId}/invites`, { email, role });
  return data;
}

export async function acceptInviteRequest(token: string): Promise<Workspace> {
  const { data } = await api.post('/workspaces/invites/accept', { token });
  return data.workspace;
}

export async function updateMemberRoleRequest(workspaceId: string, userId: string, role: MembershipRole) {
  const { data } = await api.patch(`/workspaces/${workspaceId}/members/${userId}`, { role });
  return data.membership;
}

export async function removeMemberRequest(workspaceId: string, userId: string) {
  await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
}

export async function getWorkspaceRequest(workspaceId: string) {
  const { data } = await api.get(`/workspaces/${workspaceId}`);
  return data.workspace;
}

