import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';

type CartItem = { product_id: string; qty: number; size?: string };

type CartData = { items: CartItem[] };

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetIndex, setSheetIndex] = useState<number | null>(null);
  const [navH, setNavH] = useState<number>(56);
  const [navGlass, setNavGlass] = useState<{ bg?: string; border?: string; blur?: string }>({});

  useEffect(() => {
    const readLocal = () => {
      try {
        const pk = 'hiddn_cart_pending';
        const raw = localStorage.getItem(pk);
        const pending: CartItem[] = raw ? JSON.parse(raw) : [];
        setCart({ items: pending });
      } catch { setCart({ items: [] }); }
      setLoading(false);
    };
    readLocal();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'hiddn_cart_pending' || e.key === 'hiddn_cart_count' || e.key.startsWith('hiddn_')) readLocal();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('hiddn-update', readLocal as any);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('hiddn-update', readLocal as any);
    };
  }, []);

  // Mirror navbar height and glass to position the checkout portal seamlessly
  useEffect(() => {
    const nav = document.querySelector('nav[aria-label="Hauptnavigation"]') as HTMLElement | null;
    const read = () => {
      const n = document.querySelector('nav[aria-label="Hauptnavigation"]') as HTMLElement | null;
      if (!n) return;
      setNavH(n.offsetHeight || 56);
      try {
        const s = (n as HTMLElement).style as CSSStyleDeclaration & { WebkitBackdropFilter?: string };
        setNavGlass({ bg: s.backgroundColor || undefined, border: s.borderColor || undefined, blur: (s.backdropFilter || (s as any).WebkitBackdropFilter) || undefined });
      } catch {}
    };
    read();
    let ro: ResizeObserver | null = null;
    if (nav && 'ResizeObserver' in window) {
      try { ro = new ResizeObserver(read); ro.observe(nav); } catch {}
    }
    window.addEventListener('resize', read);
    window.addEventListener('hiddn-update', read as any);
    return () => {
      window.removeEventListener('resize', read);
      window.removeEventListener('hiddn-update', read as any);
      if (ro) try { ro.disconnect(); } catch {}
    };
  }, []);

  const isEmpty = !loading && (!cart || !cart.items || cart.items.length === 0);
  const totalCents = useMemo(() => (cart?.items || []).reduce((acc, _it, i) => acc + getPriceCents(i) * (_it.qty || 1), 0), [cart]);

  function openSheet(i: number) {
    setSheetIndex(i);
    setSheetOpen(true);
  }
  function closeSheet() { setSheetOpen(false); }

  function removeAt(i: number) {
    setCart((c) => {
      if (!c) return c;
      const next = { ...c, items: c.items.filter((_, idx) => idx !== i) };
      return next;
    });
    try {
      const pk = 'hiddn_cart_pending';
      const raw = localStorage.getItem(pk);
      if (raw) {
        const arr = JSON.parse(raw).filter((_: any, idx: number) => idx !== i);
        localStorage.setItem(pk, JSON.stringify(arr));
      }
    } catch {}
    setSheetOpen(false);
  }

  function toFavorites(i: number) {
    const it = cart?.items?.[i];
    if (!it) return;
    try {
      const key = 'hiddn_wishlist';
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      if (!list.find((x: any) => x.id === it.product_id)) list.push({ id: it.product_id, title: it.product_id, price_cents: getPriceCents(i), image_url: `https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop` });
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new Event('hiddn-wish'));
      window.dispatchEvent(new Event('hiddn-update'));
    } catch {}
    setSheetOpen(false);
  }

  function viewProduct(i: number) {
    const it = cart?.items?.[i];
    if (!it) return;
    navigate(`/products/${encodeURIComponent(it.product_id)}`);
  }

  function getPriceCents(index: number) {
    // simple deterministic demo pricing
    return 2999 + (index % 4) * 700; // 29.99€, 36.99€, 43.99€, 50.99€
  }

  function updateQtyAt(index: number, delta: number) {
    setCart((prev) => {
      if (!prev) return prev;
      const copy = { ...prev, items: prev.items.map((it, i) => ({ ...it })) };
      const next = Math.max(1, (copy.items[index].qty || 1) + delta);
      copy.items[index].qty = next;
      return copy;
    });
    // persist to localStorage
    try {
      const pk = 'hiddn_cart_pending';
      const raw = localStorage.getItem(pk);
      const arr: CartItem[] = raw ? JSON.parse(raw) : [];
      if (arr[index]) { arr[index].qty = Math.max(1, (arr[index].qty || 1) + delta); }
      localStorage.setItem(pk, JSON.stringify(arr));
    } catch {}
  }

  return (
    <main className="max-w-md mx-auto p-5 pb-24" style={{ paddingBottom: `calc(${navH}px + 96px + env(safe-area-inset-bottom))` }}>
      <h1 className="font-display text-2xl mb-2" style={{ color: 'var(--text)' }}>Warenkorb</h1>
      {loading && <p className="opacity-80" style={{ color: 'var(--text)' }}>Warenkorb lädt…</p>}
      {isEmpty && (
        <section className="rounded-2xl border shadow" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header)' }}>
          <div className="px-5 py-10 grid place-items-center text-center">
            {/* abstract accents + clear shopping bag */}
            <svg width="260" height="120" viewBox="0 0 260 120" aria-hidden className="mb-4">
              {/* abstract shapes on the left */}
              <circle cx="20" cy="92" r="8" fill="#f59e0b" />
              <circle cx="42" cy="92" r="8" fill="#f59e0b" />
              <rect x="58" y="78" width="44" height="22" rx="7" fill="#fde047" />
              {/* accent arrow toward the bag */}
              <path d="M112 60 L150 60" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" />
              <path d="M140 48 L160 60 L140 72" fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              {/* clear shopping bag on the right */}
              <g fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
                <rect x="168" y="32" width="74" height="70" rx="10" />
                <path d="M176 34 c0 -18 12 -30 28 -30 s28 12 28 30" />
              </g>
            </svg>
            <p className="font-display text-lg" style={{ color: 'var(--text)' }}>Dein Warenkorb ist leer.</p>
            <div className="mt-3">
              <Link to="/products" className="px-5 py-3 rounded-md text-sm font-semibold pressable" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}>Lass dich inspirieren</Link>
            </div>
          </div>
        </section>
      )}
      {isEmpty && (
        <section className="mt-6">
          <div className="flex items-end justify-between mb-1">
            <div>
              <h2 className="font-display text-xl" style={{ color: 'var(--text)' }}>Das könnte dir gefallen</h2>
              <div className="text-sm opacity-70" style={{ color: 'var(--text)' }}>Empfehlungen für dich</div>
            </div>
            <Link to="/products" className="text-sm" style={{ color: 'var(--accent)' }}>Mehr zeigen →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map((n) => (
              <Link to="/products" key={n} className="block pressable">
                <div className="overflow-hidden rounded-2xl shadow" style={{ backgroundColor: 'var(--card)' }}>
                  <img src={`https://source.unsplash.com/featured/?outfit,style&sig=${500+n}`} alt="Empfehlung" loading="lazy" className="w-full h-full object-cover aspect-square" />
                </div>
                <div className="mt-1 text-sm">Empfehlung #{n}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!isEmpty && (
        <div className="grid grid-cols-2 gap-4">
          {cart?.items?.map((it, i) => (
            <div key={i} className="rounded-xl overflow-hidden border relative" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <button aria-label="Mehr" className="absolute top-2 right-2 w-8 h-8 rounded-full pressable" style={{ color: 'var(--text)' }} onClick={() => openSheet(i)}>⋯</button>
              <div onClick={() => openSheet(i)}>
                <div className="aspect-square overflow-hidden bg-neutral-100">
                  <img src={`https://source.unsplash.com/featured/?fashion,product&sig=${900 + i}`} alt={it.product_id} className="w-full h-full object-cover" />
                </div>
                <div className="p-2">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{it.product_id}</div>
                  <div className="text-xs opacity-80 mt-0.5" style={{ color: 'var(--text)' }}>{(getPriceCents(i)/100).toFixed(2)} €</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Seamless checkout portal above Navbar */}
      {!isEmpty && (
        <>
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, height: `calc(${navH}px + env(safe-area-inset-bottom))`, zIndex: 55, background: navGlass.bg || 'var(--bg)', borderTop: `1px solid ${navGlass.border || 'var(--border)'}`, backdropFilter: navGlass.blur || 'saturate(140%) blur(8px)', WebkitBackdropFilter: navGlass.blur || 'saturate(140%) blur(8px)' }} />
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: `calc(${navH}px - 2px + env(safe-area-inset-bottom))`, zIndex: 60 }}>
            <div className="mx-auto max-w-md px-4">
              <div className="rounded-2xl border p-4 shadow-lg" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-80" style={{ color: 'var(--text)' }}>Zwischensumme</span>
                  <span className="text-base font-semibold" style={{ color: 'var(--text)' }}>{(totalCents/100).toFixed(2)} €</span>
                </div>
                <div className="mt-3 grid gap-2">
                  <button onClick={() => navigate('/checkout/address')} className="w-full h-12 rounded-full pressable" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)', fontWeight: 700, fontSize: 16 }}>Zur Kasse</button>
                </div>
                <div className="mt-2 flex items-center gap-3 opacity-85" style={{ color: 'var(--text)' }}>
                  <svg width="46" height="18" viewBox="0 0 46 18" aria-label="Rechnung"><rect x="0.5" y="0.5" width="45" height="17" rx="3" fill="none" stroke="currentColor" /><text x="23" y="12" textAnchor="middle" fontSize="9" fill="currentColor">Rechnung</text></svg>
                  <svg width="36" height="18" viewBox="0 0 36 18" aria-label="VISA"><rect width="36" height="18" rx="3" fill="none" stroke="currentColor"/><text x="18" y="12" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor">VISA</text></svg>
                  <svg width="36" height="18" viewBox="0 0 36 18" aria-label="Mastercard"><rect width="36" height="18" rx="3" fill="none" stroke="currentColor"/><circle cx="14" cy="9" r="5" fill="#EB001B"/><circle cx="22" cy="9" r="5" fill="#F79E1B" opacity="0.85"/></svg>
                  <svg width="40" height="18" viewBox="0 0 40 18" aria-label="Amex"><rect width="40" height="18" rx="3" fill="none" stroke="currentColor"/><text x="20" y="12" textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor">AMEX</text></svg>
                  <svg width="40" height="18" viewBox="0 0 40 18" aria-label="PayPal"><rect width="40" height="18" rx="3" fill="none" stroke="currentColor"/><text x="20" y="12" textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor">PayPal</text></svg>
                  <svg width="44" height="18" viewBox="0 0 44 18" aria-label="Apple Pay"><rect width="44" height="18" rx="3" fill="none" stroke="currentColor"/><text x="22" y="12" textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor"> Pay</text></svg>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Sheet for item actions */}
      {sheetOpen && sheetIndex !== null && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" onClick={closeSheet}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)', transition: 'opacity 280ms cubic-bezier(0.22,1,0.36,1)' }} />
          <div className="absolute left-0 right-0 bottom-0">
            <div className="max-w-md mx-auto">
              <div className="mx-4 mb-4 rounded-3xl shadow-xl border sheet-anim" style={{ background: 'var(--bg)', borderColor: 'var(--border)', height: '50vh' }} onClick={(e) => e.stopPropagation()}>
                <div className="p-4 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100">
                    <img src={`https://source.unsplash.com/featured/?fashion,product&sig=${900 + sheetIndex}`} alt="item" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: 'var(--text)' }}>{cart?.items?.[sheetIndex]?.product_id}</div>
                    <div className="text-sm opacity-70" style={{ color: 'var(--text)' }}>{((getPriceCents(sheetIndex||0))/100).toFixed(2)} €</div>
                  </div>
                </div>
                <div className="grid gap-2 p-4 pt-0">
                  <button onClick={() => viewProduct(sheetIndex)} className="w-full h-12 rounded-full pressable" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>Produkt ansehen</button>
                  <button onClick={() => toFavorites(sheetIndex)} className="w-full h-12 rounded-full pressable" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>Zu Favoriten</button>
                  <button onClick={() => removeAt(sheetIndex)} className="w-full h-12 rounded-full pressable" style={{ background: 'var(--text)', color: 'var(--bg)' }}>Entfernen</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
