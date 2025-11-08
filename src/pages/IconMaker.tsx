import { useEffect, useRef, useState } from 'react';

export default function IconMaker() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState(1024);
  const [text, setText] = useState('HIDDN.');
  const [bg, setBg] = useState('#000000');
  const [fg, setFg] = useState('#FFFFFF');
  const [tracking, setTracking] = useState(6); // px letter-spacing approximation
  const [fontPx, setFontPx] = useState(560); // will be clamped

  // draw function
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    // setup
    c.width = size; c.height = size;
    // background
    ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);

    // font: Bebas Neue like our onboarding. Fallback to Inter if not available.
    const baseFont = `'Bebas Neue', 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;
    // measure to fit width with some margin
    const margin = size * 0.14; // generous side padding
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    function renderAt(fontSize: number) {
      ctx.font = `${fontSize}px ${baseFont}`;
      // approximate manual tracking by splitting
      const chars = text.split('');
      const widths = chars.map(ch => ctx.measureText(ch).width);
      const total = widths.reduce((a, b) => a + b, 0) + (chars.length - 1) * tracking;
      return { total, widths };
    }

    // binary search font to fit
    let lo = 10, hi = fontPx, best = fontPx;
    for (let i = 0; i < 16; i++) {
      const mid = Math.floor((lo + hi) / 2);
      const { total } = renderAt(mid);
      if (total <= (size - margin * 2)) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
    }

    const { total, widths } = renderAt(best);
    const startX = (size - total) / 2;
    const centerY = size / 2;
    ctx.fillStyle = fg;

    // draw with tracking
    let x = startX;
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], x, centerY);
      x += widths[i] + tracking;
    }
  }, [size, text, bg, fg, tracking, fontPx]);

  function downloadSize(target: number) {
    const base = canvasRef.current; if (!base) return;
    // draw into a temp canvas at target size
    const tmp = document.createElement('canvas');
    tmp.width = target; tmp.height = target;
    const tctx = tmp.getContext('2d'); if (!tctx) return;
    // redraw using same routine by scaling the drawn base
    tctx.drawImage(base, 0, 0, target, target);
    const url = tmp.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `icon-${target}.png`;
    a.click();
  }

  return (
    <main className="max-w-md mx-auto p-6 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <h1 className="font-display text-2xl mb-3" style={{ color: 'var(--text)' }}>Icon Maker</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--text)', opacity: 0.8 }}>Generiert ein 1024×1024 App‑Icon im Onboarding‑Stil. Schwarzer Hintergrund, weiße Schrift „HIDDN.“</p>

      <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm" style={{ color: 'var(--text)' }}>Text
            <input className="block w-full mt-1 p-2 rounded-md" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }} value={text} onChange={e=>setText(e.target.value)} />
          </label>
          <label className="text-sm" style={{ color: 'var(--text)' }}>Letter‑Spacing
            <input type="number" className="block w-full mt-1 p-2 rounded-md" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }} value={tracking} onChange={e=>setTracking(parseFloat(e.target.value)||0)} />
          </label>
          <label className="text-sm" style={{ color: 'var(--text)' }}>Background
            <input type="color" className="block w-full mt-1 p-2 rounded-md" value={bg} onChange={e=>setBg(e.target.value)} />
          </label>
          <label className="text-sm" style={{ color: 'var(--text)' }}>Foreground
            <input type="color" className="block w-full mt-1 p-2 rounded-md" value={fg} onChange={e=>setFg(e.target.value)} />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button onClick={()=>downloadSize(1024)} className="px-4 py-2 rounded-md btn-glass">PNG 1024×1024</button>
          <button onClick={()=>downloadSize(512)} className="px-4 py-2 rounded-md btn-glass">PNG 512×512</button>
          <button onClick={()=>downloadSize(192)} className="px-4 py-2 rounded-md btn-glass">PNG 192×192</button>
          <button onClick={()=>downloadSize(180)} className="px-4 py-2 rounded-md btn-glass">PNG 180×180 (Apple)</button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} width={size} height={size} />
      </div>
    </main>
  );
}
