import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error('No session');
      nav('/account');
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function onMagicLink() {
    setError(null);
    setLoading(true);
    try {
      const siteUrl = (import.meta as any).env?.VITE_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: siteUrl + '/account' } });
      if (error) throw error;
      alert('Magic Link gesendet. Bitte E‑Mail prüfen.');
    } catch (e: any) {
      setError(e?.message || 'Magic Link Fehler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ paddingTop: 20, paddingBottom: 20 }}>
      <h1 className="font-display r-h1" style={{ marginBottom: 10 }}>Login</h1>
      <form onSubmit={onSubmit} className="space-y-3" style={{ maxWidth: 520 }}>
        <input className="w-full" style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }} placeholder="E‑Mail" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full" style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }} placeholder="Passwort" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="r-text" style={{ color: '#dc2626' }}>{error}</p>}
        <div>
          <button disabled={loading} className="r-btn pressable" style={{ background: 'var(--accent)', color: '#fff' }}>{loading? '...' : 'Login'}</button>
          <button type="button" disabled={loading} onClick={onMagicLink} className="r-btn pressable" style={{ marginLeft: 10, background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)' }}>{loading? '...' : 'Magic Link'}</button>
        </div>
      </form>
    </main>
  );
}
