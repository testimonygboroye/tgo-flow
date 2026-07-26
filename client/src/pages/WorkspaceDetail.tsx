import { useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getWorkspaceMembersRequest, inviteMemberRequest, updateMemberRoleRequest, removeMemberRequest } from '../services/workspace.service';
import { listActivityRequest } from '../services/activity.service';
import { createBoardRequest, listBoardsRequest } from '../services/board.service';
import { useAuthStore } from '../store/auth.store';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import axios from 'axios';
import type { MembershipRole } from '../types';

type Tab = 'boards' | 'members' | 'activity';

export function WorkspaceDetail() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('boards');

  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [boardError, setBoardError] = useState<string | null>(null);

  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MembershipRole>('member');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const { data: boards, isLoading: boardsLoading } = useQuery({
    queryKey: ['boards', workspaceId],
    queryFn: () => listBoardsRequest(workspaceId!),
    enabled: !!workspaceId,
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => getWorkspaceMembersRequest(workspaceId!),
    enabled: !!workspaceId,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['activity', workspaceId],
    queryFn: () => listActivityRequest(workspaceId!),
    enabled: !!workspaceId && tab === 'activity',
  });

  const myMembership = members?.find((m) => m.user.id === user?.id || (m.user as any)._id === user?.id);
  const myRole = myMembership?.role;
  const canManage = myRole === 'owner' || myRole === 'admin';

  async function handleCreateBoard(e: FormEvent) {
    e.preventDefault();
    if (!newBoardName.trim() || !workspaceId) return;
    setBoardError(null);
    try {
      const { board } = await createBoardRequest(workspaceId, newBoardName.trim());
      setNewBoardName('');
      setIsCreatingBoard(false);
      queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] });
      navigate(`/workspaces/${workspaceId}/boards/${board._id}`);
    } catch {
      setBoardError('Could not create board. Please try again.');
    }
  }

  async function handleRoleChange(userId: string, newRole: MembershipRole) {
    if (!workspaceId) return;
    await updateMemberRoleRequest(workspaceId, userId, newRole);
    queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
  }

  async function handleRemoveMember(userId: string, name: string) {
    if (!workspaceId) return;
    if (!confirm(`Remove ${name} from this workspace?`)) return;
    await removeMemberRequest(workspaceId, userId);
    queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !workspaceId) return;
    setInviteError(null);
    setInviteLink(null);
    try {
      const result = await inviteMemberRequest(workspaceId, inviteEmail.trim(), inviteRole);
      const link = `${window.location.origin}/invites/accept?token=${result.inviteToken}`;
      setInviteLink(link);
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setInviteError(err.response.data.message);
      } else {
        setInviteError('Could not send invite. Please try again.');
      }
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <Logo className="h-7 w-7" />
            <span className="font-display text-lg font-bold text-text-primary">TGO Flow</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex gap-1 border-b border-border">
          <button
            onClick={() => setTab('boards')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === 'boards'
                ? 'border-brand-violet text-brand-violet'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Boards
          </button>
          <button
            onClick={() => setTab('members')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === 'members'
                ? 'border-brand-violet text-brand-violet'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setTab('activity')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === 'activity'
                ? 'border-brand-violet text-brand-violet'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Activity
          </button>
        </div>

        {tab === 'boards' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="font-display text-xl font-bold text-text-primary">Boards</h1>
              {canManage && (
                <button
                  onClick={() => setIsCreatingBoard(true)}
                  className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  + New board
                </button>
              )}
            </div>

            {isCreatingBoard && (
              <form onSubmit={handleCreateBoard} className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
                <input
                  autoFocus
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Board name (e.g. Website Redesign)"
                  className="w-full min-w-0 flex-1 rounded-lg border border-border bg-bg px-3.5 py-2 text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white hover:opacity-90 sm:flex-none">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsCreatingBoard(false); setNewBoardName(''); }}
                    className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover sm:flex-none"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {boardError && (
              <div className="mb-6 rounded-lg bg-danger/10 border border-danger/20 px-4 py-2.5 text-sm text-danger">{boardError}</div>
            )}

            {boardsLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-violet border-t-transparent" />
              </div>
            ) : boards && boards.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {boards.map((board) => (
                  <button
                    key={board._id}
                    onClick={() => navigate(`/workspaces/${workspaceId}/boards/${board._id}`)}
                    className="group rounded-xl border border-border bg-surface p-5 text-left transition hover:border-brand-violet/40 hover:shadow-lg hover:shadow-brand-violet/5"
                  >
                    <h3 className="font-display font-semibold text-text-primary group-hover:text-brand-violet transition">
                      {board.name}
                    </h3>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface/50 py-16 text-center">
                <p className="text-text-secondary">No boards yet. Create your first one to get started.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'members' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="font-display text-xl font-bold text-text-primary">Members</h1>
              {canManage && (
                <button
                  onClick={() => setIsInviting(true)}
                  className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  + Invite member
                </button>
              )}
            </div>

            {isInviting && (
              <form onSubmit={handleInvite} className="mb-6 rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Email</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="w-full rounded-lg border border-border bg-bg px-3.5 py-2 text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as MembershipRole)}
                      className="rounded-lg border border-border bg-bg px-3.5 py-2 text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button type="submit" className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                    Send invite
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsInviting(false); setInviteLink(null); setInviteError(null); }}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover"
                  >
                    Cancel
                  </button>
                </div>

                <p className="mt-2 text-xs text-text-secondary">
                  <strong>Owner</strong> manages the whole workspace. <strong>Admin</strong> can invite/remove members and manage boards. <strong>Member</strong> can view and work on boards but can't manage people or settings.
                </p>

                {inviteError && (
                  <div className="mt-3 rounded-lg bg-danger/10 border border-danger/20 px-3.5 py-2 text-sm text-danger">{inviteError}</div>
                )}

                {inviteLink && (
                  <div className="mt-3 rounded-lg bg-success/10 border border-success/20 px-3.5 py-2.5 text-sm text-text-primary">
                    Invite created. Share this link with them to join:
                    <div className="mt-1.5 break-all rounded bg-bg px-2.5 py-1.5 font-mono text-xs text-brand-violet">
                      {inviteLink}
                    </div>
                  </div>
                )}
              </form>
            )}

            {membersLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-violet border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                {members?.map((m, i) => {
                  const isSelf = m.user.id === user?.id;
                  const canModifyThisMember = canManage && m.role !== 'owner' && !isSelf;

                  return (
                    <div
                      key={m.membershipId}
                      className={`flex items-center justify-between gap-3 px-5 py-3.5 ${i !== 0 ? 'border-t border-border' : ''}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text-primary">{m.user.name}</p>
                        <p className="text-sm text-text-secondary">{m.user.email}</p>
                      </div>

                      {canModifyThisMember ? (
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <select
                            value={m.role}
                            onChange={(e) => handleRoleChange(m.user.id, e.target.value as MembershipRole)}
                            className="rounded-lg border border-border bg-bg px-2 py-1 text-xs text-text-primary outline-none focus:border-brand-violet"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleRemoveMember(m.user.id, m.user.name)}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <span className="flex-shrink-0 rounded-full bg-surface-hover px-3 py-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
                          {m.role}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {tab === 'activity' && (
          <div>
            <h1 className="mb-6 font-display text-xl font-bold text-text-primary">Activity</h1>
            {activityLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-violet border-t-transparent" />
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                {activity.map((a, i) => (
                  <div
                    key={a._id}
                    className={`flex items-start gap-3 px-5 py-3.5 ${i !== 0 ? 'border-t border-border' : ''}`}
                  >
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-semibold text-white">
                      {a.actor.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">{a.description}</p>
                      <p className="text-xs text-text-secondary">
                        {new Date(a.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface/50 py-16 text-center">
                <p className="text-text-secondary">No activity yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
