import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchCreatorsMock } from '../hiddn/core/data/creators';
import { computeNewCreators, cardBackground } from '../hiddn/core/modules/newCreators';
import type { NewCreatorsSection } from '../hiddn/core/modules/newCreators';
import { api, getProducts } from '../lib/api';
import Img from '../components/ui/Image';

export default function Home() {
  const [creating, setCreating] = useState(false);
  const [brandMsg, setBrandMsg] = useState<string | null>(null);
  const [items, setItems] = useState<Array<{id:string; title:string; price_cents:number; currency:string; image_url?:string}>>([]);
  const ACCENT = 'var(--accent)';
  const [sponsorBg, setSponsorBg] = useState<string>('#1f2937');
  const [sponsorBg2, setSponsorBg2] = useState<string>('#111111');
  const [sponsorFg, setSponsorFg] = useState<string>('#ffffff');
  const [sponsorFg2, setSponsorFg2] = useState<string>('#ffffff');
  const [sponsorBg3, setSponsorBg3] = useState<string>('#0f0f0f');
  const [sponsorFg3, setSponsorFg3] = useState<string>('#ffffff');
  const [sponsorBg4, setSponsorBg4] = useState<string>('#ececec');
  const [sponsorFg4, setSponsorFg4] = useState<string>('#0f0f0f');
  const [newCreators, setNewCreators] = useState<NewCreatorsSection | null>(null);
  const [ncVisible, setNcVisible] = useState(false);
  // pull-to-refresh state
  const hostRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number>(0);
  const pulling = useRef<boolean>(false);
  const [ptr, setPtr] = useState<number>(0);          // pull distance (0..100)
  const [armed, setArmed] = useState<boolean>(false); // threshold reached
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const chips = ['Damen', 'Herren', 'Kinder', 'Track Suits', 'Sneaker', 'Schuhe', 'Jacken', 'Hoodies', 'Hosen', 'Accessoires'];
  const catPool = ['sneakers','jackets','hoodie','accessories','bags','eyewear','tops','bottoms'];
  const trendingImgs = [
    'https://images.unsplash.com/photo-1520975922137-8bdf0ef87672?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503342217505-b0a15cf70489?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514416309822-6de6d80d02f2?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516280030429-27679b3dc9cf?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549439602-43ebca2327b1?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520975867597-0f29a98f5f3b?q=80&w=1200&auto=format&fit=crop'
  ];
  const trending = Array.from({ length: 8 }).map((_, i) => ({
    id: `trend-${i+1}`,
    img: trendingImgs[i % trendingImgs.length],
    title: `Trend #${i+1}`,
    cat: catPool[i % catPool.length]
  }));

  // Home video hero: prefer full home clip first, then light mobile fallback
  const HOME_VIDS = useMemo(() => ['/videos/home.mp4', '/videos/home_mobile.mp4'], []);
  const [homeVidIndex, setHomeVidIndex] = useState(0);
  function onHomeVidError() {
    setHomeVidIndex((i) => (i + 1 < HOME_VIDS.length ? i + 1 : i));
  }
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const vidDur = useRef<number>(0);
  const heroRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [needTap] = useState(false);
  const isCoarse = useMemo(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return false;
    try { return window.matchMedia('(pointer: coarse)').matches; } catch { return false; }
  }, []);
  const noVideo = useMemo(() => {
    try {
      const qp = new URLSearchParams(window.location.search).get('novideo');
      if (qp === '1') return true;
      if (qp === '0') return false;
      return false; // default: allow videos on all devices
    } catch {
      return false;
    }
  }, []);
  const lockRef = useRef(false);
  const lockAtRef = useRef(0);
  const [heroBlend, setHeroBlend] = useState(0); // 0..1 how strong the blur bands render
  const scrollPauseRef = useRef<number | null>(null);
  const [heroProgress, setHeroProgress] = useState(0); // 0..1 shrink/fade progress of hero
  // sponsored portrait video card state (bottom special)
  // expects file to be present at public/videos/9324831-uhd_2160_4096_25fps.mp4
  const SPONSOR_VIDS = useMemo(() => [
    '/videos/9324831-uhd_2160_4096_25fps.mp4',
    '/videos/p1.mp4',
    '/videos/home_mobile.mp4',
    '/videos/home.mp4'
  ], []);
  const [svIdx, setSvIdx] = useState(0);
  const svRef = useRef<HTMLVideoElement | null>(null);
  const [svReady, setSvReady] = useState(false);
  const [svNeedTap, setSvNeedTap] = useState(false);
  function onSvErr() { setSvIdx(i => (i + 1 < SPONSOR_VIDS.length ? i + 1 : i)); }
  useEffect(() => {
    const v = svRef.current; if (!v) return;
    // ensure attributes before attempting play
    try {
      v.muted = true;
      v.setAttribute('playsinline','');
      v.setAttribute('webkit-playsinline','');
      v.setAttribute('x5-playsinline','');
    } catch {}
    const tryPlay = async () => { try { await v.play(); } catch {} };
    const onCan = () => { setSvReady(true); tryPlay(); };
    const onData = () => { setSvReady(true); };
    v.addEventListener('canplay', onCan);
    v.addEventListener('loadeddata', onData);
    // Observe visibility to auto play/pause when in view
    let io: IntersectionObserver | null = null;
    try {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            tryPlay();
          } else {
            try { v.pause(); } catch {}
          }
        });
      }, { threshold: 0.25 });
      io.observe(v);
    } catch {}
    // detect blocked autoplay
    const id = window.setTimeout(() => { /* disabled tap overlay */ }, 1000);
    return () => {
      v.removeEventListener('canplay', onCan);
      v.removeEventListener('loadeddata', onData);
      try { if (io) io.disconnect(); } catch {}
      window.clearTimeout(id);
    };
  }, [svIdx]);
  // Invert only when device is in light mode (user wants normal on dark, IR-style on light)
  const [invertByTheme, setInvertByTheme] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return false;
    return window.matchMedia('(prefers-color-scheme: light)').matches;
  });
  // Also track light scheme to force readable text on bright video
  const [isLightScheme, setIsLightScheme] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return false;
    return window.matchMedia('(prefers-color-scheme: light)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e: MediaQueryListEvent) => { setInvertByTheme(e.matches); setIsLightScheme(e.matches); };
    try {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } catch {
      // Safari fallback
      // @ts-ignore
      mql.addListener && mql.addListener(handler);
      return () => { try { /* @ts-ignore */ mql.removeListener && mql.removeListener(handler); } catch {} };
    }
  }, []);
  // Ensure mobile autoplay works for hero (iOS inline, muted before play)
  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    try {
      v.muted = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('x5-playsinline', '');
      const tryPlay = async () => { try { await v.play(); } catch {} };
      tryPlay();
      const onVis = () => { if (!document.hidden) tryPlay(); };
      document.addEventListener('visibilitychange', onVis);
      // detect failed autoplay (no time progress after short delay)
      const id = window.setTimeout(() => { /* disabled tap overlay */ }, 900);
      return () => document.removeEventListener('visibilitychange', onVis);
    } catch {}
  }, []);
  // capture duration
  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    const onMeta = () => { vidDur.current = isFinite(v.duration) ? v.duration : 10; };
    const onCanPlay = () => {
      if (SCRUB) {
        try { v.currentTime = 0.5; } catch {}
        try { v.pause(); } catch {}
        updateVideoByScroll();
      } else {
        // ensure autoplay on mobile
        try { v.muted = true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline',''); v.play(); } catch {}
        setVideoReady(true);
      }
    };
    const onLoadedData = () => { if (SCRUB) { try { v.pause(); } catch {}; updateVideoByScroll(); } else { setVideoReady(true); } };
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('loadeddata', onLoadedData);
    if (SCRUB) { try { v.pause(); } catch {} }
    return () => { v.removeEventListener('loadedmetadata', onMeta); v.removeEventListener('canplay', onCanPlay); v.removeEventListener('loadeddata', onLoadedData); };
  }, [homeVidIndex]);
  // tie video time to scroll position (off to allow autoplay+loop)
  const SCRUB = false;
  const updateVideoByScroll = () => {
    if (!SCRUB) return;
    const el = hostRef.current; const v = videoRef.current; const d = vidDur.current; const hero = heroRef.current;
    if (!v || !hero) return;
    const range = Math.max(1, hero.clientHeight - 8);
    // Use window scroll position to drive progress for better iOS Safari/Chrome behavior
    const y = Math.max(0, Math.min(range, (typeof window !== 'undefined' ? window.scrollY || 0 : 0)));
    const progress = y / range;
    // store progress for UI transforms (hero shrink/fade)
    if (Math.abs(progress - heroProgress) > 0.001) setHeroProgress(progress);
    const dur = (d && isFinite(d) && d > 0.1) ? d : 10; // assume 10s virtual if unknown
    const target = progress * Math.max(0.1, dur - 0.1);
    // Play only while scrolling, at 2x; gently snap to the target to stay in sync
    try {
      const drift = Math.abs((v.currentTime || 0) - target);
      if (drift > 0.2) v.currentTime = target; // correct larger drift
      v.playbackRate = 2.0;
      // play during active scroll
      const p = v.play();
      if (p && typeof p.then === 'function') { p.catch(()=>{}); }
      // pause shortly after scroll stops
      if (scrollPauseRef.current) { window.clearTimeout(scrollPauseRef.current); }
      scrollPauseRef.current = window.setTimeout(() => { try { v.pause(); } catch {} }, 140);
    } catch {}
    // Smoothly blend in blur bands as user scrolls into content
    const raw = Math.max(0, Math.min(1, progress * 1.25));
    const blend = raw * raw; // ease-in for smoother start
    if (Math.abs(blend - heroBlend) > 0.005) setHeroBlend(blend);
  };
  const onScrollRaf = () => {
    if (!SCRUB) return;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateVideoByScroll();
    });
  };
  useEffect(() => {
    if (SCRUB) updateVideoByScroll();
    const onResize = () => updateVideoByScroll();
    window.addEventListener('resize', onResize);
    // Bind window scroll to drive hero progress
    window.addEventListener('scroll', onScrollRaf, { passive: true } as any);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScrollRaf as any);
    };
  }, []);

  // Creator mode: only for Top-Hero, Sponsored 1, Video-Hero
  type CreatorData = {
    topHero?: { title?: string; sub?: string; cta1?: string; cta2?: string };
    s1?: { brand?: string; title?: string; sub?: string; cta?: string; imgSrc?: string };
    videoHero?: { caption?: string; profile?: string; videoSrc?: string; posterSrc?: string };
    sponsorBand?: { title?: string; text?: string; mediaSrc?: string };
  };
  const CREATOR_KEY = 'hiddn_creator_home';
  const CREATOR_ENABLED = false; // temporarily disable Creator UI/behavior
  const [creator, setCreator] = useState(false);
  const [creatorData, setCreatorData] = useState<CreatorData>({});
  const [editorOpen, setEditorOpen] = useState<null | 'topHero' | 's1' | 'videoHero' | 'sponsorBand'>(null);

  // Inspiration cards source
  const inspirationCards = useMemo(() => ([
    { t:'Nimm es gelassen', s:'Relaxte Oversized‑Fits zum Durchatmen', img:'https://source.unsplash.com/featured/?oversized,street&sig=1401' },
    { t:'Nietendetails', s:'Femme ist angesagt – jetzt mit Spice', img:'https://source.unsplash.com/featured/?studs,details&sig=1402' },
    { t:'Soft Layers', s:'Warme Töne, weiche Stoffe', img:'https://source.unsplash.com/featured/?layers,cozy&sig=1403' },
    { t:'Clean Classics', s:'Zeitlose Silhouetten', img:'https://source.unsplash.com/featured/?minimal,outfit&sig=1404' },
  ]), []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CREATOR_KEY);
      if (raw) setCreatorData(JSON.parse(raw));
    } catch {}
  }, []);
  function saveCreator() {
    try { localStorage.setItem(CREATOR_KEY, JSON.stringify(creatorData)); } catch {}
  }
  function resetCreator() {
    if (!confirm('Alle Creator-Anpassungen zurücksetzen?')) return;
    setCreatorData({});
    try { localStorage.removeItem(CREATOR_KEY); } catch {}
  }
  function onFileToUrl(e: React.ChangeEvent<HTMLInputElement>, cb: (url: string)=>void) {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f); cb(url);
  }

  // Helpers: color conversions and tint polishing
  function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h, s, l];
  }
  function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r: number, g: number, b: number;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  function polishTint(r: number, g: number, b: number): { bg: string; fg: string } {
    const [h, s, l] = rgbToHsl(r, g, b);
    // Boost saturation slightly; normalize lightness to aesthetically pleasing bands
    let s2 = Math.min(1, Math.max(0.35, s + 0.1));
    let l2 = l;
    if (l < 0.35) l2 = 0.25; else if (l < 0.6) l2 = 0.32; else l2 = 0.9;
    const [rr, gg, bb] = hslToRgb(h, s2, l2);
    const luminance = 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
    const fg = luminance < 140 ? '#ffffff' : '#0f0f0f';
    return { bg: `rgb(${rr},${gg},${bb})`, fg };
  }

  useEffect(() => {
    (async () => {
      try { const list = await getProducts(); setItems(list.slice(0,4)); } catch {}
    })();
  }, []);

  // Load "Neu auf HIDDN" (frontend-only mock)
  useEffect(() => {
    (async () => {
      try {
        const creators = await fetchCreatorsMock();
        const sec = computeNewCreators(creators, Date.now(), 6);
        setNewCreators(sec);
        // animate in on next tick
        setTimeout(() => setNcVisible(true), 30);
      } catch {}
    })();
  }, []);

  // Sponsored 3 (dark glam – e.g., jewelry)
  useEffect(() => {
    const url = 'https://images.unsplash.com/photo-1603574670812-d24560880210?q=80&w=1200&auto=format&fit=crop';
    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          const w = (c.width = 24), h = (c.height = 24);
          const ctx = c.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;
          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i+1]; b += data[i+2]; n++; }
          r = Math.round(r/n); g = Math.round(g/n); b = Math.round(b/n);
          setSponsorBg3(`rgb(${r},${g},${b})`);
          const luminance = 0.2126*r + 0.7152*g + 0.0722*b;
          setSponsorFg3(luminance < 140 ? '#ffffff' : '#0f0f0f');
        } catch {}
      };
    } catch {}
  }, []);

  // Sponsored 4 (bright editorial – e.g., footwear color)
  useEffect(() => {
    const url = 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop';
    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          const w = (c.width = 24), h = (c.height = 24);
          const ctx = c.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;
          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i+1]; b += data[i+2]; n++; }
          r = Math.round(r/n); g = Math.round(g/n); b = Math.round(b/n);
          setSponsorBg4(`rgb(${r},${g},${b})`);
          const luminance = 0.2126*r + 0.7152*g + 0.0722*b;
          setSponsorFg4(luminance < 140 ? '#ffffff' : '#0f0f0f');
        } catch {}
      };
    } catch {}
  }, []);

  useEffect(() => {
    const url = 'https://images.unsplash.com/photo-1514416309822-6de6d80d02f2?q=80&w=1200&auto=format&fit=crop';
    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          const w = (c.width = 24), h = (c.height = 24);
          const ctx = c.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;
          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i+1]; b += data[i+2]; n++; }
          r = Math.round(r/n); g = Math.round(g/n); b = Math.round(b/n);
          const t = polishTint(r, g, b);
          setSponsorBg2(t.bg);
          setSponsorFg2(t.fg);
        } catch {}
      };
    } catch {}
  }, []);

  useEffect(() => {
    const url = 'https://source.unsplash.com/featured/?tshirt,person,model,portrait,fashion&sig=201';
    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          const w = (c.width = 24), h = (c.height = 24);
          const ctx = c.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;
          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i]; g += data[i+1]; b += data[i+2]; n++;
          }
          r = Math.round(r/n); g = Math.round(g/n); b = Math.round(b/n);
          const t = polishTint(r, g, b);
          setSponsorBg(t.bg);
          setSponsorFg(t.fg);
        } catch {}
      };
    } catch {}
  }, []);

  // Pull-to-refresh handlers
  function onTouchStart(e: React.TouchEvent) {
    if (refreshing) return;
    const el = hostRef.current;
    if (!el) return;
    if (el.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }

  // Tap-intent guard to avoid accidental navigations while scrolling
  const navArmedRef = useRef<boolean>(false);
  const startRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  function onPointerDownGlobal(e: React.PointerEvent) {
    // Arm only for primary mouse button or touch/pen
    if (e.pointerType === 'mouse' && e.buttons !== 1) return;
    navArmedRef.current = true;
    startRef.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerMoveGlobal(e: React.PointerEvent) {
    if (!navArmedRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    // If movement exceeds threshold, disarm click
    if (Math.hypot(dx, dy) > 14) {
      navArmedRef.current = false;
    }
  }
  function onPointerUpGlobal() {
    // no-op; onClickCapture will read navArmedRef
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!pulling.current || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      // resistance
      const offset = Math.min(100, dy * 0.5);
      setPtr(offset);
      const armedNow = offset > 60;
      if (armedNow && !armed) {
        setArmed(true);
        // light haptic if supported
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { (navigator as any).vibrate(10); } catch {}
        }
      } else if (!armedNow && armed) {
        setArmed(false);
      }
    }
  }
  async function onTouchEnd() {
    if (!pulling.current || refreshing) { pulling.current = false; return; }
    pulling.current = false;
    if (ptr > 60) {
      setRefreshing(true);
      setPtr(60);
      // simulate refresh: re-fetch products
      try {
        const list = await getProducts();
        setItems(list.slice(0,4));
      } catch {}
      setTimeout(() => { setRefreshing(false); setPtr(0); setArmed(false); }, 550);
    } else {
      setPtr(0);
      setArmed(false);
    }
  }

  async function createBrand() {
    setBrandMsg(null);
    setCreating(true);
    try {
      const res = await api.post('/api/v1/brands', { name: 'My Test Brand', bio: 'Seed brand for testing' });
      setBrandMsg(`Brand created: ${res.data?.name || 'ok'}`);
    } catch (e: any) {
      setBrandMsg(e?.response?.data?.message || 'Failed to create brand');
    } finally {
      setCreating(false);
    }
  }
  return (
    <main
      ref={hostRef}
      className="max-w-md mx-auto p-6 pb-24"
      style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
      onPointerDown={onPointerDownGlobal}
      onPointerMove={onPointerMoveGlobal}
      onPointerUp={onPointerUpGlobal}
      onClickCapture={(e) => {
        const t = e.target as HTMLElement;
        const a = t.closest('a');
        if (!a) return;
        // In creator mode: always block navigation
        if (CREATOR_ENABLED && creator) { e.preventDefault(); e.stopPropagation(); return; }
        // Outside creator: only allow if there was a clean tap (no move)
        if (!navArmedRef.current) { e.preventDefault(); e.stopPropagation(); return; }
        // Reset arm after successful click to avoid double handling
        navArmedRef.current = false;
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onScroll={undefined}
    >
      {/* Fullscreen video hero */}
      <section
        ref={heroRef as any}
        aria-label="Video Hero"
        className="full-bleed-bg"
        style={{
          position: 'relative',
          height: '78vh',
          background: '#000',
          backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(${(1 - 0.08 * heroProgress).toFixed(3)}) translateY(${(-6 * heroProgress).toFixed(2)}px)`,
          opacity: (1 - Math.pow(heroProgress, 1.35) * 0.9),
          willChange: 'transform, opacity'
        }}
      >
        {!noVideo ? (
        <video
          key={homeVidIndex}
          ref={videoRef}
          src={`${HOME_VIDS[homeVidIndex]}?v=2715`}
          onError={onHomeVidError}
          preload="metadata"
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'brightness(62%) contrast(1.06)', opacity: videoReady ? 1 : 0, transition: 'opacity 420ms var(--ease-ios)' }}
        />) : (
          <img
            alt="Hero"
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'brightness(62%) contrast(1.06)' }}
            onLoad={() => setVideoReady(true)}
          />
        )}
        {/* Dark overlay increases with scroll to make hero recede */}
        <div
          aria-hidden
          style={{ position:'absolute', inset:0, background:`rgba(0,0,0,${(0.0 + Math.pow(heroProgress, 1.4) * 0.6).toFixed(3)})`, zIndex:1, pointerEvents:'none' }}
        />
        {/* Tap overlay disabled by design */}
        {/* Blur bands (fade in with scroll) */}
        <div style={{ position:'absolute', top:0, left:0, width:'100%', height:120, backdropFilter:`blur(${(12*heroBlend).toFixed(2)}px)`, background:`linear-gradient(to bottom, rgba(0,0,0,${(0.35*heroBlend).toFixed(3)}), rgba(0,0,0,0))`, zIndex:1, pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:0, left:0, width:'100%', height:120, backdropFilter:`blur(${(12*heroBlend).toFixed(2)}px)`, background:`linear-gradient(to top, rgba(0,0,0,${(0.35*heroBlend).toFixed(3)}), rgba(0,0,0,0))`, zIndex:1, pointerEvents:'none' }} />
        {/* Centered content */}
        <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'max(0px, env(safe-area-inset-top)) 26px max(24px, env(safe-area-inset-bottom))' }}>
          <div style={{ width:'90vw', maxWidth:600, margin:'0 auto' }}>
            <h1 className="font-display" style={{ letterSpacing:4, fontWeight:600, fontSize:36, marginBottom:12, color: isLightScheme ? '#0F172A' : 'var(--text)' }}>HIDDN</h1>
            <p style={{ fontSize:15, letterSpacing:0.6, marginBottom:28, color: isLightScheme ? '#0F172A' : 'var(--text)' }}>Dein Stil. Dein Moment.</p>
            <h2 className="font-display" style={{ fontWeight:500, fontSize:32, marginBottom:34, color: isLightScheme ? '#0F172A' : 'var(--text)' }}>Stay Hidden.</h2>
            <Link to="/products" className="pressable btn-solid" style={{ padding:'12px 28px', borderRadius:12, fontSize:16, letterSpacing:0.6, display:'inline-block' }}>Jetzt starten</Link>
          </div>
        </div>
      </section>
      {/* Pull-to-refresh indicator (progress-driven) */}
      <div style={{ height: ptr, transition: pulling.current || refreshing ? 'none' : 'height 140ms ease' }}>
        <div className="flex flex-col items-center justify-center gap-1" style={{ height: ptr }}>
          {!refreshing && pulling.current && (
            <svg width="24" height="24" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" stroke="var(--border)" strokeWidth="3" fill="none" />
              <circle cx="18" cy="18" r="14" stroke="var(--accent)" strokeWidth="3" fill="none"
                strokeLinecap="round"
                strokeDasharray={88}
                strokeDashoffset={Math.max(0, 88 - (ptr/100)*88)}
              />
            </svg>
          )}
          {refreshing && (
            <div style={{ animation: 'logoPulse 550ms var(--ease-ios)' }}>
              {/* Logo pulse during refresh */}
              <span style={{ display: 'inline-block', transformOrigin: 'center' }}>
                {/* Using text fallback if Logo component not desired here */}
                {/* Replace with Logo component for consistency */}
              </span>
            </div>
          )}
          {pulling.current && !refreshing && <span className="text-xs" style={{ color: 'var(--text)', opacity: 0.7 }}>{armed ? 'Loslassen zum Aktualisieren' : 'Zum Aktualisieren ziehen'}</span>}
        </div>
      </div>
      <h1 className="font-display text-2xl mb-2" style={{ color: 'var(--text)' }}>Startseite</h1>
      <div className="px-6 mb-3 flex items-center justify-end">
        <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          Hallo, Godwen!
        </span>
      </div>

      {/* Creator toolbar (disabled) */}
      {CREATOR_ENABLED && creator && (
        <section className="px-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs rounded-full" style={{ background: creator ? 'var(--accent)' : 'var(--card)', color: creator ? '#fff' : 'var(--text)', border: '1px solid var(--border)' }}>Creator</span>
            <label className="text-sm flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <input type="checkbox" checked={creator} onChange={(e)=>setCreator(e.target.checked)} /> Modus
            </label>
            <button onClick={saveCreator} className="px-3 py-1 rounded-md text-sm" style={{ background: 'var(--text)', color: 'var(--bg)' }}>Speichern</button>
            <button onClick={resetCreator} className="px-3 py-1 rounded-md text-sm" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>Reset</button>
          </div>
        </section>
      )}

      

      

      {/* Boards entdecken (swiper) – very top */}
      <section className="mt-10 px-6">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Boards entdecken</h2>
        <p className="text-neutral-600">Finde Inspiration für jeden Moment</p>
        <div className="mt-3 flex gap-4 overflow-x-auto no-scrollbar">
          {[
            { title: 'Streetwear Fits', img: 'https://source.unsplash.com/featured/?streetwear,person,model,portrait&sig=11' },
            { title: 'Denim Looks', img: 'https://source.unsplash.com/featured/?denim,jeans,person,model&sig=12' },
            { title: 'Winter Jackets', img: 'https://source.unsplash.com/featured/?parka,winter%20jacket,person,model&sig=13' },
            { title: 'Dresses', img: 'https://source.unsplash.com/featured/?dress,person,model,portrait&sig=14' },
            { title: 'Suits', img: 'https://source.unsplash.com/featured/?menswear,suit,man,model,portrait&sig=15' },
            { title: 'Athleisure', img: 'https://source.unsplash.com/featured/?sportswear,tracksuit,person,model&sig=16' },
          ].map((b) => (
            <Link key={b.title} to="/products" className="shrink-0 w-[70%]">
              <div className="overflow-hidden rounded-2xl shadow-sm" style={{ background: 'var(--card)' }}>
                <div className="aspect-[9/16] w-full">
                  <Img
                    src={b.img}
                    alt={b.title}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 420px) 70vw, 300px"
                    srcSet={`${b.img}&w=400 400w, ${b.img}&w=600 600w, ${b.img}&w=900 900w`}
                  />
                </div>
              </div>
              <div className="mt-2 text-sm font-medium" style={{ color: 'var(--text)' }}>{b.title}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Neu auf HIDDN – kompakt, horizontal scrollend */}
      {newCreators && newCreators.cards.length > 0 && (
        <section className="mt-10 px-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Neu auf HIDDN</h2>
          <div className="text-sm opacity-80" style={{ color: 'var(--text)' }}>Neue Creator (letzte 48h)</div>
          <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {newCreators.cards.map((c) => (
              <div
                key={c.creator.id}
                className="shrink-0 rounded-xl shadow-sm overflow-hidden pressable"
                style={{
                  width: '62%', maxWidth: 260,
                  background: cardBackground(c.gradient),
                  color: c.textColor,
                  transform: ncVisible ? 'translateY(0)' : 'translateY(10px)',
                  opacity: ncVisible ? 1 : 0,
                  transition: 'transform 200ms cubic-bezier(0.22,1,0.36,1), opacity 200ms cubic-bezier(0.22,1,0.36,1)'
                }}
              >
                <div className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                    <Img src={c.creator.profileImage || ''} alt={c.creator.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{c.creator.name}</div>
                    <div className="text-[11px] opacity-90">Neu · {(new Date(c.creator.joinedAt)).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hero: gradient card with strong headline and CTAs */}
      <section className="px-4">
        <div
          className="rounded-2xl p-6 pressable shadow-md"
          style={{
            background: `linear-gradient(135deg, ${ACCENT} 0%, color-mix(in srgb, ${ACCENT} 60%, transparent) 55%, transparent 100%)`,
            color: '#fff'
          }}
        >
          <div className="mb-2 opacity-90 text-[12px]">Neu für dich</div>
          <h2 className="font-display text-3xl leading-tight">Entdecke deinen Style</h2>
          <p className="mt-1 text-[14px] opacity-90">Frische Drops, klare Linien, iOS‑smooth Experience.</p>
          <div className="mt-4 flex gap-2">
            <Link to="/products" className="pressable btn-solid" style={{ padding:'12px 18px', borderRadius:12 }}>Jetzt entdecken</Link>
            <Link to="/categories" className="pressable btn-glass" style={{ padding:'12px 18px', borderRadius:12 }}>Zu den Kategorien</Link>
          </div>
        </div>
      </section>

      {/* Inspirationen – horizontal portrait slider */}
      <section className="mt-12 px-6">
        <div className="mb-2">
          <h2 className="font-display text-2xl" style={{ color: 'var(--text)' }}>Inspirationen – heute für dich</h2>
          <div className="text-sm opacity-80" style={{ color: 'var(--text)' }}>Swipe nach rechts für mehr</div>
          <Link to="/products" className="inline-block mt-1 text-sm" style={{ color: ACCENT }}>Alles ansehen →</Link>
        </div>
        <div className="mt-3 flex gap-4 overflow-x-auto no-scrollbar">
          {inspirationCards.map((c,i)=> (
            <Link key={i} to="/products" className="shrink-0 w-[70%] max-w-[320px]">
              <div className="overflow-hidden rounded-2xl shadow" style={{ background: 'var(--card)' }}>
                <div className="aspect-[9/16] w-full">
                  <Img src={c.img} alt={c.t} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="mt-2 text-sm font-medium" style={{ color: 'var(--text)' }}>{c.t}</div>
              <div className="text-xs opacity-80" style={{ color: 'var(--text)' }}>{c.s}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Produkte – nach Inspirationen, um den Flow edel zu halten */}
      {items && items.length > 0 && (
        <section className="mt-10 px-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl" style={{ color: 'var(--text)' }}>Empfohlen für dich</h2>
            <Link to="/products" className="text-sm" style={{ color: ACCENT }}>Alle ansehen →</Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {items.slice(0,4).map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="pressable shadow" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:18, overflow:'hidden' }}>
                <div className="w-full" style={{ aspectRatio:'4/5' }}>
                  <Img src={p.image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop'} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold truncate" style={{ color:'var(--text)' }}>{p.title}</div>
                  <div className="text-xs opacity-80" style={{ color:'var(--text)' }}>
                    {(p.price_cents/100).toLocaleString('de-DE', { style:'currency', currency: p.currency || 'EUR' })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Get the Look – temporarily hidden */}

      {/* Inspirierende Storys – onboarding-style band with tall cards */}
      {CREATOR_ENABLED && creator && editorOpen && (
        <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={()=>setEditorOpen(null)}>
          <div className="px-4 py-5">
            <div className="mb-3">
              <h2 className="font-display text-2xl">Inspirierende Storys</h2>
              <div className="opacity-80">Wöchentlich ausgewählt</div>
              <Link to="/shorts" className="inline-block mt-1 text-sm opacity-90" style={{ color: '#fff' }}>Entdecke alle Storys →</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {[
                { t:'Moodboards', s:'Trends, die du kennen musst', img:'https://source.unsplash.com/featured/?moodboard,fashion&sig=1601' },
                { t:'Top 8 Sneaker', s:'Diesen Monat: PUMA, ASICS u. mehr', img:'https://source.unsplash.com/featured/?sneakers,flatlay&sig=1602' },
                { t:'Street Snap', s:'Looks aus der City', img:'https://source.unsplash.com/featured/?streetstyle,portrait&sig=1603' },
                { t:'Beauty Edits', s:'Soft Glam, Clean Lines', img:'https://source.unsplash.com/featured/?beauty,portrait&sig=1604' }
              ].map((c,i)=> (
                <Link key={i} to="/shorts" className="shrink-0 w-[72%]">
                  <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="aspect-[9/16] w-full">
                      <Img src={c.img} alt={c.t} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-semibold">{c.t}</div>
                  <div className="text-xs opacity-80">{c.s}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Carousel under sponsored 2 */}
      <section className="mt-8">
        <div style={{ background: sponsorBg2, color: sponsorFg2, marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
          <div className="px-4 flex gap-3 overflow-x-auto no-scrollbar py-3">
            {[...Array(10)].map((_,i)=> (
              <Link to="/products" key={`s2-${i}`} className="shrink-0 w-[160px] pressable">
                <div className="rounded-2xl overflow-hidden shadow" style={{ backgroundColor: 'var(--card)' }}>
                  <Img src={`https://source.unsplash.com/featured/?jackets,editorial,model&sig=${860+i}`} alt={`Sponsored S2 #${i+1}`} className="w-full h-[200px] object-cover" />
                </div>
                <div className="mt-1 text-sm" style={{ color: sponsorFg2 }}>S2 Produkt #{i+1}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      

      {/* Theme banner above categories */}
      <section className="mt-10 px-4">
        <div
          className="rounded-2xl p-5 shadow-md"
          style={{
            background: isLightScheme
              ? 'linear-gradient(135deg, #f9fafb 0%, #e3f2fd 45%, #e8f5e9 100%)'
              : 'linear-gradient(135deg, #0b0b0c 0%, rgba(35,56,95,0.55) 45%, rgba(20,88,58,0.55) 100%)',
            color: isLightScheme ? '#0F172A' : '#fff',
            border: '1px solid var(--border)'
          }}
        >
          <div className="text-[11px] uppercase tracking-wide opacity-80">Designed by Godwen Kaiser</div>
          <div className="font-display text-2xl mt-1">Frische Farben. Klarer Vibe.</div>
          <div className="text-sm opacity-90 mt-1">Entdecke die Kategorien</div>
        </div>
      </section>

      {/* Chips carousel */}
      <section className="mt-6 px-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {chips.map((c) => (
            <Link key={c} to="/categories" className="shrink-0 pressable px-4 py-2 rounded-full text-sm"
              style={{ backgroundColor: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              {c}
            </Link>
          ))}
        </div>
      </section>
      {/* Carousel under sponsored 3 */}
      <section className="mt-8">
        <div style={{ background: sponsorBg3, color: sponsorFg3, marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
          <div className="px-4 flex gap-3 overflow-x-auto no-scrollbar py-3">
            {[...Array(10)].map((_,i)=> (
              <Link to="/products" key={`s3-${i}`} className="shrink-0 w-[160px] pressable">
                <div className="rounded-2xl overflow-hidden shadow" style={{ backgroundColor: 'var(--card)' }}>
                  <Img src={`https://source.unsplash.com/featured/?jewelry,studio,model&sig=${910+i}`} alt={`Sponsored S3 #${i+1}`} className="w-full h-[200px] object-cover" />
                </div>
                <div className="mt-1 text-sm" style={{ color: sponsorFg3 }}>S3 Produkt #{i+1}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top-Bewertungen (non-sponsored) */}
      <section className="mt-12 px-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h3 className="font-display text-xl" style={{ color: 'var(--text)' }}>Top‑Bewertungen</h3>
            <div className="text-sm opacity-70" style={{ color: 'var(--text)' }}>Von der Community</div>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {[...Array(8)].map((_,i)=> (
            <Link to="/products" key={`rev-${i}`} className="shrink-0 w-[220px] pressable">
              <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                <Img src={`https://source.unsplash.com/featured/?product,studio&sig=${1300+i}`} alt={`Review ${i+1}`} className="w-full h-[140px] object-cover" />
                <div className="p-3">
                  <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>Produkt {i+1}</div>
                  <div className="text-xs opacity-70" style={{ color: 'var(--text)' }}>★★★★★ · 4,8</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sponsored 4 – bright color */}
      <section className="mt-12">
        <div style={{ background: sponsorBg4, color: sponsorFg4, marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
          <div className="px-4">
            <Link to="/products?cat=shoes" className="block">
              <div className="overflow-hidden shadow-sm relative" style={{ background: 'transparent', transition: 'background 360ms cubic-bezier(0.22,1,0.36,1)', color: sponsorFg4, borderRadius: 0 }}>
                <div className="absolute right-3 top-3 text-[11px] opacity-80">Gesponsert</div>
                <div className="aspect-[4/3] w-full">
                  <Img src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop" alt="Color Pop Footwear" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 pb-5">
                  <div className="text-[12px] tracking-[0.14em] uppercase opacity-90">Kazar HW25</div>
                  <h2 className="font-display text-[28px] leading-[1.1] mt-1 text-safe" style={{ maxWidth: '92%' }}>Veredelte Basics</h2>
                  <p className="text-sm opacity-90 text-safe" style={{ maxWidth: '92%' }}>Zeitlose Formen, taktile Leder und präzise Details.</p>
                  <div className="mt-4 w-full text-center rounded-md px-3 py-2 text-sm" style={{ border: `1px solid ${sponsorFg4}`, color: sponsorFg4, background: 'transparent' }}>Kollektion entdecken</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
      {/* Carousel under sponsored 4 */}
      <section className="mt-8">
        <div style={{ background: sponsorBg4, color: sponsorFg4, marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
          <div className="px-4 flex gap-3 overflow-x-auto no-scrollbar py-3">
            {[...Array(10)].map((_,i)=> (
              <Link to="/products" key={`s4-${i}`} className="shrink-0 w-[160px] pressable">
                <div className="rounded-2xl overflow-hidden shadow" style={{ backgroundColor: 'var(--card)' }}>
                  <Img src={`https://source.unsplash.com/featured/?shoes,studio,model&sig=${980+i}`} alt={`Sponsored S4 #${i+1}`} className="w-full h-[200px] object-cover" />
                </div>
                <div
                  className="mt-1 text-sm"
                  style={{ color: sponsorFg4, textAlign:'center', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', padding:'0 12px' }}
                >
                  S4 Produkt #{i+1}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Kategorien entdecken – Mosaic (re-added) */}
      <section className="mt-10 px-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h3 className="font-display text-xl" style={{ color: 'var(--text)' }}>Kategorien 1</h3>
            <div className="text-sm opacity-70" style={{ color: 'var(--text)' }}>Stöbere nach deinem Vibe</div>
          </div>
          <Link to="/categories" className="text-sm" style={{ color: 'var(--accent)' }}>Alle ansehen →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { q: 'sneakers', label: 'Sneaker', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop' },
            { q: 'jackets', label: 'Jacken', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop' },
            { q: 'hoodie', label: 'Hoodies', img: 'https://images.unsplash.com/photo-1514416309822-6de6d80d02f2?q=80&w=1200&auto=format&fit=crop' },
            { q: 'accessories', label: 'Accessoires', img: 'https://images.unsplash.com/photo-1516280030429-27679b3dc9cf?q=80&w=1200&auto=format&fit=crop' }
          ].map((c, i) => (
            <Link to={`/products?cat=${encodeURIComponent(c.q)}`} key={i} className="block pressable">
              <div className="relative overflow-hidden rounded-2xl shadow" style={{ backgroundColor: 'var(--card)' }}>
                <img src={c.img} alt={c.label} loading="lazy" className="w-full h-[120px] object-cover" />
                <div className="absolute left-2 bottom-2 px-2 py-1 rounded-md text-xs" style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}>{c.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Beliebte Produkte – Grid (re-added) */}
      <section className="mt-10 px-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h3 className="font-display text-xl" style={{ color: 'var(--text)' }}>Beliebte Produkte 1</h3>
            <div className="text-sm opacity-70" style={{ color: 'var(--text)' }}>Was gerade alle tragen</div>
          </div>
          <Link to="/products" className="text-sm" style={{ color: ACCENT }}>Mehr zeigen →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(items.length ? items : Array.from({length:4}).map((_,i)=>({id:`p${i}`, image_url:`https://source.unsplash.com/featured/?outfit,style&sig=${950+i}`, title:`Produkt ${i+1}`}))).map((p:any, i:number) => (
            <Link to="/products" key={p.id || i} className="block pressable">
              <div className="overflow-hidden rounded-2xl shadow" style={{ backgroundColor: 'var(--card)' }}>
                <img src={p.image_url || p.img} alt={p.title || 'Produkt'} loading="lazy" className="w-full h-[180px] object-cover" />
              </div>
              <div className="mt-1 text-sm" style={{ color: 'var(--text)' }}>{p.title || 'Beliebter Artikel'}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/products?cat=tops" className="block">
          <div className="overflow-hidden rounded-2xl bg-neutral-100 shadow-sm">
            <div className="aspect-[4/5] w-full">
              <Img src="https://source.unsplash.com/featured/?graphic,tee,person,model,portrait&sig=202" alt="God's Plan Tee" className="w-full h-full object-cover" />
            </div>
          </div>
          <h3 className="mt-2 font-display text-xl" style={{ marginLeft: '2%' }}>GOD'S PLAN</h3>
          <p className="text-xs text-neutral-600" style={{ marginLeft: '2%' }}>Minimal Type. Maximal Vibe.</p>
        </Link>
        <Link to="/products" className="block">
          <div className="overflow-hidden rounded-2xl bg-neutral-100 shadow-sm">
            <div className="aspect-[4/5] w-full">
              <Img src="https://source.unsplash.com/featured/?streetwear,hoodie,person,model,portrait&sig=203" alt="Streetwear Set" className="w-full h-full object-cover" />
            </div>
          </div>
          <h3 className="mt-2 font-display text-xl" style={{ marginLeft: '2%' }}>Streetwear</h3>
          <p className="text-xs text-neutral-600" style={{ marginLeft: '2%' }}>Hoodies & Pants – schwarz, laut, ready.</p>
        </Link>
      </section>

      {/* Sponsored band A – bottom */}
      <section className="mt-6">
        <div style={{ background: 'var(--card)', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide opacity-70" style={{ color: 'var(--text)' }}>Gesponsert</div>
          </div>
          <div className="px-4 flex gap-3 overflow-x-auto no-scrollbar pb-4">
            {[...Array(10)].map((_,i)=> (
              <Link to="/products" key={`sbA-${i}`} className="shrink-0 w-[180px] pressable">
                <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--card)' }}>
                  <Img src={`https://source.unsplash.com/featured/?editorial,fashion&sig=${1200+i}`} alt={`Sponsored A #${i+1}`} className="w-full h-[220px] object-cover" />
                </div>
                <div className="mt-1 text-sm" style={{ color: 'var(--text)' }}>A‑Promo #{i+1}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsored band B – bottom */}
      <section className="mt-4">
        <div style={{ background: 'var(--card)', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide opacity-70" style={{ color: 'var(--text)' }}>Gesponsert</div>
          </div>
          <div className="px-4 flex gap-3 overflow-x-auto no-scrollbar pb-4">
            {[...Array(8)].map((_,i)=> (
              <Link to="/products" key={`sbB-${i}`} className="shrink-0 w-[200px] pressable">
                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                  <Img src={`https://source.unsplash.com/featured/?fashion,studio&sig=${1300+i}`} alt={`Sponsored B #${i+1}`} className="w-full h-[240px] object-cover" />
                </div>
                <div className="mt-1 text-sm" style={{ color: 'var(--text)' }}>B‑Promo #{i+1}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsored portrait – Special under Atelier Détails */}
      <section className="mt-6 px-4">
        <div className="rounded-3xl overflow-hidden shadow-md" style={{ position:'relative', background: isLightScheme ? '#f7f7fb' : '#0a0a0b', border: '1px solid var(--border)' }}>
          <div className="aspect-[9/16] w-full" style={{ position:'relative' }}>
            {!noVideo ? (
              <>
              <video
                ref={svRef}
                src={`${SPONSOR_VIDS[svIdx]}?v=1`}
                onError={onSvErr}
                preload="auto"
                autoPlay
                loop
                muted
                playsInline
                poster="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop"
                style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: svReady ? 1 : 0, transition:'opacity 420ms var(--ease-ios)', filter: isLightScheme ? 'brightness(0.94) contrast(1.04) saturate(1.06)' : 'brightness(0.85) contrast(1.08) saturate(1.12)' }}
              />
              {isCoarse && svNeedTap && (
                <button
                  onClick={() => { try { svRef.current?.play().then(()=> setSvNeedTap(false)).catch(()=>{}); } catch {} }}
                  className="pressable"
                  style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', background:'rgba(0,0,0,0.35)', color:'#fff', zIndex:3 }}
                >
                  <span style={{ padding:'10px 16px', border:'1px solid rgba(255,255,255,0.6)', borderRadius:12, backdropFilter:'blur(6px)' }}>Zum Abspielen tippen</span>
                </button>
              )}
              </>
            ) : (
              <Img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop"
                alt="Atelier Détails – Special"
                loading="eager"
                className="w-full h-full object-cover"
                style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
              />
            )}
            <div style={{ position:'absolute', inset:0, background: isLightScheme ? 'linear-gradient(180deg, rgba(255,255,255,0.00) 10%, rgba(255,255,255,0.45) 85%)' : 'linear-gradient(180deg, rgba(0,0,0,0.00) 10%, rgba(0,0,0,0.45) 85%)' }} />
            <div style={{ position:'absolute', inset:0, mixBlendMode: isLightScheme ? 'multiply' : 'screen', pointerEvents:'none', background: isLightScheme ? 'radial-gradient(60% 60% at 80% 20%, rgba(140,92,246,0.28) 0%, rgba(0,0,0,0) 60%), radial-gradient(55% 55% at 10% 90%, rgba(16,185,129,0.28) 0%, rgba(0,0,0,0) 55%)' : 'radial-gradient(60% 60% at 80% 20%, rgba(140,92,246,0.32) 0%, rgba(0,0,0,0) 60%), radial-gradient(55% 55% at 10% 90%, rgba(16,185,129,0.32) 0%, rgba(0,0,0,0) 55%)' }} />
            <div style={{ position:'absolute', left:16, bottom:16, right:16, color: isLightScheme ? '#0F172A' : '#fff' }}>
              <div className="text-[11px] uppercase tracking-wide opacity-90">Gesponsert</div>
              <h3 className="font-display" style={{ fontSize:24, letterSpacing:0.2, marginTop:6 }}>Atelier Détails – Special</h3>
              <p className="text-sm opacity-90" style={{ marginTop:4 }}>Elegant. Besonders. Genau hier unter Atelier Détails.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <Link to="/products" className="block">
          <div className="rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-[1fr_120px] gap-3 p-3 items-center">
              <div style={{ marginLeft: '2%' }}>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">Neu</div>
                <h3 className="font-display text-xl">Copenhagen Studios Uhr</h3>
                <p className="text-xs text-neutral-600">50 m wasserfest. Cleanes Everyday‑Design.</p>
              </div>
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100">
                <Img src="https://source.unsplash.com/featured/?wristwatch,on%20wrist,person,hand&sig=205" alt="Uhr Copenhagen Studios" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </Link>
      </section>
      {/* Paid creators carousel (9:16) */}
      <section className="mt-10">
        <div style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', background:'var(--card)' }}>
          <div className="px-4 py-3 text-[11px] uppercase tracking-wide opacity-70" style={{ color:'var(--text)' }}>Brands</div>
          <div className="px-4 flex gap-6 overflow-x-auto no-scrollbar py-3" style={{ WebkitOverflowScrolling:'touch' as any }}>
            {['HIDDN','AURA','NOIR STUDIO','ATELIER DÉTAILS','COPENHAGEN','KAZAR','VALE'].map((b)=> (
              <div key={b} className="shrink-0 rounded-full px-4 py-2" style={{ background:'var(--input-bg)', color:'var(--text)', border:'1px solid var(--border)' }}>{b}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 px-4">
        <Link to="/products" className="block">
          <div className="rounded-3xl overflow-hidden" style={{ position:'relative', background:'linear-gradient(135deg, var(--hero-start), var(--hero-end))' }}>
            <div className="aspect-[16/9] w-full">
              <Img src="https://images.unsplash.com/photo-1503342217505-b0a15cf70489?w=1600&auto=format&fit=crop" alt="Weekly Spotlight" className="w-full h-full object-cover opacity-80" />
            </div>
            <div style={{ position:'absolute', left:18, bottom:18, right:18, color:'#fff' }}>
              <div className="text-[11px] uppercase tracking-wide opacity-90">Weekly Spotlight</div>
              <h3 className="font-display" style={{ fontSize:26, letterSpacing:0.2, marginTop:6 }}>Raw Essentials</h3>
              <div className="mt-3 inline-block pressable btn-glass" style={{ padding:'10px 14px', borderRadius:12 }}>Kollektion ansehen</div>
            </div>
          </div>
        </Link>
      </section>

      <section className="mt-10 px-4">
        <div className="rounded-2xl" style={{ background:'var(--card)', border:'1px solid var(--border)' }}>
          <div className="p-5">
            <div className="text-[11px] uppercase tracking-wide opacity-80" style={{ color:'var(--text)' }}>Stay in the loop</div>
            <h3 className="font-display text-2xl" style={{ color:'var(--text)' }}>HIDDN Weekly</h3>
            <div className="text-sm opacity-80" style={{ color:'var(--text)' }}>Neue Drops, Creator‑News und exklusive Aktionen.</div>
            <div className="mt-3 flex gap-2">
              <Link to="/products" className="pressable btn-solid" style={{ padding:'12px 16px', borderRadius:12 }}>Jetzt abonnieren</Link>
              <Link to="/about" className="pressable btn-glass" style={{ padding:'12px 16px', borderRadius:12 }}>Mehr erfahren</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="text-center py-8">
        <div className="mt-2 flex gap-3 justify-center">
          <button onClick={createBrand} disabled={creating} className="px-4 py-2 rounded-md border border-brand-200 text-brand-700 hover:bg-brand-50 disabled:opacity-50">
            {creating ? '...' : 'Create Brand'}
          </button>
        </div>
        {brandMsg && <p className="mt-3 text-sm text-brand-700">{brandMsg}</p>}
      </section>
    </main>
  );
}
