import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreatorPackages() {
  const navigate = useNavigate();
  const [pack, setPack] = useState<null | { id:'free'|'boost'|'premium'|'topbrand'|'partner'; expiresAt:number }>(null);
  useEffect(() => {
    const KEY = 'hiddn_creator_pack';
    try {
      const raw = localStorage.getItem(KEY);
      setPack(raw ? JSON.parse(raw) : null);
    } catch { setPack(null); }
  }, []);
  function leftDays(ts: number){
    const d = Math.max(0, ts - Date.now());
    return Math.ceil(d / (24*3600*1000));
  }
  const nameMap: Record<string,string> = { free:'FREE / Starter', boost:'HIDDN PLUS ⚡', premium:'HIDDN PRO 👑', topbrand:'Top Brand ✨', partner:'Partner +' };

  const statusLabel = pack ? (
    <>
      {nameMap[pack.id]} {pack.id!=='free' && <span style={{ opacity: 0.75 }}>· läuft ab in {leftDays(pack.expiresAt)} Tagen</span>}
    </>
  ) : 'FREE / Starter';

  return (
    <main style={{ minHeight:'100dvh', background:'#000', color:'#FFFFFF', padding:'20px 16px calc(80px + env(safe-area-inset-bottom))' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1 className="font-display" style={{ fontSize: 24, letterSpacing: 1, marginBottom: 6 }}>CREATOR‑PAKETE / PREMIUM</h1>
        <div style={{ color:'#A0A0A0', fontSize: 14, lineHeight: 1.5, marginBottom: 14 }}>
          Mehr Sichtbarkeit. Mehr Umsatz. Wähle dein HIDDN Level und lass deine Produkte für dich arbeiten.
        </div>
        {/* Status pill */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.06)', borderRadius: 9999, padding:'8px 14px', fontSize: 13, marginBottom: 16 }}>
          <span style={{ opacity: 0.9 }}>Aktueller Status:</span>
          <strong>{statusLabel}</strong>
        </div>

        {/* Promo gradient card */}
        <section style={{
          margin: '18px auto 20px',
          borderRadius: 22,
          padding: '24px 18px',
          color: '#fff',
          maxWidth: '90%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #6a11cb, #2575fc)'
        }}>
          <div>
            <h2 className="font-display" style={{ fontSize: 22, marginBottom: 4 }}>Hol dir deinen Startseiten‑Boost.</h2>
            <div style={{ opacity: 0.95, marginBottom: 10 }}>Sichere dir mehr Reichweite für deine besten Produkte.</div>
            <ul style={{ lineHeight: 1.8, marginBottom: 14 }}>
              <li>• Sichtbarkeit auf der HIDDN‑Startseite</li>
              <li>• Bessere Platzierung in Kategorien</li>
              <li>• Extra Creator‑Insights</li>
            </ul>
            <button
              onClick={() => navigate('/creator-pricing')}
              className="pressable"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 14,
                background: '#FFFFFF',
                color: '#6D28D9',
                border: '1px solid rgba(0,0,0,0.08)',
                fontWeight: 700
              }}
            >
              Pakete ansehen & upgraden →
            </button>
          </div>
        </section>

        <div style={{ color:'#7A7A7A', fontSize: 12, lineHeight: 1.6 }}>
          Hinweis: Dein Ranking hängt weiterhin auch von Engagement und Aktivität ab. Premium‑Pakete geben dir einen zusätzlichen Boost – fair für alle.
        </div>
      </div>
    </main>
  );
}
