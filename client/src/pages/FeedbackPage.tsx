import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { submitReviewRequest } from '../services/review.service';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import axios from 'axios';

interface FieldState {
  value: string;
  touched: boolean;
}

function validateName(value: string): string | null {
  if (value.trim().length < 2) return 'Please enter at least 2 characters.';
  return null;
}

function validateEmail(value: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
  return null;
}

function validateMessage(value: string): string | null {
  if (value.trim().length < 10) return 'Your message should be at least 10 characters.';
  return null;
}

export function FeedbackPage() {
  const [name, setName] = useState<FieldState>({ value: '', touched: false });
  const [email, setEmail] = useState<FieldState>({ value: '', touched: false });
  const [role, setRole] = useState('');
  const [message, setMessage] = useState<FieldState>({ value: '', touched: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const nameError = name.touched ? validateName(name.value) : null;
  const emailError = email.touched ? validateEmail(email.value) : null;
  const messageError = message.touched ? validateMessage(message.value) : null;

  const isFormValid =
    validateName(name.value) === null &&
    validateEmail(email.value) === null &&
    validateMessage(message.value) === null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setName((s) => ({ ...s, touched: true }));
    setEmail((s) => ({ ...s, touched: true }));
    setMessage((s) => ({ ...s, touched: true }));

    if (!isFormValid) return;

    setServerError(null);
    setIsSubmitting(true);
    try {
      await submitReviewRequest(name.value.trim(), email.value.trim(), role.trim(), message.value.trim());
      setSubmitted(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function fieldClasses(hasError: boolean) {
    return `w-full rounded-lg border bg-bg px-3.5 py-2.5 text-text-primary outline-none transition focus:ring-1 ${
      hasError
        ? 'border-danger focus:border-danger focus:ring-danger'
        : 'border-border focus:border-brand-violet focus:ring-brand-violet'
    }`;
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

              <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Your name</label>
                  <input
                    value={name.value}
                    onChange={(e) => setName({ value: e.target.value, touched: name.touched })}
                    onBlur={() => setName((s) => ({ ...s, touched: true }))}
                    className={fieldClasses(!!nameError)}
                    placeholder="Jane Doe"
                  />
                  {nameError && <p className="mt-1 text-xs text-danger">{nameError}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Your email</label>
                  <input
                    type="email"
                    value={email.value}
                    onChange={(e) => setEmail({ value: e.target.value, touched: email.touched })}
                    onBlur={() => setEmail((s) => ({ ...s, touched: true }))}
                    className={fieldClasses(!!emailError)}
                    placeholder="you@example.com"
                  />
                  {emailError && <p className="mt-1 text-xs text-danger">{emailError}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    Your role (optional)
                  </label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={fieldClasses(false)}
                    placeholder="e.g. Tester, Developer, Client"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Your feedback</label>
                  <textarea
                    rows={5}
                    value={message.value}
                    onChange={(e) => setMessage({ value: e.target.value, touched: message.touched })}
                    onBlur={() => setMessage((s) => ({ ...s, touched: true }))}
                    className={fieldClasses(!!messageError)}
                    placeholder="Write your message to the founder here — feedback, suggestions, or anything else..."
                  />
                  {messageError && <p className="mt-1 text-xs text-danger">{messageError}</p>}
                </div>

                {serverError && (
                  <div className="rounded-lg bg-danger/10 border border-danger/20 px-3.5 py-2.5 text-sm text-danger">
                    {serverError}
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
