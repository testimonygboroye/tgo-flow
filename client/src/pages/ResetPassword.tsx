import { useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPasswordRequest } from '../services/auth.service';
import { PasswordInput } from '../components/PasswordInput';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import axios from 'axios';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('This reset link is invalid or missing a token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordRequest(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo className="h-12 w-12" />
          <h1 className="font-display text-2xl font-bold text-text-primary">TGO Flow</h1>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8 shadow-xl shadow-black/5">
          {success ? (
            <>
              <h2 className="font-display text-xl font-semibold text-text-primary">Password reset! 🎉</h2>
              <p className="mt-2 text-sm text-text-secondary">Redirecting you to login...</p>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold text-text-primary">Choose a new password</h2>
              <p className="mt-1 text-sm text-text-secondary">Make it something you haven't used before.</p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <PasswordInput
                  id="password"
                  label="New password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters, with a number"
                />

                <PasswordInput
                  id="confirmPassword"
                  label="Confirm new password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                />

                {error && (
                  <div className="rounded-lg bg-danger/10 border border-danger/20 px-3.5 py-2.5 text-sm text-danger">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 rounded-lg bg-brand-gradient px-4 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Resetting...' : 'Reset password'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link to="/login" className="font-medium text-brand-violet hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
