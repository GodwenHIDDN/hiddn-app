import { Link } from 'react-router-dom';

export default function WeeklySubscribe() {
  return (
    <main className="max-w-md mx-auto px-5 pb-24" style={{ paddingTop: '12px' }}>
      <header className="mb-3">
        <Link to="/weekly" className="text-sm opacity-80">← Zurück</Link>
        <h1 className="font-display text-3xl" style={{ color: 'var(--text)' }}>Weekly abonnieren</h1>
        <p className="text-sm opacity-80" style={{ color: 'var(--text)' }}>Erhalte wöchentlich handverlesene HIDDN‑Inhalte.</p>
      </header>
      <section>
        <div className="rounded-2xl overflow-hidden" style={{ background:'var(--card)', border:'1px solid var(--border)' }}>
          <div className="p-5">
            <div className="text-sm" style={{ color:'var(--text)' }}>Danke! Deine Anmeldung wurde vorgemerkt. Du erhältst demnächst ein erstes Update mit neuen Drops, Creator‑News und Aktionen.</div>
            <div className="mt-4 flex gap-2">
              <Link to="/" className="pressable btn-solid" style={{ padding:'12px 16px', borderRadius:12 }}>Zur Startseite</Link>
              <Link to="/products" className="pressable btn-glass" style={{ padding:'12px 16px', borderRadius:12 }}>Jetzt shoppen</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
