import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../services/auth.service';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await forgotPasswordRequest(email);
      setSubmitted(true);
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
          {submitted ? (
            <>
              <h2 className="font-display text-xl font-semibold text-text-primary">Check your email</h2>
              <p className="mt-2 text-sm text-text-secondary">
                If an account exists for <strong>{email}</strong>, we've sent a link to reset your password. It expires in 1 hour.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold text-text-primary">Forgot your password?</h2>
              <p className="mt-1 text-sm text-text-secondary">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 rounded-lg bg-brand-gradient px-4 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send reset link'}
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
