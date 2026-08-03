import { Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listAnalyticsRequest } from '../services/analytics.service';
import { useAuthStore } from '../store/auth.store';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';

const OWNER_EMAIL = 'testimonygboroye.dev@gmail.com';

const EVENT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  register: { label: 'Created an account', icon: '🆕', color: 'text-brand-violet' },
  login: { label: 'Logged in', icon: '🔓', color: 'text-success' },
  logout: { label: 'Logged out', icon: '🔒', color: 'text-text-secondary' },
  app_return: { label: 'Returned to the app', icon: '🔁', color: 'text-brand-cyan' },
  account_deleted: { label: 'Deleted their account', icon: '🗑️', color: 'text-danger' },
};

export function AnalyticsPage() {
  const { user } = useAuthStore();

  const { data: events, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: listAnalyticsRequest,
    enabled: user?.email === OWNER_EMAIL,
  });

  if (user && user.email !== OWNER_EMAIL) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <Logo className="h-7 w-7" />
            <span className="font-display text-lg font-bold text-text-primary">TGO Flow</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-2 font-display text-2xl font-bold text-text-primary">User Activity Analytics</h1>
        <p className="mb-6 text-sm text-text-secondary">
          Account creation, logins, logouts, and app-return activity across all users — owner only.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-violet border-t-transparent" />
          </div>
        ) : !events || events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 py-16 text-center">
            <p className="text-text-secondary">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            {events.map((event, i) => {
              const meta = EVENT_LABELS[event.eventType] || { label: event.eventType, icon: '•', color: 'text-text-primary' };
              return (
                <div
                  key={event._id}
                  className={`flex items-center justify-between gap-3 px-5 py-3.5 ${i !== 0 ? 'border-t border-border' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{meta.icon}</span>
                    <div>
                      <p className="text-sm text-text-primary">
                        <span className="font-medium">{event.userName}</span>{' '}
                        <span className={meta.color}>{meta.label}</span>
                      </p>
                      <p className="text-xs text-text-secondary">{event.userEmail}</p>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-xs text-text-secondary">
                    {new Date(event.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
