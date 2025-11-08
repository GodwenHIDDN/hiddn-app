import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getProducts, api } from '../lib/api';

type Product = { id: string; title: string; price_cents: number; currency: string; image_url?: string };

export default function Products() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const cat = params.get('cat') || undefined;
  const sort = params.get('sort') || undefined; // 'new' | 'top'
  const group = params.get('group') || undefined; // 'styles'
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [wishIds, setWishIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const key = 'hiddn_wishlist';
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) as any[] : [];
      setWishIds(new Set(list.map((x: any) => x.id)));
    } catch {}
  }, []);
  function toggleWishlist(p: Product) {
    try {
      const key = 'hiddn_wishlist';
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) as any[] : [];
      const idx = list.findIndex((x) => x.id === p.id);
      let added = false;
      if (idx === -1) { list.push({ id: p.id, title: p.title, price_cents: p.price_cents, image_url: p.image_url }); added = true; }
      else { list.splice(idx, 1); }
      localStorage.setItem(key, JSON.stringify(list));
      setWishIds(new Set(list.map((x: any) => x.id)));
      setToast(added ? 'Gespeichert in Wish List' : 'Aus Wish List entfernt');
      try { window.dispatchEvent(new Event('hiddn-update')); window.dispatchEvent(new Event('hiddn-wish')); } catch {}
      setTimeout(() => setToast(null), 1200);
    } catch {
      setToast('Konnte nicht speichern');
      setTimeout(() => setToast(null), 1200);
    }
  }
  async function addItem(p: Product) {
    // Optimistic update: write to local UI/storage first
    // show '+' immediately
    setAddingId(p.id);
    try {
      const pk = 'hiddn_cart_pending';
      const raw = localStorage.getItem(pk);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push({ product_id: p.id, qty: 1 });
      localStorage.setItem(pk, JSON.stringify(arr));
    } catch {}
    try {
      const k = 'hiddn_cart_count';
      const n = parseInt(localStorage.getItem(k) || '0') || 0;
      localStorage.setItem(k, String(n + 1));
      window.dispatchEvent(new Event('hiddn-update'));
    } catch {}
    // Fire API best-effort (may fail on demo)
    try { await api.post('/api/v1/cart', { product_id: p.id, qty: 1, price_cents: p.price_cents }); } catch {}
    setTimeout(() => setAddedIds(prev => new Set(prev).add(p.id)), 180);
    setToast('Zum Warenkorb hinzugefügt');
    setTimeout(() => setToast(null), 1200);
    setTimeout(() => navigate('/cart'), 300);
    setTimeout(() => setAddingId(null), 220);
    setTimeout(() => setAddedIds(prev => { const s=new Set(prev); s.delete(p.id); return s; }), 1200);
  }

  useEffect(() => {
    (async () => {
      setError(null);
      setLoading(true);
      try {
        if (sort || group) {
          // New Drops, Top Picks, Styles → studio/white backdrop model shots
          const tag = sort === 'new' ? 'new' : sort === 'top' ? 'top' : group || 'styles';
          const label = tag === 'new' ? 'New Drops' : tag === 'top' ? 'Top Picks' : 'Styles';
          const gen: Product[] = Array.from({ length: 12 }).map((_, i) => ({
            id: `${tag}-${i + 1}`,
            title: `${label} ${i + 1}`,
            price_cents: 2999 + i * 111,
            currency: 'EUR',
            image_url: `https://source.unsplash.com/featured/?model,studio,white,backdrop,fashion,portrait&sig=${400 + i}`
          }));
          setItems(gen);
        } else if (cat) {
          // generate mock products based on category
          const label = cat.replace(/-/g, ' ');
          const gen: Product[] = Array.from({ length: 12 }).map((_, i) => ({
            id: `${cat}-${i + 1}`,
            title: `${label.charAt(0).toUpperCase() + label.slice(1)} ${i + 1}`,
            price_cents: 1999 + i * 123,
            currency: 'EUR',
            image_url: `https://source.unsplash.com/featured/?${encodeURIComponent(label)},fashion&sig=${300 + i}`
          }));
          setItems(gen);
        } else {
          const list = await getProducts();
          setItems(list);
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [cat, sort, group]);

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {sort === 'new' ? 'NEW DROPS' : sort === 'top' ? 'TOP PICKS' : group === 'styles' ? 'STYLES' : cat ? cat.toUpperCase() : 'PRODUCTS'}
        </h1>
        {!cat && !sort && !group && (
          <Link to="/products/new" className="px-3 py-2 rounded bg-brand-600 text-white text-sm hover:bg-brand-700">New</Link>
        )}
      </div>
      {loading && (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg overflow-hidden border">
              <div className="aspect-square bg-neutral-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-2/3" />
                <div className="h-4 bg-neutral-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!loading && (
        <div className="grid grid-cols-2 gap-4">
          {items.map(p => (
            <div key={p.id} className="rounded-lg overflow-hidden border relative" style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--card)' }}>
              <Link to={`/products/${encodeURIComponent(p.id)}${cat ? `?cat=${encodeURIComponent(cat)}` : ''}`} className="block">
                <div className="aspect-square bg-neutral-100 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={`https://images.unsplash.com/photo-1549439602-43ebca2327b1?q=80&w=1200&auto=format&fit=crop`}
                      alt="Model Studio"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium truncate">{p.title}</p>
                  <p className="text-sm opacity-70">{(p.price_cents/100).toFixed(2)} {p.currency}</p>
                </div>
              </Link>
              {/* Quick actions */}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  aria-label="Wish List"
                  onClick={(e) => { (e.currentTarget as HTMLButtonElement).classList.add('pop'); setTimeout(() => (e.currentTarget as HTMLButtonElement).classList.remove('pop'), 240); toggleWishlist(p); }}
                  className="w-12 h-12 rounded-full pressable btn-glass"
                  style={{ color: '#fff', fontSize: 18, display: 'grid', placeItems: 'center', borderWidth: 1, backdropFilter: 'blur(14px)' }}
                >
                  {wishIds.has(p.id) ? '♥' : '♡'}
                </button>
                <button
                  aria-label="In den Warenkorb"
                  onClick={(e) => { (e.currentTarget as HTMLButtonElement).classList.add('pop'); setTimeout(() => (e.currentTarget as HTMLButtonElement).classList.remove('pop'), 240); addItem(p); }}
                  className="w-12 h-12 rounded-full pressable btn-solid"
                  style={{ fontSize: 18, display: 'grid', placeItems: 'center' }}
                >
                  {addingId === p.id ? '+' : addedIds.has(p.id) ? '✓' : '🛍️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {toast && (
        <div className="fixed bottom-16 left-0 right-0">
          <div className="max-w-md mx-auto">
            <div className="mx-4 rounded-md bg-neutral-900 text-white text-sm px-3 py-2 text-center opacity-90">{toast}</div>
          </div>
        </div>
      )}
    </main>
  );
}
