import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

 type Pack = {
  id: 'free' | 'boost' | 'premium' | 'topbrand' | 'partner';
  title: string;
  price: string;
  cadence?: string;
  points: string[];
  cta: string;
  tint: { bg: string; fg: string; subtle?: string };
  icon?: string;
  inviteOnly?: boolean;
  durationDays?: number; // for expiry demo
};

 const PACKS: Pack[] = [
  {
    id: 'free',
    title: 'Free / Starter',
    price: '0 € / Monat',
    points: ['3 Produkte', 'Basis‑Statistiken'],
    cta: 'Jetzt aktivieren',
    tint: { bg: '#F3F4F6', fg: '#0F172A', subtle: '#E5E7EB' },
    durationDays: 365
  },
  {
    id: 'boost',
    title: 'Boost',
    price: '19,99 € / Woche',
    cadence: '⚡ Top‑Platzierung 24–48 h',
    points: ['Mehr Reichweite', 'Schnelle Sichtbarkeit'],
    cta: 'Upgrade starten',
    tint: { bg: '#F5EBDC', fg: '#0F172A', subtle: '#F1E4D5' },
    icon: '⚡',
    durationDays: 7
  },
  {
    id: 'premium',
    title: 'Premium',
    price: '99 € / Monat',
    cadence: '👑 Startseiten‑Spot 1 Woche',
    points: ['Analytics', 'Premium‑Badge'],
    cta: 'Upgrade starten',
    tint: { bg: '#0F1012', fg: '#FFFFFF', subtle: '#15161A' },
    icon: '👑',
    durationDays: 30
  },
  {
    id: 'topbrand',
    title: 'Top Brand',
    price: '249 € / Monat',
    cadence: 'Dauerhafte Sichtbarkeit',
    points: ['Social‑Feature', 'Priority‑Support'],
    cta: 'Upgrade starten',
    tint: { bg: '#000000', fg: '#FFFFFF', subtle: '#0A0A0A' },
    durationDays: 30
  },
  {
    id: 'partner',
    title: 'Partner +',
    price: 'Nur auf Einladung',
    points: ['Exklusive Drops', 'Umsatzbeteiligung'],
    cta: 'Anfrage senden',
    tint: { bg: '#FFFFFF', fg: '#0F172A', subtle: '#F7F6F4' },
    inviteOnly: true,
    durationDays: 90
  }
];

 type ActivePack = { id: Pack['id']; expiresAt: number };
 const KEY = 'hiddn_creator_pack';

 // helpers
 function leftDays(ts: number) {
  const d = Math.max(0, ts - Date.now());
  return Math.ceil(d / (24 * 3600 * 1000));
 }

 export default function CreatorPricing() {
  const navigate = useNavigate();
  const [active, setActive] = useState<ActivePack | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [vh, setVh] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setActive(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    onResize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); };
  }, []);

  const onCheckout = async (p: Pack) => {
    // Dummy Kasse/Apple‑Pay‑Placeholder
    const ok = confirm(`${p.title}\nJetzt buchen?`);
    if (!ok) return;
    const expiresAt = Date.now() + (p.durationDays || 30) * 24 * 3600 * 1000;
    const ap: ActivePack = { id: p.id, expiresAt };
    try { localStorage.setItem(KEY, JSON.stringify(ap)); } catch {}
    setActive(ap);
    alert('Buchung gespeichert. Badge erscheint auf der Startseite.');
  };

  function leftDays(ts: number) {
    const d = Math.max(0, ts - Date.now());
    return Math.ceil(d / (24 * 3600 * 1000));
  }

  const cards = useMemo(() => PACKS, []);

  return (
    <div ref={hostRef} style={{ minHeight: '100dvh', background: '#050608', color: '#FFFFFF' }}>
      <header
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          top: 0,
          zIndex: 10,
          padding: '12px 16px 10px',
          paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0))'
        }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button
            aria-label="Zurück"
            onClick={() => navigate(-1)}
            className="shrink-0"
            style={{
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 9999,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)'
            }}
          >
            ←
          </button>
          <div>
            <h1 className="font-display" style={{ fontSize: 24, letterSpacing: 1 }}>Wähle deinen HIDDN Level</h1>
            <div style={{ opacity: 0.9 }}>Mehr Engagement und Aktivität bringen dich nach oben.</div>
          </div>
        </div>
      </header>
      {/* spacer to offset fixed header height */}
      <div aria-hidden style={{ height: 'calc(76px + env(safe-area-inset-top))' }} />

      <main style={{ maxWidth: 420, margin: '0 auto', padding: 16 }}>
        {cards.map((p) => (
          <SectionCard key={p.id} pack={p} vh={vh} active={active} onCheckout={onCheckout} />
        ))}
      </main>

      <footer style={{ padding: '12px 16px 24px', color: '#CBD5E1' }}>
        <div style={{ fontSize: 12, lineHeight: 1.5 }}>
          Deine Position auf HIDDN hängt von deinem Engagement, deiner Aktivität und deinem Paket ab. Bleib aktiv – und du bleibst oben.
        </div>
      </footer>
    </div>
  );
}

 function SectionCard({ pack, vh, active, onCheckout }:{ pack:Pack; vh:number; active:ActivePack|null; onCheckout:(p:Pack)=>void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new ResizeObserver(()=> setRect(el.getBoundingClientRect()));
    setRect(el.getBoundingClientRect());
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const h = rect?.height || window.innerHeight;
  const top = rect?.top ?? 0;
  const centerDelta = (top + h/2) - (vh/2);
  const norm = Math.max(-1, Math.min(1, centerDelta / (vh*0.85))); // -1..1
  const scale = 1 - Math.abs(norm) * 0.02;
  const fade = 1; // always bright
  const translate = norm * 6; // px parallax minimal

  const isActive = active && active.id === pack.id && (!pack.inviteOnly);
  const expires = isActive ? `läuft ab in ${leftDays(active!.expiresAt)} Tagen` : undefined;

  const gloss = pack.id === 'topbrand' ? 'linear-gradient( to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.0) 35%, rgba(255,255,255,0.12) 36%, rgba(255,255,255,0.0) 80% )' : undefined;

  // Visual style per package id
  const bg = (() => {
    switch (pack.id) {
      case 'free':
        return 'linear-gradient(145deg, #1a1a1a, #2c2c2c)';
      case 'boost':
        return 'linear-gradient(145deg, #6a11cb, #2575fc)';
      case 'premium':
        return 'linear-gradient(145deg, #ff8a00, #e52e71)';
      case 'topbrand':
        return 'linear-gradient(145deg, #000000, #0a0a0a)';
      case 'partner':
        return 'linear-gradient(145deg, #ffffff, #f7f6f4)';
      default:
        return '#101218';
    }
  })();

  const fg = pack.id === 'partner' ? '#0F172A' : '#FFFFFF';

  return (
    <section
      ref={ref}
      style={{ height: '92dvh', display:'flex', alignItems:'center', justifyContent:'center' }}
    >
      <div
        className="rounded-3xl"
        style={{
          width: '100%',
          maxWidth: 420,
          margin: '0 auto',
          height: '86dvh',
          background: bg,
          color: fg,
          transform: `translateY(${translate.toFixed(1)}px) scale(${(scale * (hovered ? 1.02 : 1)).toFixed(3)})`,
          opacity: 1,
          transition: 'opacity 120ms linear, transform 180ms cubic-bezier(0.22,1,0.36,1), box-shadow 180ms ease',
          border: isActive ? '1px solid rgba(255,215,0,0.35)' : '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 24,
          boxShadow: hovered ? '0 12px 30px rgba(0,0,0,0.35)' : 'none'
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {(pack.id === 'free' || pack.id === 'topbrand') && (
          <div aria-hidden style={{ position:'absolute', inset:0, pointerEvents:'none', boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.08)' }} />
        )}
        {gloss && <div style={{ position:'absolute', inset:0, backgroundImage: gloss, pointerEvents:'none' }} />}
        {/* Subtle diagonal sheen texture */}
        <div aria-hidden style={{ position:'absolute', inset:0, background: 'linear-gradient(120deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 30%)', pointerEvents:'none', mixBlendMode: pack.id==='premium'||pack.id==='topbrand' ? 'screen' : 'normal' }} />
        {/* Corner ribbon */}
        <div aria-hidden style={{ position:'absolute', top:14, right:-50, width:180, height:28, background: pack.id==='premium'||pack.id==='topbrand' ? 'linear-gradient(90deg, #facc15, #fde68a)' : 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))', color: pack.id==='premium'||pack.id==='topbrand' ? '#111' : fg, transform:'rotate(15deg)', display:'grid', placeItems:'center', fontSize:12, letterSpacing:0.4, border:'1px solid rgba(255,255,255,0.18)' }}>Exklusiv</div>
        <div style={{ position:'absolute', inset:0, padding:'24px 22px 80px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            {/* Title row with badge + price pill */}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ fontSize: 12, opacity: 0.8, padding:'4px 8px', borderRadius:9999, border:'1px solid rgba(255,255,255,0.18)', background: pack.id==='partner' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.10)' }}>
                {pack.icon ? `${pack.icon} Paket` : 'Paket'}
              </div>
              <div style={{ marginLeft:'auto', fontSize:12, padding:'6px 10px', borderRadius:9999, border:'1px solid rgba(255,255,255,0.18)', background: pack.id==='partner' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', backdropFilter:'blur(6px)' }}>
                {pack.price}{pack.cadence ? ` • ${pack.cadence}` : ''}
              </div>
            </div>
            <h2 className="font-display" style={{ fontSize: 28, letterSpacing: 0.5, marginTop: 10 }}>{pack.title}</h2>
            {/* Feature chips */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop: 14 }}>
              {pack.points.map((p) => (
                <span key={p} style={{ fontSize: 12, padding:'6px 10px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.14)', background: pack.id==='partner' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', color: fg }}>{p}</span>
              ))}
            </div>
            {isActive && expires && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#A0A0A0' }}>{expires}</div>
            )}
            {pack.inviteOnly && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#A0A0A0' }}>Nur auf Einladung</div>
            )}
          </div>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <button
              onClick={() => onCheckout(pack)}
              className="pressable"
              style={{
                width: '100%',
                maxWidth: 420,
                padding:'14px 18px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #7F5CFF, #D34DFF)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.16)'
              }}
            >
              {pack.cta}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
