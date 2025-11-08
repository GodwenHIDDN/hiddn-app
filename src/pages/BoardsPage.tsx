import { Link, useParams } from 'react-router-dom';

export default function BoardsPage() {
  const { slug = 'discover' } = useParams();
  const title = slug
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
  const img = `https://source.unsplash.com/featured/?${encodeURIComponent(slug)},fashion,editorial&sig=401`;
  return (
    <main className="max-w-md mx-auto px-5 pb-24" style={{ paddingTop: '12px' }}>
      <header className="mb-3">
        <Link to="/" className="text-sm opacity-80">← Zurück</Link>
        <h1 className="font-display text-3xl" style={{ color: 'var(--text)' }}>{title}</h1>
        <p className="text-sm opacity-80" style={{ color: 'var(--text)' }}>Kuratiertes Board – Looks, die zu "{title}" passen.</p>
      </header>
      <section>
        <div className="overflow-hidden rounded-2xl shadow" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-full" style={{ aspectRatio: '4/3' }}>
            <img src={img} alt={title} className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <p className="text-sm" style={{ color: 'var(--text)' }}>Inspiration, Edits und Produkte zur Kategorie "{title}" – täglich erneuert.</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              {["Neu", "Best Rated", "Under 100€", "Premium"].map(t => (
                <Link key={t} to={`/products?board=${encodeURIComponent(slug)}&filter=${encodeURIComponent(t)}`} className="pressable px-3 py-2 text-sm rounded-full" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>{t}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mt-6">
        <h2 className="font-display text-2xl" style={{ color: 'var(--text)' }}>Empfehlungen</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[...Array(6)].map((_,i) => (
            <Link key={i} to="/products" className="block pressable">
              <div className="overflow-hidden rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="w-full" style={{ aspectRatio: '4/5' }}>
                  <img src={`https://source.unsplash.com/featured/?${encodeURIComponent(slug)},look&sig=${700+i}`} alt={`${title} ${i+1}`} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="mt-1 text-sm" style={{ color: 'var(--text)' }}>{title} #{i+1}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
