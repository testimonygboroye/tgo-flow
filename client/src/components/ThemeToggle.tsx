import { useThemeStore } from '../store/theme.store';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="relative flex h-9 w-16 items-center rounded-full bg-surface-hover border border-border px-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-white text-xs transition-transform duration-300 ${
          theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {theme === 'dark' ? '🌙' : '☀'}
      </span>
    </button>
  );
}
