import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type CProd = { id: string; title: string; price_cents: number; status: 'draft'|'pending_review'|'active'; images: string[]; desc?: string; cat?: string };

function loadCreatorProducts(): CProd[] {
  try { const raw = localStorage.getItem('hiddn_creator_products'); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveCreatorProducts(list: CProd[]) {
  try { localStorage.setItem('hiddn_creator_products', JSON.stringify(list)); } catch {}
}

export default function CreatorForm() {
  const { id } = useParams();
  const editing = !!id;
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('');
  const [showCatPicker, setShowCatPicker] = useState(false);
  const catOptions = ['Hoodies','Jacken','Sneaker','Hosen','Tops','Accessoires','Bags','Eyewear'];
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!editing) return;
    const list = loadCreatorProducts();
    const found = list.find(p => p.id === id);
    if (found) {
      setTitle(found.title);
      setPrice(String((found.price_cents/100).toFixed(2)));
      setDesc(found.desc || '');
      setCat(found.cat || '');
      setImages(found.images || []);
    }
  }, [editing, id]);

  function onImageFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    Promise.all(files.slice(0,4).map(file => new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.readAsDataURL(file);
    }))).then(urls => setImages(urls));
  }

  function onSave() {
    const cents = Math.round(parseFloat(price.replace(',', '.')) * 100) || 0;
    const list = loadCreatorProducts();
    if (editing) {
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) list[idx] = { ...list[idx], title, price_cents: cents, desc, cat, images, status: 'pending_review' };
    } else {
      const nid = 'c-' + Math.random().toString(36).slice(2,8);
      list.unshift({ id: nid, title, price_cents: cents, desc, cat, images, status: 'pending_review' });
    }
    saveCreatorProducts(list);
    nav('/creator');
  }

  return (
    <main className="max-w-md mx-auto" style={{ minHeight:'100svh', background:'#0a0a0a', color:'#fff' }}>
      {/* Header */}
      <section style={{ position:'sticky', top:0, zIndex:10, padding:'16px 14px', background:'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display" style={{ fontSize:22 }}>{editing ? 'Produkt bearbeiten' : 'Neues Produkt'}</h1>
            <div className="opacity-80 text-xs">Creator · Atelier</div>
          </div>
          <button onClick={onSave} className="pressable" style={{ background:'#fff', color:'#000', padding:'10px 14px', borderRadius:12, fontWeight:700 }}>Speichern</button>
        </div>
      </section>

      {/* Form content */}
      <section className="px-4 py-4 grid gap-4">
        <label className="grid gap-2">
          <span className="font-display text-[16px]">Produktname</span>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="creator-input rounded-xl" style={{ height:48, padding:'0 12px' }} placeholder="z. B. HIDDN Hoodie" />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="grid gap-2">
            <span className="font-display text-[16px]">Preis (EUR)</span>
            <input value={price} onChange={e=>setPrice(e.target.value)} inputMode="decimal" className="creator-input rounded-xl" style={{ height:48, padding:'0 12px' }} placeholder="z. B. 59,90" />
          </label>
          <div className="grid gap-2">
            <span className="font-display text-[16px]">Kategorie</span>
            <button type="button" onClick={()=>setShowCatPicker(true)} className="creator-input rounded-xl pressable flex items-center justify-between" style={{ height:48, padding:'0 12px' }}>
              <span className="text-sm opacity-90">{cat ? cat : 'Kategorie auswählen'}</span>
              <span className="text-xs opacity-70">Weiter ▸</span>
            </button>
          </div>
        </div>

        <label className="grid gap-2">
          <span className="font-display text-[16px]">Beschreibung</span>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={5} className="creator-input rounded-xl" style={{ padding:'12px' }} placeholder="Kurze Beschreibung" />
        </label>

        <div className="grid gap-2">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[16px]">Bilder (1–4)</span>
            <span className="text-xs opacity-75">Erstes Bild = Cover</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {images.map((url, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)' }}>
                <img src={url} alt={`Bild ${i+1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            {images.length < 4 && (
              <label className="aspect-square rounded-xl grid place-items-center cursor-pointer pressable" style={{ background:'rgba(255,255,255,0.04)', border:'1px dashed rgba(255,255,255,0.24)', color:'#fff' }}>
                <span className="text-sm opacity-90">+ Bild</span>
                <input type="file" accept="image/*" multiple onChange={onImageFiles} style={{ display:'none' }} />
              </label>
            )}
          </div>
        </div>

        <div className="h-3" />
        <div className="pb-6">
          <button onClick={onSave} className="w-full h-12 rounded-xl pressable" style={{ background:'#fff', color:'#000', fontWeight:700 }}>Speichern</button>
        </div>
      </section>

      {/* Category picker overlay */}
      {showCatPicker && (
        <div style={{ position:'fixed', inset:0, zIndex:40, background:'rgba(0,0,0,0.6)' }} onClick={()=>setShowCatPicker(false)}>
          <div onClick={(e)=>e.stopPropagation()} style={{ position:'absolute', left:0, right:0, bottom:0, background:'#0f0f0f', borderTopLeftRadius:18, borderTopRightRadius:18, border:'1px solid rgba(255,255,255,0.12)', padding:'14px' }}>
            <div className="font-display mb-2" style={{ fontSize:18, color:'#fff' }}>Kategorie auswählen</div>
            <div className="grid grid-cols-2 gap-2">
              {catOptions.map(opt => (
                <button key={opt} onClick={()=>setCat(opt)} className="h-11 rounded-xl pressable" style={{ border: cat===opt ? '2px solid #fff' : '1px solid rgba(255,255,255,0.16)', background: cat===opt ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', color:'#fff', fontWeight:600 }}>{opt}</button>
              ))}
            </div>
            <div className="mt-3 grid">
              <button onClick={()=>setShowCatPicker(false)} className="h-11 rounded-xl pressable" style={{ background:'#fff', color:'#000', fontWeight:700 }}>Weiter</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
