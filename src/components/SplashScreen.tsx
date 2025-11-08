import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish, durationMs = 2600 }: { onFinish: () => void; durationMs?: number }) {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);
  const [typed, setTyped] = useState(0);
  const [dot, setDot] = useState(false);
  const [topPct, setTopPct] = useState<number>(26);
  const WORD = 'HIDDN';

  useEffect(() => {
    // Typing: quick type HIDDN, short pause, then dot
    const charDelay = 90; // ms between letters
    const pauseBeforeDot = 1100; // slightly faster dot
    const timers: Array<number> = [] as any;
    for (let i = 1; i <= WORD.length; i++) {
      timers.push(window.setTimeout(() => setTyped(i), i * charDelay));
    }
    timers.push(window.setTimeout(() => setDot(true), WORD.length * charDelay + pauseBeforeDot));
    const tFade = window.setTimeout(() => {
      setFade(true);
      window.setTimeout(() => { setVisible(false); onFinish(); }, 500);
    }, durationMs);
    return () => { timers.forEach(clearTimeout); clearTimeout(tFade); };
  }, [onFinish, durationMs]);

  // Align to onboarding heading top (vh) if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hiddn_onboarding_h1_top_vh');
      if (!raw) return;
      const v = Math.max(10, Math.min(60, parseFloat(raw))); // clamp 10%..60%
      if (!Number.isNaN(v)) setTopPct(v);
    } catch {}
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100svh', minHeight: '100dvh',
        backgroundColor: '#000',
        paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)',
        zIndex: 9999,
        opacity: fade ? 0 : 1, transition: 'opacity 500ms var(--ease-ios)', touchAction: 'none', overflow: 'hidden'
      }}
    >
      <div aria-label="HIDDN Splash" style={{ position:'absolute', top: `${topPct}%`, left:'50%', transform:'translateX(-50%)', textAlign:'center' }}>
        <div
          className="font-display"
          style={{
            color: '#fff', fontWeight: 600, letterSpacing: 6, fontSize: 28,
            willChange: 'opacity, transform',
          }}
        >
          <span>{WORD.slice(0, typed)}</span>
          {dot && (
            <span style={{ marginLeft: -3, display: 'inline-block', letterSpacing: 0 }}>.</span>
          )}
        </div>
      </div>
    </div>
  );
}
