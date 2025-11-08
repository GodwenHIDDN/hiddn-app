import { Link } from 'react-router-dom';

export default function OrderCancel() {
  return (
    <main className="max-w-md mx-auto p-6 space-y-4" style={{ color: 'var(--text)' }}>
      <h1 className="font-display text-2xl">Bestellung abgebrochen</h1>
      <p className="text-sm opacity-80">Du hast den Checkout abgebrochen. Dein Warenkorb bleibt erhalten.</p>
      <div className="flex gap-3">
        <Link to="/cart" className="r-btn pressable" style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}>Zum Warenkorb</Link>
        <Link to="/" className="r-btn pressable" style={{ background: 'var(--accent)', color: '#fff' }}>Weiter shoppen</Link>
      </div>
    </main>
  );
}
