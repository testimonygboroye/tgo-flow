import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '../store/theme.store';

describe('theme store', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('toggles from light to dark and updates the document class', () => {
    useThemeStore.getState().setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('persists the chosen theme to localStorage', () => {
    useThemeStore.getState().setTheme('dark');
    expect(localStorage.getItem('tgo-flow-theme')).toBe('dark');
  });

  it('toggles back to light correctly', () => {
    useThemeStore.getState().setTheme('dark');
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
