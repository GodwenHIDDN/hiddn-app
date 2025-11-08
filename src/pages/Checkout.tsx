import { useState } from 'react';
import { detectCurrency } from '../lib/currency';

export default function Checkout() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function onCheckout() {
    setLoading(true);
    try {
      const currency = detectCurrency();
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, items: [] })
      });
      const data = await res.json();
      setResult(data);
      if (data?.url) {
        window.location.href = data.url as string;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Checkout</h1>
      <button disabled={loading} onClick={onCheckout} className="px-4 py-2 rounded bg-blue-600 text-white">
        {loading ? '...' : 'Start Checkout'}
      </button>
      {result && (
        <pre className="text-xs bg-neutral-100 p-3 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>
      )}
    </main>
  );
}
