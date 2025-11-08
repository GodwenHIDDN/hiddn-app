import { useEffect, useRef, useState } from 'react';
import Image from './ui/Image';

// 9:16 paid creators carousel (auto every 5s + swipe)
// Images are expected in public/ads/*. Placeholders provided.
const ADS = [
  { id: 'stussy', src: 'https://images.unsplash.com/photo-1516824467205-afa656f3fdf8?q=70&w=1000&auto=format&fit=crop', href: '/products?campaign=stussy' },
  { id: 'nocta', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=70&w=1000&auto=format&fit=crop', href: '/products?campaign=nocta' },
  { id: 'pink', src: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=70&w=1000&auto=format&fit=crop', href: '/products?campaign=pink' },
];


export default function AdsStories() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const userInteractingRef = useRef(false);

  // Auto slide every 5s (pause when tab hidden or user interacting)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const go = () => {
      if (userInteractingRef.current || document.hidden) return;
      const next = (index + 1) % ADS.length;
      setIndex(next);
      const child = el.children[next] as HTMLElement | undefined;
      if (child) el.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
    };

    timerRef.current = window.setInterval(go, 5000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [index]);

  // Sync index on manual swipe using scroll position
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      userInteractingRef.current = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = el.clientWidth;
        const i = Math.round(el.scrollLeft / w);
        setIndex(Math.max(0, Math.min(ADS.length - 1, i)));
        // release interaction lock shortly after scroll ends
        window.setTimeout(() => (userInteractingRef.current = false), 600);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="mt-2">
      <div className="rounded-2xl overflow-hidden">
        <div
          ref={scrollerRef}
          className="relative flex gap-0 overflow-x-auto snap-x snap-mandatory no-scrollbar"
          style={{ scrollBehavior: 'smooth', overscrollBehaviorX: 'contain', overscrollBehaviorY: 'none' }}
        >
          {ADS.map((ad) => (
            <a
              key={ad.id}
              href={ad.href}
              className="shrink-0 w-full snap-center"
              aria-label={`Ad ${ad.id}`}
            >
              <div className="w-full aspect-[16/9] max-h-48 bg-neutral-100">
                <Image
                  src={ad.src}
                  alt={ad.id}
                  className="w-full h-full object-cover"
                  sizes="100vw"
                  srcSet={`${ad.src}&dpr=1 1x, ${ad.src}&dpr=2 2x, ${ad.src}&dpr=3 3x`}
                  fetchPriority="low"
                />
              </div>
            </a>
          ))}
        </div>
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 py-2">
          {ADS.map((ad, i) => (
            <button
              key={ad.id}
              onClick={() => {
                setIndex(i);
                const el = scrollerRef.current;
                if (!el) return;
                const child = el.children[i] as HTMLElement | undefined;
                if (child) el.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
              }}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-black' : 'w-2 bg-neutral-300'}`}
              aria-label={`Go to ad ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
