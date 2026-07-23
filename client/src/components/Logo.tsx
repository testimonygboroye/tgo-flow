interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-8 w-8' }: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <path d="M50 8 L88 28 L50 48 L12 28 Z" fill="url(#logoGradient)" />
      <path d="M12 28 L50 48 L50 92 L12 72 Z" fill="url(#logoGradient)" opacity="0.85" />
      <path d="M88 28 L50 48 L50 92 L88 72 Z" fill="url(#logoGradient)" opacity="0.7" />
    </svg>
  );
}
