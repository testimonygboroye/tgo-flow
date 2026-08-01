import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { helpArticles, searchHelpArticles } from '../data/helpArticles';
import type { HelpArticle } from '../data/helpArticles';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';

export function HelpPage() {
  const [query, setQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const results = useMemo(() => searchHelpArticles(query), [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, HelpArticle[]>();
    results.forEach((article) => {
      const list = map.get(article.category) || [];
      list.push(article);
      map.set(article.category, list);
    });
    return map;
  }, [results]);

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
        <h1 className="mb-2 font-display text-2xl font-bold text-text-primary">Help & Guide</h1>
        <p className="mb-6 text-text-secondary">
          Search for anything — try "board," "invite," "move task," or "how to..."
        </p>

        <div className="relative mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the help guide..."
            className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
          />
        </div>

        {selectedArticle ? (
          <div className="rounded-xl border border-border bg-surface p-6">
            <button
              onClick={() => setSelectedArticle(null)}
              className="mb-4 text-sm font-medium text-brand-violet hover:underline"
            >
              ← Back to all results
            </button>
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              {selectedArticle.category}
            </span>
            <h2 className="mt-1 font-display text-xl font-bold text-text-primary">{selectedArticle.title}</h2>
            <p className="mt-3 leading-relaxed text-text-primary">{selectedArticle.content}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 py-16 text-center">
            <p className="text-text-secondary">No articles found for "{query}". Try a different word.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {Array.from(grouped.entries()).map(([category, articles]) => (
              <div key={category}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  {category}
                </h3>
                <div className="flex flex-col gap-2">
                  {articles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="rounded-lg border border-border bg-surface px-4 py-3 text-left transition hover:border-brand-violet/40 hover:shadow-sm"
                    >
                      <p className="font-medium text-text-primary">{article.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-text-secondary">
          {helpArticles.length} articles available. Can't find what you need? More help is on the way.
        </p>
      </main>
    </div>
  );
}
