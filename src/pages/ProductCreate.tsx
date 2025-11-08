import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function ProductCreate() {
  const nav = useNavigate();
  const [title, setTitle] = useState('Logo Tee');
  const [price, setPrice] = useState(1999);
  const [currency, setCurrency] = useState('EUR');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/api/v1/products', { title, price_cents: Number(price), currency });
      nav('/products');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Create failed');
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Create Product</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="title" value={title} onChange={e=>setTitle(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="price_cents" type="number" value={price} onChange={e=>setPrice(parseInt(e.target.value))} />
        <input className="w-full border rounded px-3 py-2" placeholder="currency" value={currency} onChange={e=>setCurrency(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full rounded bg-blue-600 text-white py-2">Create</button>
      </form>
    </main>
  );
}
