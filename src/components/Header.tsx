import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdSearch } from 'react-icons/md';
import { AiOutlineLeft, AiOutlineBell } from 'react-icons/ai';
import { useEffect, useState } from 'react';
import Logo from './Logo';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const showSearch = pathname === '/' || pathname.startsWith('/categories');
  const ROOTS = ['/', '/categories', '/favorites', '/cart', '/account'];
  const showBack = !ROOTS.includes(pathname);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [packBadge, setPackBadge] = useState<string | null>(null);

  useEffect(() => {
    const KEY = 'hiddn_creator_pack';
    function leftDays(ts: number) {
      const d = Math.max(0, ts - Date.now());
      return Math.ceil(d / (24 * 3600 * 1000));
    }
    const read = () => {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) { setPackBadge(null); return; }
        const obj = JSON.parse(raw) as { id: 'free'|'boost'|'premium'|'topbrand'|'partner'; expiresAt: number };
        const map: Record<string,string> = { free:'FREE', boost:'⚡ Boost', premium:'👑 Premium', topbrand:'✨ Top', partner:'⭐ Partner' };
        const days = leftDays(obj.expiresAt);
        setPackBadge(`${map[obj.id] || 'Pack'}${obj.id==='free' ? '' : ` · ${days}T`}`);
      } catch { setPackBadge(null); }
    };
    read();
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) read(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
        backgroundColor: 'var(--nav-bg)',
        color: 'var(--text)',
        WebkitBackdropFilter: 'saturate(140%) blur(10px)',
        backdropFilter: 'saturate(140%) blur(10px)',
        borderColor: 'var(--border)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.06)'
      }}
    >
      <div className="max-w-md mx-auto px-5 pb-2" style={{ color: 'var(--text)', position: 'relative' }}>
        <div className="flex items-center justify-between" style={{ position: 'relative' }}>
          {/* Left: HIDDN wordmark (clickable) */}
          {showBack ? (
            <button
              aria-label="Zurück"
              onClick={() => navigate(-1)}
              className="shrink-0"
              style={{
                color: 'var(--text)',
                width: 44,
                height: 44,
                display: 'grid',
                placeItems: 'center',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <AiOutlineLeft className="text-3xl" />
            </button>
          ) : (
            <Link to="/" aria-label="HIDDN Home" className="shrink-0" style={{ color: 'var(--text)' }}>
              <Logo className="w-24 h-6" />
            </Link>
          )}
          {/* Right: Notifications bell */}
          <button
            aria-label="Benachrichtigungen"
            onClick={() => navigate('/notifications')}
            className="shrink-0"
            style={{
              color: 'var(--text)',
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            <AiOutlineBell className="text-2xl" />
          </button>
          <div
            aria-hidden
            style={{
              position: 'absolute',
              right: 56,
              top: 6,
              padding: '6px 10px',
              borderRadius: 9999,
              fontSize: 11,
              lineHeight: '12px',
              letterSpacing: 0.3,
              color: 'var(--text)',
              border: '1px solid var(--border)',
              background: 'color-mix(in srgb, var(--card) 85%, rgba(139,92,246,0.25))'
            }}
          >
            Designed by Godwen Kaiser
          </div>
        </div>
        {/* Center: Designed-by above a pill search bar */}
        {/* Active package badge */}
        {packBadge && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              right: 56,
              top: 38,
              padding: '6px 10px',
              borderRadius: 9999,
              fontSize: 11,
              lineHeight: '12px',
              letterSpacing: 0.3,
              color: 'var(--text)',
              border: '1px solid var(--border)',
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--card) 65%, #facc15) 0%, color-mix(in srgb, var(--card) 65%, #fde68a) 100%)'
            }}
          >
            {packBadge}
          </div>
        )}
        {showSearch && (
          <div className="relative mx-auto" style={{ marginTop: 8, width: '100%', maxWidth: 560 }}>
            <div className="text-center" style={{ marginTop: 10 }}>
              <div
                className={`inline-flex items-center justify-center header-search ${focused || query ? 'is-focused' : ''}`}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 28,
                  padding: focused ? '12px 20px' : '11px 20px',
                  transition: 'all 160ms ease',
                  width: '100%',
                  maxWidth: 560,
                  backgroundColor: 'var(--input-bg)'
                }}
              >
                <MdSearch className="text-2xl" style={{ color: 'var(--placeholder)', marginRight: 10, transform: focused || query ? 'translateX(2px)' : 'translateX(0)', transition: 'transform 160ms ease' }} />
                <input
                  type="text"
                  placeholder="Suche"
                  className="focus:outline-none"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text)',
                    width: '100%',
                    fontSize: 16
                  }}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
