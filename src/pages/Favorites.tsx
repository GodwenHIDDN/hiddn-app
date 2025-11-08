import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

export default function Favorites() {
  const navigate = useNavigate();
  // pull-to-refresh state (simulate refresh)
  const hostRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number>(0);
  const pulling = useRef<boolean>(false);
  const [ptr, setPtr] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [items, setItems] = useState<Array<{id:string; title:string; price_cents?:number; image_url?:string}>>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetIndex, setSheetIndex] = useState<number | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hiddn_wishlist');
      const list = raw ? JSON.parse(raw) : [];
      setItems(list);
    } catch {}
  }, []);

  function openSheet(i: number) { setSheetIndex(i); setSheetOpen(true); }
  function closeSheet() { setSheetOpen(false); }

  function removeAt(i: number) {
    setItems((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      try { localStorage.setItem('hiddn_wishlist', JSON.stringify(next)); window.dispatchEvent(new Event('hiddn-wish')); window.dispatchEvent(new Event('hiddn-update')); } catch {}
      return next;
    });
    setSheetOpen(false);
  }

  async function addToCart(i: number) {
    const it = items[i]; if (!it) return;
    try {
      await api.post('/api/v1/cart', { product_id: it.id, qty: 1, price_cents: it.price_cents || 2999 });
      try { const k='hiddn_cart_count'; const n=parseInt(localStorage.getItem(k)||'0')||0; localStorage.setItem(k, String(n+1)); window.dispatchEvent(new Event('hiddn-update')); } catch {}
      try { const pk='hiddn_cart_pending'; const raw=localStorage.getItem(pk); const arr=raw?JSON.parse(raw):[]; arr.push({ product_id: it.id, qty:1 }); localStorage.setItem(pk, JSON.stringify(arr)); } catch {}
    } catch {}
    setSheetOpen(false);
  }

  function viewProduct(i: number) { const it = items[i]; if (!it) return; navigate(`/products/${encodeURIComponent(it.id)}`); }

  function onTouchStart(e: React.TouchEvent) {
    if (refreshing) return;
    const el = hostRef.current; if (!el) return;
    if (el.scrollTop === 0) { startY.current = e.touches[0].clientY; pulling.current = true; }
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!pulling.current || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setPtr(Math.min(100, dy * 0.5));
  }
  function onTouchEnd() {
    if (!pulling.current || refreshing) { pulling.current = false; return; }
    pulling.current = false;
    if (ptr > 60) {
      setRefreshing(true); setPtr(60);
      setTimeout(() => { setRefreshing(false); setPtr(0); }, 600);
    } else { setPtr(0); }
  }
  return (
    <main
      ref={hostRef}
      className="max-w-md mx-auto p-6 pb-24"
      style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <div style={{ height: ptr, transition: pulling.current || refreshing ? 'none' : 'height 160ms ease' }}>
        <div className="flex items-center justify-center" style={{ height: ptr }}>
          {(pulling.current || refreshing) && (
            <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: 999 }} />
          )}
        </div>
      </div>
      <h1 className="font-display text-2xl mb-2" style={{ color: 'var(--text)' }}>Wish List</h1>
      {items.length === 0 ? (
        <section className="rounded-2xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header)' }}>
          <div className="px-5 py-8 grid place-items-center text-center">
            <p className="text-sm opacity-80" style={{ color: 'var(--text)' }}>Noch keine Produkte gespeichert.</p>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {items.map((p, i) => (
            <div key={p.id} className="rounded-xl overflow-hidden border relative" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <button aria-label="Mehr" className="absolute top-2 right-2 w-8 h-8 rounded-full pressable" style={{ color: 'var(--text)' }} onClick={() => openSheet(i)}>⋯</button>
              <div onClick={() => openSheet(i)}>
                <div className="aspect-square overflow-hidden bg-neutral-100">
                  <img src={p.image_url || 'https://images.unsplash.com/photo-1549439602-43ebca2327b1?q=80&w=1200&auto=format&fit=crop'} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-2">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{p.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Sheet for wishlist item actions */}
      {sheetOpen && sheetIndex !== null && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" onClick={closeSheet}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)', transition: 'opacity 280ms cubic-bezier(0.22,1,0.36,1)' }} />
          <div className="absolute left-0 right-0 bottom-0">
            <div className="max-w-md mx-auto">
              <div className="mx-4 mb-4 rounded-3xl shadow-xl border" style={{ background: 'var(--bg)', borderColor: 'var(--border)', transform: 'translateY(0)', transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1)' }} onClick={(e) => e.stopPropagation()}>
                <div className="p-4 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100">
                    <img src={items[sheetIndex]?.image_url || 'https://images.unsplash.com/photo-1549439602-43ebca2327b1?q=80&w=1200&auto=format&fit=crop'} alt={items[sheetIndex]?.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: 'var(--text)' }}>{items[sheetIndex]?.title}</div>
                  </div>
                </div>
                <div className="grid gap-2 p-4 pt-0">
                  <button onClick={() => viewProduct(sheetIndex)} className="w-full h-12 rounded-full pressable" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>Produkt ansehen</button>
                  <button onClick={() => addToCart(sheetIndex)} className="w-full h-12 rounded-full pressable" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>In den Warenkorb</button>
                  <button onClick={() => removeAt(sheetIndex)} className="w-full h-12 rounded-full pressable" style={{ background: 'var(--text)', color: 'var(--bg)' }}>Aus Wish List entfernen</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <section className="mt-6 px-4">
        <h2 className="font-display text-xl mb-2" style={{ color: 'var(--text)' }}>Das könnte dir gefallen</h2>
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map((n) => (
            <Link to="/products?sort=top" key={n} className="block pressable">
              <div className="overflow-hidden rounded-2xl shadow" style={{ backgroundColor: 'var(--card)' }}>
                <img src={`https://source.unsplash.com/featured/?outfit,portrait,style&sig=${500+n}`} alt="Empfehlung" loading="lazy" className="w-full h-full object-cover aspect-square" />
              </div>
              <div className="mt-1 text-sm" style={{ color: 'var(--text)' }}>Empfehlung #{n}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
