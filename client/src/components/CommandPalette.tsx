import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/theme.store';
import { useAuthStore } from '../store/auth.store';
import { logoutRequest } from '../services/auth.service';

interface Command {
  id: string;
  label: string;
  keywords: string;
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  const commands: Command[] = useMemo(() => {
    const base: Command[] = [
      { id: 'dashboard', label: 'Go to Dashboard', keywords: 'home workspaces', action: () => navigate('/dashboard') },
      { id: 'help', label: 'Open Help & Guide', keywords: 'guide support faq', action: () => navigate('/help') },
      { id: 'feedback', label: 'Send Feedback', keywords: 'message founder contact review', action: () => navigate('/feedback') },
      { id: 'theme', label: 'Toggle Dark / Light Mode', keywords: 'theme appearance dark light', action: toggleTheme },
    ];

    if (isLoggedIn) {
      base.push({
        id: 'logout',
        label: 'Log Out',
        keywords: 'sign out exit',
        action: async () => {
          if (!confirm('Are you sure you want to log out?')) return;
          await logoutRequest().catch(() => {});
          clearAuth();
          navigate('/login');
        },
      });
    } else {
      base.push(
        { id: 'login', label: 'Go to Login', keywords: 'sign in', action: () => navigate('/login') },
        { id: 'register', label: 'Go to Sign Up', keywords: 'register create account', action: () => navigate('/register') }
      );
    }

    return base;
  }, [isLoggedIn, navigate, toggleTheme, clearAuth]);

  const filtered = commands.filter((c) =>
    `${c.label} ${c.keywords}`.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-4 pt-24"
      onClick={() => setIsOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-border bg-surface shadow-2xl"
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command... (e.g. help, theme, logout)"
          className="w-full border-b border-border bg-transparent px-4 py-3.5 text-text-primary outline-none"
        />
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-2.5 py-4 text-center text-sm text-text-secondary">No matching commands.</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  c.action();
                  setIsOpen(false);
                }}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-text-primary hover:bg-surface-hover"
              >
                {c.label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
