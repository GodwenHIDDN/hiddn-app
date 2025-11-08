import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AiOutlineHome, AiOutlineSearch, AiOutlineHeart, AiOutlineUser, AiOutlineCrown } from 'react-icons/ai';
import { BsBag } from 'react-icons/bs';

export default function Navbar() {
  const { pathname } = useLocation();
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
  // Expose navbar height as CSS variable for precise positioning of floating CTAs
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const setVar = () => {
      try { document.documentElement.style.setProperty('--nav-height', `${el.offsetHeight}px`); } catch {}
    };
    setVar();
    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(() => setVar());
      ro.observe(el);
    } catch {}
    const onResize = () => setVar();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro) try { ro.disconnect(); } catch {}
    };
  }, []);
  // Softer glass: slightly more opaque and a bit less blur
  const BG = isDark ? 'rgba(10,10,10,0.72)' : '#ffffff';
  const BORDER = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const BLUR = isDark ? 'saturate(140%) blur(8px)' : 'saturate(120%) blur(6px)';
  const Item = ({ to, icon: Icon, label, badge = 0 }: { to: string; icon: any; label: string; badge?: number }) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        aria-label={label}
        className={`relative flex flex-col items-center justify-center pressable ${active ? 'opacity-100' : 'opacity-85'}`}
        style={{
          color: isDark ? 'var(--text)' : '#0F172A',
          padding: '6px 10px',
          borderRadius: 12,
          background: active ? 'var(--accent-soft)' : 'transparent'
        }}
      >
        <div className="relative" style={{ lineHeight: 0 }}>
          <Icon style={{ color: active ? 'var(--accent)' : (isDark ? 'var(--text)' : '#0F172A'), fontSize: 22 }} />
          {badge > 0 && (
            <span
              className="absolute inline-flex items-center justify-center rounded-full pop"
              style={{
                top: -6,
                right: -10,
                height: 16,
                minWidth: 16,
                padding: '0 4px',
                fontSize: 10,
                fontWeight: 700,
                backgroundColor: 'var(--text)',
                color: 'var(--bg)'
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <span className={`leading-3 mt-0.5`} style={{ color: active ? 'var(--accent)' : (isDark ? 'var(--text)' : '#0F172A'), fontSize: 11, fontWeight: 600 }}>{label}</span>
      </Link>
    );
  };
  const [wishCount, setWishCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isCreator, setIsCreator] = useState<boolean>(() => {
    try { return localStorage.getItem('hiddn_role') === 'creator'; } catch { return false; }
  });
  const navRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const readCounts = () => {
      try {
        const wl = localStorage.getItem('hiddn_wishlist');
        setWishCount(wl ? (JSON.parse(wl) as any[]).length : 0);
        const cc = localStorage.getItem('hiddn_cart_count');
        setCartCount(cc ? parseInt(cc) || 0 : 0);
        setIsCreator(localStorage.getItem('hiddn_role') === 'creator');
      } catch {}
    };
    readCounts();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith('hiddn_')) readCounts();
    };
    window.addEventListener('storage', onStorage);
    const onCustom = () => readCounts();
    const onWish = () => {
      const el = navRef.current;
      if (!el) return;
      el.classList.add('nav-flash');
      setTimeout(() => el.classList.remove('nav-flash'), 360);
    };
    window.addEventListener('hiddn-update', onCustom as any);
    window.addEventListener('hiddn-wish', onWish as any);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('hiddn-update', onCustom as any);
      window.removeEventListener('hiddn-wish', onWish as any);
    };
  }, []);
  const bar = (
    <nav
      role="navigation"
      aria-label="Hauptnavigation"
      ref={navRef as any}
      className="fixed left-0 right-0 bottom-0 w-full z-40 border-t"
      style={{
        height: 'calc(56px + env(safe-area-inset-bottom))',
        minHeight: 'calc(56px + env(safe-area-inset-bottom))',
        bottom: 0,
        backgroundColor: BG,
        borderColor: BORDER,
        WebkitBackdropFilter: BLUR,
        backdropFilter: BLUR,
        display: 'grid',
        mixBlendMode: 'normal' as any,
        isolation: 'isolate' as any,
        boxShadow: isDark ? '0 -6px 18px rgba(0,0,0,0.35)' : '0 -6px 18px rgba(0,0,0,0.06)',
        willChange: 'transform',
        transform: 'translate3d(0,0,0)',
        WebkitTransform: 'translate3d(0,0,0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        contain: 'layout style paint'
      }}
    >
      <div
        className={`grid ${isCreator ? 'grid-cols-6' : 'grid-cols-5'} items-center h-full px-6 relative w-full`}
        style={{ zIndex: 1, pointerEvents: 'auto', transform: 'translateZ(0) translateY(-4px)', transformOrigin: 'center center' }}
      >
        <div className="justify-self-center"><Item to="/" icon={AiOutlineHome} label="Home" /></div>
        <div className="justify-self-center"><Item to="/categories" icon={AiOutlineSearch} label="Kategorien" /></div>
        <div className="justify-self-center"><Item to="/favorites" icon={AiOutlineHeart} label="Wish List" badge={wishCount} /></div>
        {isCreator && <div className="justify-self-center"><Item to="/creator" icon={AiOutlineCrown} label="Creator" /></div>}
        <div className="justify-self-center"><Item to="/cart" icon={BsBag} label="Warenkorb" badge={cartCount} /></div>
        <div className="justify-self-center"><Item to="/account" icon={AiOutlineUser} label="Account" /></div>
      </div>
      <span className="sr-only">Tabbar</span>
    </nav>
  );
  return typeof document !== 'undefined' ? createPortal(bar, document.body) : bar;
}
