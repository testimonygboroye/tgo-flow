import { Link } from 'react-router-dom';

interface HelpButtonProps {
  publicOnly?: boolean;
}

export function HelpButton({ publicOnly }: HelpButtonProps) {
  return (
    <Link
      to={publicOnly ? '/help?public=1' : '/help'}
      title="Help & Guide"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
