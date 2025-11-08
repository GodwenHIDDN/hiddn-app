import { useLocation, useParams } from 'react-router-dom';
import { useState } from 'react';
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
  const [showPlus, setShowPlus] = useState(false);

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
      setShowPlus(true);
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
      setMsg('Konnte nicht zum Warenkorb hinzufügen');
    } finally {
      setAdding(false);
      setTimeout(() => setShowPlus(false), 200);
      setTimeout(() => setAdded(false), 900);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 pb-24" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom))', color: 'var(--text)' }}>
      <h1 className="font-display text-2xl mb-2">{title}</h1>

      <div className="rounded-2xl overflow-hidden shadow mb-4" style={{ backgroundColor: 'var(--card)' }}>
        <img src={hero} alt={title} className="w-full h-[280px] object-cover" />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {gallery.map((src, i) => (
          <img key={i} src={src} alt={`${title} ${i+1}`} className="h-[120px] w-[120px] object-cover rounded-xl shadow" loading="lazy" />
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-xl font-semibold">{(priceCents/100).toFixed(2)} EUR</div>
        <span className="text-sm opacity-70">inkl. MwSt.</span>
      </div>

      <p className="text-sm opacity-80 mb-4">Ausgewählte {label} – inspiriert von aktuellen Trends. Bilder und Daten sind Demo‑Inhalte.</p>

      {/* Action bar (large iOS pills) */}
      <div className="grid grid-cols-1 gap-6 mt-2 mb-14">
        <button
          onClick={(e) => { (e.currentTarget as HTMLButtonElement).classList.add('pop'); setTimeout(() => (e.currentTarget as HTMLButtonElement).classList.remove('pop'), 240); addToCart(); }}
          disabled={adding}
          className="w-4/5 mx-auto rounded-full pressable btn-solid"
          style={{ height: 68, fontSize: 18, fontWeight: 800, boxShadow: '0 10px 24px rgba(0,0,0,0.18)' }}
        >
          {showPlus ? '+' : added ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-label="Added"><path d="M20.285 6.709a1 1 0 0 1 0 1.414l-9.19 9.19a1 1 0 0 1-1.414 0L3.715 11.35a1 1 0 1 1 1.414-1.414l5.048 5.048 8.483-8.275a1 1 0 0 1 1.625 0z"/></svg>
          ) : 'In den Warenkorb'}
        </button>
        <button
          aria-label="Zu Favoriten hinzufügen"
          onClick={(e) => { (e.currentTarget as HTMLButtonElement).classList.add('pop'); setTimeout(() => (e.currentTarget as HTMLButtonElement).classList.remove('pop'), 240); saveToWishlist(); }}
          disabled={saving}
          className="w-4/5 mx-auto rounded-full pressable"
          style={{ height: 56, background: 'var(--card)', border: 'none', color: 'var(--text)', fontSize: 16, fontWeight: 700, marginTop: 2, boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}
        >
          {saved ? 'Aus Favoriten entfernen ♥' : 'Zu Favoriten hinzufügen ♡'}
        </button>
      </div>
      {msg && <div className="text-xs opacity-70 mb-4" style={{ color: 'var(--text)' }}>{msg}</div>}

      {/* Rich description */}
      <section className="space-y-3 mb-8">
        <div>
          <h3 className="font-display text-xl mb-1">Beschreibung</h3>
          <p className="text-sm opacity-85">Zeitlose {label} mit cleanem Look. Weiche Haptik, hochwertiger Stoff, vielseitig kombinierbar – von Street bis Smart Casual.</p>
        </div>
        <div>
          <h4 className="font-medium mb-1">Details</h4>
          <ul className="text-sm opacity-85 list-disc pl-5">
            <li>Material: 100% Baumwolle</li>
            <li>Passform: Regular Fit</li>
            <li>Features: Kapuze, Metall‑Zip, Kängurutasche</li>
            <li>Pflege: 30° Schonwaschgang, nicht im Trockner</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-1">Brand Story</h4>
          <p className="text-sm opacity-85">HIDDN kuratiert Pieces von aufstrebenden Labels und etablierten Brands – mit Fokus auf Qualität, Komfort und Style.</p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl mb-2">Ähnliche Produkte</h2>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow" style={{ backgroundColor: 'var(--card)' }}>
              <img src={`https://source.unsplash.com/featured/?${encodeURIComponent(label)},look&sig=${1200 + i}`} alt={`Similar ${i+1}`} className="w-full h-[180px] object-cover" />
              <div className="p-2 text-sm">{label} Pick #{i+1}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
