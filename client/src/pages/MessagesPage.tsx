import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listReviewsRequest, markReviewReadRequest, deleteReviewRequest } from '../services/review.service';
import { useAuthStore } from '../store/auth.store';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';

const OWNER_EMAIL = 'testimonygboroye.dev@gmail.com';

export function MessagesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: listReviewsRequest,
    enabled: user?.email === OWNER_EMAIL,
  });

  if (user && user.email !== OWNER_EMAIL) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleToggleRead(reviewId: string, currentIsRead: boolean) {
    await markReviewReadRequest(reviewId, !currentIsRead);
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
  }

  async function handleDelete(reviewId: string) {
    if (!confirm('Delete this message permanently?')) return;
    await deleteReviewRequest(reviewId);
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
  }

  const filteredReviews = (reviews || []).filter((r) => {
    if (filter === 'unread') return !r.isRead;
    if (filter === 'read') return r.isRead;
    return true;
  });

  const unreadCount = (reviews || []).filter((r) => !r.isRead).length;

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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Messages {unreadCount > 0 && <span className="text-brand-violet">({unreadCount} unread)</span>}
          </h1>
        </div>

        <div className="mb-6 flex gap-2">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition ${
                filter === f ? 'bg-brand-violet text-white' : 'bg-surface-hover text-text-secondary hover:text-text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-violet border-t-transparent" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 py-16 text-center">
            <p className="text-text-secondary">No messages here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredReviews.map((review) => (
              <div
                key={review._id}
                className={`rounded-xl border p-5 ${
                  review.isRead ? 'border-border bg-surface' : 'border-brand-violet/40 bg-brand-violet/5'
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-text-primary">
                      {review.reviewerName}
                      {review.reviewerRole && (
                        <span className="ml-2 text-xs font-normal text-text-secondary">({review.reviewerRole})</span>
                      )}
                    </p>
                    <p className="text-xs text-text-secondary">{review.reviewerEmail}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-text-secondary">
                    {new Date(review.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-sm text-text-primary">{review.message}</p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleToggleRead(review._id, review.isRead)}
                    className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-text-primary hover:bg-surface-hover"
                  >
                    Mark as {review.isRead ? 'unread' : 'read'}
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="rounded-lg border border-danger/30 px-3 py-1 text-xs font-medium text-danger hover:bg-danger/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
