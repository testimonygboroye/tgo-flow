import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { submitReviewRequest } from '../services/review.service';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import axios from 'axios';

export function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await submitReviewRequest(name, email, role, message);
      setSubmitted(true);
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
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo className="h-12 w-12" />
          <h1 className="font-display text-2xl font-bold text-text-primary">TGO Flow</h1>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8 shadow-xl shadow-black/5">
          {submitted ? (
            <>
              <h2 className="font-display text-xl font-semibold text-text-primary">Thank you! 🙏</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Your feedback has been sent. We really appreciate you taking the time to share it.
              </p>
              <Link
                to="/dashboard"
                className="mt-5 inline-block w-full rounded-lg bg-brand-gradient px-4 py-2.5 text-center font-medium text-white transition hover:opacity-90"
              >
                Back to dashboard
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold text-text-primary">Message the founder</h2>
              <p className="mt-1 text-sm text-text-secondary">
                This message goes directly to Testimony Oluwatimilehin Gboroye, the founder of TGO DevStudio.
                Share suggestions, things you liked, things you didn't, or any other feedback about TGO Flow.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Your name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Your email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    Your role (optional)
                  </label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
                    placeholder="e.g. Tester, Developer, Client"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Your feedback</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
                    placeholder="Write your message to the founder here — feedback, suggestions, or anything else..."
                  />
                </div>

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
                  {isSubmitting ? 'Sending...' : 'Send feedback'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
