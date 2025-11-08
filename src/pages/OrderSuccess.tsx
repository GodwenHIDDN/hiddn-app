import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [message, setMessage] = useState('Danke! Deine Zahlung war erfolgreich.');

  useEffect(() => {
    // TODO: Optionally fetch session details or show order summary
    if (!sessionId) setMessage('Danke! Zahlung erfolgreich.');
  }, [sessionId]);

  return (
    <main className="max-w-md mx-auto p-6 space-y-4" style={{ color: 'var(--text)' }}>
      <h1 className="font-display text-2xl">Bestellung erfolgreich</h1>
      <p className="text-sm opacity-80">{message}</p>
      <div className="flex gap-3">
        <Link to="/orders" className="r-btn pressable" style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}>Bestellungen ansehen</Link>
        <Link to="/" className="r-btn pressable" style={{ background: 'var(--accent)', color: '#fff' }}>Weiter shoppen</Link>
      </div>
    </main>
  );
}
