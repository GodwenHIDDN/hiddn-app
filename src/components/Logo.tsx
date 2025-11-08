import { useEffect, useState } from 'react';

export default function Logo({ className = "w-28 h-8" }: { className?: string }) {
  const [isDark, setIsDark] = useState<boolean>(() => (
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  ));
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsDark((e as MediaQueryListEvent).matches ?? (e as MediaQueryList).matches);
    if (mql.addEventListener) mql.addEventListener('change', onChange as (e: MediaQueryListEvent) => void);
    else mql.addListener(onChange as (this: MediaQueryList, ev: MediaQueryListEvent) => any);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange as (e: MediaQueryListEvent) => void);
      else mql.removeListener(onChange as (this: MediaQueryList, ev: MediaQueryListEvent) => any);
    };
  }, []);

  const ACCENT = isDark ? '#6D28D9' : '#2563EB';

  return (
    <svg
      className={`${className} block`}
      viewBox="0 0 240 44"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="HIDDN"
    >
      <defs>
        <linearGradient id="hiddn-accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={ACCENT} stopOpacity={0.95} />
          <stop offset="100%" stopColor={ACCENT} stopOpacity={0.6} />
        </linearGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
        </filter>
      </defs>

      {/* Symbol: Spotlight (Creator im Rampenlicht) */}
      <g transform="translate(5,2)">
        {/* Light cone */}
        <path d="M6 30 L22 6 L28 6 L12 30 Z" fill="url(#hiddn-accent)" opacity="0.9" filter="url(#soft)" />
        {/* Creator dot */}
        <circle cx="12" cy="32" r="3" fill={ACCENT} />
      </g>

      {/* Wordmark HIDDN in currentColor (passt sich Textfarbe an) */}
      <g fill="currentColor" transform="translate(48,4)">
        {/* H */}
        <rect x="0" y="2" width="8" height="32" rx="2" />
        <rect x="24" y="2" width="8" height="32" rx="2" />
        <rect x="10" y="16" width="12" height="6" rx="3" />
        {/* I */}
        <rect x="40" y="2" width="6" height="32" rx="3" />
        {/* D */}
        <path d="M54 2 h10 c10 0 16 6 16 16 s-6 16 -16 16 h-10 z M64 8 c6 0 10 4 10 10 s-4 10 -10 10 h-4 V8z" />
        {/* D */}
        <path d="M86 2 h10 c10 0 16 6 16 16 s-6 16 -16 16 h-10 z M96 8 c6 0 10 4 10 10 s-4 10 -10 10 h-4 V8z" />
        {/* N */}
        <path d="M118 2 v32 h8 V20 l14 14 h6 V2 h-8 v18 l-14 -18 h-6z" />
      </g>

      {/* Accent underline */}
      <rect x="48" y="38" width="152" height="2" rx="1" fill="url(#hiddn-accent)" />
    </svg>
  );
}
