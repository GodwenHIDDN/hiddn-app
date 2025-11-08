import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineRight } from 'react-icons/ai';

const GENDERS = ['Damen', 'Herren', 'Kinder'] as const;

const CATEGORIES: { key: string; label: string; to: string }[] = [
  { key: 'new', label: 'New Drops', to: '/products?sort=new' },
  { key: 'top', label: 'Top Picks', to: '/products?sort=top' },
  { key: 'styles', label: 'Styles', to: '/products?group=styles' },
  // Track Suits above Sneakers & Shoes
  { key: 'tracksuits', label: 'Track Suits', to: '/products?cat=tracksuits' },
  { key: 'shoes', label: 'Sneakers & Shoes', to: '/products?cat=shoes' },
  { key: 'accessories', label: 'Accessories', to: '/products?cat=accessories' },
  { key: 'jewels', label: 'Jewels & Watches', to: '/products?cat=jewels-watches' },
  { key: 'bags', label: 'Bags & Gear', to: '/products?cat=bags' },
  { key: 'eyewear', label: 'Eyewear', to: '/products?cat=eyewear' },
  { key: 'outer', label: 'Outerwear', to: '/products?cat=outerwear' },
  { key: 'tops', label: 'Tops & Hoodies', to: '/products?cat=tops-hoodies' },
  { key: 'bottoms', label: 'Bottoms & Pants', to: '/products?cat=bottoms-pants' }
];

export default function Categories() {
  const [gender, setGender] = useState<typeof GENDERS[number]>('Damen');
  return (
    <main className="mx-auto max-w-md" style={{ color: 'var(--text)' }}>
      {/* Gender tabs: big like search, slightly smaller, boxed with top & bottom borders */}
      <div className="z-10" style={{ backgroundColor: 'var(--header)' }}>
        <div className="px-4">
          <div className="relative w-full rounded-[24px]" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', backgroundColor: 'transparent' }}>
            <div className="grid grid-cols-3 text-center font-semibold relative" style={{ height: '44px' }}>
              {GENDERS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className="relative select-none"
                  style={{ color: 'var(--text)', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                  aria-current={gender === g ? 'page' : undefined}
                >
                  <span className="inline-block font-display" style={{ lineHeight: '44px', fontSize: '15px' }}>{g}</span>
                </button>
              ))}
              {/* sliding thin blue underline */}
              <span
                className="pointer-events-none absolute bottom-0 h-[2px] rounded-full"
                style={{
                  width: '33.3333%',
                  left: 0,
                  transform: `translateX(${GENDERS.indexOf(gender) * 100}%)`,
                  transition: 'transform 220ms ease',
                  backgroundColor: '#3b82f6'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Theme-aware banner above list */}
      <section className="px-4 mt-4">
        <div
          className="rounded-2xl p-5 shadow-md"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--card) 60%, #8b5cf6) 0%, color-mix(in srgb, var(--card) 60%, #22c55e) 55%, var(--card) 100%)',
            border: '1px solid var(--border)',
            color: 'var(--text)'
          }}
        >
          <div className="text-[11px] uppercase tracking-wide opacity-80">Designed by Godwen Kaiser</div>
          <div className="font-display text-2xl mt-1">Kategorien entdecken</div>
          <div className="text-sm opacity-90 mt-1">Track Suits, Sneaker & mehr</div>
        </div>
      </section>

      {/* Category list */}
      <ul className="mt-6 space-y-6 px-4" style={{ listStyleType: 'none', paddingLeft: 0, margin: 0 }}>
        {CATEGORIES.map((c) => (
          <li key={c.key} className="first:mt-0">
            <Link to={c.to} className="block" style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
              <div
                className="flex items-center justify-between rounded-2xl px-5 mx-auto w-full pressable"
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  height: '80px',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
                  position: 'relative'
                }}
              >
                {/* left chevron removed per request */}
                <div className="flex items-center flex-1 pr-4 text-left" style={{ paddingLeft: 'calc(44px - 1.5%)' }}>
                  <span className="block text-[15px] font-extrabold tracking-wide uppercase" style={{ color: 'var(--text)' }}>
                    {c.label}
                  </span>
                </div>
                <AiOutlineRight aria-hidden className="absolute" size={26}
                  style={{ color: 'var(--text)', right: '10%', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
