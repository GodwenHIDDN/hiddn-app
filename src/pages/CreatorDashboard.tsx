import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type CProd = { id: string; title: string; price_cents: number; status: 'draft'|'pending_review'|'active'; images: string[] };

function loadCreatorProducts(): CProd[] {
  try { const raw = localStorage.getItem('hiddn_creator_products'); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveCreatorProducts(list: CProd[]) {
  try { localStorage.setItem('hiddn_creator_products', JSON.stringify(list)); } catch {}
}

export default function CreatorDashboard() {
  const [items, setItems] = useState<CProd[]>([]);
  useEffect(() => { setItems(loadCreatorProducts()); }, []);
  function remove(id: string) {
    const next = items.filter(x => x.id !== id);
    setItems(next);
    saveCreatorProducts(next);
  }
  const total = items.length;
  const active = items.filter(i => i.status === 'active').length;
  const pending = items.filter(i => i.status === 'pending_review').length;
  return (
    <main className="max-w-md mx-auto" style={{ minHeight:'100svh', color:'#fff', background: 'linear-gradient(180deg, #0e0e0e 0%, #141414 100%)' }}>
      {/* subtle texture overlay */}
      <div aria-hidden style={{ position:'fixed', inset:0, pointerEvents:'none', opacity:0.06, backgroundImage:'radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 70% 60%, #fff, transparent), radial-gradient(1px 1px at 40% 80%, #fff, transparent)' }} />
      {/* Hero header */}
      <section style={{ position:'relative', padding:'28px 18px 18px', background:'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', borderBottom:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(6px)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display" style={{ fontSize:24, letterSpacing:0.5 }}>Creator</h1>
            <div className="opacity-80 text-sm">Dein Atelier</div>
          </div>
          <Link to="/creator/new" className="pressable" style={{ background:'linear-gradient(135deg, #a96fff, #5f2aff)', color:'#fff', padding:'12px 16px', borderRadius:12, fontWeight:700, boxShadow:'0 8px 22px rgba(95,42,255,0.35)', transform:'translateZ(0)', transition:'transform 200ms var(--ease-ios), box-shadow 200ms var(--ease-ios)' }} onMouseEnter={(e)=>{ (e.currentTarget as HTMLAnchorElement).style.transform='scale(1.02)'; }} onMouseLeave={(e)=>{ (e.currentTarget as HTMLAnchorElement).style.transform='scale(1)'; }}>+ Produkt</Link>
        </div>
        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', boxShadow:'0 6px 16px rgba(0,0,0,0.25)' }}>
            <div className="px-3 pt-2 text-xs opacity-80">Gesamt</div>
            <div className="px-3 pb-2 font-display" style={{ fontSize:18 }}>{total}</div>
          </div>
          <div className="rounded-xl" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', boxShadow:'0 6px 16px rgba(0,0,0,0.25)' }}>
            <div className="px-3 pt-2 text-xs opacity-80">Aktiv</div>
            <div className="px-3 pb-2 font-display" style={{ fontSize:18 }}>{active}</div>
          </div>
          <div className="rounded-xl" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', boxShadow:'0 6px 16px rgba(0,0,0,0.25)' }}>
            <div className="px-3 pt-2 text-xs opacity-80">Prüfung</div>
            <div className="px-3 pb-2 font-display" style={{ fontSize:18 }}>{pending}</div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-6">
        {items.length === 0 && (
          <div className="grid place-items-center" style={{ minHeight:'45vh' }}>
            <div className="rounded-2xl text-center" style={{ border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.03)', padding:'22px 18px', maxWidth: 360, width:'100%' }}>
              <div className="font-medium">Noch keine Produkte</div>
              <div className="text-sm opacity-80 mt-1">Lege dein erstes Produkt an.</div>
              <div className="mt-3">
                <Link to="/creator/new" className="pressable" style={{ background:'#fff', color:'#000', padding:'10px 18px', borderRadius:12, fontWeight:700 }}>Jetzt starten</Link>
              </div>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {items.map((p, i) => (
              <div key={p.id} className="rounded-2xl overflow-hidden transition-transform" style={{ border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.03)', boxShadow:'0 10px 28px rgba(0,0,0,0.35)' }} onMouseEnter={(e)=>{ (e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)'; }} onMouseLeave={(e)=>{ (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; }}>
                <div className="aspect-square" style={{ position:'relative', background:'#111' }}>
                  <img src={p.images[0] || `https://source.unsplash.com/featured/?fashion,product&sig=${1000+i}`} alt={p.title} className="w-full h-full object-cover" />
                  <div style={{ position:'absolute', top:8, left:8 }}>
                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background:'rgba(0,0,0,0.6)', border:'1px solid rgba(255,255,255,0.18)', boxShadow: p.status==='pending_review' ? '0 0 12px rgba(169,111,255,0.55)' : p.status==='active' ? '0 0 10px rgba(85,255,170,0.35)' : '0 0 8px rgba(255,255,255,0.18)' }}>{p.status}</span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-medium truncate" style={{ fontSize:14 }}>{p.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-80">{(p.price_cents/100).toFixed(2)} €</span>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to={`/creator/edit/${encodeURIComponent(p.id)}`} className="h-8 rounded-md text-xs grid place-items-center pressable" style={{ border:'1px solid rgba(255,255,255,0.18)', color:'#fff' }}>Edit</Link>
                      <button onClick={()=>remove(p.id)} className="h-8 rounded-md text-xs grid place-items-center pressable" style={{ background:'linear-gradient(135deg, #a96fff, #5f2aff)', color:'#fff', fontWeight:700, boxShadow:'0 6px 16px rgba(95,42,255,0.35)' }}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
