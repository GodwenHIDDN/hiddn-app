import { useEffect, useRef, useState } from 'react';
import Image from './ui/Image';

const SLIDES = [
  {
    id: 'hero1',
    img: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1400&auto=format&fit=crop',
    title: 'Neue Kollektion 2025',
    subtitle: 'Streetwear Hero',
  },
  {
    id: 'hero2',
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1400&auto=format&fit=crop',
    title: 'HIDDN Collective',
    subtitle: 'Eine neue Ära',
  },
];

export default function HeroSlider() {
  const [i, setI] = useState(0);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => {
    t.current = window.setInterval(() => {
      setI((p) => (p + 1) % SLIDES.length);
    }, 5000) as unknown as number;
    return () => {
      if (t.current) clearInterval(t.current);
    };
  }, []);
  return (
    <section className="mt-3">
      <div className="relative overflow-hidden rounded-2xl">
        {SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="aspect-[16/9] w-full">
              <Image
                src={s.img}
                alt={s.title}
                className="w-full h-full object-cover"
                sizes="100vw"
                srcSet={`${s.img}&dpr=1 1x, ${s.img}&dpr=2 2x, ${s.img}&dpr=3 3x`}
                fetchPriority="high"
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
            <div className="absolute left-4 bottom-4 text-white">
              <h3 className="text-xl font-semibold">{s.title}</h3>
              <p className="text-sm opacity-90">{s.subtitle}</p>
            </div>
          </div>
        ))}
        <div className="relative">
          {/* spacer for stacking absolute slides */}
          <div className="aspect-[16/9] w-full" />
        </div>
        <div className="absolute bottom-2 inset-x-0 flex justify-center gap-2">
          {SLIDES.map((s, idx) => (
            <span key={s.id} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-6 bg-white' : 'w-2 bg-white/60'}`} />)
          )}
        </div>
      </div>
    </section>
  );
}
