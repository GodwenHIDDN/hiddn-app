import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  AiOutlineQuestionCircle,
  AiOutlineUser,
  AiOutlineSetting,
  AiOutlinePlusCircle,
  AiOutlineBell,
  AiOutlineShopping,
  AiOutlineRollback,
  AiOutlineUpload,
  AiOutlineGift,
  AiOutlineWallet,
  AiOutlineInfoCircle,
  AiOutlineCrown,
  AiOutlinePieChart,
  AiOutlineRight
} from 'react-icons/ai';

const Section = ({ title, children, mt = 8 }: { title: string; children: React.ReactNode; mt?: number }) => (
  <section className={`mt-${mt}`}>
    <div className="px-3 py-3 rounded-md text-sm" style={{ backgroundColor: 'var(--card)', color: 'var(--text)' }}>
      <span className="font-display text-[20px]">{title}</span>
    </div>
    <div className="mt-5 rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header)' }}>
      <ul className="space-y-12" style={{ borderColor: 'var(--border)', listStyleType:'none', paddingLeft:0, margin:0 }}>
        {children}
      </ul>
    </div>
  </section>
);

const Row = ({ to = '#', label, icon, onClick }: { to?: string; label: string; icon?: React.ReactNode; onClick?: () => void }) => (
  <li>
    {onClick ? (
      <button onClick={onClick} className="account-item w-full active:opacity-80" style={{ color: 'var(--text)', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', background: 'transparent' }}>
        <div className="flex items-center gap-5">
          {icon && <span aria-hidden className="text-4xl">{icon}</span>}
          <span>{label}</span>
        </div>
        <AiOutlineRight aria-hidden className="shrink-0" style={{ fontSize: 20 }} />
      </button>
    ) : (
      <Link to={to} className="account-item active:opacity-80" style={{ color: 'var(--text)', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
        <div className="flex items-center gap-5">
          {icon && <span aria-hidden className="text-4xl">{icon}</span>}
          <span>{label}</span>
        </div>
        <AiOutlineRight aria-hidden className="shrink-0" style={{ fontSize: 20 }} />
      </Link>
    )}
  </li>
);

export default function Account() {
  const nav = useNavigate();
  const [codeOpen, setCodeOpen] = useState(false);
  const [creatorCode, setCreatorCode] = useState('');
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  
  function activateCreator() {
    try {
      const code = (creatorCode || '').replace(/\D+/g, '').slice(0, 4);
      if (code.length !== 4) { setCodeMsg('Bitte 4‑stelligen Code eingeben'); return; }
      if (code !== '1234') { setCodeMsg('Code ungültig'); return; }
      localStorage.setItem('hiddn_role', 'creator');
      window.dispatchEvent(new Event('hiddn-update'));
      setCodeMsg('Creator‑Modus aktiviert');
      setTimeout(() => nav('/creator'), 220);
    } catch {
      setCodeMsg('Konnte nicht speichern');
    }
  }
  async function onLogout() {
    try { await supabase.auth.signOut(); } catch {}
    try {
      localStorage.removeItem('hiddn_role');
      localStorage.removeItem('hiddn_onboarded');
      window.dispatchEvent(new Event('hiddn-update'));
    } catch {}
    nav('/onboarding');
  }
  return (
    <main
      className="max-w-md mx-auto px-6 pt-0"
      style={{
        minHeight: '100svh',
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom))'
      }}
    >
      {/* Header bar at very top; centered title, no settings icon */}
      <header
        className="mb-0 relative"
        style={{
          color: 'var(--text)',
          backgroundColor: 'var(--header)',
          paddingTop: 20,
          paddingBottom: 20,
          borderBottom: '1px solid var(--border)'
        }}
      >
        <h1 className="font-display text-xl text-center">Mein Konto</h1>
      </header>

      {/* Content wrapper – page scroll */}
      <div style={{ paddingTop: 12 }}>

        {/* Banner + greeting (avatar removed) */}
        <section className="rounded-2xl overflow-hidden mt-0" style={{ backgroundColor: 'var(--header)' }}>
          <div className="relative" style={{ height: 60 }}>
            <div
              className="absolute inset-0 w-full h-full"
              aria-hidden
              style={{
                backgroundImage:
                'radial-gradient(circle at 10% 10%, rgba(255,255,255,0.08) 2px, transparent 2px), radial-gradient(circle at 30% 40%, rgba(255,255,255,0.06) 2px, transparent 2px), radial-gradient(circle at 70% 20%, rgba(255,255,255,0.05) 2px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.07) 2px, transparent 2px)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </div>
          <div className="pt-2 pb-3 text-center" style={{ color: 'var(--text)' }}>
            <div className="text-sm opacity-70">Hallo,</div>
            <div className="font-display text-xl">Godwen Kaiser</div>
          </div>
        </section>

        <Section title="Übersicht" mt={2}>
          <Row to="/plus" label="Plus" icon={<AiOutlinePlusCircle />} />
          <Row to="/notifications" label="Deine Benachrichtigungen" icon={<AiOutlineBell />} />
          <Row to="/orders" label="Bestellungen" icon={<AiOutlineShopping />} />
          <Row to="/returns" label="Rücksendungen" icon={<AiOutlineRollback />} />
          <Row to="/creator/sell" label="Artikel verkaufen" icon={<AiOutlineUpload />} />
          <Row to="/account/profile" label="Persönliche Daten" icon={<AiOutlineUser />} />
          <Row to="/account/deals" label="Gutscheine" icon={<AiOutlineGift />} />
          <Row to="/account/settings" label="App‑Einstellungen" icon={<AiOutlineSetting />} />
          <Row to="/loyalty" label="Treueprogramme" icon={<AiOutlineWallet />} />
        </Section>

        <Section title="Erstelle als Creator" mt={14}>
          <Row to="/creator/profile" label="Creator‑Profil" icon={<AiOutlineUser />} />
          <Row to="/creator/packages" label="Creator‑Pakete / Premium" icon={<AiOutlineCrown />} />
          <Row to="/creator/insights" label="Creator‑Statistiken / Insights" icon={<AiOutlinePieChart />} />
          <li>
            <button onClick={()=>setCodeOpen(v=>!v)} className="account-item w-full active:opacity-80" style={{ color: 'var(--text)', background:'transparent' }}>
              <div className="flex items-center gap-5">
                <span aria-hidden className="text-4xl"><AiOutlineCrown /></span>
                <span>Creator‑Code eingeben</span>
              </div>
              <AiOutlineRight aria-hidden className="shrink-0" style={{ fontSize: 20 }} />
            </button>
            {codeOpen && (
              <div className="px-7 pb-6 -mt-6">
                <div className="rounded-2xl border p-4 shadow-sm" style={{ borderColor:'var(--border)', background:'var(--header)' }}>
                  <label className="grid gap-2">
                    <span className="font-display text-[16px]" style={{ color:'var(--text)' }}>Creator‑Code</span>
                    <input
                      value={creatorCode}
                      onChange={e=> setCreatorCode(e.target.value.replace(/\D+/g, '').slice(0,4))}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder="• • • •"
                      className="rounded-xl text-center tracking-[0.4em]"
                      style={{ height:48, padding:'0 12px', border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text)', fontSize:20, fontWeight:600, letterSpacing:'0.4em' }}
                    />
                  </label>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button onClick={activateCreator} className="h-11 rounded-xl pressable" style={{ background:'var(--text)', color:'var(--bg)', fontWeight:700 }}>Aktivieren</button>
                    <button onClick={()=>setCodeOpen(false)} className="h-11 rounded-xl pressable" style={{ border:'1px solid var(--border)', color:'var(--text)' }}>Schließen</button>
                  </div>
                  {codeMsg && <div className="mt-3 text-sm" style={{ color:'var(--text)', opacity:0.85 }}>{codeMsg}</div>}
                </div>
              </div>
            )}
          </li>
        </Section>

        <Section title="Mehr" mt={14}>
          <Row to="/about" label="Über uns" icon={<AiOutlineInfoCircle />} />
          <Row to="/help" label="Hilfe & Kontakt" icon={<AiOutlineQuestionCircle />} />
        </Section>

        <Section title="Daten und Datenschutz" mt={14}>
          <Row to="/recommendation-settings" label="Einstellungen zu den Empfehlungen" icon={<AiOutlinePlusCircle />} />
        </Section>

        <Section title="Konto" mt={14}>
          <Row label="Abmelden" icon={<AiOutlineRollback />} onClick={onLogout} />
        </Section>

      </div>

    </main>
  );
}
