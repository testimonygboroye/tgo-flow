import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { acceptInviteRequest } from '../services/workspace.service';
import { useAuthStore } from '../store/auth.store';
import { Logo } from '../components/Logo';
import axios from 'axios';

export function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { accessToken, isInitialized } = useAuthStore();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;

    if (!accessToken) {
      navigate(`/login?redirect=/invites/accept?token=${token}`);
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('This invite link is missing a token.');
      return;
    }

    acceptInviteRequest(token)
      .then((workspace) => {
        setStatus('success');
        setWorkspaceId(workspace._id);
      })
      .catch((err) => {
        setStatus('error');
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setMessage(err.response.data.message);
        } else {
          setMessage('This invite could not be accepted. It may be invalid or expired.');
        }
      });
  }, [isInitialized, accessToken, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Logo className="h-12 w-12" />
          <h1 className="font-display text-2xl font-bold text-text-primary">TGO Flow</h1>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8 shadow-xl shadow-black/5">
          {status === 'pending' && (
            <>
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brand-violet border-t-transparent" />
              <p className="text-text-secondary">Joining workspace...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h2 className="font-display text-xl font-semibold text-text-primary">You're in! 🎉</h2>
              <p className="mt-2 text-sm text-text-secondary">You've successfully joined the workspace.</p>
              <button
                onClick={() => navigate(`/workspaces/${workspaceId}`)}
                className="mt-5 w-full rounded-lg bg-brand-gradient px-4 py-2.5 font-medium text-white transition hover:opacity-90"
              >
                Go to workspace
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <h2 className="font-display text-xl font-semibold text-danger">Invite issue</h2>
              <p className="mt-2 text-sm text-text-secondary">{message}</p>
              <Link
                to="/dashboard"
                className="mt-5 inline-block w-full rounded-lg border border-border px-4 py-2.5 font-medium text-text-primary transition hover:bg-surface-hover"
              >
                Go to dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
