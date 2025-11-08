import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type CartItem = { product_id: string; qty: number };

type Step = 'address' | 'shipping' | 'payment' | 'review';

export default function Checkout() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const stepFromPath = (() => {
    if (pathname.endsWith('/shipping')) return 'shipping';
    if (pathname.endsWith('/payment')) return 'payment';
    if (pathname.endsWith('/review')) return 'review';
    return 'address';
  })() as Step;
  const [step, setStep] = useState<Step>(stepFromPath);
  useEffect(() => { setStep(stepFromPath); }, [stepFromPath]);

  const [navH, setNavH] = useState(56);
  const [navGlass, setNavGlass] = useState<{ bg?: string; border?: string; blur?: string }>({});
  useEffect(() => {
    const read = () => {
      const n = document.querySelector('nav[aria-label="Hauptnavigation"]') as HTMLElement | null;
      if (!n) return;
      setNavH(n.offsetHeight || 56);
      try {
        const s = (n as HTMLElement).style as CSSStyleDeclaration & { WebkitBackdropFilter?: string };
        setNavGlass({ bg: s.backgroundColor || undefined, border: s.borderColor || undefined, blur: (s.backdropFilter || (s as any).WebkitBackdropFilter) || undefined });
      } catch {}
    };
    read();
    let ro: ResizeObserver | null = null;
    const n = document.querySelector('nav[aria-label="Hauptnavigation"]') as HTMLElement | null;
    if (n && 'ResizeObserver' in window) {
      try { ro = new ResizeObserver(read); ro.observe(n); } catch {}
    }
    window.addEventListener('resize', read);
    return () => { window.removeEventListener('resize', read); if (ro) try { ro.disconnect(); } catch {} };
  }, []);

  // Read cart items from pending
  const cartItems = useMemo<CartItem[]>(() => {
    try { const raw = localStorage.getItem('hiddn_cart_pending'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  }, [pathname]);
  const priceFor = (i: number) => 2999 + (i % 4) * 700;
  const totalCents = useMemo(() => cartItems.reduce((a, _it, i) => a + priceFor(i) * (_it.qty || 1), 0), [cartItems]);

  // Persist simple form states
  const [address, setAddress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hiddn_checkout_address') || 'null') || { name:'', street:'', zip:'', city:'', country:'DE' }; } catch { return { name:'', street:'', zip:'', city:'', country:'DE' }; }
  });
  useEffect(() => { try { localStorage.setItem('hiddn_checkout_address', JSON.stringify(address)); } catch {} }, [address]);
  const [shipping, setShipping] = useState<'standard'|'express'>(() => (localStorage.getItem('hiddn_checkout_shipping') as any) || 'standard');
  useEffect(() => { try { localStorage.setItem('hiddn_checkout_shipping', shipping); } catch {} }, [shipping]);
  const [payment, setPayment] = useState<'card'|'paypal'|'applepay'>(() => (localStorage.getItem('hiddn_checkout_payment') as any) || 'card');
  useEffect(() => { try { localStorage.setItem('hiddn_checkout_payment', payment); } catch {} }, [payment]);

  const goStep = (s: Step) => {
    setStep(s);
    nav(`/checkout/${s === 'address' ? 'address' : s}`);
  };

  return (
    <main className="max-w-md mx-auto" style={{ paddingBottom: `calc(${navH}px + 96px + env(safe-area-inset-bottom))`, color: 'var(--text)' }}>
      <section className="px-5 pt-4">
        <h1 className="font-display text-2xl">Checkout</h1>
        <div className="mt-2 grid grid-cols-4 text-center text-xs" style={{ color: 'var(--text)' }}>
          {(['address','shipping','payment','review'] as Step[]).map((s, i) => (
            <div key={s} className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full grid place-items-center" style={{ background: step===s ? 'var(--accent-soft)' : 'var(--card)', border: '1px solid var(--border)', color: step===s ? 'var(--accent)' : 'var(--text)' }}>{i+1}</div>
              <div className="mt-1 opacity-80">{s === 'address' ? 'Adresse' : s === 'shipping' ? 'Versand' : s === 'payment' ? 'Zahlung' : 'Review'}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-4">
        <AnimatePresence mode="wait">
          {step === 'address' && (
            <motion.div key="address" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}>
              <div className="grid gap-3">
                <div className="grid gap-1">
                  <label className="text-sm opacity-80">Name</label>
                  <input value={address.name} onChange={(e)=>setAddress({ ...address, name: e.target.value })} className="rounded-xl px-3 py-3" style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)' }} />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm opacity-80">Straße</label>
                  <input value={address.street} onChange={(e)=>setAddress({ ...address, street: e.target.value })} className="rounded-xl px-3 py-3" style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)' }} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="grid gap-1 col-span-1">
                    <label className="text-sm opacity-80">PLZ</label>
                    <input value={address.zip} onChange={(e)=>setAddress({ ...address, zip: e.target.value })} className="rounded-xl px-3 py-3" style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)' }} />
                  </div>
                  <div className="grid gap-1 col-span-2">
                    <label className="text-sm opacity-80">Stadt</label>
                    <input value={address.city} onChange={(e)=>setAddress({ ...address, city: e.target.value })} className="rounded-xl px-3 py-3" style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)' }} />
                  </div>
                </div>
                <div className="grid gap-1">
                  <label className="text-sm opacity-80">Land</label>
                  <select value={address.country} onChange={(e)=>setAddress({ ...address, country: e.target.value })} className="rounded-xl px-3 py-3" style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)' }}>
                    <option value="DE">Deutschland</option>
                    <option value="AT">Österreich</option>
                    <option value="CH">Schweiz</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
          {step === 'shipping' && (
            <motion.div key="shipping" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}>
              <div className="grid gap-2">
                <label className="rounded-xl px-3 py-3 flex items-center justify-between pressable" style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)' }}>
                  <span>Standard (2–4 Werktage)</span>
                  <input type="radio" name="ship" checked={shipping==='standard'} onChange={()=>setShipping('standard')} />
                </label>
                <label className="rounded-xl px-3 py-3 flex items-center justify-between pressable" style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)' }}>
                  <span>Express (1–2 Werktage)</span>
                  <input type="radio" name="ship" checked={shipping==='express'} onChange={()=>setShipping('express')} />
                </label>
              </div>
            </motion.div>
          )}
          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}>
              <div className="grid gap-2">
                <label className="rounded-xl px-3 py-3 flex items-center justify-between pressable" style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)' }}>
                  <span>Kreditkarte</span>
                  <input type="radio" name="pay" checked={payment==='card'} onChange={()=>setPayment('card')} />
                </label>
                <label className="rounded-xl px-3 py-3 flex items-center justify-between pressable" style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)' }}>
                  <span>PayPal</span>
                  <input type="radio" name="pay" checked={payment==='paypal'} onChange={()=>setPayment('paypal')} />
                </label>
                <label className="rounded-xl px-3 py-3 flex items-center justify-between pressable" style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)' }}>
                  <span>Apple Pay</span>
                  <input type="radio" name="pay" checked={payment==='applepay'} onChange={()=>setPayment('applepay')} />
                </label>
              </div>
            </motion.div>
          )}
          {step === 'review' && (
            <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}>
              <div className="rounded-2xl border p-4" style={{ background:'var(--card)', border:'1px solid var(--border)' }}>
                <div className="text-sm font-medium mb-2">Zusammenfassung</div>
                <div className="text-sm opacity-85">{address.name}, {address.street}, {address.zip} {address.city}, {address.country}</div>
                <div className="text-sm opacity-85 mt-1">Versand: {shipping === 'express' ? 'Express' : 'Standard'}</div>
                <div className="text-sm opacity-85 mt-1">Zahlung: {payment === 'card' ? 'Kreditkarte' : payment === 'paypal' ? 'PayPal' : 'Apple Pay'}</div>
                <div className="mt-3 text-sm opacity-85">Artikel: {cartItems.length}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Seamless bottom portal above Navbar */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, height: `calc(${navH}px + env(safe-area-inset-bottom))`, zIndex: 55, background: navGlass.bg || 'var(--bg)', borderTop: `1px solid ${navGlass.border || 'var(--border)'}`, backdropFilter: navGlass.blur || 'saturate(140%) blur(8px)', WebkitBackdropFilter: navGlass.blur || 'saturate(140%) blur(8px)' }} />
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: `calc(${navH}px - 2px + env(safe-area-inset-bottom))`, zIndex: 60 }}>
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-2xl border p-4 shadow-lg" style={{ background:'var(--card)', borderColor:'var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-80">Zwischensumme</span>
              <span className="text-base font-semibold">{(totalCents/100).toFixed(2)} €</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => goStep(step === 'address' ? 'address' : (step === 'shipping' ? 'address' : step === 'payment' ? 'shipping' : 'payment'))} className="h-12 rounded-full pressable" style={{ border:'1px solid var(--border)', color:'var(--text)' }}>Zurück</button>
              <button onClick={() => goStep(step === 'address' ? 'shipping' : (step === 'shipping' ? 'payment' : step === 'payment' ? 'review' : 'review'))} className="h-12 rounded-full pressable" style={{ background:'var(--text)', color:'var(--bg)', fontWeight: 700 }}>Weiter</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
