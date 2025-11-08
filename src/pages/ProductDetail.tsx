import { useLocation, useParams } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

export default function ProductDetail() {
  const { id } = useParams();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const cat = params.get('cat') || 'product';
  const label = cat.replace(/-/g, ' ');

  const title = `${label.charAt(0).toUpperCase() + label.slice(1)} · ${decodeURIComponent(id || '')}`;
  const hero = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop';
  const gallery = [
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520975922137-8bdf0ef87672?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503342217505-b0a15cf70489?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516280030429-27679b3dc9cf?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514416309822-6de6d80d02f2?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549439602-43ebca2327b1?q=80&w=1200&auto=format&fit=crop'
  ];

  const priceCents = 2999;
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeImg = useMemo(() => [hero, ...gallery][activeIdx] || hero, [activeIdx]);
  const [navH, setNavH] = useState<number>(56);
  const [navGlass, setNavGlass] = useState<{ bg?: string; border?: string; blur?: string }>({});
  useEffect(() => {
    const getNav = () => document.querySelector('nav[aria-label="Hauptnavigation"]') as HTMLElement | null;
    const el = getNav();
    const read = () => {
      const n = getNav();
      if (!n) return;
      const h = n.offsetHeight || 56;
      setNavH(h);
      // mirror inline styles from Navbar for seamless filler
      try {
        const s = (n as HTMLElement).style as CSSStyleDeclaration & { WebkitBackdropFilter?: string };
        setNavGlass({ bg: s.backgroundColor || undefined, border: s.borderColor || undefined, blur: (s.backdropFilter || (s as any).WebkitBackdropFilter) || undefined });
      } catch {}
    };
    read();
    let ro: ResizeObserver | null = null;
    if (el && 'ResizeObserver' in window) {
      try { ro = new ResizeObserver(read); ro.observe(el); } catch {}
    }
    const onResize = () => read();
    window.addEventListener('resize', onResize);
    const onCustom = () => read();
    window.addEventListener('hiddn-update', onCustom as any);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('hiddn-update', onCustom as any);
      if (ro) try { ro.disconnect(); } catch {}
    };
  }, []);

  // init saved state from wishlist
  useState(() => {
    try {
      const raw = localStorage.getItem('hiddn_wishlist');
      const list = raw ? JSON.parse(raw) as any[] : [];
      setSaved(!!list.find((x) => x.id === (id || '')));
    } catch {}
    return undefined;
  });

  function saveToWishlist() {
    try {
      setSaving(true);
      const key = 'hiddn_wishlist';
      const entry = { id: id || '', cat, title, priceCents, hero };
      const raw = localStorage.getItem(key);
      const list = raw ? (JSON.parse(raw) as any[]) : [];
      const idx = list.findIndex((x) => x.id === entry.id);
      if (idx === -1) {
        list.push(entry);
        setMsg('Gespeichert in deiner Wish List');
        setSaved(true);
      } else {
        list.splice(idx, 1);
        setMsg('Aus deiner Wish List entfernt');
        setSaved(false);
      }
      localStorage.setItem(key, JSON.stringify(list));
      try { window.dispatchEvent(new Event('hiddn-wish')); window.dispatchEvent(new Event('hiddn-update')); } catch {}
    } catch {
      setMsg('Konnte nicht speichern');
    } finally { setSaving(false); }
  }

  async function addToCart() {
    try {
      setAdding(true);
      await api.post('/api/v1/cart', { product_id: id, qty: 1, price_cents: priceCents });
      setMsg('Zum Warenkorb hinzugefügt');
      try {
        const k = 'hiddn_cart_count';
        const n = parseInt(localStorage.getItem(k) || '0') || 0;
        localStorage.setItem(k, String(n + 1));
        window.dispatchEvent(new Event('hiddn-update'));
      } catch {}
      try {
        const pk = 'hiddn_cart_pending';
        const raw = localStorage.getItem(pk);
        const arr = raw ? JSON.parse(raw) : [];
        arr.push({ product_id: id, qty: 1 });
        localStorage.setItem(pk, JSON.stringify(arr));
      } catch {}
      setTimeout(() => setAdded(true), 180);
    } catch {
      // Offline/local fallback: still add to pseudo cart so UX flows smoothly
      try {
        const k = 'hiddn_cart_count';
        const n = parseInt(localStorage.getItem(k) || '0') || 0;
        localStorage.setItem(k, String(n + 1));
        const fk = 'hiddn_cart_fallback_items';
        const raw = localStorage.getItem(fk);
        const items = raw ? JSON.parse(raw) : [];
        items.push({ product_id: id, qty: 1, price_cents: priceCents });
        localStorage.setItem(fk, JSON.stringify(items));
        // Also mirror into pending so the Cart page (which reads hiddn_cart_pending) shows items immediately
        try {
          const pk = 'hiddn_cart_pending';
          const praw = localStorage.getItem(pk);
          const parr = praw ? JSON.parse(praw) : [];
          parr.push({ product_id: id, qty: 1 });
          localStorage.setItem(pk, JSON.stringify(parr));
        } catch {}
        window.dispatchEvent(new Event('hiddn-update'));
        setMsg('Zum Warenkorb (lokal) hinzugefügt');
        setTimeout(() => setAdded(true), 180);
      } catch {
        setMsg('Konnte nicht zum Warenkorb hinzufügen');
      }
    } finally {
      setAdding(false);
      setTimeout(() => setAdded(false), 900);
    }
  }

  return (
    <main className="max-w-md mx-auto" style={{ paddingBottom: `calc(${navH}px + 108px + env(safe-area-inset-bottom))`, color: 'var(--text)' }}>
      <section className="px-5 pt-4">
        <h1 className="font-display text-2xl" style={{ letterSpacing: 0.3 }}>{title}</h1>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-xl font-semibold">{(priceCents/100).toFixed(2)} EUR</div>
          <span className="text-sm opacity-70">inkl. MwSt.</span>
        </div>
      </section>

      <section className="mt-3">
        <div className="rounded-2xl overflow-hidden" style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <motion.img
            key={activeImg}
            initial={{ opacity: 0.0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }}
            src={activeImg}
            alt={title}
            className="w-full"
            style={{ aspectRatio: '4/5', objectFit: 'cover' }}
          />
        </div>
        <div className="px-5 mt-3 flex gap-3 overflow-x-auto no-scrollbar">
          {[hero, ...gallery].map((src, i) => (
            <button key={i} onClick={()=>setActiveIdx(i)} className={`shrink-0 rounded-xl overflow-hidden border`} style={{ borderColor: 'var(--border)', boxShadow: i===activeIdx ? '0 0 0 2px var(--accent)' : 'none' }}>
              <img src={src} alt={`${title} ${i+1}`} className="h-[92px] w-[92px] object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 mt-5">
        <p className="text-sm opacity-80">Ausgewählte {label} – inspiriert von aktuellen Trends. Bilder und Daten sind Demo‑Inhalte.</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs opacity-85">
          <div className="rounded-xl p-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>Kostenloser Versand</div>
          <div className="rounded-xl p-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>30 Tage Retoure</div>
          <div className="rounded-xl p-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>Klimaneutral</div>
        </div>
      </section>

      <section className="px-5 mt-6 space-y-4">
        <div>
          <h3 className="font-display text-xl">Beschreibung</h3>
          <p className="text-sm opacity-85 mt-1">Zeitlose {label} mit cleanem Look. Weiche Haptik, hochwertiger Stoff, vielseitig kombinierbar – von Street bis Smart Casual.</p>
        </div>
        <div>
          <h4 className="font-medium">Details</h4>
          <ul className="text-sm opacity-85 list-disc pl-5 mt-1">
            <li>Material: 100% Baumwolle</li>
            <li>Passform: Regular Fit</li>
            <li>Features: Kapuze, Metall‑Zip, Kängurutasche</li>
            <li>Pflege: 30° Schonwaschgang, nicht im Trockner</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium">Brand Story</h4>
          <p className="text-sm opacity-85 mt-1">HIDDN kuratiert Pieces von aufstrebenden Labels und etablierten Brands – mit Fokus auf Qualität, Komfort und Style.</p>
        </div>
      </section>

      <section className="px-5 mt-8 mb-28">
        <h2 className="font-display text-xl mb-2">Ähnliche Produkte</h2>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <img src={`https://source.unsplash.com/featured/?${encodeURIComponent(label)},look&sig=${1200 + i}`} alt={`Similar ${i+1}`} className="w-full h-[180px] object-cover" />
              <div className="p-2 text-sm">{label} Pick #{i+1}</div>
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}
            className="fixed left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-sm"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)', boxShadow: '0 8px 18px rgba(0,0,0,0.10)', bottom: `calc(${navH}px + 20px + env(safe-area-inset-bottom))` }}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seamless filler matching Navbar glass to avoid visible gap */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, height: `calc(${navH}px + env(safe-area-inset-bottom))`, zIndex: 55, background: navGlass.bg || 'var(--bg)', borderTop: `1px solid ${navGlass.border || 'var(--border)'}`, backdropFilter: navGlass.blur || 'saturate(140%) blur(8px)', WebkitBackdropFilter: navGlass.blur || 'saturate(140%) blur(8px)' }} />

      <div style={{ position: 'fixed', left: 0, right: 0, bottom: `calc(${navH}px - 2px + env(safe-area-inset-bottom))`, zIndex: 60 }}>
        <div className="mx-auto max-w-md border-t" style={{ background: 'var(--bg)', borderColor: 'var(--border)', backdropFilter: 'saturate(140%) blur(10px)', WebkitBackdropFilter: 'saturate(140%) blur(10px)', boxShadow: '0 -10px 24px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-3 grid grid-cols-[1fr_auto] gap-3 items-center">
            <button
              onClick={(e) => { (e.currentTarget as HTMLButtonElement).classList.add('pop'); setTimeout(() => (e.currentTarget as HTMLButtonElement).classList.remove('pop'), 240); addToCart(); }}
              disabled={adding}
              className="rounded-xl pressable btn-solid"
              style={{ height: 52, fontSize: 16, fontWeight: 800 }}
            >
              {added ? 'Hinzugefügt' : 'In den Warenkorb'}
            </button>
            <button
              aria-label="Zu Favoriten hinzufügen"
              onClick={(e) => { (e.currentTarget as HTMLButtonElement).classList.add('pop'); setTimeout(() => (e.currentTarget as HTMLButtonElement).classList.remove('pop'), 240); saveToWishlist(); }}
              disabled={saving}
              className="rounded-xl pressable"
              style={{ width: 52, height: 52, background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              {/* Heart icon with currentColor, no red fill change */}
              {saved ? (
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12.001 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6.01 4.01 4 6.5 4c1.54 0 3.04.81 3.86 2.09h.28C11.46 4.81 12.96 4 14.5 4 16.99 4 19 6.01 19 8.5c0 3.78-3.4 6.86-8.55 11.54l-1.449 1.31z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M16.5 4c-1.74 0-3.41.81-4.5 2.09C10.91 4.81 9.24 4 7.5 4 4.42 4 2 6.42 2 9.5c0 3.57 3.4 6.64 8.55 11.31l.95.86.95-.86C18.6 16.14 22 13.07 22 9.5 22 6.42 19.58 4 16.5 4zm-4.4 15.55l-.1.09-.1-.09C7.14 15.24 4 12.39 4 9.5 4 7.5 5.5 6 7.5 6c1.54 0 3.04.99 3.57 2.36h1.87C13.46 6.99 14.96 6 16.5 6 18.5 6 20 7.5 20 9.5c0 2.89-3.14 5.74-7.9 10.05z" fill="currentColor"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
