import { Component } from 'react';
import type { ReactNode } from 'react';
import { Logo } from './Logo';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
          <Logo className="h-12 w-12" />
          <h1 className="font-display text-xl font-bold text-text-primary">Something went wrong</h1>
          <p className="max-w-sm text-sm text-text-secondary">
            An unexpected error occurred. Try reloading the page — if it keeps happening, please let us know.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
