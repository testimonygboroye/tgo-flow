import { useState } from 'react';
import type { FormEvent } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listWorkspacesRequest, createWorkspaceRequest } from '../services/workspace.service';
import { logoutRequest } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { HelpButton } from '../components/HelpButton';
import { DeleteAccountModal } from '../components/DeleteAccountModal';
import { WelcomePopup } from '../components/WelcomePopup';

export function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, clearAuth } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: memberships, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: listWorkspacesRequest,
  });

  async function handleCreateWorkspace(e: FormEvent) {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createWorkspaceRequest(newWorkspaceName.trim());
      setNewWorkspaceName('');
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    } catch {
      setError('Could not create workspace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    if (!confirm('Are you sure you want to log out?')) return;
    await logoutRequest().catch(() => {});
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-bg">
      <WelcomePopup />
      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Logo className="h-7 w-7" />
            <span className="font-display text-lg font-bold text-text-primary">TGO Flow</span>
          </div>
          <div className="flex items-center gap-4">
            <HelpButton />
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary hidden sm:inline">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
              >
                Log out
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-danger transition hover:bg-danger/10"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">Your workspaces</h1>
            <p className="mt-1 text-sm text-text-secondary">Pick a workspace to continue, or create a new one.</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            + New workspace
          </button>
        </div>

        {isCreating && (
          <form
            onSubmit={handleCreateWorkspace}
            className="mb-8 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center"
          >
            <input
              autoFocus
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Workspace name (e.g. Bella's Bakery)"
              className="w-full min-w-0 flex-1 rounded-lg border border-border bg-bg px-3.5 py-2 text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 sm:flex-none"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewWorkspaceName('');
                }}
                className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover sm:flex-none"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-danger/10 border border-danger/20 px-4 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-violet border-t-transparent" />
          </div>
        ) : memberships && memberships.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memberships.map(({ workspace, role }) => (
              <button
                key={workspace._id}
                onClick={() => navigate(`/workspaces/${workspace._id}`)}
                className="group rounded-xl border border-border bg-surface p-5 text-left transition hover:border-brand-violet/40 hover:shadow-lg hover:shadow-brand-violet/5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient font-display text-lg font-bold text-white">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-display font-semibold text-text-primary group-hover:text-brand-violet transition">
                  {workspace.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-text-secondary">{role}</span>
                  <span className="text-xs text-text-secondary" title={new Date(workspace.createdAt).toLocaleString()}>
                    · {formatDistanceToNow(new Date(workspace.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 py-16 text-center">
            <p className="text-text-secondary">No workspaces yet. Create your first one to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}
