import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingLite() {
  const nav = useNavigate();
  const [current, setCurrent] = useState(0); // slide index: 0..3
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dotsRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const autoTimer = useRef<number | null>(null);
  const pausedUntil = useRef<number>(0);
  const lastInteraction = useRef<number>(0);
  const [ready, setReady] = useState(false);
  const [vidErr, setVidErr] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevTouch = html.style.touchAction;
    const prevOver = (html as any).style.overscrollBehavior || '';
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    html.style.touchAction = 'none';
    (html as any).style.overscrollBehavior = 'none';

    const preventPinch = (e: any) => { if ((e as WheelEvent).ctrlKey) { e.preventDefault(); } };
    const preventGesture = (e: Event) => { e.preventDefault(); };
    window.addEventListener('wheel', preventPinch, { passive: false } as any);
    window.addEventListener('gesturestart', preventGesture as any, { passive: false } as any);
    window.addEventListener('gesturechange', preventGesture as any, { passive: false } as any);
    return () => {
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      html.style.touchAction = prevTouch;
      (html as any).style.overscrollBehavior = prevOver;
      window.removeEventListener('wheel', preventPinch as any);
      window.removeEventListener('gesturestart', preventGesture as any);
      window.removeEventListener('gesturechange', preventGesture as any);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('x5-playsinline', '');
      const tryPlay = () => { try { v.play().catch(()=>{}); } catch {} };
      tryPlay();
      const onVis = () => { if (!document.hidden) tryPlay(); };
      document.addEventListener('visibilitychange', onVis);
      return () => document.removeEventListener('visibilitychange', onVis);
    } catch {}
  }, []);

  // Auto-advance slides with pause/resume on interaction
  useEffect(() => {
    const schedule = (delay = 6000) => {
      if (autoTimer.current) window.clearTimeout(autoTimer.current);
      autoTimer.current = window.setTimeout(() => {
        const now = Date.now();
        if (now < pausedUntil.current) {
          // still paused, reschedule minimally to check again
          schedule(pausedUntil.current - now + 25);
          return;
        }
        setCurrent((c) => {
          if (c < 3) {
            // chain next schedule
            schedule(6000);
            return c + 1;
          }
          // stop on last slide
          return c;
        });
      }, delay);
    };
    schedule(6000);
    return () => { if (autoTimer.current) window.clearTimeout(autoTimer.current); };
  }, []);

  function pauseAuto(ms = 2500) {
    const now = Date.now();
    pausedUntil.current = Math.max(pausedUntil.current, now + ms);
    lastInteraction.current = now;
  }

  // Swipe handlers (horizontal)
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; pauseAuto(); }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return; // ignore tiny moves
    pauseAuto();
    setCurrent((c) => {
      if (dx < 0) return Math.min(3, c + 1); // swipe left → next
      return Math.max(0, c - 1); // swipe right → prev
    });
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') { pauseAuto(); setCurrent((c) => Math.max(0, c - 1)); }
    if (e.key === 'ArrowRight') { pauseAuto(); setCurrent((c) => Math.min(3, c + 1)); }
  }

  function enterApp() {
    if (overlayRef.current) overlayRef.current.style.opacity = '0';
    if (dotsRef.current) dotsRef.current.style.opacity = '0';
    window.setTimeout(() => {
      try { localStorage.setItem('hiddn_onboarded', '1'); } catch {}
      nav('/');
    }, 900);
  }

  // No pan; video fills screen
  const panX = 0;

  return (
    <div style={{ width: '100vw', height: '100dvh', background: '#000', color: '#fff', touchAction: 'auto', overscrollBehavior: 'none' as any }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          id="bgVideo"
          poster="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop"
          style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `translateX(${panX}%)` }}
        onLoadedData={() => { setReady(true); setVidErr(false); }}
        onError={() => {
          const v = videoRef.current;
          if (!v) return;
          // Fallback if external URL cannot play (CORS or non-mp4)
          v.innerHTML = '';
          const src = document.createElement('source');
          src.src = '/videos/home.mp4';
          src.type = 'video/mp4';
          v.appendChild(src);
          try { v.load(); v.play().catch(()=>{}); } catch {}
          setVidErr(true);
        }}
        >
          {/* Primary source: user-provided onboarding video */}
          <source src="/videos/onboarding.mp4?v=2720" type="video/mp4" />
        </video>
      </div>

      <div
        ref={overlayRef}
        className="overlay"
        style={{ position: 'fixed', inset: 0, transition: 'opacity 0.9s ease', zIndex: 1, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%)', touchAction: 'pan-x' as any }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => {
          pauseAuto();
          setCurrent((c) => {
            if (c >= 3) return c; // guard: last slide only via button
            return Math.min(3, c + 1);
          });
        }}
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        {/* Centered slides with breathing space */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 8%', width:'min(92vw, 720px)', maxWidth:'720px' }}>
          <div style={{ opacity: current===0 ? 1 : 0, transition: 'opacity 1.7s ease', position:'absolute', left:0, right:0 }}>
            <div style={{ maxWidth:'80%', margin:'0 auto' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.6rem', fontWeight: 600, letterSpacing: '0.04em' }}>Willkommen bei HIDDN.</h2>
              <p style={{ fontSize: '1.2rem', lineHeight: '1.7rem' }}>Eine Welt zwischen Fashion, Design und Vision.<br/>Für Marken, die echt sind – und Menschen, die das spüren.</p>
            </div>
          </div>
          <div style={{ opacity: current===1 ? 1 : 0, transition: 'opacity 1.7s ease', position:'absolute', left:0, right:0 }}>
            <div style={{ maxWidth:'80%', margin:'0 auto' }}>
              <p style={{ fontSize: '1.2rem', lineHeight: '1.7rem' }}>Nicht versteckt. Nur nicht überall.<br/>Zu echt, um laut zu sein.<br/>HIDDN zeigt, was echt ist – bevor es jemand anderes tut.</p>
            </div>
          </div>
          <div style={{ opacity: current===2 ? 1 : 0, transition: 'opacity 1.7s ease', position:'absolute', left:0, right:0 }}>
            <div style={{ maxWidth:'80%', margin:'0 auto' }}>
              <p style={{ fontSize: '1.2rem', lineHeight: '1.7rem' }}>Kein Algorithmus. Kein Trend.<br/>Nur du. Dein Stil. Dein Gefühl.<br/>Fashion, die bleibt, weil sie nicht versucht zu passen.</p>
            </div>
          </div>
          <div style={{ opacity: current===3 ? 1 : 0, transition: 'opacity 1.7s ease', position:'absolute', left:0, right:0 }}>
            <div style={{ maxWidth:'80%', margin:'0 auto' }}>
              <p style={{ fontSize: '1.2rem', lineHeight: '1.7rem' }}>Mach’s zu deinem Moment.<br/>Entdecke Brands, die noch Geschichten erzählen.</p>
              <div style={{ marginTop: '2rem' }}>
                <button
                  className="start-btn"
                  onClick={enterApp}
                  style={{
                    padding: '0.8rem 1.8rem', borderRadius: 9999,
                    border: '1px solid rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.18)',
                    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', color: '#fff',
                    fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', outline: 'none'
                  }}
                >
                  App starten
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* minimal fallback notice only if video errors and not ready */}
        {!ready && vidErr && (
          <div style={{ position:'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', fontSize: 12, opacity: 0.7 }}>
            Video konnte nicht automatisch geladen werden.
          </div>
        )}
      </div>

    </div>
  );
}
