import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Simple vertical short-video feed. Autoplays muted, swipe/scroll to change.
export default function Shorts() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const vids = [
    {
      src: 'https://cdn.coverr.co/videos/coverr-brunette-girl-brushing-her-hair-4464/1080p.mp4',
      poster: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
      profile: { name: 'tammyjoyunterholzer', avatar: 'https://i.pravatar.cc/80?img=47' },
      caption: 'Die perfekte Bürste für glänzend gestyltes Haar.'
    },
    {
      src: 'https://cdn.coverr.co/videos/coverr-black-dress-4453/1080p.mp4',
      poster: 'https://images.unsplash.com/photo-1519400197429-404ae1a1e184?q=80&w=1200&auto=format&fit=crop',
      profile: { name: 'lena.styles', avatar: 'https://i.pravatar.cc/80?img=12' },
      caption: 'Get ready with me – Evening Look.'
    },
    {
      src: 'https://cdn.coverr.co/videos/coverr-putting-on-makeup-9287/1080p.mp4',
      poster: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
      profile: { name: 'mara.beauty', avatar: 'https://i.pravatar.cc/80?img=32' },
      caption: 'Day in a life – Soft Glam Routine.'
    }
  ];
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 30) setIndex((i) => Math.min(i + 1, vids.length - 1));
      else if (e.deltaY < -30) setIndex((i) => Math.max(i - 1, 0));
    };
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => el.removeEventListener('wheel', onWheel);
  }, [vids.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') setIndex((i) => Math.min(i + 1, vids.length - 1));
      if (e.key === 'ArrowUp') setIndex((i) => Math.max(i - 1, 0));
      if (e.key === 'Escape') navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, vids.length]);

  return (
    <main ref={containerRef} className="w-full h-[calc(100dvh-96px)] overflow-hidden bg-black text-white">
      <div className="relative w-full h-full">
        {vids.map((v, i) => (
          <section key={i} className="absolute inset-0 transition-transform duration-500" style={{ transform: `translateY(${(i - index) * 100}%)` }}>
            <video
              src={v.src}
              poster={v.poster}
              className="w-full h-full object-cover"
              autoPlay={i === index}
              muted
              loop
              playsInline
            />
            {/* Overlay UI */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <button onClick={() => navigate(-1)} aria-label="Zurück" className="px-3 py-1 rounded-full bg-[rgba(0,0,0,0.45)]">←</button>
              <div className="text-sm opacity-80">Im Rampenlicht</div>
            </div>
            <div className="absolute bottom-4 left-3 right-3">
              <div className="flex items-center gap-3 mb-3">
                <img src={v.profile.avatar} alt={v.profile.name} className="w-9 h-9 rounded-full object-cover" />
                <div className="text-sm"><span className="font-semibold">{v.profile.name}</span> · Folgen</div>
              </div>
              <div className="mb-3 text-sm bg-[rgba(0,0,0,0.45)] inline-block px-2 py-1 rounded">{v.caption}</div>
              <div className="flex gap-2">
                <Link to="/products" className="px-4 py-2 rounded-md border border-white/80">Shoppe den Look</Link>
                <button className="px-3 py-2 rounded-md border border-white/40">⋯</button>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
