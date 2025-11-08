import React from 'react';

export default function Plus() {
  return (
    <main className="max-w-md mx-auto p-6 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <h1 className="font-display text-2xl mb-2" style={{ color: 'var(--text)' }}>Plus</h1>
      <p style={{ color: 'var(--text)', opacity: 0.8 }}>Hier kommen in Zukunft exklusive Vorteile und Programme hin.</p>
    </main>
  );
}
