import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteAccountRequest } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import axios from 'axios';

const CONFIRM_PHRASE = 'DELETE MY ACCOUNT';

interface DeleteAccountModalProps {
  onClose: () => void;
}

export function DeleteAccountModal({ onClose }: DeleteAccountModalProps) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMatch = confirmText === CONFIRM_PHRASE;

  async function handleDelete() {
    if (!isMatch) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteAccountRequest();
      clearAuth();
      navigate('/login');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-danger/30 bg-surface p-6 shadow-2xl"
      >
        <h2 className="font-display text-lg font-bold text-danger">Delete your account?</h2>
        <p className="mt-2 text-sm text-text-secondary">
          This permanently deletes your account and cannot be undone. If you own any workspaces, you must delete
          or transfer them first.
        </p>
        <p className="mt-3 text-sm text-text-primary">
          Type <strong className="font-mono">{CONFIRM_PHRASE}</strong> below to confirm:
        </p>
        <input
          autoFocus
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 font-mono text-sm text-text-primary outline-none focus:border-danger focus:ring-1 focus:ring-danger"
          placeholder={CONFIRM_PHRASE}
        />

        {error && (
          <div className="mt-3 rounded-lg bg-danger/10 border border-danger/20 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-hover"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isMatch || isDeleting}
            className="flex-1 rounded-lg bg-danger px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {isDeleting ? 'Deleting...' : 'Delete forever'}
          </button>
        </div>
      </div>
    </div>
  );
}
