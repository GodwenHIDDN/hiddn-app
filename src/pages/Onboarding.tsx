import { useEffect, useMemo, useRef, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const nav = useNavigate();
  useEffect(() => {
    document.body.classList.add('hide-nav');
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevTouch = html.style.touchAction;
    const prevOver = (html as any).style.overscrollBehavior || '';
    const preventPinch = (e: any) => { if ((e as WheelEvent).ctrlKey) { e.preventDefault(); } };
    const preventGesture = (e: Event) => { e.preventDefault(); };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) { e.preventDefault(); return; }
      if (!t.closest('.allow-scroll')) { e.preventDefault(); }
    };
    // Apply locks while onboarding is visible
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    html.style.touchAction = 'none';
    (html as any).style.overscrollBehavior = 'none';
    window.addEventListener('wheel', preventPinch, { passive: false } as any);
    window.addEventListener('gesturestart', preventGesture as any, { passive: false } as any);
    window.addEventListener('gesturechange', preventGesture as any, { passive: false } as any);
    window.addEventListener('touchmove', onTouchMove, { passive: false } as any);
    return () => {
      document.body.classList.remove('hide-nav');
      // Full cleanup to restore app gestures
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      html.style.touchAction = prevTouch;
      (html as any).style.overscrollBehavior = prevOver;
      window.removeEventListener('wheel', preventPinch as any);
      window.removeEventListener('gesturestart', preventGesture as any);
      window.removeEventListener('gesturechange', preventGesture as any);
      window.removeEventListener('touchmove', onTouchMove as any);
    };
  }, []);

  const [needTap] = useState(false);
  const [vidReady, setVidReady] = useState(false);
  const isCoarse = useMemo(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return false;
    try { return window.matchMedia('(pointer: coarse)').matches; } catch { return false; }
  }, []);
  const showLoginRef = useRef(false);
  // Ensure mobile autoplay works (iOS inline, muted before play)
  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    try {
      v.muted = true;
      // iOS inline attributes
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('x5-playsinline', '');
      const tryPlay = async () => { try { await v.play(); } catch {} };
      tryPlay();
      const onVis = () => {
        if (document.hidden) { try { v.pause(); } catch {} }
        else if (!showLoginRef.current) tryPlay();
      };
      document.addEventListener('visibilitychange', onVis);
      return () => { document.removeEventListener('visibilitychange', onVis); };
    } catch {}
  }, [isCoarse]);

  function finish() {
    try { localStorage.setItem('hiddn_onboarded', '1'); } catch {}
    nav('/');
  }
  // no creator activation here (UI removed)

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
  const userUrl = params?.get('video') || undefined;
  const userList = (() => {
    const raw = params?.get('videos');
    if (!raw) return undefined;
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  })();
  const doShuffle = params?.get('mix') === '1';
  // Known good fallbacks (tested)
  const FALLBACKS = useMemo(() => {
    const base = [
      userUrl,
      // Only user's local clips (mix first if present)
      '/videos/fashion-mix.mp4',
      '/videos/p1.mp4',
      '/videos/p2.mp4',
      '/videos/p3.mp4',
      '/videos/p4.mp4'
    ].filter(Boolean) as string[];
    const list = userList && userList.length ? userList : base;
    if (!doShuffle) return list;
    // simple shuffle copy
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [userUrl, userList, doShuffle]);
  const locals = useMemo(() => ['/videos/p1.mp4','/videos/p2.mp4','/videos/p3.mp4','/videos/p4.mp4'], []);
  const [vidIndex, setVidIndex] = useState(0);
  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);
  const [cur, setCur] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  useEffect(() => {
    showLoginRef.current = showLogin;
    const v = videoRef.current;
    if (!v) return;
    try {
      if (showLogin) v.pause(); else v.play().catch(()=>{});
    } catch {}
  }, [showLogin]);
  const [leaving, setLeaving] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [closingSheet, setClosingSheet] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetDone, setResetDone] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [code, setCode] = useState<string[]>(Array(12).fill(''));
  const [codeOk, setCodeOk] = useState<null | boolean>(null);
  const codeRefs = useRef<Array<HTMLInputElement | null>>(Array(12).fill(null));
  function onCodeChange(i: number, val: string) {
    const c = (val || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 1);
    const next = [...code];
    next[i] = c;
    setCode(next);
    setCodeOk(null);
    if (c && i < 11) {
      const n = codeRefs.current[i+1]; n && n.focus();
    }
  }
  function onCodeKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      const p = codeRefs.current[i-1]; p && p.focus();
    }
  }
  function onCodePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const txt = (e.clipboardData.getData('text') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    if (!txt) return;
    e.preventDefault();
    const next = Array(12).fill('');
    for (let i = 0; i < txt.length; i++) next[i] = txt[i];
    setCode(next);
    const t = codeRefs.current[Math.min(txt.length, 11)]; t && t.focus();
  }
  const codeFilled = useMemo(() => code.every(c => c && c.length === 1), [code]);
  function verifyCode() {
    // Dummy verification: accept any 12-char code; toggle success animation
    if (codeFilled) { setCodeOk(true); setTimeout(()=>setCodeOk(null), 1200); }
    else { setCodeOk(false); setTimeout(()=>setCodeOk(null), 700); }
  }
  // removed creator code UI; keep state minimal
  function closeSheet() {
    setClosingSheet(true);
    setTimeout(()=>{ setShowLogin(false); setClosingSheet(false); }, 300);
  }
  // Lock body scroll while sheet is open
  useEffect(() => {
    if (showLogin) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [showLogin]);
  function onVideoError() {
    setVidIndex((i) => (i + 1 < FALLBACKS.length ? i + 1 : i));
  }
  // Pick the first playable local source
  useEffect(() => {
    let cancelled = false;
    async function pick() {
      const candidates = locals;
      for (let i = 0; i < candidates.length; i++) {
        const src = candidates[i];
        if (!src) continue;
        const tester = document.createElement('video');
        let timeout: number | undefined;
        const ok = await new Promise<boolean>((resolve) => {
          const done = (val: boolean) => { window.clearTimeout(timeout); tester.src = ''; resolve(val); };
          tester.oncanplay = () => done(true);
          tester.onerror = () => done(false);
          timeout = window.setTimeout(() => done(false), 6000);
          tester.src = src;
          tester.load();
        });
        if (cancelled) return;
        if (ok) { setSelectedSrc(src); setCur(i); return; }
      }
      setSelectedSrc(locals[0] || null);
    }
    pick();
    return () => { cancelled = true; };
  }, [locals]);

  // Sequence through playlist when a video ends or errors
  const playlist = locals;
  useEffect(() => { setCur(0); }, [locals.join('|')]);
  function advance() {
    setCur((i) => {
      const next = (i + 1) % Math.max(1, playlist.length);
      setSelectedSrc(playlist[next] || null);
      return next;
    });
  }

  // Measure heading position for Splash alignment (store in localStorage)
  useEffect(() => {
    try {
      const h1 = document.querySelector('main .font-display');
      if (!h1) return;
      const r = (h1 as HTMLElement).getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const topVh = +(r.top / vh * 100).toFixed(2);
      localStorage.setItem('hiddn_onboarding_h1_top_vh', String(topVh));
    } catch {}
  }, []);

  return (
    <main className="min-h-screen" style={{ background: '#000', color: '#fff', touchAction: 'none', overscrollBehavior: 'none' as any }}>
      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => { try { videoRef.current?.play(); } catch {} }}
        onLoadedData={() => { setVidReady(true); try { videoRef.current?.play(); } catch {} }}
        onError={() => { try { if (videoRef.current) { videoRef.current.src = '/videos/home.mp4?v=2719'; videoRef.current.load(); videoRef.current.play().catch(()=>{}); } } catch {} }}
        src={'/videos/home.mp4?v=2718'}
        poster="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop"
        style={{ position:'fixed', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'brightness(52%) contrast(1.06)', zIndex:0, background:'#000', opacity: vidReady ? 1 : 0, transition: 'opacity 420ms var(--ease-ios)' }}
      />
      {/* Tap overlay disabled by design */}
      {/* Blur bands: avoid heavy backdrop blur on mobile */}
      <div style={{ position:'fixed', top:0, left:0, width:'100%', height:80, backdropFilter: isCoarse ? 'none' : 'blur(8px)', background:'linear-gradient(to bottom, rgba(0,0,0,0.28), rgba(0,0,0,0))', zIndex:2 }} />
      <div style={{ position:'fixed', bottom:0, left:0, width:'100%', height:80, backdropFilter: isCoarse ? 'none' : 'blur(8px)', background:'linear-gradient(to top, rgba(0,0,0,0.28), rgba(0,0,0,0))', zIndex:2 }} />

      {/* Content */}
      <div style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', zIndex:1, padding:'max(0px, env(safe-area-inset-top)) 14px max(20px, env(safe-area-inset-bottom))', width:'86vw', maxWidth:520, margin:'0 auto', pointerEvents: showLogin ? 'none' : 'auto' }}>
        <h1 className="font-display" style={{ letterSpacing:5, fontWeight:600, fontSize:'clamp(22px, 5.5vw, 30px)', marginBottom:10 }}>HIDDN.</h1>
        <p style={{ fontSize:'clamp(12px, 3.4vw, 14px)', letterSpacing:0.8, marginBottom:26, opacity:0.95 }}>Echte Ideen. Echte Menschen.</p>
        <h2 className="font-display" style={{ fontWeight:500, fontSize:'clamp(18px, 5vw, 24px)', marginBottom:28, opacity:0.95 }}>Gangsters Only.</h2>

        <button onClick={()=> { setAuthMode('login'); setShowLogin(true); }} className="pressable" style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.6)', color:'#fff', padding:'12px 36px', borderRadius:12, fontSize:'clamp(14px, 3.8vw, 16px)', letterSpacing:0.8, cursor:'pointer', marginBottom:10 }}>Login</button>
        <div style={{ display:'grid', gap:6 }}>
          <button onClick={()=> { setAuthMode('register'); setShowLogin(true); }} className="ios-type" style={{ background:'transparent', border:0, color:'#fff', textDecoration:'underline', fontSize:'clamp(13px, 3.8vw, 16px)', letterSpacing:0.3, opacity:0.95, cursor:'pointer' }}>Registrieren</button>
          <Link to="/about" className="ios-type" style={{ color:'#fff', textDecoration:'underline', fontSize:'clamp(12px, 3.4vw, 14px)', opacity:0.9 }}>Über uns</Link>
        </div>
      </div>

      {/* Skip entfernt */}

      {/* Später registrieren */}
      <div style={{ position:'fixed', bottom:'calc(max(10px, env(safe-area-inset-bottom)) + 36px)', left:0, right:0, textAlign:'center', zIndex:3 }}>
        <button
          onClick={() => { try { localStorage.setItem('hiddn_onboarded','1'); } catch {}; nav('/'); }}
          className="ios-type"
          style={{ background:'transparent', border:0, color:'#fff', opacity:0.9, fontSize:'clamp(12px, 3.5vw, 15px)', letterSpacing:0.2, textDecoration:'underline', cursor:'pointer' }}
        >
          Später registrieren
        </button>
      </div>

      {/* Impressum (subtle) */}
      <div style={{ position:'fixed', bottom:'max(10px, env(safe-area-inset-bottom))', left:0, right:0, textAlign:'center', zIndex:3 }}>
        <Link to="/about" className="ios-type" style={{ color:'#fff', opacity:0.8, fontSize:12, textDecoration:'underline' }}>Impressum</Link>
      </div>
      {/* creator code UI removed per request */}

      {/* Login modal */}
      {showLogin && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.35)', padding:'0', display:'block', pointerEvents:'auto', backdropFilter: isCoarse ? 'none' : 'blur(4px)' }} onClick={closeSheet}>
          <div onClick={(e)=>e.stopPropagation()} style={{ position:'absolute', left:0, right:0, bottom:0, height:'92vh', background:'rgba(16,16,18,0.70)', backdropFilter:'blur(10px) saturate(120%)', borderTopLeftRadius:18, borderTopRightRadius:18, border:'1px solid rgba(255,255,255,0.14)', boxShadow:'0 -16px 32px rgba(0,0,0,0.38)', transform: 'translateY(0)', animation: closingSheet ? 'sheetDown 420ms cubic-bezier(0.22,1,0.36,1) both' : 'sheetUp 420ms cubic-bezier(0.22,1,0.36,1) both' }}>
            <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.12)', background:'transparent', borderTopLeftRadius:18, borderTopRightRadius:18 }}>
              <button onClick={closeSheet} aria-label="Schließen" style={{ background:'transparent', border:0, color:'#fff', fontSize:18, opacity:0.9 }}>✕</button>
              <div className="ios-type" style={{ color:'#fff', opacity:0.9, fontSize:12, display:'flex', gap:10, alignItems:'center' }}>
                <button onClick={()=> { setAuthMode('login'); setResetMode(false); }} style={{ background:'transparent', border:0, color: authMode==='login' ? '#fff' : '#bbb', cursor:'pointer' }}>Login</button>
                <span style={{ opacity:0.4 }}>·</span>
                <button onClick={()=> { setAuthMode('register'); setResetMode(false); }} style={{ background:'transparent', border:0, color: authMode==='register' ? '#fff' : '#bbb', cursor:'pointer' }}>Registrieren</button>
              </div>
              <div style={{ width:18 }} />
              {/* sheen */}
              <div aria-hidden style={{ position:'absolute', inset:0, pointerEvents:'none', background:'linear-gradient(120deg, rgba(255,255,255,0.07), rgba(255,255,255,0) 30%)' }} />
            </div>
            <div className="allow-scroll" style={{ height:'calc(100% - 48px)', overflowY:'auto', WebkitOverflowScrolling: 'touch', padding:'22px 16px 28px' }}>
              <div style={{ maxWidth: 440, width:'100%', margin:'0 auto' }}>
                {/* Hero headline */}
                <div style={{ position:'relative', textAlign:'center', padding:'22px 0 18px', marginBottom: 18 }}>
                  <div aria-hidden style={{ position:'absolute', inset:0, background:'radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)' }} />
                  <h3 className="font-display" style={{ position:'relative', fontSize:'clamp(20px, 6vw, 24px)', letterSpacing:1, margin:0 }}>YOU ARE PART OF SOMETHING SPECIAL.</h3>
                </div>
                {/* Creator Access Code (only in register mode) */}
                {authMode === 'register' && (
                  <div className={`container-access ${codeOk === true ? 'access-verified' : ''} ${codeOk === false ? 'access-invalid' : ''}`} onPaste={onCodePaste as any}>
                    <div className="font-display" style={{ fontSize:16, marginBottom:6, color:'#fff' }}>Creator Access Code</div>
                    <div style={{ fontSize:16, color:'#999', marginBottom:12 }}>12‑stelliger Zugangscode – exklusiv für HIDDN Creator. <button className="underline" style={{ background:'transparent', border:0, color:'#BBB', cursor:'pointer' }}>Code beantragen</button></div>
                    <div className="code-rows" role="group" aria-label="Creator Code">
                      {code.map((ch, i) => (
                        <input
                          key={i}
                          ref={(el) => { codeRefs.current[i] = el; }}
                          className="code-box"
                          value={ch}
                          onChange={(e)=>onCodeChange(i, e.target.value)}
                          onKeyDown={(e)=>onCodeKey(i, e)}
                          inputMode="text"
                          autoCapitalize="characters"
                          autoComplete="one-time-code"
                          enterKeyHint="next"
                          style={{ fontSize: 18, textAlign:'center' }}
                          maxLength={1}
                        />
                      ))}
                    </div>
                    {codeFilled ? (
                      <button onClick={verifyCode} className="btn-primary pressable" style={{ marginTop:12 }}>Verifizieren</button>
                    ) : null}
                    {codeOk === true && (<div style={{ marginTop:8, color:'#A7F3D0', fontSize:12 }}>Access Verified. Willkommen in HIDDN.</div>)}
                    {codeOk === false && (<div style={{ marginTop:8, color:'#FCA5A5', fontSize:12 }}>Ungültiger Code – versuche es erneut.</div>)}
                  </div>
                )}

                {/* Inputs or Reset */}
                {!resetMode ? (
                  <div style={{ display:'grid', gap:12, marginBottom:16 }}>
                    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E‑Mail‑Adresse*" style={{ width:'100%', maxWidth:'calc(100vw - 32px)', background:'#141414', color:'#fff', border:'1px solid rgba(255,255,255,0.18)', borderRadius:12, height:48, padding:'0 14px', fontSize:16, boxShadow:'0 2px 6px rgba(0,0,0,0.18)' }} />
                    <div>
                      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Passwort*" type="password" style={{ width:'100%', maxWidth:'calc(100vw - 32px)', background:'#141414', color:'#fff', border:'1px solid rgba(255,255,255,0.18)', borderRadius:12, height:48, padding:'0 14px', fontSize:16, boxShadow:'0 2px 6px rgba(0,0,0,0.18)' }} />
                      {authMode === 'login' && (
                        <div style={{ marginTop:8, textAlign:'right' }}>
                          <button onClick={()=>{ setResetMode(true); setResetDone(false); setResetEmail(email || ''); }} className="underline" style={{ color:'#fff', opacity:0.9, fontSize:'clamp(12px, 3.3vw, 13px)', background:'transparent', border:0, cursor:'pointer' }}>Passwort vergessen?</button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'grid', gap:10, marginBottom:16 }}>
                    <div style={{ textAlign:'left', opacity:0.9 }}>Passwort zurücksetzen</div>
                    <input value={resetEmail} onChange={e=>setResetEmail(e.target.value)} placeholder="E‑Mail‑Adresse" style={{ width:'100%', maxWidth:'calc(100vw - 32px)', background:'#141414', color:'#fff', border:'1px solid rgba(255,255,255,0.18)', borderRadius:12, height:48, padding:'0 14px', fontSize:'clamp(13px, 3.6vw, 14px)' }} />
                    <div style={{ display:'flex', gap:10 }}>
                      <button onClick={()=>{ setResetMode(false); }} className="pressable" style={{ flex:1, height:44, borderRadius:12, background:'transparent', border:'1px solid rgba(255,255,255,0.22)', color:'#fff' }}>Abbrechen</button>
                      <button onClick={()=>{ if (!resetEmail.trim()) return; setResetDone(true); }} className="pressable" style={{ flex:1, height:44, borderRadius:12, background:'var(--accent-grad)', color:'#fff', border:'1px solid rgba(255,255,255,0.22)' }}>Link senden</button>
                    </div>
                    {resetDone && <div style={{ marginTop:8, fontSize:13, color:'#A1E3A1' }}>Wenn ein Konto existiert, haben wir dir einen Reset‑Link geschickt.</div>}
                  </div>
                )}
                {/* Primary login button (accent) */}
                {!resetMode && (
                <div style={{ marginBottom:22 }}>
                  <button onClick={()=>{
                    if (!email.trim() || !password.trim()) { setLoginError('Bitte E‑Mail und Passwort eingeben.'); return; }
                    setLoginError(null);
                    if (authMode === 'register') {
                      // Smooth fade then go to onboarding swipe intro
                      setShowLogin(false);
                      setLeaving(true);
                      setTimeout(() => { nav('/onboarding-lite'); }, 320);
                    } else {
                      // Login flow: mark onboarded and go home
                      setShowLogin(false);
                      try { localStorage.setItem('hiddn_onboarded','1'); } catch {}
                      nav('/');
                    }
                  }} className="pressable" style={{ width:'100%', maxWidth:'calc(100vw - 32px)', background:'var(--accent-grad)', color:'#fff', border:'1px solid rgba(255,255,255,0.22)', borderRadius:14, height:48, fontWeight:800, letterSpacing:0.6, fontSize:'clamp(14px, 3.8vw, 16px)', boxShadow:'0 10px 24px rgba(127,92,255,0.35)' }}>{authMode === 'register' ? 'REGISTRIEREN' : 'LOGIN'}</button>
                  {loginError && <div style={{ marginTop:8, color:'#fca5a5', fontSize:'13px' }}>{loginError}</div>}
                </div>
                )}
                {/* Divider */}
                <div style={{ display:'flex', alignItems:'center', gap:10, margin:'10px 0 12px' }}>
                  <div style={{ height:1, background:'rgba(255,255,255,0.12)', flex:1 }} />
                  <span style={{ opacity:0.8, fontSize:'clamp(12px, 3.2vw, 13px)' }}>ODER</span>
                  <div style={{ height:1, background:'rgba(255,255,255,0.12)', flex:1 }} />
                </div>
                {/* Social logins (glass) */}
                <div style={{ display:'grid', gap:12, paddingTop:8, paddingBottom:24 }}>
                  <button onClick={()=> { if (authMode==='register') { setShowLogin(false); setLeaving(true); setTimeout(()=>nav('/onboarding-lite'), 320); } else { setShowLogin(true); } }} className="pressable" style={{ width:'100%', maxWidth:'calc(100vw - 32px)', backdropFilter:'blur(10px) saturate(140%)', background:'rgba(255,255,255,0.10)', color:'#fff', border:'1px solid rgba(255,255,255,0.20)', borderRadius:14, height:48, fontSize:'clamp(13px, 3.6vw, 14px)', display:'flex', alignItems:'center', gap:10, justifyContent:'center' }}>FORTFAHREN MIT GOOGLE</button>
                  <button onClick={()=> { if (authMode==='register') { setShowLogin(false); setLeaving(true); setTimeout(()=>nav('/onboarding-lite'), 320); } else { setShowLogin(true); } }} className="pressable" style={{ width:'100%', maxWidth:'calc(100vw - 32px)', backdropFilter:'blur(10px) saturate(140%)', background:'rgba(255,255,255,0.10)', color:'#fff', border:'1px solid rgba(255,255,255,0.20)', borderRadius:14, height:48, fontSize:'clamp(13px, 3.6vw, 14px)', display:'flex', alignItems:'center', gap:10, justifyContent:'center' }}>FORTFAHREN MIT APPLE</button>
                  <button onClick={()=> { if (authMode==='register') { setShowLogin(false); setLeaving(true); setTimeout(()=>nav('/onboarding-lite'), 320); } else { setShowLogin(true); } }} className="pressable" style={{ width:'100%', maxWidth:'calc(100vw - 32px)', backdropFilter:'blur(10px) saturate(140%)', background:'rgba(255,255,255,0.10)', color:'#fff', border:'1px solid rgba(255,255,255,0.20)', borderRadius:14, height:48, fontSize:'clamp(13px, 3.6vw, 14px)', display:'flex', alignItems:'center', gap:10, justifyContent:'center' }}>FORTFAHREN MIT FACEBOOK</button>
                </div>
              </div>
              {/* Spacer to guarantee scroll */}
              <div style={{ height: 60 }} />
            </div>
          </div>
        </div>
      )}
      {/* Smooth fade for leaving to /login */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', background:'#000', opacity: leaving ? 0.3 : 0, transition:'opacity 220ms var(--ease-ios)', zIndex:29 }} />
    </main>
  );
}
