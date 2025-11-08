import { useEffect, useMemo, useState } from 'react';

// Test-only creator model
type CreatorItem = {
  id: number;
  brand: string;
  headline: string;
  imageUrl?: string;
  layoutStyle: 'starter' | 'basic' | 'premium';
  packageActiveUntil: string; // ISO
};

const LS_KEY = 'hiddn_creators';

export default function CreatorTest() {
  const [brand, setBrand] = useState('');
  const [headline, setHeadline] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [layoutStyle, setLayoutStyle] = useState<'starter'|'basic'|'premium'>('starter');
  const [duration, setDuration] = useState<number>(7);
  const [items, setItems] = useState<CreatorItem[]>([]);

  // load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const arr: CreatorItem[] = raw ? JSON.parse(raw) : [];
      setItems(arr);
    } catch { setItems([]); }
  }, []);

  const activeItems = useMemo(() => {
    const now = new Date();
    return (items || []).filter(c => new Date(c.packageActiveUntil) >= now);
  }, [items]);

  function saveCreator() {
    const expires = new Date();
    expires.setDate(expires.getDate() + (duration || 7));
    const newCreator: CreatorItem = {
      id: Date.now(),
      brand: brand.trim() || 'Unbenannte Brand',
      headline: headline.trim() || '—',
      imageUrl: imageUrl.trim() || undefined,
      layoutStyle,
      packageActiveUntil: expires.toISOString()
    };
    const next = [...items, newCreator];
    setItems(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  }

  function removeById(id: number) {
    const next = items.filter(x => x.id !== id);
    setItems(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  }

  function extendById(id: number, extraDays = 7) {
    const next = items.map(x => x.id === id ? { ...x, packageActiveUntil: (() => { const d = new Date(x.packageActiveUntil); d.setDate(d.getDate() + extraDays); return d.toISOString(); })() } : x);
    setItems(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  }

  const cardBgFor = (style: CreatorItem['layoutStyle']) => {
    if (style === 'starter') return 'linear-gradient(145deg,#1a1a1a,#2c2c2c)';
    if (style === 'basic') return 'linear-gradient(145deg,#6a11cb,#2575fc)';
    return 'linear-gradient(145deg,#ff8a00,#e52e71)';
  };

  return (
    <main className="max-w-md mx-auto p-5 pb-24" style={{ background: 'var(--bg)', color: 'var(--text)', paddingBottom: 'calc(56px + env(safe-area-inset-bottom))' }}>
      <h2 className="font-display text-2xl text-center mb-3">HIDDN Creator Test</h2>

      <section className="rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="p-5">
          <label className="block text-sm opacity-80">Brand-Name</label>
          <input value={brand} onChange={(e)=>setBrand(e.target.value)} className="w-full mt-1 rounded-xl px-3 py-3" style={{ background: 'var(--header)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="z. B. Lorenzo Worldwide" />

          <label className="block text-sm opacity-80 mt-3">Überschrift / Slogan</label>
          <input value={headline} onChange={(e)=>setHeadline(e.target.value)} className="w-full mt-1 rounded-xl px-3 py-3" style={{ background: 'var(--header)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="z. B. Neue Drop-Kollektion" />

          <label className="block text-sm opacity-80 mt-3">Banner-Bild-URL</label>
          <input value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} className="w-full mt-1 rounded-xl px-3 py-3" style={{ background: 'var(--header)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="https://..." />

          <label className="block text-sm opacity-80 mt-3">Layout-Style</label>
          <select value={layoutStyle} onChange={(e)=>setLayoutStyle(e.target.value as any)} className="w-full mt-1 rounded-xl px-3 py-3" style={{ background: 'var(--header)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <option value="starter">Starter</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>

          <label className="block text-sm opacity-80 mt-3">Paket-Dauer</label>
          <select value={duration} onChange={(e)=>setDuration(parseInt(e.target.value))} className="w-full mt-1 rounded-xl px-3 py-3" style={{ background: 'var(--header)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <option value={7}>1 Woche</option>
            <option value={30}>1 Monat</option>
          </select>

          <button onClick={saveCreator} className="w-full mt-4 rounded-xl pressable" style={{ padding: '12px', background: 'linear-gradient(90deg,#6a11cb,#2575fc)', color: '#fff', fontWeight: 700 }}>Creator-Paket aktivieren</button>
        </div>
      </section>

      <section className="mt-6" id="creator-section">
        <div className="grid gap-4">
          {activeItems.map(c => (
            <div key={c.id} className="creator-card rounded-2xl p-5" style={{ background: cardBgFor(c.layoutStyle), border: '1px solid var(--border)' }}>
              <h3 className="text-lg font-semibold">{c.brand}</h3>
              <p className="opacity-90 mt-1">{c.headline}</p>
              {c.imageUrl && (
                <img src={c.imageUrl} className="preview mt-3" alt={c.brand} style={{ width: '100%', borderRadius: 12, objectFit: 'cover', height: 200 }} />
              )}
              <div className="mt-2 text-xs opacity-85">Läuft bis: {new Date(c.packageActiveUntil).toLocaleDateString()}</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={()=>extendById(c.id, 7)} className="h-10 rounded-xl pressable" style={{ background: 'var(--text)', color: 'var(--bg)', fontWeight: 700 }}>+1 Woche</button>
                <button onClick={()=>removeById(c.id)} className="h-10 rounded-xl pressable" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>Entfernen</button>
              </div>
            </div>
          ))}
          {activeItems.length === 0 && (
            <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="opacity-80">Keine aktiven Creator. Lege oben ein Paket an.</div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
