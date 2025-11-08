import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure no legacy Service Worker interferes with the standalone app.
if ('serviceWorker' in navigator) {
  (async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch {}
  })();
}

const params = new URLSearchParams(location.search);
const DEBUG = params.get('debug') === '1' || params.get('safe') === '1';

function attachDebugOverlay() {
  if (!DEBUG) return;
  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'fixed', left: '8px', bottom: '8px', right: '8px', maxHeight: '40vh', overflow: 'auto',
    background: 'rgba(0,0,0,0.72)', color: '#fff', font: '12px/1.5 system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    padding: '8px 10px', borderRadius: '10px', zIndex: '99999', whiteSpace: 'pre-wrap'
  } as CSSStyleDeclaration);
  box.id = 'dbg';
  document.body.appendChild(box);
  const log = (type: string, msg: any) => {
    const line = document.createElement('div');
    line.textContent = `[${type}] ${typeof msg === 'string' ? msg : (msg && msg.message) || String(msg)}`;
    box.appendChild(line);
  };
  (window as any).__dbglog = log;
  window.addEventListener('error', (e) => log('error', e.error || e.message));
  window.addEventListener('unhandledrejection', (e: any) => log('promise', e.reason));
  const origErr = console.error;
  console.error = (...args: any[]) => { try { log('console', args[0]); } catch {} origErr.apply(console, args as any); };
}

attachDebugOverlay();

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  ;(window as any).__booted = true
  try { window.dispatchEvent(new Event('hiddn-booted')); } catch {}
} catch (e: any) {
  if (DEBUG) {
    const el = document.getElementById('dbg') || document.body.appendChild(document.createElement('div'));
    if (el && el.id !== 'dbg') { el.id = 'dbg'; }
    if (el) {
      Object.assign(el.style, { position:'fixed', left:'8px', bottom:'8px', right:'8px', background:'rgba(0,0,0,0.72)', color:'#fff', padding:'8px', zIndex:'99999', borderRadius:'10px', font:'12px/1.5 system-ui' } as CSSStyleDeclaration);
      el.textContent = `Render error: ${(e && e.message) || e}`;
    }
  } else {
    throw e;
  }
}


// Fade out and remove the HTML pre-splash once React has mounted
requestAnimationFrame(() => {
  const pre = document.getElementById('pre-splash');
  const shell = document.getElementById('nojs-shell');
  if (pre) {
    // small delay to ensure visibility then fade
    setTimeout(() => {
      pre.classList.add('fade');
      setTimeout(() => pre.remove(), 300);
    }, 50);
  }
  if (shell) {
    // hide static shell once app is booted
    setTimeout(() => {
      (shell as HTMLElement).style.opacity = '0';
      (shell as HTMLElement).style.transition = 'opacity .2s ease';
      setTimeout(() => shell.remove(), 220);
    }, 80);
  }
});

// Debug reset: visit with ?reset=1 to clear SW and caches in case of white/black screens
(async () => {
  try {
    const params = new URLSearchParams(location.search);
    if (params.get('reset') === '1') {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      // Drop any persisted storage (optional):
      try { await (navigator as any).storage?.persist && (navigator as any).storage.persist(); } catch {}
      // Reload without query
      const clean = location.origin + location.pathname;
      location.replace(clean);
    }
  } catch {}
})();
