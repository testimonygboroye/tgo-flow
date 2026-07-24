import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
      <Logo className="h-12 w-12" />
      <h1 className="font-display text-2xl font-bold text-text-primary">Page not found</h1>
      <p className="max-w-sm text-sm text-text-secondary">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/dashboard"
        className="rounded-lg bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
