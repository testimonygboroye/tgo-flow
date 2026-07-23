import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerRequest } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { Logo } from '../components/Logo';
import { PasswordInput } from '../components/PasswordInput';
import { ThemeToggle } from '../components/ThemeToggle';
import axios from 'axios';

export function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await registerRequest(name, email, password);
      setAuth(result.user, result.accessToken);
      navigate('/dashboard');
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
          <h2 className="font-display text-xl font-semibold text-text-primary">Create your account</h2>
          <p className="mt-1 text-sm text-text-secondary">Start organizing your team's work in minutes.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text-primary">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-text-primary outline-none transition focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-primary">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-text-primary outline-none transition focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
                placeholder="you@example.com"
              />
            </div>

            <PasswordInput
              id="password"
              label="Password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters, with a number"
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
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-violet hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
