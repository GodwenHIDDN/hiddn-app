import { Link } from 'react-router-dom';

export default function WeeklyPage() {
  return (
    <main className="max-w-md mx-auto px-5 pb-24" style={{ paddingTop: '12px' }}>
      <header className="mb-3">
        <Link to="/" className="text-sm opacity-80">← Zurück</Link>
        <h1 className="font-display text-3xl" style={{ color: 'var(--text)' }}>HIDDN Weekly</h1>
        <p className="text-sm opacity-80" style={{ color: 'var(--text)' }}>Neue Drops, Creator‑News und exklusive Aktionen – kompakt kuratiert.</p>
      </header>
      <section>
        <div className="rounded-2xl overflow-hidden" style={{ background:'var(--card)', border:'1px solid var(--border)' }}>
          <div className="p-4">
            <p className="text-sm" style={{ color:'var(--text)' }}>Erhalte wöchentlich die besten Looks, Trends und Aktionen direkt in deinen Feed.</p>
            <div className="mt-3 flex gap-2">
              <Link to="/weekly/subscribe" className="pressable btn-solid" style={{ padding:'12px 16px', borderRadius:12 }}>Jetzt abonnieren</Link>
              <Link to="/products" className="pressable btn-glass" style={{ padding:'12px 16px', borderRadius:12 }}>Produkte entdecken</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
