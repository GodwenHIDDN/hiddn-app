import { Link, useParams } from 'react-router-dom';

export default function SpotlightPage() {
  const { slug = 'spotlight' } = useParams();
  const title = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  const hero = `https://images.unsplash.com/photo-1503342217505-b0a15cf70489?w=1600&auto=format&fit=crop`;
  return (
    <main className="max-w-md mx-auto px-5 pb-24" style={{ paddingTop: '12px' }}>
      <header className="mb-3">
        <Link to="/" className="text-sm opacity-80">← Zurück</Link>
        <h1 className="font-display text-3xl" style={{ color: 'var(--text)' }}>{title}</h1>
        <p className="text-sm opacity-80" style={{ color: 'var(--text)' }}>Weekly Spotlight – kuratierte Capsule rund um {title}.</p>
      </header>
      <section>
        <div className="overflow-hidden rounded-2xl shadow" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-full" style={{ aspectRatio: '16/9' }}>
            <img src={hero} alt={title} className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <p className="text-sm" style={{ color: 'var(--text)' }}>Entdecke Edits, Produkte und Looks – handverlesen und wöchentlich neu.</p>
            <div className="mt-3 flex gap-2">
              <Link to="/products" className="pressable btn-solid" style={{ padding:'10px 14px', borderRadius:12 }}>Produkte ansehen</Link>
              <Link to="/categories" className="pressable btn-glass" style={{ padding:'10px 14px', borderRadius:12 }}>Kategorien</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
