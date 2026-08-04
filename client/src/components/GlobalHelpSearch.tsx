import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchHelpArticles, getPublicArticles, helpArticles } from '../data/helpArticles';

interface GlobalHelpSearchProps {
  publicOnly?: boolean;
}

export function GlobalHelpSearch({ publicOnly }: GlobalHelpSearchProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const baseArticles = publicOnly ? getPublicArticles() : helpArticles;
  const results = query.trim() ? searchHelpArticles(query, baseArticles).slice(0, 6) : [];

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function goToArticle(articleId: string) {
    setIsOpen(false);
    setQuery('');
    navigate(`/help?article=${articleId}${publicOnly ? '&public=1' : ''}`);
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <input
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search help..."
          className="w-32 rounded-full border border-border bg-surface py-1.5 pl-8 pr-2 text-xs text-text-primary outline-none transition focus:w-48 focus:border-brand-violet focus:ring-1 focus:ring-brand-violet sm:w-40 sm:focus:w-56"
        />
      </div>

      {isOpen && query.trim() && (
        <div className="absolute right-0 top-full z-20 mt-1.5 w-72 rounded-xl border border-border bg-surface py-1.5 shadow-2xl">
          {results.length === 0 ? (
            <p className="px-3.5 py-3 text-xs text-text-secondary">No articles match "{query}".</p>
          ) : (
            results.map((article) => (
              <button
                key={article.id}
                onClick={() => goToArticle(article.id)}
                className="block w-full px-3.5 py-2 text-left hover:bg-surface-hover"
              >
                <p className="text-sm text-text-primary">{article.title}</p>
                <p className="text-[10px] uppercase tracking-wide text-text-secondary">{article.category}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
