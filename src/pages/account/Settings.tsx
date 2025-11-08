import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
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
  const nameMap: Record<string,string> = { free:'FREE', boost:'Boost ⚡', premium:'Premium 👑', topbrand:'Top Brand ✨', partner:'Partner +' };

  return (
    <main className="max-w-md mx-auto p-6 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <h1 className="font-display text-2xl mb-3" style={{ color: 'var(--text)' }}>Einstellungen</h1>
      {/* App Toggles (UI only) */}
      <section className="rounded-2xl border p-4 mb-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header)', color: 'var(--text)' }}>
        <div className="flex items-center justify-between py-2">
          <label htmlFor="darkMode" className="text-sm">Dark Mode</label>
          <input id="darkMode" type="checkbox" defaultChecked aria-readonly />
        </div>
        <div className="flex items-center justify-between py-2">
          <label htmlFor="notifications" className="text-sm">Benachrichtigungen</label>
          <input id="notifications" type="checkbox" aria-readonly />
        </div>
        <div className="flex items-center justify-between py-2">
          <label htmlFor="language" className="text-sm">Sprache</label>
          <select id="language" defaultValue="de" aria-readonly style={{ background:'var(--card)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:10, padding:'6px 8px' }}>
            <option value="de">Deutsch</option>
            <option value="en">Englisch</option>
          </select>
        </div>
      </section>

      {/* Creator: Pakete/Premium */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Erstelle als Creator</h2>
        <button
          className="w-full text-left rounded-2xl border p-4 pressable"
          onClick={() => navigate('/creator-pricing')}
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm opacity-80">Creator Pakete / Premium</div>
              <div className="font-medium">
                {pack ? (
                  <>
                    {nameMap[pack.id]} {pack.id!=='free' && <span className="opacity-80">· läuft ab in {leftDays(pack.expiresAt)} Tagen</span>}
                  </>
                ) : 'Kein Paket aktiv'}
              </div>
            </div>
            <div className="shrink-0 text-sm" style={{ opacity: 0.9, color: 'var(--accent)' }}>Verwalten →</div>
          </div>
        </button>
      </section>
    </main>
  );
}
